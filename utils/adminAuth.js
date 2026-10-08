const { randomBytes, createHash, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const { pool } = require('../db');

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'photoprint-session';
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
  const [algorithm, saltHex, keyHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/i.test(saltHex) || !/^[a-f0-9]{128}$/i.test(keyHex)) {
    return false;
  }

  const expectedKey = Buffer.from(keyHex, 'hex');
  const actualKey = await scrypt(password, Buffer.from(saltHex, 'hex'), expectedKey.length);
  return timingSafeEqual(actualKey, expectedKey);
}

let dummyPasswordHash;
async function getDummyPasswordHash() {
  if (!dummyPasswordHash) {
    dummyPasswordHash = await hashPassword(randomBytes(32).toString('hex'));
  }
  return dummyPasswordHash;
}

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await pool.query('DELETE FROM admin_sessions WHERE expires_at <= now()');
  await pool.query(
    'INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)',
    [hashSessionToken(token), userId, expiresAt]
  );
  return { token, expiresAt };
}

async function getSession(token) {
  const tokenHash = hashSessionToken(token);
  const { rows } = await pool.query(
    `SELECT users.id, users.email, sessions.expires_at
     FROM admin_sessions AS sessions
     JOIN admin_users AS users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1`,
    [tokenHash]
  );
  const session = rows[0];
  if (!session) return null;
  if (new Date(session.expires_at) <= new Date()) {
    await deleteSession(token);
    return null;
  }
  return session;
}

async function deleteSession(token) {
  await pool.query('DELETE FROM admin_sessions WHERE token_hash = $1', [hashSessionToken(token)]);
}

function cookieOptions(req) {
  return {
    httpOnly: true,
    secure: req.secure || process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };
}

module.exports = {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  normalizeEmail,
  hashPassword,
  verifyPassword,
  getDummyPasswordHash,
  createSession,
  getSession,
  deleteSession,
  cookieOptions
};

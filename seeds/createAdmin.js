require('dotenv').config();

const { pool } = require('../db');
const { hashPassword, normalizeEmail } = require('../utils/adminAuth');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : '';
  if (!/^[^\s@]+@[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Set ADMIN_EMAIL to a valid administrator email address.');
  }
  if (!password || password.length < 12) {
    throw new Error('Set ADMIN_PASSWORD to a password of at least 12 characters.');
  }

  const passwordHash = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO admin_users (email, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()
       RETURNING id, email`,
      [normalizedEmail, passwordHash]
    );
    await client.query('DELETE FROM admin_sessions WHERE user_id = $1', [rows[0].id]);
    await client.query('COMMIT');
    console.log(`Administrator credentials saved for ${rows[0].email}.`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

createAdmin()
  .catch((error) => {
    console.error('Could not create administrator:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });

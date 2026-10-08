async function loginPage(req, res) {
  res.render('admin/login', { title: 'Вход в админку', activePage: 'login' });
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    req.flash('error', 'Введите email и пароль');
    return res.redirect('/admin/login');
  }
  const {
    normalizeEmail,
    verifyPassword,
    getDummyPasswordHash,
    createSession,
    SESSION_COOKIE,
    SESSION_DURATION_MS,
    cookieOptions
  } = require('../utils/adminAuth');
  const { pool } = require('../db');
  const { rows } = await pool.query(
    'SELECT id, email, password_hash FROM admin_users WHERE email = $1',
    [normalizeEmail(email)]
  );
  const admin = rows[0];
  const validPassword = await verifyPassword(password, admin?.password_hash || await getDummyPasswordHash());
  if (!admin || !validPassword) {
    req.flash('error', 'Неверный email или пароль.');
    return res.redirect('/admin/login');
  }

  const session = await createSession(admin.id);
  res.cookie(SESSION_COOKIE, session.token, {
    ...cookieOptions(req),
    maxAge: SESSION_DURATION_MS
  });
  req.flash('success', 'Добро пожаловать');
  return res.redirect('/admin');
}

async function logoutUser(req, res) {
  const { SESSION_COOKIE, deleteSession, cookieOptions } = require('../utils/adminAuth');
  const token = req.cookies[SESSION_COOKIE];
  if (token) await deleteSession(token);
  res.clearCookie(SESSION_COOKIE, cookieOptions(req));
  req.flash('success', 'Вы вышли из системы');
  return res.redirect('/admin/login');
}

module.exports = { loginPage, loginUser, logoutUser };

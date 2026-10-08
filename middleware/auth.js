async function requireAuth(req, res, next) {
  const { SESSION_COOKIE, getSession, cookieOptions } = require('../utils/adminAuth');
  const token = req.cookies[SESSION_COOKIE];
  if (!token) {
    req.flash('error', 'Требуется авторизация');
    return res.redirect('/admin/login');
  }

  const user = await getSession(token);
  if (!user) {
    res.clearCookie(SESSION_COOKIE, cookieOptions(req));
    req.flash('error', 'Сессия завершилась. Войдите снова.');
    return res.redirect('/admin/login');
  }

  req.user = {
    id: user.id,
    email: user.email,
    username: user.email
  };
  res.locals.user = req.user;
  return next();
}

module.exports = { requireAuth };

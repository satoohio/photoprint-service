const jwt = require('jsonwebtoken');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'photoprint-secret', {
    expiresIn: '30d'
  });
}

function requireAuth(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    req.flash('error', 'Требуется авторизация');
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'photoprint-secret');
    req.user = decoded;
    res.locals.user = decoded;
    return next();
  } catch (error) {
    req.flash('error', 'Сессия истекла. Войдите снова.');
    return res.redirect('/admin/login');
  }
}

function requireApiAuth(req, res, next) {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'photoprint-secret');
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = { requireAuth, requireApiAuth, signToken };

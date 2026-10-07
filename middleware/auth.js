async function requireAuth(req, res, next) {
  try {
    const { getUser, refreshSession } = await import('@netlify/identity');
    await refreshSession();
    const user = await getUser();
    if (!user) {
      req.flash('error', 'Требуется авторизация');
      return res.redirect('/admin/login');
    }
    if (!user.roles?.includes('admin')) {
      return res.status(403).render('403', { title: 'Доступ запрещён' });
    }
    req.user = { ...user, username: user.name || user.email };
    res.locals.user = req.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAuth };

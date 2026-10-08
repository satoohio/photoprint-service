async function requireAuth(req, res, next) {
  const accessToken = req.cookies['sb-access-token'];
  const refreshToken = req.cookies['sb-refresh-token'];
  if (!accessToken || !refreshToken) {
    req.flash('error', 'Требуется авторизация');
    return res.redirect('/admin/login');
  }

  const { createPublicSupabaseClient } = require('../utils/supabase');
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  if (error || !data.user || !data.session) {
    const cookieOptions = {
      httpOnly: true,
      secure: req.secure || process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    };
    res.clearCookie('sb-access-token', cookieOptions);
    res.clearCookie('sb-refresh-token', cookieOptions);
    req.flash('error', 'Сессия завершилась. Войдите снова.');
    return res.redirect('/admin/login');
  }

  if (data.user.app_metadata?.role !== 'admin') {
    return res.status(403).render('403', { title: 'Доступ запрещён' });
  }

  const cookieOptions = {
    httpOnly: true,
    secure: req.secure || process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  };
  res.cookie('sb-access-token', data.session.access_token, {
    ...cookieOptions,
    maxAge: data.session.expires_in * 1000
  });
  res.cookie('sb-refresh-token', data.session.refresh_token, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
  req.user = {
    id: data.user.id,
    email: data.user.email,
    username: data.user.user_metadata?.name || data.user.email
  };
  res.locals.user = req.user;
  return next();
}

module.exports = { requireAuth };

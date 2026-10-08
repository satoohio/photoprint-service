async function loginPage(req, res) {
  res.render('admin/login', { title: 'Вход в админку', activePage: 'login' });
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    req.flash('error', 'Введите email и пароль');
    return res.redirect('/admin/login');
  }
  const { createPublicSupabaseClient } = require('../utils/supabase');
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    req.flash('error', 'Не удалось войти. Проверьте email, пароль и подтверждение аккаунта.');
    return res.redirect('/admin/login');
  }

  if (data.user.app_metadata?.role !== 'admin') {
    req.flash('error', 'Для входа требуется роль admin в настройках пользователя Supabase.');
    return res.redirect('/admin/login');
  }

  const secure = req.secure || process.env.NODE_ENV === 'production';
  const cookieOptions = { httpOnly: true, secure, sameSite: 'lax', path: '/' };
  res.cookie('sb-access-token', data.session.access_token, {
    ...cookieOptions,
    maxAge: data.session.expires_in * 1000
  });
  res.cookie('sb-refresh-token', data.session.refresh_token, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60 * 1000
  });
  req.flash('success', 'Добро пожаловать');
  return res.redirect('/admin');
}

async function logoutUser(req, res) {
  const secure = req.secure || process.env.NODE_ENV === 'production';
  const cookieOptions = { httpOnly: true, secure, sameSite: 'lax', path: '/' };
  res.clearCookie('sb-access-token', cookieOptions);
  res.clearCookie('sb-refresh-token', cookieOptions);
  req.flash('success', 'Вы вышли из системы');
  return res.redirect('/admin/login');
}

module.exports = { loginPage, loginUser, logoutUser };

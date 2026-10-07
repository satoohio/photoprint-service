async function loginPage(req, res) {
  res.render('admin/login', { title: 'Вход в админку', activePage: 'login' });
}

async function loginUser(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    req.flash('error', 'Введите email и пароль');
    return res.redirect('/admin/login');
  }
  try {
    const { login, logout } = await import('@netlify/identity');
    const user = await login(email, password);
    if (!user.roles?.includes('admin')) {
      await logout();
      req.flash('error', 'Для входа требуется роль admin в Netlify Identity');
      return res.redirect('/admin/login');
    }
    req.flash('success', 'Добро пожаловать');
    return res.redirect('/admin');
  } catch {
    req.flash('error', 'Не удалось войти. Проверьте email, пароль и подтверждение аккаунта.');
    return res.redirect('/admin/login');
  }
}

async function acceptInvitation(req, res) {
  const { token, password } = req.body;
  if (typeof token !== 'string' || !token || typeof password !== 'string' || password.length < 8) {
    req.flash('error', 'Некорректное приглашение или слишком короткий пароль');
    return res.redirect('/admin/login');
  }
  try {
    const { acceptInvite, login, logout } = await import('@netlify/identity');
    const invitedUser = await acceptInvite(token, password);
    const user = await login(invitedUser.email, password);
    if (!user.roles?.includes('admin')) {
      await logout();
      req.flash('error', 'Аккаунт подтверждён. Назначьте роль admin в Netlify Identity.');
      return res.redirect('/admin/login');
    }
    return res.redirect('/admin');
  } catch {
    req.flash('error', 'Не удалось принять приглашение. Запросите новое приглашение.');
    return res.redirect('/admin/login');
  }
}

async function logoutUser(req, res) {
  const { logout } = await import('@netlify/identity');
  await logout();
  req.flash('success', 'Вы вышли из системы');
  return res.redirect('/admin/login');
}

module.exports = { loginPage, loginUser, logoutUser, acceptInvitation };

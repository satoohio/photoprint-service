const invitation = new URLSearchParams(window.location.hash.slice(1)).get('invite_token');
if (invitation) {
  const form = document.querySelector('form[action="/admin/login"]');
  const tokenInput = document.createElement('input');
  tokenInput.type = 'hidden';
  tokenInput.name = 'token';
  tokenInput.value = invitation;
  form.append(tokenInput);
  form.action = '/admin/invite';
  document.getElementById('login-email').closest('div').hidden = true;
  document.getElementById('login-email').required = false;
  const passwordInput = document.getElementById('login-password');
  passwordInput.autocomplete = 'new-password';
  passwordInput.minLength = 8;
  document.querySelector('.login-title h1').textContent = 'Принять приглашение';
  form.querySelector('button[type="submit"]').textContent = 'Сохранить пароль';
  window.history.replaceState(null, '', window.location.pathname);
}

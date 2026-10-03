document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('site-theme') || 'classic';
  document.body.dataset.theme = savedTheme;

  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach((button) => {
    const isActive = button.dataset.themeOption === savedTheme;
    button.classList.toggle('active', isActive);
    button.addEventListener('click', () => {
      const nextTheme = button.dataset.themeOption;
      document.body.dataset.theme = nextTheme;
      localStorage.setItem('site-theme', nextTheme);
      themeButtons.forEach((item) => item.classList.toggle('active', item === button));
    });
  });

  const forms = document.querySelectorAll('[data-form="order"]');

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('button[type="submit"]');
      const rawMessage = document.getElementById('order-message');
      const statusNode = document.getElementById('order-status');

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';
      }

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });

        const result = await response.json();

        if (!response.ok) {
          const messages = result.errors ? result.errors.map((item) => item.msg).join('<br>') : result.message;
          if (statusNode) {
            statusNode.innerHTML = `<div class="alert alert-error">${messages}</div>`;
          }
          return;
        }

        if (statusNode) {
          statusNode.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
        }

        form.reset();
      } catch (error) {
        if (statusNode) {
          statusNode.innerHTML = '<div class="alert alert-error">Не удалось отправить заявку. Попробуйте позже.</div>';
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Отправить';
        }
      }
    });
  });

  document.querySelectorAll('[data-service-button]').forEach((button) => {
    button.addEventListener('click', () => {
      const serviceName = button.getAttribute('data-service-name');
      const serviceField = document.getElementById('order-service');
      if (serviceField && serviceName) {
        serviceField.value = serviceName;
      }
    });
  });
});

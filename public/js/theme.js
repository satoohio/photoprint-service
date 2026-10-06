(function () {
  function render(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var isDark = theme === 'dark';

    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var icon = button.querySelector('i');
      if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
      button.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
      button.setAttribute('title', isDark ? 'Светлая тема' : 'Тёмная тема');
      button.setAttribute('aria-pressed', String(isDark));
    });
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function setTheme(theme) {
    render(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      /* storage unavailable */
    }
  }

  render(currentTheme());

  document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });
})();

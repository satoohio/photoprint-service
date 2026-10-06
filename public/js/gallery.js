document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const allItems = Array.from(document.querySelectorAll('[data-gallery-item]'));
  const lightbox = document.getElementById('lightbox');
  const lightboxBody = document.getElementById('lightbox-body');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const closeButton = document.getElementById('lightbox-close');
  const prevButton = document.getElementById('lightbox-prev');
  const nextButton = document.getElementById('lightbox-next');

  let visibleItems = allItems;
  let currentIndex = 0;
  let lastFocused = null;

  const renderCounter = () => {
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
    }
  };

  const renderSlide = () => {
    const item = visibleItems[currentIndex];
    if (!item || !lightboxBody) return;

    const src = item.getAttribute('data-src');
    const mime = item.getAttribute('data-mime');
    const title = item.getAttribute('data-title') || '';

    if (mime === 'video') {
      lightboxBody.innerHTML = `<video controls autoplay playsinline src="${src}"></video>`;
    } else {
      lightboxBody.innerHTML = `<img src="${src}" alt="${title}" />`;
    }

    if (lightboxCaption) lightboxCaption.textContent = title;
    renderCounter();
  };

  const openLightbox = (item) => {
    if (!lightbox) return;
    visibleItems = allItems.filter((entry) => !entry.classList.contains('is-hidden'));
    currentIndex = Math.max(visibleItems.indexOf(item), 0);
    lastFocused = document.activeElement;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderSlide();
    closeButton?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    if (lightboxBody) lightboxBody.innerHTML = '';
    document.body.style.overflow = '';
    lastFocused?.focus?.();
  };

  const step = (delta) => {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex + delta + visibleItems.length) % visibleItems.length;
    renderSlide();
  };

  if (filterButtons.length && allItems.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        filterButtons.forEach((item) => item.classList.toggle('active', item === button));

        allItems.forEach((item) => {
          const matches = filter === 'all' || item.getAttribute('data-category') === filter;
          item.classList.toggle('is-hidden', !matches);
        });
      });
    });
  }

  allItems.forEach((item) => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  closeButton?.addEventListener('click', closeLightbox);
  prevButton?.addEventListener('click', () => step(-1));
  nextButton?.addEventListener('click', () => step(1));

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox?.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
});

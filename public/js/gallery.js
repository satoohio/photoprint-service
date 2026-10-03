document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('[data-filter]');
  const galleryItems = document.querySelectorAll('[data-gallery-item]');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');

  if (filterButtons.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        filterButtons.forEach((item) => item.classList.toggle('active', item === button));

        galleryItems.forEach((item) => {
          const matches = filter === 'all' || item.getAttribute('data-category') === filter;
          item.style.display = matches ? '' : 'none';
        });
      });
    });
  }

  if (lightbox && lightboxImage) {
    galleryItems.forEach((item) => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-src');
        const mime = item.getAttribute('data-mime');
        if (mime === 'video') {
          lightboxImage.innerHTML = `<video controls autoplay src="${src}"></video>`;
        } else {
          lightboxImage.innerHTML = `<img src="${src}" alt="" />`;
        }
        lightbox.classList.add('open');
      });
    });

    lightboxClose?.addEventListener('click', () => {
      lightbox.classList.remove('open');
      lightboxImage.innerHTML = '';
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        lightbox.classList.remove('open');
        lightboxImage.innerHTML = '';
      }
    });
  }
});

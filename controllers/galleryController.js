const { GalleryItem } = require('../models');

const CATEGORY_LABELS = {
  general: 'Общее',
  photo: 'Фото',
  print: 'Печать',
  docs: 'Документы',
  scan: 'Сканирование',
  copy: 'Копирование'
};

function buildCategoryList(items) {
  const seen = new Map();

  items.forEach((item) => {
    const value = item.category || 'general';
    if (!seen.has(value)) {
      seen.set(value, CATEGORY_LABELS[value] || value.charAt(0).toUpperCase() + value.slice(1));
    }
  });

  const preferredOrder = ['photo', 'print', 'docs', 'scan', 'copy', 'general'];
  return [...seen.entries()]
    .sort((a, b) => {
      const ia = preferredOrder.indexOf(a[0]);
      const ib = preferredOrder.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[1].localeCompare(b[1], 'ru');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    })
    .map(([value, label]) => ({ value, label }));
}

async function listPublicGallery(req, res) {
  const items = await GalleryItem.findAll({ order: [['order', 'ASC']], raw: true });

  res.render('gallery', {
    title: 'Галерея',
    items,
    categories: buildCategoryList(items),
    activePage: 'gallery'
  });
}

async function getGalleryApi(req, res) {
  const items = await GalleryItem.findAll({ order: [['order', 'ASC']], raw: true });
  res.json(items);
}

async function createGalleryItem(req, res) {
  if (!req.file) throw new Error('Загрузите файл галереи');
  const { title, category, description, order, type } = req.body;
  const filePath = req.file.url;

  return GalleryItem.create({
    title,
    category: category || 'general',
    description: description || '',
    type: type || 'image',
    url: filePath,
    thumbnail: null,
    order: Number(order || 0)
  });
}

module.exports = { listPublicGallery, getGalleryApi, createGalleryItem };

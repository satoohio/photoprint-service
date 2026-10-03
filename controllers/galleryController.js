const { GalleryItem } = require('../models');
const { generateVideoThumbnail } = require('../utils/thumbnail');

async function listPublicGallery(req, res) {
  const items = await GalleryItem.findAll({ order: [['order', 'ASC']], raw: true });

  res.render('gallery', {
    title: 'Галерея',
    items,
    activePage: 'gallery'
  });
}

async function getGalleryApi(req, res) {
  const items = await GalleryItem.findAll({ order: [['order', 'ASC']], raw: true });
  res.json(items);
}

async function createGalleryItem(req, res) {
  const { title, category, description, order, type } = req.body;
  const filePath = req.file ? `/uploads/gallery/${req.file.filename}` : '';
  let thumbnail = null;

  if (type === 'video' && filePath) {
    thumbnail = generateVideoThumbnail(filePath);
  }

  return GalleryItem.create({
    title,
    category: category || 'general',
    description: description || '',
    type: type || 'image',
    url: filePath,
    thumbnail,
    order: Number(order || 0)
  });
}

module.exports = { listPublicGallery, getGalleryApi, createGalleryItem };

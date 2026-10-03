const fs = require('fs');
const path = require('path');
const multer = require('multer');

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const serviceStorage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = ensureDirectory(path.join(__dirname, '../public/uploads/services'));
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, safeName);
  }
});

const galleryStorage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = ensureDirectory(path.join(__dirname, '../public/uploads/gallery'));
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, safeName);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'video/mp4'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error('Недоступный тип файла. Используйте JPG, PNG, WEBP или MP4.'));
}

const uploadServiceImage = multer({
  storage: serviceStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadGalleryMedia = multer({
  storage: galleryStorage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 }
});

module.exports = { uploadServiceImage, uploadGalleryMedia };

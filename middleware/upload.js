const path = require('node:path');
const { randomUUID } = require('node:crypto');
const multer = require('multer');

const MIME_TO_EXTENSION = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'video/mp4': ['.mp4']
};

function createUpload(section, allowVideo) {
  const storage = {
    _handleFile(req, file, callback) {
      const chunks = [];
      let size = 0;
      file.stream.on('data', (chunk) => {
        size += chunk.length;
        chunks.push(chunk);
      });
      file.stream.once('error', callback);
      file.stream.once('end', async () => {
        if (file.stream.truncated) return callback(new multer.MulterError('LIMIT_FILE_SIZE'));
        try {
          const filename = randomUUID() + path.extname(file.originalname).toLowerCase();
          const buffer = Buffer.concat(chunks);
          const { uploadObject } = require('../utils/blobStorage');
          const url = await uploadObject(section + '/' + filename, file.mimetype, buffer);
          callback(null, { filename, size, key: section + '/' + filename, url });
        } catch (error) {
          callback(error);
        }
      });
    },
    async _removeFile(req, file, callback) {
      try {
        if (file.key) {
          const { deleteUpload } = require('../utils/blobStorage');
          if (file.url) await deleteUpload(file.url);
        }
        callback(null);
      } catch (error) {
        callback(error);
      }
    }
  };

  return multer({
    storage,
    fileFilter(req, file, callback) {
      const extensions = MIME_TO_EXTENSION[file.mimetype];
      const extension = path.extname(file.originalname).toLowerCase();
      if (!extensions?.includes(extension) || (!allowVideo && file.mimetype === 'video/mp4')) {
        return callback(new Error('Недоступный тип файла. Используйте JPG, PNG, WEBP' + (allowVideo ? ' или MP4.' : '.')));
      }
      callback(null, true);
    },
    limits: { fileSize: 4 * 1024 * 1024, files: 1, fields: 20, fieldSize: 64 * 1024 }
  });
}

module.exports = {
  uploadServiceImage: createUpload('services', false),
  uploadGalleryMedia: createUpload('gallery', true)
};

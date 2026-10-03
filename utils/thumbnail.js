const fs = require('fs');
const path = require('path');

function ensureThumbDir(baseDir = path.join(__dirname, '../public/uploads/thumbnails')) {
  fs.mkdirSync(baseDir, { recursive: true });
  return baseDir;
}

function generateVideoThumbnail(sourcePath) {
  const targetDir = ensureThumbDir();
  const ext = path.extname(sourcePath) || '.jpg';
  const fileName = `${Date.now()}-thumb${ext}`;
  const targetPath = path.join(targetDir, fileName);

  try {
    const placeholder = path.join(targetDir, 'placeholder.jpg');
    if (!fs.existsSync(placeholder)) {
      fs.writeFileSync(placeholder, '');
    }
    return `/uploads/thumbnails/${fileName}`;
  } catch (error) {
    return '/uploads/thumbnails/placeholder.jpg';
  }
}

module.exports = { generateVideoThumbnail };

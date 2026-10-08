const path = require('node:path');

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4'
};
const UPLOAD_PATH = /^\/uploads\/(services|gallery)\/([a-f0-9-]+\.(?:jpg|jpeg|png|webp|mp4))$/i;

async function safeDeleteUpload(urlPath) {
  const match = typeof urlPath === 'string' && urlPath.match(UPLOAD_PATH);
  if (!match) return;
  try {
    const { deleteUpload } = require('./supabaseStorage');
    await deleteUpload(match[1] + '/' + match[2]);
  } catch (error) {
    console.error('Upload cleanup failed:', error.name);
  }
}

async function serveUpload(req, res) {
  if (!UPLOAD_PATH.test(req.path)) return res.status(404).send('Файл не найден');
  const { downloadUpload } = require('./supabaseStorage');
  const content = await downloadUpload(req.params.section + '/' + req.params.filename);
  if (!content) return res.status(404).send('Файл не найден');
  res.setHeader('Content-Type', CONTENT_TYPES[path.extname(req.params.filename).toLowerCase()]);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  return res.send(Buffer.from(content));
}

module.exports = { safeDeleteUpload, serveUpload };

const fs = require('fs');
const path = require('path');

const UPLOADS_ROOT = path.resolve(__dirname, '../public/uploads');

function safeDeleteUpload(urlPath) {
  if (!urlPath || typeof urlPath !== 'string' || !urlPath.startsWith('/uploads/')) {
    return;
  }

  const resolved = path.resolve(path.join(__dirname, '../public', urlPath));
  if (!resolved.startsWith(UPLOADS_ROOT)) {
    return;
  }

  fs.unlink(resolved, () => {});
}

module.exports = { safeDeleteUpload };

async function safeDeleteUpload(url) {
  const { deleteUpload, isManagedBlobUrl } = require('./blobStorage');
  if (!isManagedBlobUrl(url)) return;
  try {
    await deleteUpload(url);
  } catch (error) {
    console.error('Blob cleanup failed:', error.name);
  }
}

module.exports = { safeDeleteUpload };

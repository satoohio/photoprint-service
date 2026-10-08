const { put, del } = require('@vercel/blob');

async function uploadObject(pathname, contentType, content) {
  const blob = await put(pathname, content, {
    access: 'public',
    addRandomSuffix: false,
    contentType
  });
  return blob.url;
}

async function deleteUpload(url) {
  await del(url);
}

function isManagedBlobUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

module.exports = { uploadObject, deleteUpload, isManagedBlobUrl };

const { getSupabaseAdmin, getStorageBucket } = require('./supabase');

async function uploadObject(key, contentType, content) {
  const { error } = await getSupabaseAdmin().storage
    .from(getStorageBucket())
    .upload(key, content, { contentType, upsert: false });
  if (error) throw error;
}

async function deleteUpload(key) {
  const { error } = await getSupabaseAdmin().storage
    .from(getStorageBucket())
    .remove([key]);
  if (error) throw error;
}

async function downloadUpload(key) {
  const { data, error } = await getSupabaseAdmin().storage
    .from(getStorageBucket())
    .download(key);
  if (error) {
    if (error.statusCode === '404' || error.statusCode === 404) return null;
    throw error;
  }
  return Buffer.from(await data.arrayBuffer());
}

module.exports = { uploadObject, deleteUpload, downloadUpload };

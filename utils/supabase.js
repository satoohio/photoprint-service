const { createClient } = require('@supabase/supabase-js');

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to connect to Supabase`);
  return value;
}

function createSupabaseClient(apiKey) {
  return createClient(requiredEnv('SUPABASE_URL'), apiKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

function createPublicSupabaseClient() {
  return createSupabaseClient(requiredEnv('SUPABASE_ANON_KEY'));
}

let adminClient;
function getSupabaseAdmin() {
  if (!adminClient) {
    adminClient = createSupabaseClient(requiredEnv('SUPABASE_SERVICE_ROLE_KEY'));
  }
  return adminClient;
}

function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'photoprint-uploads';
}

module.exports = {
  createPublicSupabaseClient,
  getSupabaseAdmin,
  getStorageBucket
};

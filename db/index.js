const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');

function normalizeDatabaseUrl(connectionString) {
  if (!connectionString) {
    return connectionString;
  }

  let normalizedConnectionString = connectionString.trim();
  const credentialsSeparator = normalizedConnectionString.indexOf('://');

  if (credentialsSeparator !== -1) {
    const authPart = normalizedConnectionString.slice(credentialsSeparator + 3);
    const atIndex = authPart.lastIndexOf('@');

    if (atIndex !== -1) {
      const userInfo = authPart.slice(0, atIndex);
      const colonIndex = userInfo.lastIndexOf(':');

      if (colonIndex !== -1) {
        const username = userInfo.slice(0, colonIndex);
        const password = userInfo.slice(colonIndex + 1);

        if (password && !password.includes('%') && /[\s#?&]/.test(password)) {
          const sanitizedPassword = encodeURIComponent(password);
          const remaining = authPart.slice(atIndex + 1);
          normalizedConnectionString = `${normalizedConnectionString.slice(0, credentialsSeparator + 3)}${username}:${sanitizedPassword}@${remaining}`;
        }
      }
    }
  }

  try {
    const url = new URL(normalizedConnectionString);
    url.searchParams.set('sslmode', 'require');
    return url.toString();
  } catch (error) {
    const separator = normalizedConnectionString.includes('?') ? '&' : '?';
    return `${normalizedConnectionString}${separator}sslmode=require`;
  }
}

const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!connectionString) {
  throw new Error('DATABASE_URL is required to connect to Supabase Postgres');
}

const pool = new Pool({
  connectionString,
  max: 1,
  ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined
});

const db = drizzle({ client: pool, schema });

module.exports = { db, pool, normalizeDatabaseUrl };

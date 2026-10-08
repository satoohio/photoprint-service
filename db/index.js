const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const schema = require('./schema');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to connect to Supabase Postgres');
}

const pool = new Pool({ connectionString, max: 1 });

const db = drizzle({ client: pool, schema });

module.exports = { db, pool };

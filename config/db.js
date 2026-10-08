async function syncDatabase() {
  const { db } = require('../db/index.js');
  const { sql } = await import('drizzle-orm');
  await db.execute(sql`select 1`);
  return db;
}

module.exports = { syncDatabase };

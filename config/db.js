async function syncDatabase() {
  const { db } = await import('../db/index.ts');
  const { sql } = await import('drizzle-orm');
  await db.execute(sql`select 1`);
  return db;
}

module.exports = { syncDatabase };

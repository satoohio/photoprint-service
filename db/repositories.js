const { and, or, eq, asc, desc, count, sql } = require('drizzle-orm');
const { db } = require('./index.js');
const { services, galleryItems, orders, settings, rateLimits } = require('./schema.js');
const operators = require('../utils/operators.js');

const { Op } = operators;

function isQueryWhere(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function condition(table, where = {}) {
  const clauses = Reflect.ownKeys(where).map((key) => {
    if (key === Op.or) {
      const nested = where[key];
      if (!Array.isArray(nested) || !nested.every(isQueryWhere)) {
        throw new Error('Unsupported query condition');
      }
      return or(...nested.map((entry) => condition(table, entry)));
    }
    const column = table[key];
    if (!column) throw new Error('Unknown query field');
    const value = where[key];
    if (isQueryWhere(value)) {
      if (Op.ne in value) return sql`${column} <> ${value[Op.ne]}`;
      if (Op.like in value && typeof value[Op.like] === 'string') {
        return sql`${column} ILIKE ${value[Op.like]}`;
      }
      throw new Error('Unsupported query operator');
    }
    return sql`${column} = ${value}`;
  });
  return clauses.length ? and(...clauses) : undefined;
}

function repository(table) {
  function record(row) {
    if (!row) return null;
    Object.defineProperties(row, {
      toJSON: { value: () => ({ ...row }) },
      update: { value: async (values) => {
        const [updated] = await db.update(table).set({ ...values, updatedAt: new Date() })
          .where(eq(table.id, row.id)).returning();
        Object.assign(row, updated);
        return row;
      } },
      destroy: { value: () => db.delete(table).where(eq(table.id, row.id)) }
    });
    return row;
  }

  return {
    async findAll(options = {}) {
      const selection = options.attributes
        ? Object.fromEntries(options.attributes.map((key) => [key, table[key]]))
        : undefined;
      let query = db.select(selection).from(table).where(condition(table, options.where)).$dynamic();
      if (options.order) {
        query = query.orderBy(...options.order.map(([key, direction]) =>
          direction === 'DESC' ? desc(table[key]) : asc(table[key])));
      }
      if (options.limit !== undefined) query = query.limit(options.limit);
      const rows = await query;
      return options.raw ? rows : rows.map(record);
    },
    async findOne(options = {}) {
      const rows = await this.findAll({ ...options, limit: 1 });
      return rows[0] || null;
    },
    async findByPk(id) {
      const numericId = Number(id);
      if (!Number.isSafeInteger(numericId) || numericId < 1) return null;
      return this.findOne({ where: { id: numericId } });
    },
    async count(options = {}) {
      const [result] = await db.select({ total: count() }).from(table)
        .where(condition(table, options.where));
      return result.total;
    },
    async create(values) {
      const [row] = await db.insert(table).values(values).returning();
      return record(row);
    },
    async findOrCreate({ where, defaults }) {
      const [inserted] = await db.insert(table).values({ ...defaults, ...where })
        .onConflictDoNothing().returning();
      return inserted ? [record(inserted), true] : [await this.findOne({ where }), false];
    },
    async update(values, options) {
      return db.update(table).set({ ...values, updatedAt: new Date() })
        .where(condition(table, options.where)).returning();
    }
  };
}

const repositories = {
  Service: repository(services),
  GalleryItem: repository(galleryItems),
  Order: repository(orders),
  Setting: repository(settings)
};

async function incrementRateLimit(key, windowMs) {
  const expiresAt = new Date(Date.now() + windowMs);
  const [row] = await db.insert(rateLimits).values({ key, hits: 1, expiresAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        hits: sql`CASE WHEN ${rateLimits.expiresAt} <= now() THEN 1 ELSE ${rateLimits.hits} + 1 END`,
        expiresAt: sql`CASE WHEN ${rateLimits.expiresAt} <= now() THEN ${expiresAt.toISOString()}::timestamptz ELSE ${rateLimits.expiresAt} END`
      }
    }).returning();
  return { totalHits: row.hits, resetTime: row.expiresAt };
}

async function decrementRateLimit(key) {
  await db.update(rateLimits).set({ hits: sql`greatest(0, ${rateLimits.hits} - 1)` })
    .where(eq(rateLimits.key, key));
}

async function resetRateLimit(key) {
  await db.delete(rateLimits).where(eq(rateLimits.key, key));
}

module.exports = {
  repositories,
  incrementRateLimit,
  decrementRateLimit,
  resetRateLimit
};

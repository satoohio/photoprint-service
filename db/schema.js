const { pgTable, serial, text, integer, boolean, doublePrecision, timestamp, pgEnum } = require('drizzle-orm/pg-core');

const timestamps = () => ({
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

const galleryType = pgEnum('gallery_type', ['image', 'video']);
const orderStatus = pgEnum('order_status', ['new', 'in_progress', 'done']);

const services = pgTable('services', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull().default(''),
  price: doublePrecision('price').notNull().default(0),
  priceUnit: text('price_unit').notNull().default('шт'),
  image: text('image'),
  icon: text('icon').default('fa-print'),
  order: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps()
});

const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  type: galleryType('type').notNull().default('image'),
  url: text('url').notNull(),
  thumbnail: text('thumbnail'),
  category: text('category').notNull().default('general'),
  description: text('description').default(''),
  order: integer('sort_order').notNull().default(0),
  ...timestamps()
});

const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email').default(''),
  service: text('service').default(''),
  message: text('message').default(''),
  status: orderStatus('status').notNull().default('new'),
  ...timestamps()
});

const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull().default(''),
  ...timestamps()
});

const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  hits: integer('hits').notNull().default(1),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

module.exports = {
  galleryType,
  orderStatus,
  services,
  galleryItems,
  orders,
  settings,
  rateLimits
};

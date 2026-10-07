CREATE TYPE "gallery_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('new', 'in_progress', 'done');--> statement-breakpoint
CREATE TABLE "gallery_items" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"type" "gallery_type" DEFAULT 'image'::"gallery_type" NOT NULL,
	"url" text NOT NULL,
	"thumbnail" text,
	"category" text DEFAULT 'general' NOT NULL,
	"description" text DEFAULT '',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '',
	"service" text DEFAULT '',
	"message" text DEFAULT '',
	"status" "order_status" DEFAULT 'new'::"order_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY,
	"hits" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text DEFAULT '' NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"price_unit" text DEFAULT 'шт' NOT NULL,
	"image" text,
	"icon" text DEFAULT 'fa-print',
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY,
	"key" text NOT NULL UNIQUE,
	"value" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO settings (key, value) VALUES
('siteName', 'PhotoPrint Service'),
('phone', '+7 (495) 123-45-67'),
('email', 'hello@photoprint.local'),
('address', 'пгт. Яшкино, Суворово 8а'),
('workHours', 'Пн–Сб: 09:00–20:00'),
('heroTitle', 'Печать, копирование и оформление документов'),
('heroSubtitle', 'Быстро, качественно и по доступной цене для дома, офиса и бизнеса.'),
('mapEmbed', '<iframe src="https://www.google.com/maps?q=%D0%BF%D0%B3%D1%82.%20%D0%8F%D1%88%D0%BA%D0%B8%D0%BD%D0%BE%2C%20%D0%A1%D1%83%D0%B2%D0%BE%D1%80%D0%BE%D0%B2%D0%BE%208%D0%B0&z=15&output=embed" width="100%" height="100%" frameborder="0" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>') ON CONFLICT (key) DO NOTHING;
--> statement-breakpoint
INSERT INTO services (title, slug, description, price, price_unit, icon, sort_order, is_active) VALUES
('Фото 10x15', 'foto-10x15', 'Печать фотографий 10×15 для документов, подарков и семейных архивов.', 25, 'шт', 'fa-camera', 1, true),
('Фото A4', 'foto-a4', 'Красочная печать на фотобумаге формата A4.', 90, 'лист', 'fa-image', 2, true),
('Копирование', 'kopirovanie', 'Черно-белое и цветное копирование документов.', 10, 'лист', 'fa-copy', 3, true),
('Оформление документов', 'oformlenie-dokumentov', 'Помощь в заполнении и оформлении документов, бланков и заявлений.', 250, 'услуга', 'fa-file-signature', 4, true),
('Набор текста', 'nabor-teksta', 'Печать и набор текста в Word, PDF, таблицы и отчеты.', 80, 'страница', 'fa-keyboard', 5, true) ON CONFLICT (slug) DO NOTHING;
--> statement-breakpoint
INSERT INTO gallery_items (title, type, url, category, description, sort_order) VALUES
('Печать семейных фото', 'image', '/gallery-placeholders/sample-1.svg', 'photo', 'Фотопечать и обработка кадра', 1),
('Документальная печать', 'image', '/gallery-placeholders/sample-2.svg', 'print', 'Печать документов и отчетов', 2),
('Сканирование бумаг', 'image', '/gallery-placeholders/sample-3.svg', 'docs', 'Подготовка и сканирование документов', 3),
('Копировальный центр', 'image', '/gallery-placeholders/sample-4.svg', 'print', 'Рабочий процесс и продуктивность', 4);

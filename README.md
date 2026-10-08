# PhotoPrint Service

Сайт фотопечати на Express и EJS. Приложение разворачивается на Vercel, данные хранит в Supabase Postgres, загруженные изображения и видео — в Supabase Storage, а вход администратора обрабатывается Supabase Auth.

## Настройка Supabase

Создайте проект Supabase и задайте переменные окружения:

| Переменная | Где взять |
| --- | --- |
| `DATABASE_URL` | Supabase → **Connect** → строка Postgres для serverless/transaction pooler; добавьте `sslmode=require` |
| `SUPABASE_URL` | Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Project Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key |
| `SUPABASE_STORAGE_BUCKET` | Необязательно; по умолчанию `photoprint-uploads` |

Выполните SQL из [`supabase/migrations/20261008000000_create_photoprint_tables.sql`](./supabase/migrations/20261008000000_create_photoprint_tables.sql) в Supabase SQL Editor. Он создаёт таблицы, исходные демонстрационные услуги, настройки и элементы галереи, а также приватный bucket `photoprint-uploads` с лимитом 4 МБ и разрешёнными типами `image/jpeg`, `image/png`, `image/webp`, `video/mp4`.

Файлы читаются через серверный маршрут `/uploads/...`; bucket не должен быть публичным. Ключ `SUPABASE_SERVICE_ROLE_KEY` используется только на сервере — никогда не добавляйте его в клиентский JavaScript.

### Администратор

В Supabase Auth создайте пользователя с надёжным паролем и подтвердите его email. Затем задайте ему серверную роль `admin` через Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
WHERE email = 'admin@example.com';
```

Замените email на адрес созданного администратора. Роль хранится в `app_metadata`, которое пользователь не может изменить через обычный клиентский API. Вход в панель: `/admin/login`.

## Размещение на Vercel

В Vercel откройте проект → **Settings → Environment Variables** и добавьте `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` и `SUPABASE_SERVICE_ROLE_KEY` для окружения **Production**. `DATABASE_URL` скопируйте из **Supabase → Connect**; используйте строку Postgres с session/transaction pooler и SSL (`sslmode=require`). `SUPABASE_URL` и API keys находятся в **Project Settings → API**. Не используйте service role key как anon key и не вставляйте service role key в клиентский код.

После сохранения переменных запустите новый production deployment: существующие deployments не получают обновлённые переменные автоматически. Если лог по-прежнему говорит `DATABASE_URL is required`, значит deployment не получил `DATABASE_URL` в своём Production окружении. Если приложение подключилось к базе, но сообщает об отсутствующих таблицах или типах, сначала выполните SQL-миграцию из раздела настройки Supabase.

Для production укажите production-домен в `BASE_URL` (например, `https://example.com`), чтобы sitemap использовал постоянный адрес сайта. Vercel обслуживает Express-приложение из корневого `app.js`.

Локальный запуск:

```bash
npm install
cp .env.example .env
# Заполните Supabase-переменные в .env
npm start
```

Для локальной разработки можно использовать `npm run dev`. `npm run seed` повторно добавляет отсутствующие начальные записи; он не создаёт пользователей и не сбрасывает существующие настройки.

При изменении схемы добавляйте новую SQL-миграцию в `supabase/migrations/`, проверяйте её и применяйте в Supabase SQL Editor.

## Данные из предыдущего размещения

Схема и демонстрационные записи создаются новой миграцией, но данные и загруженные файлы из прежних Netlify Database и Netlify Blobs автоматически не копируются. Если на старом размещении есть реальные заказы, настройки, услуги или файлы, экспортируйте и перенесите их в Supabase отдельно до переключения production-трафика.

## Дополнительные настройки

`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` и `MAIL_TO` используются для почтовых уведомлений. Без SMTP заявка сохраняется, но уведомление по почте не отправляется.

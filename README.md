# PhotoPrint Service

Сайт фотопечати на Express и EJS. Приложение разворачивается на Vercel, данные хранит в Supabase Postgres, загруженные изображения и видео — в Supabase Storage, а вход администратора обрабатывается Supabase Auth.

## Настройка Supabase

Создайте проект Supabase и задайте переменные окружения:

| Переменная | Где взять |
| --- | --- |
| `DATABASE_URL` | Supabase → **Connect** → **Transaction pooler** → URI. Вставьте полный адрес подключения, замените `[YOUR-PASSWORD]` на пароль базы; если в конце нет `sslmode=require`, добавьте его как параметр (`?sslmode=require`, либо `&sslmode=require`, если `?` уже есть) |
| `SUPABASE_URL` | Supabase → **Project Settings → API** → **Project URL** |
| `SUPABASE_ANON_KEY` | Supabase → **Project Settings → API Keys** → **Publishable key** (`sb_publishable_...`); подходит также legacy `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **Project Settings → API Keys** → **Secret key** (`sb_secret_...`); подходит также legacy `service_role` key. Только для сервера, никому не отправляйте |
| `SUPABASE_STORAGE_BUCKET` | Необязательно; по умолчанию `photoprint-uploads` |

### От пустой страницы Vercel до работающего сайта

1. Если у вас ещё нет проекта Supabase, откройте [Supabase Dashboard](https://supabase.com/dashboard), нажмите **New project** и дождитесь его создания. Сохраните пароль базы данных: он понадобится для `DATABASE_URL`.
2. Откройте проект Supabase → нажмите **Connect** в верхней части страницы → выберите **Transaction pooler** и скопируйте URI. Это должна быть целая строка вида `postgresql://...`, не только `sslmode=require`. Замените `[YOUR-PASSWORD]` на пароль базы, не раскрывая его; если в пароле есть символы `&`, `#`, `?` или пробелы, URL-кодируйте их.
3. В Supabase откройте **Project Settings → API** и скопируйте **Project URL**. В **Project Settings → API Keys** скопируйте **Publishable key** и **Secret key**.
4. Вернитесь на показанную страницу Vercel **Environment Variables** и нажмите **Add Environment Variable** вверху справа. Добавляйте по одной переменной: `DATABASE_URL` = полный URI из шага 2; `SUPABASE_URL` = Project URL; `SUPABASE_ANON_KEY` = Publishable key; `SUPABASE_SERVICE_ROLE_KEY` = Secret key. Для каждой выберите **Production**. Если используете Preview deployments, добавьте эти же переменные и в **Preview**. Не отправляйте Secret key в чат и не добавляйте его в клиентский код.
5. В Supabase откройте **SQL Editor → New query**, вставьте весь SQL из [`supabase/migrations/20261008000000_create_photoprint_tables.sql`](./supabase/migrations/20261008000000_create_photoprint_tables.sql) и нажмите **Run** один раз.
6. Создайте администратора через **Authentication → Users → Add user** и подтвердите его. Затем в SQL Editor выполните запрос из раздела «Администратор» ниже, заменив email.
7. В Vercel сохраните переменные и запустите новый deployment через **Deployments → Redeploy**. Уже созданный deployment не получает новые переменные автоматически.

Выполните SQL из [`supabase/migrations/20261008000000_create_photoprint_tables.sql`](./supabase/migrations/20261008000000_create_photoprint_tables.sql) в Supabase SQL Editor. Он создаёт таблицы, исходные демонстрационные услуги, настройки и элементы галереи, а также приватный bucket `photoprint-uploads` с лимитом 4 МБ и разрешёнными типами `image/jpeg`, `image/png`, `image/webp`, `video/mp4`.

Файлы читаются через серверный маршрут `/uploads/...`; bucket не должен быть публичным. Ключ `SUPABASE_SERVICE_ROLE_KEY` используется только на сервере — никогда не добавляйте его в клиентский JavaScript.

### Администратор

После создания пользователя в Supabase Auth и подтверждения email задайте ему серверную роль `admin` через Supabase SQL Editor:

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

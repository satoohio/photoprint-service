# PhotoPrint Service

Node.js + Express сервис фотопечати, копирования и оформления документов: публичный сайт + админ-панель.

## Возможности

### Сайт
- Страницы: главная, услуги (с детальными страницами по slug), галерея, контакты
- Форма заявки на сайте (`POST /api/orders`) с валидацией и уведомлением на почту
- Фильтр галереи по категориям (список строится из данных)
- Контакты, телефон и режим работы в шапке/футере берутся из настроек админки
- Тёмная/светлая тема, адаптивная вёрстка

### Админ-панель (`/admin`)
- Вход по логину/паролю (JWT в httpOnly-cookie), выход
- Rate limit на попытки входа (5 / 15 мин)
- Дашборд: статистика и последние заявки
- Услуги: CRUD, свой slug (уникальность с суффиксом), загрузка/замена/удаление изображения
- Галерея: CRUD, фото и видео (MP4), категории с подсказками (datalist), удаление файла
- Заявки: список, фильтр по статусу, поиск по имени/телефону/услуге, смена статуса, удаление
- Настройки сайта: название, контакты, hero-блок, HTML-код карты (белый список ключей)

## Быстрый старт

```bash
npm install
copy .env.example .env   # Windows: задайте SESSION_SECRET и JWT_SECRET
npm run seed
npm start
```

Сервер: `http://localhost:3000`

### Переменные окружения (`.env`)

| Переменная | Назначение |
|---|---|
| `PORT` | Порт HTTP-сервера (по умолчанию 3000) |
| `NODE_ENV` | `development` / `production` |
| `SESSION_SECRET` | Секрет сессий (обязательно в проде) |
| `JWT_SECRET` | Секрет JWT-токенов (обязательно в проде) |
| `BASE_URL` | Базовый URL для sitemap |
| `MAIL_*` | SMTP для уведомлений о заявках (если не заданы — почта пропускается) |

## Вход в админку

После `npm run seed`:

- Логин: `admin`
- Пароль: `Admin123!`

Панель: `http://localhost:3000/admin/login`

> Смените пароль и секреты в `.env` перед публичным размещением.

## Скрипты npm

| Команда | Описание |
|---|---|
| `npm start` | Запуск сервера (`node server.js`) |
| `npm run dev` | Запуск с nodemon |
| `npm run seed` | Идемпотентное наполнение БД (админ, настройки, услуги, галерея) |

## Структура

```
app.js            # Express: middleware, роуты, статика, обработчики ошибок
server.js         # Точка входа
config/db.js      # Sequelize + SQLite (data/photoprint.sqlite)
controllers/      # Логика страниц и API
models/           # Service, GalleryItem, Order, Setting, User
routes/           # public, admin, api
middleware/       # auth (JWT-cookie), upload (multer)
views/            # EJS: публичные страницы + views/admin
public/           # css, js, uploads
seeds/seed.js     # Демо-данные
utils/            # asyncHandler, mailer, slugify, uploads
```

## Технологии

- Express 4, EJS, Sequelize + SQLite
- JWT + cookie auth, express-session, connect-flash
- Multer (загрузка файлов), Helmet, express-rate-limit, express-validator
- Nodemailer (опционально), bcryptjs
- Vanilla JS + собственный CSS (light/dark)

## Заметки

- Загруженные файлы: `public/uploads/services`, `public/uploads/gallery`
- `data/` и `public/uploads/*` (кроме `.gitkeep`) в `.gitignore` — на новом клоне выполните `npm run seed`
- `sequelize.sync({ alter: true })` при старте — будьте осторожны с реальными данными
- Видео в галерее показывается с плейсхолдером (генерации превью нет)

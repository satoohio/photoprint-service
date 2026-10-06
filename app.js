require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const rateLimit = require('express-rate-limit');

const { syncDatabase } = require('./config/db');
const { getSettingsMap } = require('./controllers/homeController');
const indexRouter = require('./routes/index');
const servicesRouter = require('./routes/services');
const galleryRouter = require('./routes/gallery');
const contactsRouter = require('./routes/contacts');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

const app = express();

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required');
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false }
}));
app.use(flash());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const legacyPlaceholderFiles = {
  '/uploads/gallery/sample-1.svg': 'sample-1.svg',
  '/uploads/gallery/sample-2.svg': 'sample-2.svg',
  '/uploads/gallery/sample-3.svg': 'sample-3.svg',
  '/uploads/gallery/sample-4.svg': 'sample-4.svg',
  '/uploads/services/service-default.svg': 'service-default.svg'
};

app.get(Object.keys(legacyPlaceholderFiles), (req, res, next) => {
  res.sendFile(
    path.join(__dirname, 'public', 'gallery-placeholders', legacyPlaceholderFiles[req.path]),
    (error) => {
      if (error) next(error);
    }
  );
});

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads'), {
  index: false,
  setHeaders(res, filePath) {
    const forbiddenExtensions = ['.html', '.htm', '.svg', '.xml', '.js', '.json', '.css'];
    const ext = path.extname(filePath).toLowerCase();

    if (forbiddenExtensions.includes(ext)) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentYear = new Date().getFullYear();

  try {
    res.locals.settings = await getSettingsMap();
  } catch (error) {
    console.error('Settings load failed:', error.message);
    res.locals.settings = {};
  }

  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Слишком много запросов. Попробуйте позже.'
});
app.use('/api', apiLimiter);

app.use('/', indexRouter);
app.use('/services', servicesRouter);
app.use('/gallery', galleryRouter);
app.use('/contacts', contactsRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nAllow: /\n');
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${process.env.BASE_URL || 'http://localhost:3000'}/</loc></url>\n  <url><loc>${process.env.BASE_URL || 'http://localhost:3000'}/services</loc></url>\n  <url><loc>${process.env.BASE_URL || 'http://localhost:3000'}/gallery</loc></url>\n  <url><loc>${process.env.BASE_URL || 'http://localhost:3000'}/contacts</loc></url>\n</urlset>`);
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Страница не найдена' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).render('500', { title: 'Ошибка сервера', error: err.message });
});

async function startApp() {
  await syncDatabase();
  return app;
}

module.exports = { app, startApp };

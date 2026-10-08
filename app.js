require('dotenv').config();

const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const flashMessages = require('./middleware/flash');
const { createLimiter } = require('./middleware/rateLimit');
const asyncHandler = require('./utils/asyncHandler');

const { syncDatabase } = require('./config/db');
const { getSettingsMap } = require('./controllers/homeController');
const indexRouter = require('./routes/index');
const servicesRouter = require('./routes/services');
const galleryRouter = require('./routes/gallery');
const contactsRouter = require('./routes/contacts');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

const app = express();
const projectRoot = process.cwd();
let databaseInitialization;

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(morgan(':method :url :status :response-time ms', {
  skip: (req) => req.originalUrl.startsWith('/admin')
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(flashMessages);
app.use((req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin) {
    const expectedOrigin = `${req.protocol}://${req.get('host')}`;
    if (req.headers.origin !== expectedOrigin) {
      return res.status(403).send('Запрос с другого сайта запрещён');
    }
  }
  if (req.path.startsWith('/admin')) res.setHeader('Cache-Control', 'private, no-store');
  next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(projectRoot, 'views'));

const legacyPlaceholderFiles = {
  '/uploads/gallery/sample-1.svg': 'sample-1.svg',
  '/uploads/gallery/sample-2.svg': 'sample-2.svg',
  '/uploads/gallery/sample-3.svg': 'sample-3.svg',
  '/uploads/gallery/sample-4.svg': 'sample-4.svg',
  '/uploads/services/service-default.svg': 'service-default.svg'
};

app.get(Object.keys(legacyPlaceholderFiles), (req, res, next) => {
  res.sendFile(
    path.join(projectRoot, 'public', 'gallery-placeholders', legacyPlaceholderFiles[req.path]),
    (error) => {
      if (error) next(error);
    }
  );
});

app.get('/uploads/:section/:filename', asyncHandler(require('./utils/uploads').serveUpload));
app.use(express.static(path.join(projectRoot, 'public')));

app.use((req, res, next) => {
  startApp().then(() => next(), next);
});

app.use(async (req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentYear = new Date().getFullYear();
  res.locals.activePage = '';

  try {
    res.locals.settings = await getSettingsMap();
  } catch (error) {
    console.error('Settings load failed:', error.name);
    res.locals.settings = {};
  }

  next();
});

const apiLimiter = createLimiter('api', {
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
  const deploymentUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const baseUrl = (process.env.BASE_URL || (deploymentUrl ? `https://${deploymentUrl}` : `${req.protocol}://${req.get('host')}`)).replace(/\/$/, '');
  const escapedUrl = baseUrl.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]);
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['/', '/services', '/gallery', '/contacts'].map((page) => `  <url><loc>${escapedUrl}${page}</loc></url>`).join('\n')}\n</urlset>`);
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Страница не найдена' });
});

app.use((err, req, res, next) => {
  const message = typeof err.message === 'string'
    ? err.message.replace(/(postgres(?:ql)?:\/\/[^:\s/]+:)[^@\s/]+@/gi, '$1[REDACTED]@')
    : '';
  console.error('Request failed:', err.name, message, err.cause?.code || '');
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).render('500', {
    title: 'Ошибка сервера',
    error: 'Попробуйте позже.',
    flash: {},
    settings: {},
    currentYear: new Date().getFullYear(),
    activePage: ''
  });
});

async function startApp() {
  if (!databaseInitialization) {
    databaseInitialization = syncDatabase();
  }
  await databaseInitialization;
  return app;
}

app.startApp = startApp;

module.exports = app;

const express = require('express');
const rateLimit = require('express-rate-limit');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const { uploadServiceImage, uploadGalleryMedia } = require('../middleware/upload');
const { loginPage, loginUser, logoutUser } = require('../controllers/authController');
const {
  renderDashboard,
  renderServicesPage,
  renderServiceForm,
  saveService,
  deleteService,
  renderGalleryPage,
  renderGalleryForm,
  saveGallery,
  deleteGallery,
  renderOrdersPage,
  updateOrderStatus,
  deleteOrder,
  renderSettingsPage,
  saveSettings
} = require('../controllers/adminController');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    req.flash('error', 'Слишком много попыток входа. Попробуйте позже.');
    return res.redirect('/admin/login');
  }
});

function handleUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (!err) {
        return next();
      }

      const message = err.message || 'Ошибка загрузки файла';
      const section = req.baseUrl.includes('gallery') ? 'gallery' : 'services';
      req.flash('error', message);
      return res.redirect(req.params.id ? `/admin/${section}/${req.params.id}/edit` : `/admin/${section}/new`);
    });
  };
}

router.get('/login', asyncHandler(loginPage));
router.post('/login', authLimiter, asyncHandler(loginUser));
router.post('/logout', asyncHandler(logoutUser));

router.use(requireAuth);

router.get('/', asyncHandler(renderDashboard));

router.get('/services', asyncHandler(renderServicesPage));
router.get('/services/new', asyncHandler(renderServiceForm));
router.get('/services/:id/edit', asyncHandler(renderServiceForm));
router.post('/services', handleUpload(uploadServiceImage.single('image')), asyncHandler(saveService));
router.post('/services/:id', handleUpload(uploadServiceImage.single('image')), asyncHandler(saveService));
router.post('/services/:id/delete', asyncHandler(deleteService));

router.get('/gallery', asyncHandler(renderGalleryPage));
router.get('/gallery/new', asyncHandler(renderGalleryForm));
router.get('/gallery/:id/edit', asyncHandler(renderGalleryForm));
router.post('/gallery', handleUpload(uploadGalleryMedia.single('media')), asyncHandler(saveGallery));
router.post('/gallery/:id', handleUpload(uploadGalleryMedia.single('media')), asyncHandler(saveGallery));
router.post('/gallery/:id/delete', asyncHandler(deleteGallery));

router.get('/orders', asyncHandler(renderOrdersPage));
router.post('/orders/:id/status', asyncHandler(updateOrderStatus));
router.patch('/orders/:id/status', asyncHandler(updateOrderStatus));
router.post('/orders/:id/delete', asyncHandler(deleteOrder));

router.get('/settings', asyncHandler(renderSettingsPage));
router.post('/settings', asyncHandler(saveSettings));

module.exports = router;

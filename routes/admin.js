const express = require('express');
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
  renderSettingsPage,
  saveSettings
} = require('../controllers/adminController');

const router = express.Router();

router.get('/login', loginPage);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.use(requireAuth);

router.get('/', renderDashboard);

router.get('/services', renderServicesPage);
router.get('/services/new', renderServiceForm);
router.get('/services/:id/edit', renderServiceForm);
router.post('/services', uploadServiceImage.single('image'), saveService);
router.post('/services/:id', uploadServiceImage.single('image'), saveService);
router.post('/services/:id/delete', deleteService);

router.get('/gallery', renderGalleryPage);
router.get('/gallery/new', renderGalleryForm);
router.get('/gallery/:id/edit', renderGalleryForm);
router.post('/gallery', uploadGalleryMedia.single('media'), saveGallery);
router.post('/gallery/:id', uploadGalleryMedia.single('media'), saveGallery);
router.post('/gallery/:id/delete', deleteGallery);

router.get('/orders', renderOrdersPage);
router.post('/orders/:id/status', updateOrderStatus);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/settings', renderSettingsPage);
router.post('/settings', saveSettings);

module.exports = router;

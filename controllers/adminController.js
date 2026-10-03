const fs = require('fs');
const path = require('path');
const { Service, GalleryItem, Order, Setting } = require('../models');
const { createService, updateService } = require('./serviceController');
const { createGalleryItem } = require('./galleryController');
const { getSettingsMap } = require('./homeController');

async function renderDashboard(req, res) {
  const [services, galleryItems, orders, settings] = await Promise.all([
    Service.count(),
    GalleryItem.count(),
    Order.findAll({ order: [['createdAt', 'DESC']], limit: 8, raw: true }),
    getSettingsMap()
  ]);

  res.render('admin/dashboard', {
    title: 'Панель управления',
    stats: {
      services,
      galleryItems,
      orders: orders.length
    },
    recentOrders: orders,
    settings,
    activePage: 'dashboard'
  });
}

async function renderServicesPage(req, res) {
  const services = await Service.findAll({ order: [['order', 'ASC']], raw: true });
  res.render('admin/services', {
    title: 'Услуги',
    services,
    activePage: 'services'
  });
}

async function renderServiceForm(req, res) {
  const { id } = req.params;
  const service = id ? await Service.findByPk(id) : null;
  res.render('admin/service-form', {
    title: service ? 'Редактировать услугу' : 'Новая услуга',
    service,
    activePage: 'services'
  });
}

async function saveService(req, res) {
  const { id } = req.params;
  const service = id ? await Service.findByPk(id) : null;

  try {
    if (service) {
      await updateService(req, res, service);
      req.flash('success', 'Услуга обновлена');
      return res.redirect('/admin/services');
    }

    await createService(req, res);
    req.flash('success', 'Услуга добавлена');
    return res.redirect('/admin/services');
  } catch (error) {
    req.flash('error', 'Ошибка при сохранении услуги');
    return res.redirect('/admin/services');
  }
}

async function deleteService(req, res) {
  const { id } = req.params;
  const service = await Service.findByPk(id);

  if (service && service.image) {
    const filePath = path.join(__dirname, '../public', service.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await service.destroy();
  req.flash('success', 'Услуга удалена');
  return res.redirect('/admin/services');
}

async function renderGalleryPage(req, res) {
  const items = await GalleryItem.findAll({ order: [['order', 'ASC']], raw: true });
  res.render('admin/gallery', {
    title: 'Галерея',
    items,
    activePage: 'gallery'
  });
}

async function renderGalleryForm(req, res) {
  const { id } = req.params;
  const item = id ? await GalleryItem.findByPk(id) : null;
  res.render('admin/gallery-form', {
    title: item ? 'Редактировать элемент' : 'Новый элемент галереи',
    item,
    activePage: 'gallery'
  });
}

async function saveGallery(req, res) {
  const { id } = req.params;

  try {
    if (id) {
      const item = await GalleryItem.findByPk(id);
      const { title, category, description, order, type } = req.body;
      const updateData = {
        title,
        category: category || 'general',
        description: description || '',
        order: Number(order || 0),
        type: type || item.type
      };
      if (req.file) {
        updateData.url = `/uploads/gallery/${req.file.filename}`;
      }
      await item.update(updateData);
      req.flash('success', 'Элемент галереи обновлён');
      return res.redirect('/admin/gallery');
    }

    await createGalleryItem(req, res);
    req.flash('success', 'Элемент галереи добавлен');
    return res.redirect('/admin/gallery');
  } catch (error) {
    req.flash('error', 'Ошибка при сохранении файла галереи');
    return res.redirect('/admin/gallery');
  }
}

async function deleteGallery(req, res) {
  const { id } = req.params;
  const item = await GalleryItem.findByPk(id);

  if (item && item.url) {
    const filePath = path.join(__dirname, '../public', item.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await item.destroy();
  req.flash('success', 'Элемент удалён');
  return res.redirect('/admin/gallery');
}

async function renderOrdersPage(req, res) {
  const orders = await Order.findAll({ order: [['createdAt', 'DESC']], raw: true });
  res.render('admin/orders', {
    title: 'Заявки',
    orders,
    activePage: 'orders'
  });
}

async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const order = await Order.findByPk(id);

  if (!order) {
    return res.status(404).json({ message: 'Заявка не найдена' });
  }

  await order.update({ status });
  return res.json({ success: true, order });
}

async function renderSettingsPage(req, res) {
  const settings = await getSettingsMap();
  res.render('admin/settings', {
    title: 'Настройки сайта',
    settings,
    activePage: 'settings'
  });
}

async function saveSettings(req, res) {
  const entries = req.body;

  for (const [key, value] of Object.entries(entries)) {
    const existing = await Setting.findOne({ where: { key } });
    if (existing) {
      await existing.update({ value });
    } else {
      await Setting.create({ key, value });
    }
  }

  req.flash('success', 'Настройки сохранены');
  return res.redirect('/admin/settings');
}

module.exports = {
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
};

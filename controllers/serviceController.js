const { Service } = require('../models');
const { makeSlug } = require('../utils/slugify');

async function listPublicServices(req, res) {
  const services = await Service.findAll({
    where: { isActive: true },
    order: [['order', 'ASC']],
    raw: true
  });

  res.render('services', {
    title: 'Услуги',
    services,
    activePage: 'services'
  });
}

async function showSingleService(req, res) {
  const { slug } = req.params;
  const service = await Service.findOne({ where: { slug } });

  if (!service) {
    return res.status(404).render('404', { title: 'Услуга не найдена' });
  }

  return res.render('service-single', {
    title: service.title,
    service: service.toJSON(),
    activePage: 'services'
  });
}

async function getServiceApi(req, res) {
  const services = await Service.findAll({
    where: { isActive: true },
    order: [['order', 'ASC']],
    raw: true
  });
  res.json(services);
}

async function createService(req, res) {
  const { title, description, price, priceUnit, icon, order, isActive } = req.body;
  const slug = makeSlug(title);

  const service = await Service.create({
    title,
    slug,
    description,
    price: Number(price || 0),
    priceUnit: priceUnit || 'шт',
    icon: icon || 'fa-print',
    order: Number(order || 0),
    isActive: String(isActive) === 'on' || Boolean(isActive),
    image: req.file ? `/uploads/services/${req.file.filename}` : null
  });

  return service;
}

async function updateService(req, res, service) {
  const { title, description, price, priceUnit, icon, order, isActive } = req.body;
  const updateData = {
    title,
    description,
    price: Number(price || 0),
    priceUnit: priceUnit || 'шт',
    icon: icon || 'fa-print',
    order: Number(order || 0),
    isActive: String(isActive) === 'on' || Boolean(isActive)
  };

  if (title) {
    updateData.slug = makeSlug(title);
  }

  if (req.file) {
    updateData.image = `/uploads/services/${req.file.filename}`;
  }

  await service.update(updateData);
  return service;
}

module.exports = {
  listPublicServices,
  showSingleService,
  getServiceApi,
  createService,
  updateService
};

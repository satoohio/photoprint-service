const { Op } = require('../utils/operators');
const { Service } = require('../models');
const { makeSlug } = require('../utils/slugify');
const { safeDeleteUpload } = require('../utils/uploads');

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

async function resolveUniqueSlug(rawSlug, title, excludeId) {
  const base = makeSlug(rawSlug || title) || makeSlug(title) || `service-${Date.now()}`;
  let candidate = base;
  let suffix = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const where = { slug: candidate };
    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }
    const existing = await Service.findOne({ where });
    if (!existing) {
      return candidate;
    }
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function createService(req, res) {
  const { title, description, price, priceUnit, icon, order, isActive, slug } = req.body;
  const finalSlug = await resolveUniqueSlug(slug, title, null);

  const service = await Service.create({
    title,
    slug: finalSlug,
    description,
    price: Number(price || 0),
    priceUnit: priceUnit || 'шт',
    icon: icon || 'fa-print',
    order: Number(order || 0),
    isActive: String(isActive) === 'on' || Boolean(isActive),
    image: req.file ? req.file.url : null
  });

  return service;
}

async function updateService(req, res, service) {
  const { title, description, price, priceUnit, icon, order, isActive, slug, removeImage } = req.body;
  const updateData = {
    title,
    description,
    price: Number(price || 0),
    priceUnit: priceUnit || 'шт',
    icon: icon || 'fa-print',
    order: Number(order || 0),
    isActive: String(isActive) === 'on' || Boolean(isActive)
  };

  const incomingSlug = (slug || '').trim();
  const previousImage = service.image;
  if (incomingSlug && incomingSlug !== service.slug) {
    updateData.slug = await resolveUniqueSlug(incomingSlug, title, service.id);
  }

  if (req.file) {
    updateData.image = req.file.url;
  } else if (removeImage === '1' || removeImage === 'on') {
    updateData.image = null;
  }

  await service.update(updateData);
  if ('image' in updateData && previousImage) await safeDeleteUpload(previousImage);
  return service;
}

module.exports = {
  listPublicServices,
  showSingleService,
  getServiceApi,
  createService,
  updateService
};

const { createModel } = require('./repository');

module.exports = {
  Service: createModel('Service'),
  GalleryItem: createModel('GalleryItem'),
  Order: createModel('Order'),
  Setting: createModel('Setting')
};

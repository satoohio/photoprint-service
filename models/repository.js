function createModel(name) {
  const model = {};
  for (const method of ['findAll', 'findOne', 'findByPk', 'count', 'create', 'findOrCreate', 'update']) {
    model[method] = async (...args) => {
      const { repositories } = require('../db/repositories.js');
      return repositories[name][method](...args);
    };
  }
  return model;
}

module.exports = { createModel };

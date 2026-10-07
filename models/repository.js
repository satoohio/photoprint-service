function createModel(name) {
  const model = {};
  for (const method of ['findAll', 'findOne', 'findByPk', 'count', 'create', 'findOrCreate', 'update']) {
    model[method] = async (...args) => {
      const { repositories } = await import('../db/repositories.ts');
      return repositories[name][method](...args);
    };
  }
  return model;
}

module.exports = { createModel };

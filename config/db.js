const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const dataDir = path.join(__dirname, '../data');
fs.mkdirSync(dataDir, { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dataDir, 'photoprint.sqlite'),
  logging: false,
  define: {
    timestamps: true
  }
});

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true, force: false });
    return sequelize;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

module.exports = { sequelize, syncDatabase };

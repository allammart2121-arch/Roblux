const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'roblox_recarga_super_secret_jwt_key_2026_antigravity',
  JWT_EXPIRES_IN: '7d',
  DB_PATH: path.join(__dirname, '..', 'data', 'db.json')
};

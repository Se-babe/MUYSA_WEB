const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'muysa_user',
  password: process.env.DB_PASSWORD || 'Muysa@2026',
  database: process.env.DB_NAME || 'muysa_connect',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;

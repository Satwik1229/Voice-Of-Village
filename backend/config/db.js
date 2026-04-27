const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false
  }
});
const promisePool = pool.promise();

// Application-layer heartbeat to prevent aggressive Railway proxy disconnects
setInterval(async () => {
  try {
    await promisePool.query('SELECT 1');
  } catch (err) {
    console.error('MySQL Heartbeat failed:', err);
  }
}, 10000); // Ping every 10 seconds

module.exports = promisePool;
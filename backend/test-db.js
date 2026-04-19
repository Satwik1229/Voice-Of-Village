const db = require('./config/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT 1 as result');
    console.log('Database connection successful:', rows[0].result === 1);
    process.exit(0);
  } catch (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();

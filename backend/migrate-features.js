const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateFeatures() {
  const connectionDetails = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'voice_of_village',
    port: process.env.DB_PORT || 3306
  };

  try {
    console.log('Connecting to MySQL Server for feature migrations...');
    const connection = await mysql.createConnection(connectionDetails);

    console.log('Creating fund_documents table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fund_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        document_url VARCHAR(255) NOT NULL,
        uploaded_by INT NOT NULL,
        financial_year VARCHAR(20),
        category ENUM('budget', 'expenditure', 'audit', 'tender', 'other') DEFAULT 'other',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ fund_documents table created');

    console.log('Creating announcements table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        posted_by INT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ announcements table created');

    await connection.end();
    console.log('Feature Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrateFeatures();

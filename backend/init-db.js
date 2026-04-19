const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  const connectionDetails = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
  };

  try {
    console.log('Connecting to MySQL Server (without schema)...');
    const connection = await mysql.createConnection(connectionDetails);

    const dbName = process.env.DB_NAME || 'voice_of_village';
    console.log(`Creating database ${dbName} if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    
    console.log(`Using ${dbName} database...`);
    await connection.query(`USE \`${dbName}\``);

    console.log('Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Creating issues table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        submitted_by INT NOT NULL,
        image_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('Creating issue_comments table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS issue_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        issue_id INT NOT NULL,
        user_id INT NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database and all tables created successfully!');
    await connection.end();
    process.exit(0);

  } catch (err) {
    console.error('❌ Failed to initialize database:', err.message);
    process.exit(1);
  }
}

initializeDatabase();

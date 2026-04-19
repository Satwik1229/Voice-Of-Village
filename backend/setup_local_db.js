const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function setupLocalDB() {
  console.log("=== STARTING LOCAL DATABASE SETUP ===");
  try {
    const scripts = [
      'init-db.js',
      'migrate-donations.js',
      'migrate-electricity.js',
      'migrate-house.js',
      'migrate-water.js',
      'migrate-pds.js'
    ];

    for (let script of scripts) {
      console.log(`\n=> Running ${script}...`);
      try {
        const output = execSync(`node ${script}`, { stdio: 'inherit' });
      } catch (err) {
        console.error(`Warning: ${script} encountered an issue: ${err.message}`);
      }
    }

    console.log("\n=> Seeding Default Admin Account...");
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    const [adminCheck] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@village.com']);
    if (adminCheck.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Super Admin', 'admin@village.com', hashedPassword, 'admin']
      );
      console.log("✅ Default admin created! (admin@village.com / admin123)");
    } else {
      console.log("✅ Admin account already exists.");
    }
    
    // Seed PDS Dealer for test
    const [pdsCheck] = await connection.query('SELECT * FROM users WHERE email = ?', ['dealer@village.com']);
    if (pdsCheck.length === 0) {
      const pdsHashed = await bcrypt.hash('dealer123', 10);
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['PDS Dealer', 'dealer@village.com', pdsHashed, 'pds_dealer']
      );
      console.log("✅ Default PDS dealer created! (dealer@village.com / dealer123)");
    }

    // Insert dummy PDS inventory just in case (handled by migrate-pds.js now)

    await connection.end();
    console.log("\n=== LOCAL DATABASE SETUP COMPLETE! ===");
    process.exit(0);
  } catch(e) {
    console.error("FATAL Setup Error:", e.message);
    process.exit(1);
  }
}

setupLocalDB();

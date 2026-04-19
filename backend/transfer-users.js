const mysql = require('mysql2/promise');
require('dotenv').config();

async function transferUsers() {
  // 1. Connect to Local MySQL
  console.log('Connecting to Local MySQL Database...');
  let localDb;
  try {
    localDb = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Reddy@2004', // Update this if your local MySQL has a password
      database: 'voice_of_village',
      port: 3306
    });
    console.log('✅ Connected to Local Database!');
  } catch (err) {
    console.error('❌ Failed to connect to local DB. Is your local MySQL server running (like XAMPP)?');
    console.error(err.message);
    process.exit(1);
  }

  // 2. Fetch all users from local
  let usersToTransfer = [];
  try {
    const [rows] = await localDb.query('SELECT * FROM users');
    usersToTransfer = rows;
    console.log(`Found ${usersToTransfer.length} users in local DB.`);
  } catch (err) {
    console.error('❌ Failed to fetch users from local DB:', err.message);
    process.exit(1);
  }

  // 3. Connect to Railway MySQL
  console.log('Connecting to Railway MySQL Database...');
  let railwayDb;
  try {
    railwayDb = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    console.log('✅ Connected to Railway Database!');
  } catch (err) {
    console.error('❌ Failed to connect to Railway DB:', err.message);
    process.exit(1);
  }

  // 4. Insert users into Railway
  if (usersToTransfer.length > 0) {
    console.log('Transferring users to Railway...');
    for (const user of usersToTransfer) {
      try {
        await railwayDb.query(
          `INSERT IGNORE INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [user.id, user.name, user.email, user.password, user.role, user.created_at]
        );
        console.log(`✅ Transferred user: ${user.email}`);
      } catch (insertErr) {
        console.error(`⚠️ Skipped ${user.email}: `, insertErr.message);
      }
    }
    console.log('🎉 All user transfers completed!');
  } else {
    console.log('No users found in local database to transfer.');
  }

  await localDb.end();
  await railwayDb.end();
  process.exit(0);
}

transferUsers();

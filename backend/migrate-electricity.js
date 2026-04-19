const db = require('./config/db');

async function migrateElectricityRequests() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS electricity_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        village_name VARCHAR(150) NOT NULL,
        ward_number VARCHAR(100),
        contact_number VARCHAR(15) NOT NULL,
        consumer_number VARCHAR(100),
        problem_type ENUM(
          'No power supply',
          'Frequent power cuts',
          'Transformer failure',
          'Street light not working',
          'Damaged electric pole/wire',
          'New connection request',
          'Meter issue/complaint'
        ) NOT NULL,
        description TEXT NOT NULL,
        days_existing INT DEFAULT 0,
        households_affected INT DEFAULT 0,
        landmark TEXT,
        pole_number VARCHAR(100),
        photo_path VARCHAR(255) DEFAULT NULL,
        priority ENUM('Low','Medium','Urgent') DEFAULT 'Medium',
        status ENUM('Pending','In Progress','Resolved','Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ electricity_requests table created');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

migrateElectricityRequests();

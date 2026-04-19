const db = require('./config/db');

async function migrateHouseRequests() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS house_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        village_name VARCHAR(150) NOT NULL,
        ward_number VARCHAR(100),
        contact_number VARCHAR(15) NOT NULL,
        aadhaar_number VARCHAR(12) NOT NULL,
        
        plot_number VARCHAR(100),
        plot_size VARCHAR(100),
        survey_number VARCHAR(100),
        landmark TEXT,
        sale_deed_path VARCHAR(255) DEFAULT NULL,

        request_type ENUM(
          'Building Plan Approval',
          'NOC from Gram Panchayat',
          'Commencement Certificate',
          'Completion Certificate',
          'Occupancy Certificate (OC)',
          'Water & Electricity Connection NOC',
          'Property Tax Registration'
        ) NOT NULL,

        construction_type ENUM('New House', 'Extension/Addition', 'Renovation') NOT NULL,
        floors_planned INT DEFAULT 1,
        estimated_cost VARCHAR(100),
        expected_start_date DATE,
        house_plan_path VARCHAR(255) DEFAULT NULL,

        encumbrance_cert_path VARCHAR(255) DEFAULT NULL,
        land_record_path VARCHAR(255) DEFAULT NULL,
        prev_approvals_path VARCHAR(255) DEFAULT NULL,

        priority ENUM('Normal','Urgent') DEFAULT 'Normal',
        status ENUM('Pending','In Progress','Approved','Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ house_requests table created');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exit(1);
  }
}

migrateHouseRequests();

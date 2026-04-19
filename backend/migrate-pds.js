const db = require('./config/db');

async function migratePds() {
  try {
    console.log("Creating PDS tables...");
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS pds_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item VARCHAR(255) NOT NULL,
        quantity VARCHAR(50) NOT NULL,
        price VARCHAR(50) NOT NULL,
        availability VARCHAR(50) DEFAULT 'Available'
      )
    `);
    console.log("Created pds_items table.");

    await db.query(`
      CREATE TABLE IF NOT EXISTS pds_bookings (
        id VARCHAR(50) PRIMARY KEY,
        user_id INT NOT NULL,
        item VARCHAR(255) NOT NULL,
        quantity VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        time_slot VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'BOOKED',
        otp VARCHAR(10) NOT NULL,
        qr_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Created pds_bookings table.");

    // Insert Default Items if none exist
    const [items] = await db.query('SELECT * FROM pds_items');
    if (items.length === 0) {
      await db.query(`
        INSERT INTO pds_items (item, quantity, price, availability) VALUES 
        ('Rice', '500 Kg', '₹10', 'Available'),
        ('Wheat', '300 Kg', '₹8', 'Available'),
        ('Sugar', '100 Kg', '₹30', 'Out of Stock')
      `);
      console.log("Inserted default PDS items.");
    }

    console.log("PDS Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migratePds();

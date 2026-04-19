require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createPdsDealer() {
  try {
    const [existing] = await db.query("SELECT * FROM users WHERE email = 'pds@village.com'");
    if (existing.length > 0) {
      console.log('✅ PDS dealer already exists: pds@village.com / Pds@1234');
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash('Pds@1234', 10);
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ['PDS Dealer', 'pds@village.com', hashedPassword, 'pds_dealer']
    );
    console.log('✅ PDS Dealer user created successfully!');
    console.log('   Email: pds@village.com');
    console.log('   Password: Pds@1234');
    process.exit(0);
  } catch (err) {
    console.error('Error creating PDS dealer:', err.message);
    process.exit(1);
  }
}

createPdsDealer();

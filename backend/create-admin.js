const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const [existing] = await db.query("SELECT * FROM users WHERE email = 'admin@village.com'");
    if (existing.length > 0) {
      console.log('Admin user already exists:', existing[0].email);
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ['Village Admin', 'admin@village.com', hashedPassword, 'admin']
    );
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@village.com');
    console.log('   Password: Admin@1234');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();

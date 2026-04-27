const db = require('./config/db');

async function seedDonations() {
  try {
    console.log("Seeding dummy donations...");
    await db.query(`
      INSERT INTO donations (name, email, amount, status) 
      VALUES 
      ('Satwik Reddy', 'satwik@example.com', 5000, 'completed'), 
      ('John Doe', 'john@example.com', 1000, 'completed'),
      ('Village Well-wisher', 'anon@example.com', 2500, 'completed')
    `);
    console.log("✅ Donations seeded!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seedDonations();

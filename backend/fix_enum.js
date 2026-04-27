const db = require('./config/db');

async function fixFullSchema() {
  try {
    console.log("Starting comprehensive schema fix...");

    // Issues Table
    await db.query("ALTER TABLE issues MODIFY COLUMN category VARCHAR(100) NOT NULL");
    await db.query("ALTER TABLE issues MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending'");
    console.log("✅ Issues table fixed");

    // Water Requests
    await db.query("ALTER TABLE water_requests MODIFY COLUMN problem_type VARCHAR(100) NOT NULL");
    await db.query("ALTER TABLE water_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'");
    console.log("✅ Water requests fixed");

    // Electricity Requests
    await db.query("ALTER TABLE electricity_requests MODIFY COLUMN problem_type VARCHAR(100) NOT NULL");
    await db.query("ALTER TABLE electricity_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'");
    console.log("✅ Electricity requests fixed");

    // House Requests
    await db.query("ALTER TABLE house_requests MODIFY COLUMN aadhaar_number VARCHAR(20) NOT NULL");
    await db.query("ALTER TABLE house_requests MODIFY COLUMN request_type VARCHAR(100)");
    await db.query("ALTER TABLE house_requests MODIFY COLUMN construction_type VARCHAR(100)");
    await db.query("ALTER TABLE house_requests MODIFY COLUMN status VARCHAR(50) DEFAULT 'Pending'");
    console.log("✅ House requests fixed");

    console.log("\n🚀 All tables updated to flexible VARCHAR types!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Schema fix failed:", err.message);
    process.exit(1);
  }
}

fixFullSchema();

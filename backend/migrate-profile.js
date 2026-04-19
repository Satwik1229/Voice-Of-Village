const db = require('./config/db');

async function addProfileColumns() {
  const columns = [
    "ALTER TABLE users ADD COLUMN pds_number VARCHAR(50) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN dob DATE DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL",
  ];

  for (const sql of columns) {
    try {
      await db.query(sql);
      console.log("✅ Column added:", sql.split("ADD COLUMN")[1].trim());
    } catch (e) {
      console.log("⚠️  Skipped (already exists):", sql.split("ADD COLUMN")[1].trim());
    }
  }
  console.log("Done.");
  process.exit(0);
}

addProfileColumns();

const db = require('./config/db');

async function fixDb() {
  try {
    console.log("Adding columns if they do not exist...");
    try {
      await db.query("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE");
      console.log("Added is_verified column.");
    } catch (e) { console.log("is_verified column might already exist."); }
    
    try {
      await db.query("ALTER TABLE users ADD COLUMN document_path VARCHAR(255) DEFAULT NULL");
      console.log("Added document_path column.");
    } catch (e) { console.log("document_path column might already exist."); }

    await db.query("UPDATE users SET is_verified = TRUE WHERE role IN ('admin', 'pds_dealer')");
    console.log("Auto-verified admin and pds_dealer accounts.");
    
    console.log("Database schema fixed successfully.");
  } catch (err) {
    console.error("Failed to fix schema:", err);
  } finally {
    process.exit(0);
  }
}

fixDb();

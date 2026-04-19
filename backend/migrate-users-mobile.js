const db = require('./config/db');

async function migrate() {
  try {
    console.log('Migrating users table to add mobile_number...');
    
    // Add mobile_number column
    try {
      await db.query(`ALTER TABLE users ADD COLUMN mobile_number VARCHAR(15) UNIQUE DEFAULT NULL`);
      console.log('Added mobile_number column.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('mobile_number column already exists.');
      } else {
        throw err;
      }
    }

    // Modify email column to be nullable
    try {
      await db.query(`ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL`);
      console.log('Modified email column to let it be NULL.');
    } catch (err) {
      console.error('Error modifying email column:', err);
    }

    // Drop unique constraint on email if needed (might fail if foreign keys exist, but we can try)
    try {
      await db.query(`ALTER TABLE users DROP INDEX email`);
      console.log('Dropped unique constraint on email.');
    } catch (err) {
      console.log('Unique constraint on email might already be dropped or does not exist.', err.message);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

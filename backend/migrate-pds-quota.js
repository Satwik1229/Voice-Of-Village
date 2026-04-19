const db = require('./config/db');
require('dotenv').config();

async function migrate() {
  console.log('🚀 Running PDS Card Type & Quota Migration...\n');

  // 1. Add card_type and family_members to users table
  try {
    await db.query("ALTER TABLE users ADD COLUMN card_type ENUM('AAY', 'PHH', 'APL') DEFAULT NULL");
    console.log('✅ Added card_type column to users');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️  card_type column already exists');
    else console.log('⚠️  card_type:', e.message);
  }

  try {
    await db.query("ALTER TABLE users ADD COLUMN family_members INT DEFAULT 1");
    console.log('✅ Added family_members column to users');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️  family_members column already exists');
    else console.log('⚠️  family_members:', e.message);
  }

  // 2. Add monthly_quota column to pds_items
  try {
    await db.query("ALTER TABLE pds_items ADD COLUMN monthly_quota_aay DECIMAL(8,2) DEFAULT NULL COMMENT 'kg or litre per family per month for AAY card'");
    await db.query("ALTER TABLE pds_items ADD COLUMN monthly_quota_phh DECIMAL(8,2) DEFAULT NULL COMMENT 'kg or litre per person per month for PHH card'");
    await db.query("ALTER TABLE pds_items ADD COLUMN unit VARCHAR(20) DEFAULT 'Kg'");
    console.log('✅ Added quota columns to pds_items');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log('ℹ️  quota columns already exist');
    else console.log('⚠️  quota cols:', e.message);
  }

  // 3. Seed/update pds_items with correct Telangana ration items and quotas
  const items = [
    // [item_name, unit, price, monthly_quota_aay (per family), monthly_quota_phh (per person), availability, quantity]
    ['Rice',           'Kg',    '₹2/Kg',  35, 6,   'Available', '200 Kg'],
    ['Wheat',          'Kg',    '₹2/Kg',  35, 5,   'Available', '150 Kg'],
    ['Red Gram Dal',   'Kg',    '₹3/Kg',  1,  1,   'Available', '50 Kg'],
    ['Palm Oil',       'Litre', '₹5/L',   1,  0.5, 'Available', '30 Litre'],
    ['Sugar',          'Kg',    '₹13/Kg', 1,  1,   'Available', '30 Kg'],
    ['Kerosene',       'Litre', '₹15/L',  4,  2,   'Available', '20 Litre'],
    ['Salt',           'Kg',    '₹2/Kg',  1,  1,   'Available', '40 Kg'],
  ];

  // Clear existing and re-seed
  await db.query('DELETE FROM pds_items');
  for (const [item, unit, price, quota_aay, quota_phh, availability, quantity] of items) {
    await db.query(
      'INSERT INTO pds_items (item, unit, price, monthly_quota_aay, monthly_quota_phh, availability, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [item, unit, price, quota_aay, quota_phh, availability, quantity]
    );
    console.log(`✅ Seeded: ${item}`);
  }

  console.log('\n🎉 PDS Migration complete!');
  process.exit(0);
}

migrate().catch(e => { console.error('❌ Migration failed:', e.message); process.exit(1); });

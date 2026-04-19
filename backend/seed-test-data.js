const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  // Get first regular user id
  const [[user]] = await db.query("SELECT id, name FROM users WHERE role = 'user' LIMIT 1");
  if (!user) { console.log('No villager user found. Please register a villager first.'); process.exit(1); }
  const uid = user.id;
  console.log('Using villager:', user.name, '(ID:', uid + ')');

  // Seed Issues
  await db.query(
    "INSERT INTO issues (title, description, category, submitted_by, status) VALUES (?, ?, ?, ?, ?)",
    ['Road Damage Near School', 'The main road near the government school has large potholes causing accidents for 2-wheelers.', 'infrastructure', uid, 'pending']
  );
  console.log('✅ Issue 1 added');

  await db.query(
    "INSERT INTO issues (title, description, category, submitted_by, status) VALUES (?, ?, ?, ?, ?)",
    ['Streetlight Not Working', 'Three streetlights on Main Street have been dead for over 2 weeks creating safety hazards at night.', 'electricity', uid, 'in-progress']
  );
  console.log('✅ Issue 2 added');

  await db.query(
    "INSERT INTO issues (title, description, category, submitted_by, status) VALUES (?, ?, ?, ?, ?)",
    ['Water Supply Interruption', 'Water supply has been cut for 3 consecutive days. Many families are struggling.', 'water', uid, 'pending']
  );
  console.log('✅ Issue 3 added');

  // Seed Water Request
  try {
    await db.query(
      "INSERT INTO water_requests (user_id, full_name, village_name, ward_number, contact_number, problem_type, description, days_existing, households_affected, landmark, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uid, user.name, 'Main Village', '3', '9876543210', 'No Water Supply', 'Water supply has been completely cut for the past 3 days. Requesting urgent restoration.', 3, 15, 'Near Village Temple', 'pending']
    );
    console.log('✅ Water request added');
  } catch(e) { console.log('⚠️ Water request skip:', e.message); }

  // Seed House Request
  try {
    await db.query(
      "INSERT INTO house_requests (user_id, full_name, village_name, ward_number, contact_number, aadhaar_number, plot_number, request_type, construction_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uid, user.name, 'Main Village', '7', '9876543210', '1234-5678-9012', 'Plot-45-E', 'New Construction', 'RCC', 'pending']
    );
    console.log('✅ House request added');
  } catch(e) { console.log('⚠️ House request skip:', e.message); }

  // Seed Electricity Request
  try {
    await db.query(
      "INSERT INTO electricity_requests (user_id, full_name, village_name, ward_number, contact_number, problem_type, description, days_existing, households_affected, landmark, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [uid, user.name, 'Main Village', '2', '9876543210', 'No Connection', 'No electricity connection in household. Requesting new meter and connection urgently.', 30, 5, 'Near Water Tank', 'pending']
    );
    console.log('✅ Electricity request added');
  } catch(e) { console.log('⚠️ Electricity request skip:', e.message); }

  console.log('\n🎉 All test data seeded successfully!');
  await db.end();
  process.exit(0);
}

seed().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });

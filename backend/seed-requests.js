const db = require('./config/db');
async function seed() {
  const [[user]] = await db.query("SELECT id, name FROM users WHERE role='user' LIMIT 1");
  const uid = user.id;
  console.log('User:', user.name, uid);

  await db.query(
    'INSERT INTO house_requests (user_id, full_name, village_name, ward_number, contact_number, aadhaar_number, plot_number, request_type, construction_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [uid, user.name, 'Main Village', '7', '9876543210', '123456789012', 'Plot-45-E', 'Building Plan Approval', 'New House', 'pending']
  );
  console.log('House request added');

  await db.query(
    'INSERT INTO electricity_requests (user_id, full_name, village_name, ward_number, contact_number, problem_type, description, days_existing, households_affected, landmark, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [uid, user.name, 'Main Village', '2', '9876543210', 'New connection request', 'No electricity connection. Requesting new meter.', 30, 5, 'Near Water Tank', 'pending']
  );
  console.log('Electricity request added');

  process.exit(0);
}
seed().catch(e => { console.error(e.message); process.exit(1); });

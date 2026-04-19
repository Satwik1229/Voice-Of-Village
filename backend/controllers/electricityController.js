const db = require('../config/db');

// POST /api/electricity
const createElectricityRequest = async (req, res) => {
  try {
    const {
      user_id, full_name, village_name, ward_number, contact_number,
      consumer_number, problem_type, description, days_existing,
      households_affected, landmark, pole_number, priority
    } = req.body;
    const photo_path = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO electricity_requests
        (user_id, full_name, village_name, ward_number, contact_number,
         consumer_number, problem_type, description, days_existing,
         households_affected, landmark, pole_number, photo_path, priority)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [user_id, full_name, village_name, ward_number, contact_number,
       consumer_number || null, problem_type, description,
       days_existing || 0, households_affected || 0,
       landmark, pole_number || null, photo_path, priority || 'Medium']
    );
    res.status(201).json({ message: 'Electricity request submitted successfully!' });
  } catch (err) {
    console.error('createElectricityRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/electricity?userId=X
const getUserElectricityRequests = async (req, res) => {
  try {
    const { userId } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM electricity_requests WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/electricity/all
const getAllElectricityRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT er.*, u.email
       FROM electricity_requests er
       JOIN users u ON er.user_id = u.id
       ORDER BY er.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/electricity/:id/status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query('UPDATE electricity_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createElectricityRequest, getUserElectricityRequests, getAllElectricityRequests, updateStatus };

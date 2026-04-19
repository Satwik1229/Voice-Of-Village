const db = require('../config/db');

// POST /api/water - submit a new request
const createWaterRequest = async (req, res) => {
  try {
    const {
      user_id, full_name, village_name, ward_number, contact_number,
      problem_type, description, days_existing, households_affected,
      landmark, priority
    } = req.body;
    const photo_path = req.file ? req.file.filename : null;

    await db.query(
      `INSERT INTO water_requests
        (user_id, full_name, village_name, ward_number, contact_number,
         problem_type, description, days_existing, households_affected,
         landmark, photo_path, priority)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [user_id, full_name, village_name, ward_number, contact_number,
       problem_type, description, days_existing || 0, households_affected || 0,
       landmark, photo_path, priority || 'Medium']
    );
    res.status(201).json({ message: 'Water request submitted successfully!' });
  } catch (err) {
    console.error('createWaterRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/water?userId=X - get requests for a user
const getUserWaterRequests = async (req, res) => {
  try {
    const { userId } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM water_requests WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/water/all - admin view all requests
const getAllWaterRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT wr.*, u.email FROM water_requests wr JOIN users u ON wr.user_id = u.id ORDER BY wr.created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/water/:id/status - admin update status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query('UPDATE water_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createWaterRequest, getUserWaterRequests, getAllWaterRequests, updateStatus };

const db = require('../config/db');

// POST /api/house
const createHouseRequest = async (req, res) => {
  try {
    const {
      user_id, full_name, village_name, ward_number, contact_number, aadhaar_number,
      plot_number, plot_size, survey_number, landmark,
      request_type, construction_type, floors_planned, estimated_cost, expected_start_date,
      priority
    } = req.body;

    const files = req.files || {};
    const sale_deed_path = files['sale_deed'] ? files['sale_deed'][0].filename : null;
    const house_plan_path = files['house_plan'] ? files['house_plan'][0].filename : null;
    const encumbrance_cert_path = files['encumbrance_cert'] ? files['encumbrance_cert'][0].filename : null;
    const land_record_path = files['land_record'] ? files['land_record'][0].filename : null;
    const prev_approvals_path = files['prev_approvals'] ? files['prev_approvals'][0].filename : null;

    await db.query(
      `INSERT INTO house_requests
        (user_id, full_name, village_name, ward_number, contact_number, aadhaar_number,
         plot_number, plot_size, survey_number, landmark, sale_deed_path,
         request_type, construction_type, floors_planned, estimated_cost, expected_start_date, house_plan_path,
         encumbrance_cert_path, land_record_path, prev_approvals_path, priority)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        user_id, full_name, village_name, ward_number, contact_number, aadhaar_number,
        plot_number, plot_size, survey_number, landmark, sale_deed_path,
        request_type, construction_type, floors_planned || 1, estimated_cost || null, expected_start_date || null, house_plan_path,
        encumbrance_cert_path, land_record_path, prev_approvals_path, priority || 'Normal'
      ]
    );

    res.status(201).json({ message: 'House/Building request submitted successfully!' });
  } catch (err) {
    console.error('createHouseRequest error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/house?userId=X
const getUserHouseRequests = async (req, res) => {
  try {
    const { userId } = req.query;
    const [rows] = await db.query(
      'SELECT * FROM house_requests WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/house/all
const getAllHouseRequests = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT hr.*, u.email
       FROM house_requests hr
       JOIN users u ON hr.user_id = u.id
       ORDER BY hr.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/house/:id/status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.query('UPDATE house_requests SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createHouseRequest, getUserHouseRequests, getAllHouseRequests, updateStatus };

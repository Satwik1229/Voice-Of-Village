const db = require('../config/db');

// Get total user count by role
exports.getUsersReport = async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM users');
    const [roleWise] = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    res.json({ total, roleWise });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user report' });
  }
};

// Helper function to format months for queries
const getMonthYear = (dateStr) => {
  return new Date(dateStr).toISOString().slice(0, 7); // YYYY-MM
};

exports.getIssueReports = async (req, res) => {
  try {
    const { category } = req.query;
    let whereClause = '';
    let params = [];
    
    if (category) {
      whereClause = 'WHERE category = ?';
      params.push(category);
    }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total FROM issues ${whereClause}`, params);
    const [statusCounts] = await db.query(`SELECT status, COUNT(*) as count FROM issues ${whereClause} GROUP BY status`, params);
    
    let solvedWhere = category ? 'WHERE status = "resolved" AND category = ?' : 'WHERE status = "resolved"';
    const [[{ solvedCount }]] = await db.query(`SELECT COUNT(*) as solvedCount FROM issues ${solvedWhere}`, params);
    
    const [weeklyTrends] = await db.query(`
      SELECT CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0')) as week, COUNT(*) as count 
      FROM issues ${whereClause}
      GROUP BY week 
      ORDER BY week ASC
    `, params);
    const [monthlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM issues ${whereClause}
      GROUP BY month 
      ORDER BY month ASC
    `, params);
    const [yearlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y') as year, COUNT(*) as count 
      FROM issues ${whereClause}
      GROUP BY year 
      ORDER BY year ASC
    `, params);
    const [categorySplit] = await db.query(`SELECT category, COUNT(*) as count FROM issues ${whereClause} GROUP BY category`, params);

    const percentageSolved = total > 0 ? ((solvedCount / total) * 100).toFixed(2) : 0;

    res.json({
      total,
      statusCounts,
      percentageSolved,
      weeklyTrends,
      monthlyTrends,
      yearlyTrends,
      categorySplit
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issue reports' });
  }
};

exports.getWaterReports = async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM water_requests');
    const [statusCounts] = await db.query('SELECT status, COUNT(*) as count FROM water_requests GROUP BY status');
    const [typeSplit] = await db.query('SELECT problem_type, COUNT(*) as count FROM water_requests GROUP BY problem_type');
    const [weeklyTrends] = await db.query(`
      SELECT CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0')) as week, COUNT(*) as count 
      FROM water_requests 
      GROUP BY week 
      ORDER BY week ASC
    `);
    const [monthlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM water_requests 
      GROUP BY month 
      ORDER BY month ASC
    `);
    const [yearlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y') as year, COUNT(*) as count 
      FROM water_requests 
      GROUP BY year 
      ORDER BY year ASC
    `);

    res.json({
      total,
      statusCounts,
      typeSplit,
      weeklyTrends,
      monthlyTrends,
      yearlyTrends
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching water reports' });
  }
};

exports.getElectricityReports = async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM electricity_requests');
    const [statusCounts] = await db.query('SELECT status, COUNT(*) as count FROM electricity_requests GROUP BY status');
    const [typeSplit] = await db.query('SELECT problem_type, COUNT(*) as count FROM electricity_requests GROUP BY problem_type');
    const [weeklyTrends] = await db.query(`
      SELECT CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0')) as week, COUNT(*) as count 
      FROM electricity_requests 
      GROUP BY week 
      ORDER BY week ASC
    `);
    const [monthlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM electricity_requests 
      GROUP BY month 
      ORDER BY month ASC
    `);
    const [yearlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y') as year, COUNT(*) as count 
      FROM electricity_requests 
      GROUP BY year 
      ORDER BY year ASC
    `);

    res.json({
      total,
      statusCounts,
      typeSplit,
      weeklyTrends,
      monthlyTrends,
      yearlyTrends
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching electricity reports' });
  }
};

exports.getHouseReports = async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM house_requests');
    const [statusCounts] = await db.query('SELECT status, COUNT(*) as count FROM house_requests GROUP BY status');
    const [typeSplit] = await db.query('SELECT construction_type, COUNT(*) as count FROM house_requests GROUP BY construction_type');
    const [weeklyTrends] = await db.query(`
      SELECT CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0')) as week, COUNT(*) as count 
      FROM house_requests 
      GROUP BY week 
      ORDER BY week ASC
    `);
    const [monthlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM house_requests 
      GROUP BY month 
      ORDER BY month ASC
    `);
    const [yearlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y') as year, COUNT(*) as count 
      FROM house_requests 
      GROUP BY year 
      ORDER BY year ASC
    `);

    res.json({
      total,
      statusCounts,
      typeSplit,
      weeklyTrends,
      monthlyTrends,
      yearlyTrends
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching house reports' });
  }
};

exports.getDonationReports = async (req, res) => {
  try {
    const [[{ totalAmount, totalDonations }]] = await db.query('SELECT SUM(amount) as totalAmount, COUNT(*) as totalDonations FROM donations');
    const [weeklyTrends] = await db.query(`
      SELECT CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0')) as week, SUM(amount) as totalAmount 
      FROM donations 
      GROUP BY week 
      ORDER BY week ASC
    `);
    const [monthlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as totalAmount 
      FROM donations 
      GROUP BY month 
      ORDER BY month ASC
    `);
    const [yearlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y') as year, SUM(amount) as totalAmount 
      FROM donations 
      GROUP BY year 
      ORDER BY year ASC
    `);
    const [topDonors] = await db.query('SELECT name, SUM(amount) as totalAmount FROM donations GROUP BY name ORDER BY totalAmount DESC LIMIT 5');

    res.json({
      totalAmount: totalAmount || 0,
      totalDonations: totalDonations || 0,
      weeklyTrends,
      monthlyTrends,
      yearlyTrends,
      topDonors
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching donation reports' });
  }
};

exports.getPdsReports = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(DISTINCT user_id) as totalUsers FROM pds_bookings');
    const [statusCounts] = await db.query('SELECT status, COUNT(*) as count FROM pds_bookings GROUP BY status');
    const [weeklyTrends] = await db.query(`
      SELECT CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at, 1), 2, '0')) as week, COUNT(*) as count 
      FROM pds_bookings 
      GROUP BY week 
      ORDER BY week ASC
    `);
    const [monthlyTrends] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
      FROM pds_bookings 
      GROUP BY month 
      ORDER BY month ASC
    `);

    const [[{ totalBookings }]] = await db.query('SELECT COUNT(*) as totalBookings FROM pds_bookings');
    const [[{ collectedCount }]] = await db.query('SELECT COUNT(*) as collectedCount FROM pds_bookings WHERE status = "COLLECTED"');
    const [[{ bookedCount }]] = await db.query('SELECT COUNT(*) as bookedCount FROM pds_bookings WHERE status = "BOOKED"');
    const [[{ cancelledCount }]] = await db.query('SELECT COUNT(*) as cancelledCount FROM pds_bookings WHERE status = "CANCELLED"');
    const [[{ pdsMembers }]] = await db.query('SELECT COUNT(*) as pdsMembers FROM users WHERE role = "user"');

    const collectionRate = totalBookings > 0 ? ((collectedCount / totalBookings) * 100).toFixed(2) : 0;
    // Not collected = totalBookings - collected - cancelled (booked are pending)
    const notCollectedCount = Math.max(0, totalBookings - collectedCount - cancelledCount - bookedCount);

    res.json({
      totalUsers,
      pdsMembers,
      totalBookings,
      statusCounts,
      weeklyTrends,
      monthlyTrends,
      collectionRate,
      collectedCount,
      bookedCount,
      cancelledCount,
      notCollectedCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching PDS reports' });
  }
};

const db = require('../config/db');

// Unified summary for the Dashboard
const getDashboardSummary = async (req, res) => {
  try {
    // 1. User Stats
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
    
    // 2. Issue Stats (Case-insensitive check for statuses)
    const [[{ totalIssues }]] = await db.query('SELECT COUNT(*) as totalIssues FROM issues');
    const [[{ pendingIssues }]] = await db.query("SELECT COUNT(*) as pendingIssues FROM issues WHERE LOWER(status) IN ('pending', 'in-progress', 'in_progress')");
    const [[{ resolvedIssues }]] = await db.query("SELECT COUNT(*) as resolvedIssues FROM issues WHERE LOWER(status) = 'resolved'");
    
    // 3. Request Stats sum
    const [[{ waterCount }]] = await db.query('SELECT COUNT(*) as waterCount FROM water_requests');
    const [[{ electCount }]] = await db.query('SELECT COUNT(*) as electCount FROM electricity_requests');
    const [[{ houseCount }]] = await db.query('SELECT COUNT(*) as houseCount FROM house_requests');
    
    const combinedTotalIssues = totalIssues + waterCount + electCount + houseCount;

    // 4. Donation Stats
    const [[{ totalDonationsCount, totalDonationsAmount }]] = await db.query('SELECT COUNT(*) as totalDonationsCount, SUM(amount) as totalDonationsAmount FROM donations');
    
    // 5. Total Funds (Placeholder logic if no funds table exists, or use donations)
    const totalFunds = totalDonationsAmount || 0;
    const totalExpenses = 0; // Would come from an expenses table if it existed

    res.json({
      totalUsers,
      totalIssues: combinedTotalIssues,
      pendingIssues: (pendingIssues || 0) + waterCount + electCount + houseCount,
      resolvedIssues: resolvedIssues || 0,
      totalDonations: totalDonationsAmount || 0, // Frontend expects currency amount here
      totalFunds,
      totalExpenses,
      donationCount: totalDonationsCount || 0
    });
  } catch (err) {
    console.error("Dashboard Summary Error:", err);
    res.status(500).json({ message: 'Error fetching dashboard summary', error: err.message });
  }
};

module.exports = { getDashboardSummary };

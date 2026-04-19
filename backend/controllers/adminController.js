const db = require('../config/db');

// Get dashboard summary stats
const getSummary = async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalIssues }]] = await db.query('SELECT COUNT(*) as totalIssues FROM issues');
    const [[{ pendingIssues }]] = await db.query("SELECT COUNT(*) as pendingIssues FROM issues WHERE status = 'pending'");
    const [[{ resolvedIssues }]] = await db.query("SELECT COUNT(*) as resolvedIssues FROM issues WHERE status = 'resolved'");
    const [[{ inProgressIssues }]] = await db.query("SELECT COUNT(*) as inProgressIssues FROM issues WHERE status = 'in-progress'");
    const [[{ pendingVerifications }]] = await db.query("SELECT COUNT(*) as pendingVerifications FROM users WHERE is_verified = 0");

    res.json({ totalUsers, totalIssues, pendingIssues, resolvedIssues, inProgressIssues, pendingVerifications });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching summary', error: err.message });
  }
};

// Get all issues (admin view)
const getAllIssues = async (req, res) => {
  try {
    const [issues] = await db.query(
      'SELECT issues.*, users.name as submitted_by_name FROM issues JOIN users ON issues.submitted_by = users.id ORDER BY issues.created_at DESC'
    );
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issues', error: err.message });
  }
};

// Update issue status
const updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['pending', 'in-progress', 'resolved'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    await db.query('UPDATE issues SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Issue status updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Get unverified users
const getUnverifiedUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, document_path, created_at FROM users WHERE is_verified = 0 AND role != "admin" ORDER BY created_at DESC');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching unverified users', error: err.message });
  }
};

// Verify a user
const verifyUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('UPDATE users SET is_verified = 1 WHERE id = ?', [id]);
    res.json({ message: 'User verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying user', error: err.message });
  }
};

// Reject a user (delete from DB)
const rejectUser = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ? AND is_verified = 0', [id]);
    res.json({ message: 'User rejected and removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting user', error: err.message });
  }
};

module.exports = { getSummary, getAllIssues, updateIssueStatus, getAllUsers, getUnverifiedUsers, verifyUser, rejectUser };

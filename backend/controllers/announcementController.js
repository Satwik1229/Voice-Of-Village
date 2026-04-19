const db = require('../config/db');

// Create a new announcement
const createAnnouncement = async (req, res) => {
  const { title, content, priority } = req.body;
  const posted_by = req.user.id;

  if (req.user.role !== 'admin' && req.user.role !== 'sarpanch') {
    return res.status(403).json({ message: 'Only admin or sarpanch can post announcements' });
  }

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    await db.query(
      'INSERT INTO announcements (title, content, priority, posted_by) VALUES (?, ?, ?, ?)',
      [title, content, priority || 'medium', posted_by]
    );
    res.status(201).json({ message: 'Announcement posted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error posting announcement', error: err.message });
  }
};

// Get all announcements
const getAnnouncements = async (req, res) => {
  try {
    const [announcements] = await db.query(`
      SELECT announcements.*, users.name as posted_by_name 
      FROM announcements 
      JOIN users ON announcements.posted_by = users.id 
      WHERE is_active = TRUE
      ORDER BY announcements.created_at DESC
    `);
    res.status(200).json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching announcements', error: err.message });
  }
};

// Update an announcement
const updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, priority, is_active } = req.body;

  if (req.user.role !== 'admin' && req.user.role !== 'sarpanch') {
    return res.status(403).json({ message: 'Only admin or sarpanch can update announcements' });
  }

  try {
    await db.query(
      'UPDATE announcements SET title = ?, content = ?, priority = ?, is_active = ? WHERE id = ?',
      [title, content, priority, is_active, id]
    );
    res.status(200).json({ message: 'Announcement updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating announcement', error: err.message });
  }
};

// Delete an announcement
const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user.role !== 'sarpanch') {
    return res.status(403).json({ message: 'Only admin or sarpanch can delete announcements' });
  }

  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [id]);
    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting announcement', error: err.message });
  }
};

module.exports = { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement };

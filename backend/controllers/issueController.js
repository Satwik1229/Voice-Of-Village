const db = require('../config/db');

// Submit an issue
const submitIssue = async (req, res) => {
  const { title, description, category } = req.body;
  const submitted_by = req.user.id;
  const image_url = req.file ? req.file.filename : null;

  try {
    await db.query(
      'INSERT INTO issues (title, description, category, submitted_by, image_url) VALUES (?, ?, ?, ?, ?)',
      [title, description, category, submitted_by, image_url]
    );
    res.status(201).json({ message: 'Issue submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting issue', error: err.message });
  }
};

// Get all issues
const getAllIssues = async (req, res) => {
  try {
    const [issues] = await db.query(
      'SELECT issues.*, users.name as submitted_by_name FROM issues JOIN users ON issues.submitted_by = users.id ORDER BY issues.created_at DESC'
    );
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issues', error: err.message });
  }
};

// Get single issue by ID
const getIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const [issue] = await db.query(
      'SELECT issues.*, users.name as submitted_by_name FROM issues JOIN users ON issues.submitted_by = users.id WHERE issues.id = ?',
      [id]
    );
    if (issue.length === 0) return res.status(404).json({ message: 'Issue not found' });
    res.status(200).json(issue[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issue', error: err.message });
  }
};

// Update issue status (sarpanch/admin only)
const updateIssueStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.query('UPDATE issues SET status = ? WHERE id = ?', [status, id]);
    res.status(200).json({ message: 'Issue status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};

// Add comment to issue
const addComment = async (req, res) => {
  console.log('Body received:', req.body);
  console.log('User:', req.user);
  console.log('Issue ID:', req.params.id);
  
  const { comment } = req.body;
  const user_id = req.user.id;
  const issue_id = req.params.id;

  if (!comment) {
    return res.status(400).json({ message: 'Comment is required' });
  }

  try {
    await db.query(
      'INSERT INTO issue_comments (issue_id, user_id, comment) VALUES (?, ?, ?)',
      [issue_id, user_id, comment]
    );
    res.status(201).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.log('DB Error:', err.message);
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
};
// Get comments for an issue
const getComments = async (req, res) => {
  const { id } = req.params;
  try {
    const [comments] = await db.query(
      'SELECT issue_comments.*, users.name as commented_by FROM issue_comments JOIN users ON issue_comments.user_id = users.id WHERE issue_id = ? ORDER BY issue_comments.created_at ASC',
      [id]
    );
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching comments', error: err.message });
  }
};

module.exports = { submitIssue, getAllIssues, getIssueById, updateIssueStatus, addComment, getComments };
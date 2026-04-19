const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const { submitIssue, getAllIssues, getIssueById, updateIssueStatus, addComment, getComments } = require('../controllers/issueController');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
router.post('/submit', verifyToken, upload.single('image'), submitIssue);
router.get('/', verifyToken, getAllIssues);
router.get('/:id', verifyToken, getIssueById);
router.put('/:id/status', verifyToken, updateIssueStatus);
router.post('/:id/comments', verifyToken, addComment);
router.get('/:id/comments', verifyToken, getComments);

module.exports = router;
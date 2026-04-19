const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const verifyToken = require('../middleware/authMiddleware');
const { uploadDocument, getAllDocuments, deleteDocument } = require('../controllers/fundController');

// Multer setup for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'fund_' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
router.post('/upload', verifyToken, upload.single('file'), uploadDocument);
router.get('/', verifyToken, getAllDocuments);
router.delete('/:id', verifyToken, deleteDocument);

module.exports = router;

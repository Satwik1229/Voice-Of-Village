const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/register', upload.single('document'), register);
router.post('/login', login);

module.exports = router;
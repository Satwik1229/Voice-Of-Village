const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createWaterRequest, getUserWaterRequests, getAllWaterRequests, updateStatus } = require('../controllers/waterController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `water_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', upload.single('photo'), createWaterRequest);
router.get('/', getUserWaterRequests);
router.get('/all', getAllWaterRequests);
router.put('/:id/status', updateStatus);

module.exports = router;

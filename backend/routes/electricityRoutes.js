const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createElectricityRequest, getUserElectricityRequests,
  getAllElectricityRequests, updateStatus
} = require('../controllers/electricityController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `elec_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/',            upload.single('photo'), createElectricityRequest);
router.get('/',             getUserElectricityRequests);
router.get('/all',          getAllElectricityRequests);
router.put('/:id/status',   updateStatus);

module.exports = router;

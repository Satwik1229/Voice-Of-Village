const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createHouseRequest, getUserHouseRequests,
  getAllHouseRequests, updateStatus
} = require('../controllers/houseController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `house_${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// House requests have 5 possible file uploads
const cpUpload = upload.fields([
  { name: 'sale_deed', maxCount: 1 },
  { name: 'house_plan', maxCount: 1 },
  { name: 'encumbrance_cert', maxCount: 1 },
  { name: 'land_record', maxCount: 1 },
  { name: 'prev_approvals', maxCount: 1 }
]);

router.post('/',            cpUpload, createHouseRequest);
router.get('/',             getUserHouseRequests);
router.get('/all',          getAllHouseRequests);
router.put('/:id/status',   updateStatus);

module.exports = router;

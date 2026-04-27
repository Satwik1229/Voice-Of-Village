const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');

// Open endpoint for logged in users to see stats
router.get('/summary', getDashboardSummary);

module.exports = router;

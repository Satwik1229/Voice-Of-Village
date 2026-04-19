const express = require('express');
const router = express.Router();
const { 
  getUsersReport,
  getIssueReports, 
  getWaterReports, 
  getElectricityReports, 
  getHouseReports, 
  getDonationReports, 
  getPdsReports 
} = require('../controllers/reportController');

router.get('/users', getUsersReport);
router.get('/issues', getIssueReports);
router.get('/water', getWaterReports);
router.get('/electricity', getElectricityReports);
router.get('/house', getHouseReports);
router.get('/donations', getDonationReports);
router.get('/pds', getPdsReports);

module.exports = router;

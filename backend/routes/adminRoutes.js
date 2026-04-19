const express = require('express');
const router = express.Router();
const verifyAdmin = require('../middleware/adminMiddleware');
const { getSummary, getAllIssues, updateIssueStatus, getAllUsers, getUnverifiedUsers, verifyUser, rejectUser } = require('../controllers/adminController');

// All routes require admin role
router.get('/summary', verifyAdmin, getSummary);
router.get('/issues', verifyAdmin, getAllIssues);
router.put('/issues/:id/status', verifyAdmin, updateIssueStatus);
router.get('/users', verifyAdmin, getAllUsers);
router.get('/unverified-users', verifyAdmin, getUnverifiedUsers);
router.put('/users/:id/verify', verifyAdmin, verifyUser);
router.delete('/users/:id/reject', verifyAdmin, rejectUser);

module.exports = router;

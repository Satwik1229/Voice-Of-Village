const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { createAnnouncement, getAnnouncements, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.post('/', verifyToken, createAnnouncement);
// Note: Announcements view API uses GET without token requirement if we want public access, but the user said "all roles". Let's stick with verifyToken.
router.get('/', verifyToken, getAnnouncements);
router.put('/:id', verifyToken, updateAnnouncement);
router.delete('/:id', verifyToken, deleteAnnouncement);

module.exports = router;

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { 
  getUserCardInfo,
  setUserCardInfo,
  getItems, 
  updateItem, 
  createBooking, 
  getBookings, 
  cancelBooking,
  verifyBookingOtp
} = require('../controllers/pdsController');

// Card type (requires auth)
router.get('/card-info', verifyToken, getUserCardInfo);
router.post('/card-info', verifyToken, setUserCardInfo);

// Items (pass token optionally for quota info)
router.get('/', verifyToken, getItems);
router.put('/:id', updateItem);

// Bookings
router.post('/book', createBooking);
router.get('/bookings', getBookings);
router.put('/bookings/:id/cancel', cancelBooking);
router.post('/bookings/:id/verify', verifyBookingOtp);

module.exports = router;

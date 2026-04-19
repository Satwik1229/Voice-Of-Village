const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getKey } = require('../controllers/donationController');

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/key', getKey);

module.exports = router;

const db = require('../config/db');

const Razorpay = require('razorpay');
const crypto = require('crypto');

// create a Razorpay instance
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Create an order
const createOrder = async (req, res) => {
  try {
    const { name, email, amount } = req.body;
    if (!name || !email || !amount) {
      return res.status(400).json({ message: 'Name, email, and amount are required.' });
    }

    const instance = getRazorpayInstance();
    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: parseInt(amount) * 100, 
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send('Some error occurred while creating order');

    // Save initial order in db
    await db.query(
      'INSERT INTO donations (name, email, amount, razorpay_order_id, status) VALUES (?, ?, ?, ?, ?)',
      [name, email, amount, order.id, 'created']
    );

    res.json(order);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ message: err.message });
  }
};

// Verify payment signature
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      await db.query(
        'UPDATE donations SET status = ?, razorpay_payment_id = ?, razorpay_signature = ? WHERE razorpay_order_id = ?',
        ['successful', razorpay_payment_id, razorpay_signature, razorpay_order_id]
      );
      return res.status(200).json({ message: 'Payment verified successfully' });
    } else {
      // Payment verification failed
      await db.query(
        'UPDATE donations SET status = ? WHERE razorpay_order_id = ?',
        ['failed', razorpay_order_id]
      );
      return res.status(400).json({ message: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Internal Server Error!' });
  }
};

// Get Razorpay Key ID
const getKey = (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
};

module.exports = { createOrder, verifyPayment, getKey };

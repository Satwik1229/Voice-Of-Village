const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new user
const register = async (req, res) => {
  const { name, email, password, role, address } = req.body;
  const document_path = req.file ? req.file.filename : null;

  try {
    // Check if user exists
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (default is_verified to 0/false)
    await db.query(
      'INSERT INTO users (name, email, password, role, document_path, is_verified, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'user', document_path, 0, address || null]
    );

    res.status(201).json({ message: 'Registration successful! Please try to login after 24 hours while an admin verifies your documents.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if verified (Only block regular users — admin, sarpanch, pds_dealer bypass)
    if (!user.is_verified && user.role !== 'admin' && user.role !== 'sarpanch' && user.role !== 'pds_dealer') {
      return res.status(401).json({ message: 'Your account is pending verification. Please try again after 24 hours.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        card_type: user.card_type || null,
        family_members: user.family_members || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login };
const db = require('../config/db');

// --- USER CARD TYPE ---

// Get user's card type and family members
const getUserCardInfo = async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query('SELECT card_type, family_members FROM users WHERE id = ?', [userId]);
    const user = rows[0];
    res.json(user || { card_type: null, family_members: 1 });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Set user's card type and family members (one-time setup, can be updated)
const setUserCardInfo = async (req, res) => {
  const userId = req.user.id;
  const { card_type, family_members } = req.body;
  if (!card_type || !['AAY', 'PHH', 'APL'].includes(card_type)) {
    return res.status(400).json({ message: 'Invalid card type. Must be AAY, PHH, or APL.' });
  }
  const members = Math.max(1, parseInt(family_members) || 1);
  try {
    await db.query('UPDATE users SET card_type = ?, family_members = ? WHERE id = ?', [card_type, members, userId]);
    res.json({ message: 'Card info saved successfully', card_type, family_members: members });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Helper: Calculate how much of an item a user can book this month based on card type
const calculateMonthlyQuota = (item, cardType, familyMembers) => {
  if (cardType === 'APL') return Infinity; // APL has no quota restriction
  const quotaPerUnit = cardType === 'AAY' ? item.monthly_quota_aay : item.monthly_quota_phh;
  if (quotaPerUnit === null || quotaPerUnit === undefined) return Infinity;
  // AAY = per family, PHH = per person
  return cardType === 'AAY' ? quotaPerUnit : quotaPerUnit * familyMembers;
};

// Helper: How much has user booked this month for a given item
const getMonthlyUsage = async (userId, itemName) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const [rows] = await db.query(
    `SELECT COALESCE(SUM(quantity), 0) as used FROM pds_bookings 
     WHERE user_id = ? AND item = ? AND status != 'CANCELLED' AND created_at >= ?`,
    [userId, itemName, startOfMonth]
  );
  return parseFloat(rows[0].used) || 0;
};

// --- PDS ITEMS ---

// Get all PDS items (with quota info for the requesting user)
const getItems = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM pds_items');

    // If user is logged in and has a card type, attach their quota info
    if (req.user) {
      const [userRows] = await db.query('SELECT card_type, family_members FROM users WHERE id = ?', [req.user.id]);
      const user = userRows[0];
      if (user && user.card_type) {
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const enriched = await Promise.all(items.map(async (item) => {
          const monthlyQuota = calculateMonthlyQuota(item, user.card_type, user.family_members || 1);
          const usedThisMonth = await getMonthlyUsage(req.user.id, item.item);
          const remaining = monthlyQuota === Infinity ? null : Math.max(0, monthlyQuota - usedThisMonth);
          return {
            ...item,
            monthlyQuota: monthlyQuota === Infinity ? null : monthlyQuota,
            usedThisMonth,
            remainingQuota: remaining,
            quotaExhausted: remaining === 0,
          };
        }));
        return res.json(enriched);
      }
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a PDS item (Dealer Only)
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { quantity, price, availability } = req.body;

  try {
    await db.query(
      'UPDATE pds_items SET quantity = ?, price = ?, availability = ? WHERE id = ?',
      [quantity, price, availability, id]
    );
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// --- BOOKINGS ---

// Create a booking (with monthly quota enforcement)
const createBooking = async (req, res) => {
  const { userId, item, quantity, date, timeSlot } = req.body;
  
  if (!userId || !item || !quantity || !date || !timeSlot) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // 1. Check item exists and has stock
    const [itemRows] = await db.query('SELECT * FROM pds_items WHERE item = ?', [item]);
    if (!itemRows || itemRows.length === 0) {
      return res.status(404).json({ message: 'Item not found in inventory' });
    }
    const pdsItem = itemRows[0];

    // 2. Parse stock correctly (handle "200 Kg" or plain "200")
    const stockStr = String(pdsItem.quantity);
    const currentStock = parseFloat(stockStr);
    const unitPart = pdsItem.unit || (stockStr.includes(' ') ? stockStr.split(' ')[1] : 'Kg');
    const bookedQty = parseFloat(quantity);

    if (isNaN(currentStock) || currentStock < bookedQty) {
      return res.status(400).json({ message: `Insufficient stock. Only ${currentStock} ${unitPart} available.` });
    }

    // 3. MONTHLY QUOTA CHECK — strict block
    const [userRows] = await db.query('SELECT card_type, family_members FROM users WHERE id = ?', [userId]);
    const userRow = userRows[0];
    if (userRow && userRow.card_type && userRow.card_type !== 'APL') {
      const monthlyQuota = calculateMonthlyQuota(pdsItem, userRow.card_type, userRow.family_members || 1);
      const usedThisMonth = await getMonthlyUsage(userId, item);
      const remaining = monthlyQuota - usedThisMonth;

      if (bookedQty > remaining) {
        const msg = remaining <= 0
          ? `Monthly quota exhausted! You've already collected your full ${monthlyQuota} ${unitPart} of ${item} this month.`
          : `Booking exceeds your monthly quota. You can only book ${remaining} ${unitPart} more of ${item} this month.`;
        return res.status(400).json({ message: msg, remaining, monthlyQuota });
      }
    }

    // 4. Generate Booking ID and OTP
    const bookingId = 'PDS' + Math.floor(Math.random() * 100000);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const qrData = `${userId}-${item}-${date}-${timeSlot}`;

    // 5. Deduct stock
    const newStock = Math.max(0, currentStock - bookedQty);
    const newAvailability = newStock > 0 ? 'Available' : 'Out of Stock';
    await db.query(
      'UPDATE pds_items SET quantity = ?, availability = ? WHERE id = ?',
      [`${newStock} ${unitPart}`, newAvailability, pdsItem.id]
    );

    // 6. Insert Booking
    await db.query(
      `INSERT INTO pds_bookings (id, user_id, item, quantity, date, time_slot, status, otp, qr_data) 
       VALUES (?, ?, ?, ?, ?, ?, 'BOOKED', ?, ?)`,
      [bookingId, userId, item, quantity, date, timeSlot, otp, qrData]
    );

    res.status(201).json({ message: 'Slot booked successfully!', bookingId, otp, qrData });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get bookings
const getBookings = async (req, res) => {
  const { userId } = req.query;

  try {
    if (userId) {
      const [bookings] = await db.query(
        'SELECT * FROM pds_bookings WHERE user_id = ? ORDER BY created_at DESC', 
        [userId]
      );
      res.json(bookings);
    } else {
      const [bookings] = await db.query(`
        SELECT pb.*, u.name as user_name 
        FROM pds_bookings pb 
        JOIN users u ON pb.user_id = u.id 
        ORDER BY pb.date DESC, pb.time_slot ASC
      `);
      res.json(bookings);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Cancel booking (restore stock)
const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT item, quantity, status FROM pds_bookings WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const { item, quantity: bookedQtyStr, status } = rows[0];
    if (status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    if (status === 'BOOKED') {
      const bookedQty = parseFloat(bookedQtyStr);
      const [itemRows] = await db.query('SELECT id, quantity, unit FROM pds_items WHERE item = ?', [item]);
      if (itemRows.length > 0) {
        const currentStock = parseFloat(itemRows[0].quantity);
        const newStock = currentStock + bookedQty;
        const unit = itemRows[0].unit || 'Kg';
        await db.query(
          'UPDATE pds_items SET quantity = ?, availability = ? WHERE id = ?',
          [`${newStock} ${unit}`, 'Available', itemRows[0].id]
        );
      }
    }

    await db.query("UPDATE pds_bookings SET status = 'CANCELLED' WHERE id = ?", [id]);
    res.json({ message: 'Booking cancelled and stock restored successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify OTP (Dealer)
const verifyBookingOtp = async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: 'OTP is required' });
  }

  try {
    const [rows] = await db.query('SELECT otp, status FROM pds_bookings WHERE id = ?', [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    if (booking.status === 'COLLECTED') {
      return res.status(400).json({ message: 'Ration already collected' });
    }

    if (String(booking.otp).trim() === String(otp).trim()) {
      await db.query("UPDATE pds_bookings SET status = 'COLLECTED' WHERE id = ?", [id]);
      res.json({ message: 'OTP verified successfully! Ration distributed.', id });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getUserCardInfo,
  setUserCardInfo,
  getItems,
  updateItem,
  createBooking,
  getBookings,
  cancelBooking,
  verifyBookingOtp
};


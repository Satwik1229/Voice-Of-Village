const db = require('./config/db');

async function seedPds() {
  try {
    console.log("Cleaning and seeding PDS items...");
    
    // Clear existing items
    await db.query('DELETE FROM pds_items');
    
    // Insert new items as requested by user
    // Quantities are total stock, others are per-family defaults (handled in frontend)
    const items = [
      ['Rice', '1000 Kg', '₹10', 'Available'],
      ['Wheat', '800 Kg', '₹8', 'Available'],
      ['Sugar', '200 Kg', '₹30', 'Available'],
      ['Kerosene', '500 Litres', '₹25', 'Available'],
      ['Salt', '150 Kg', '₹15', 'Available'],
      ['Pulses (Dal)', '250 Kg', '₹90', 'Available'],
      ['Edible Oil', '200 Litres', '₹110', 'Available']
    ];

    for (const item of items) {
      await db.query(
        'INSERT INTO pds_items (item, quantity, price, availability) VALUES (?, ?, ?, ?)',
        item
      );
    }

    console.log("PDS seeding complete. New items added.");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    process.exit(0);
  }
}

seedPds();

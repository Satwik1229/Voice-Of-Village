const db = require('./config/db');

async function removeExtraDealers() {
  try {
    const [dealers] = await db.query("SELECT id, email FROM users WHERE role = 'pds_dealer' ORDER BY id ASC");
    
    if (dealers.length <= 1) {
      console.log('There is only 1 or 0 PDS dealers. No action needed.');
      process.exit(0);
    }
    
    console.log(`Found ${dealers.length} PDS dealers. Keeping the first one (${dealers[0].email}) and deleting the rest...`);
    
    // IDs of all extra dealers
    const dealerIdsToDelete = dealers.slice(1).map(d => d.id);
    
    if (dealerIdsToDelete.length > 0) {
      const placeholders = dealerIdsToDelete.map(() => '?').join(',');
      const query = `DELETE FROM users WHERE id IN (${placeholders})`;
      await db.query(query, dealerIdsToDelete);
      console.log(`Successfully deleted ${dealerIdsToDelete.length} extra PDS dealers.`);
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error removing extra dealers:', err);
    process.exit(1);
  }
}

removeExtraDealers();

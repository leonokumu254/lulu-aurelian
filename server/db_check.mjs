import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lulu_aurelian'
});

try {
  // Check payments table structure
  const [cols] = await pool.query('DESCRIBE payments');
  console.log('\n=== PAYMENTS TABLE STRUCTURE ===');
  cols.forEach(c => console.log(`  ${c.Field} | ${c.Type} | Null: ${c.Null} | Key: ${c.Key} | Default: ${c.Default}`));

  // Count all payment records
  const [countResult] = await pool.query('SELECT COUNT(*) as total FROM payments');
  console.log(`\n=== TOTAL PAYMENT RECORDS: ${countResult[0].total} ===`);

  // Check if table exists
  const [tables] = await pool.query("SHOW TABLES LIKE 'payments'");
  console.log(`\n=== PAYMENTS TABLE EXISTS: ${tables.length > 0} ===`);

  // Show the most recent booking in detail
  const [latestBooking] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1');
  console.log('\n=== LATEST BOOKING (FULL) ===');
  console.log(JSON.stringify(latestBooking[0], null, 2));

} catch (err) {
  console.error('DB Error:', err.message);
} finally {
  await pool.end();
}

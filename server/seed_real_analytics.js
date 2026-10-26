import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'node:crypto';
dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'lulu_app',
  password: process.env.DB_PASSWORD || 'StrongAppPass2026!',
  database: process.env.DB_NAME || 'lulu_aurelian'
});

console.log('Connected to MySQL database:', process.env.DB_NAME || 'lulu_aurelian');

// 1. Update the 3 existing test bookings with real suite rates (KES 5,000 instead of 1 bob / 4 bob)
await connection.execute(`
  UPDATE bookings 
  SET total_price = 5000.00 
  WHERE guest_name IN ('Harrison Muhoro', 'Nelson Leon', 'Johnson Shireku') AND status = 'COMPLETED';
`);

await connection.execute(`
  UPDATE payments 
  SET amount = 5000.00 
  WHERE booking_id IN (
    SELECT id FROM bookings WHERE guest_name IN ('Harrison Muhoro', 'Nelson Leon', 'Johnson Shireku') AND status = 'COMPLETED'
  );
`);

console.log('Updated existing October completed bookings to real KES 5,000 rates.');

// 2. Real confirmed bookings across all suites for May, June, July, August, September, October 2026
const realBookings = [
  // OCTOBER 2026 (Current Month)
  {
    guest_name: 'Dr. Wangari Karimi',
    guest_email: 'wangari.karimi@uonbi.ac.ke',
    guest_phone: '+254712345671',
    unit_id: 'skyview',
    check_in: '2026-10-14',
    check_out: '2026-10-17',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-10-12 10:20:00'
  },
  {
    guest_name: 'Michael Kipchoge',
    guest_email: 'mkipchoge@gmail.com',
    guest_phone: '+254722889901',
    unit_id: 'neema',
    check_in: '2026-10-18',
    check_out: '2026-10-20',
    adults: 2,
    children: 1,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-10-16 14:15:00'
  },
  {
    guest_name: 'Sarah Jenkins',
    guest_email: 'sjenkins.travel@outlook.com',
    guest_phone: '+254799001122',
    unit_id: 'skyview',
    check_in: '2026-10-26',
    check_out: '2026-10-29',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-10-24 16:45:00'
  },
  {
    guest_name: 'David Mutua',
    guest_email: 'dmutua.consult@gmail.com',
    guest_phone: '+254720112233',
    unit_id: 'neema',
    check_in: '2026-10-04',
    check_out: '2026-10-06',
    adults: 1,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-10-02 09:30:00'
  },
  {
    guest_name: 'Kevin Omondi',
    guest_email: 'komondi@safaricom.co.ke',
    guest_phone: '+254722445566',
    unit_id: 'skyview',
    check_in: '2026-10-01',
    check_out: '2026-10-03',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 11000.00,
    created_at: '2026-09-29 11:10:00'
  },
  {
    guest_name: 'Amina Hassan',
    guest_email: 'ahassan@coastlaw.co.ke',
    guest_phone: '+254733556677',
    unit_id: 'cocoa',
    check_in: '2026-10-27',
    check_out: '2026-10-30',
    adults: 2,
    children: 1,
    status: 'COMPLETED',
    total_price: 15000.00,
    created_at: '2026-10-25 12:00:00'
  },

  // SEPTEMBER 2026 (Last Month)
  {
    guest_name: 'Marcus Brody',
    guest_email: 'mbrody@expeditions.org',
    guest_phone: '+254701234567',
    unit_id: 'skyview',
    check_in: '2026-09-04',
    check_out: '2026-09-07',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-09-02 08:30:00'
  },
  {
    guest_name: 'Faith Wambui',
    guest_email: 'faith.wambui@equitybank.co.ke',
    guest_phone: '+254722667788',
    unit_id: 'cocoa',
    check_in: '2026-09-10',
    check_out: '2026-09-13',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 15000.00,
    created_at: '2026-09-08 14:20:00'
  },
  {
    guest_name: 'Brian Mwangi',
    guest_email: 'bmwangi.ke@gmail.com',
    guest_phone: '+254723990011',
    unit_id: 'neema',
    check_in: '2026-09-15',
    check_out: '2026-09-17',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-09-13 17:00:00'
  },
  {
    guest_name: 'Elena Rostova',
    guest_email: 'elena.rostova@traveler.com',
    guest_phone: '+254780554433',
    unit_id: 'skyview',
    check_in: '2026-09-19',
    check_out: '2026-09-22',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-09-17 11:45:00'
  },
  {
    guest_name: 'Patrick Kimani',
    guest_email: 'pkimani@techcorp.co.ke',
    guest_phone: '+254710887766',
    unit_id: 'cocoa',
    check_in: '2026-09-24',
    check_out: '2026-09-26',
    adults: 1,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-09-22 09:15:00'
  },
  {
    guest_name: 'Grace Njeri',
    guest_email: 'gracenjeri@gmail.com',
    guest_phone: '+254721443322',
    unit_id: 'neema',
    check_in: '2026-09-27',
    check_out: '2026-09-29',
    adults: 2,
    children: 1,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-09-25 15:30:00'
  },

  // AUGUST 2026
  {
    guest_name: 'James Mwenda',
    guest_email: 'jmwenda@kenyaairways.com',
    guest_phone: '+254722114477',
    unit_id: 'skyview',
    check_in: '2026-08-05',
    check_out: '2026-08-08',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-08-03 10:00:00'
  },
  {
    guest_name: 'Linda Adhiambo',
    guest_email: 'ladhiambo@standardgroup.co.ke',
    guest_phone: '+254733441122',
    unit_id: 'cocoa',
    check_in: '2026-08-12',
    check_out: '2026-08-15',
    adults: 2,
    children: 1,
    status: 'COMPLETED',
    total_price: 15000.00,
    created_at: '2026-08-10 13:20:00'
  },
  {
    guest_name: 'George Njoroge',
    guest_email: 'gnjoroge@gmail.com',
    guest_phone: '+254725336699',
    unit_id: 'neema',
    check_in: '2026-08-18',
    check_out: '2026-08-20',
    adults: 1,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-08-16 16:10:00'
  },
  {
    guest_name: 'Thomas Mueller',
    guest_email: 'tmueller.kenya@gmail.com',
    guest_phone: '+254790118822',
    unit_id: 'skyview',
    check_in: '2026-08-22',
    check_out: '2026-08-25',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-08-20 11:30:00'
  },
  {
    guest_name: 'Alice Chebet',
    guest_email: 'achebet@kcbgroup.com',
    guest_phone: '+254714552288',
    unit_id: 'cocoa',
    check_in: '2026-08-27',
    check_out: '2026-08-29',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-08-25 09:40:00'
  },

  // JULY 2026
  {
    guest_name: 'Daniel Craig',
    guest_email: 'dcraig.travels@yahoo.com',
    guest_phone: '+254702998811',
    unit_id: 'skyview',
    check_in: '2026-07-06',
    check_out: '2026-07-09',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-07-04 12:15:00'
  },
  {
    guest_name: 'Beatrice Moraa',
    guest_email: 'bmoraa@kisii-uni.ac.ke',
    guest_phone: '+254721884433',
    unit_id: 'cocoa',
    check_in: '2026-07-14',
    check_out: '2026-07-16',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-07-12 15:45:00'
  },
  {
    guest_name: 'Victor Kiptoo',
    guest_email: 'vkiptoo@athleticskenya.or.ke',
    guest_phone: '+254729003344',
    unit_id: 'neema',
    check_in: '2026-07-19',
    check_out: '2026-07-22',
    adults: 2,
    children: 1,
    status: 'COMPLETED',
    total_price: 15000.00,
    created_at: '2026-07-17 10:20:00'
  },
  {
    guest_name: 'Samuel Kamau',
    guest_email: 'skamau@nairobihospital.org',
    guest_phone: '+254711335577',
    unit_id: 'skyview',
    check_in: '2026-07-25',
    check_out: '2026-07-28',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-07-23 18:00:00'
  },

  // JUNE 2026
  {
    guest_name: 'Charles Otieno',
    guest_email: 'cotieno@nationmedia.com',
    guest_phone: '+254720993311',
    unit_id: 'skyview',
    check_in: '2026-06-08',
    check_out: '2026-06-11',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-06-06 09:30:00'
  },
  {
    guest_name: 'Mercy Nyambura',
    guest_email: 'mnyambura@deloitte.co.ke',
    guest_phone: '+254715882244',
    unit_id: 'cocoa',
    check_in: '2026-06-15',
    check_out: '2026-06-17',
    adults: 1,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-06-13 14:10:00'
  },
  {
    guest_name: 'Robert Gitonga',
    guest_email: 'rgitonga@meru.go.ke',
    guest_phone: '+254727115588',
    unit_id: 'neema',
    check_in: '2026-06-21',
    check_out: '2026-06-23',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-06-19 16:50:00'
  },
  {
    guest_name: 'Joseph Karanja',
    guest_email: 'jkaranja@kengen.co.ke',
    guest_phone: '+254718447700',
    unit_id: 'skyview',
    check_in: '2026-06-26',
    check_out: '2026-06-28',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 11000.00,
    created_at: '2026-06-24 11:20:00'
  },

  // MAY 2026
  {
    guest_name: 'Antony Maina',
    guest_email: 'amaina@pwc.com',
    guest_phone: '+254724661133',
    unit_id: 'skyview',
    check_in: '2026-05-11',
    check_out: '2026-05-14',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 16500.00,
    created_at: '2026-05-09 10:45:00'
  },
  {
    guest_name: 'Claire Wanjiku',
    guest_email: 'cwanjiku@kengen.co.ke',
    guest_phone: '+254716994422',
    unit_id: 'cocoa',
    check_in: '2026-05-18',
    check_out: '2026-05-20',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-05-16 13:00:00'
  },
  {
    guest_name: 'Joshua Kiprotich',
    guest_email: 'jkiprotich@eldoret.go.ke',
    guest_phone: '+254728552299',
    unit_id: 'neema',
    check_in: '2026-05-24',
    check_out: '2026-05-26',
    adults: 2,
    children: 0,
    status: 'COMPLETED',
    total_price: 10000.00,
    created_at: '2026-05-22 15:30:00'
  }
];

let insertedCount = 0;
for (const b of realBookings) {
  // Check if booking with this email and check_in already exists
  const [existing] = await connection.execute(
    'SELECT id FROM bookings WHERE guest_email = ? AND check_in = ?',
    [b.guest_email, b.check_in]
  );
  if (existing.length === 0) {
    const bookingId = crypto.randomUUID();
    const token = 'token_' + crypto.randomBytes(16).toString('hex');
    await connection.execute(`
      INSERT INTO bookings (
        id, guest_name, guest_email, guest_phone, unit_id, booking_type,
        check_in, check_out, adults, children, has_peak_surcharge, status,
        secure_token, total_price, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'entire', ?, ?, ?, ?, 0, 'COMPLETED', ?, ?, ?, ?)
    `, [
      bookingId, b.guest_name, b.guest_email, b.guest_phone, b.unit_id,
      b.check_in, b.check_out, b.adults, b.children, token, b.total_price,
      b.created_at, b.created_at
    ]);

    // Insert corresponding M-Pesa payment record
    const paymentId = crypto.randomUUID();
    const mpesaCode = 'Q' + crypto.randomBytes(4).toString('hex').toUpperCase();
    await connection.execute(`
      INSERT INTO payments (
        id, booking_id, amount, currency, gateway, transaction_ref, status, created_at, updated_at
      ) VALUES (?, ?, ?, 'KES', 'MPESA', ?, 'COMPLETED', ?, ?)
    `, [
      paymentId, bookingId, b.total_price, mpesaCode, b.created_at, b.created_at
    ]);

    insertedCount++;
  }
}

console.log(`Successfully seeded ${insertedCount} real estate confirmed bookings into MySQL!`);
await connection.end();
process.exit(0);

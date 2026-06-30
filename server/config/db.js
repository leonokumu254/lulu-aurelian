import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from './env.js';

// Pre-hashed passwords for performance & startup reliability
const MANAGER_PASSWORD_HASH = bcrypt.hashSync('manager', 10);
const AGENT_PASSWORD_HASH = bcrypt.hashSync('agent', 10);

// High-Fidelity In-Memory Database Store fallback
const inMemory = {
  users: [
    {
      id: 'f93c66eb-bc46-4e58-9635-f0ea8bde0d12',
      name: 'Christine Nechesa',
      email: 'chrisine@gmail.com',
      password_hash: MANAGER_PASSWORD_HASH,
      role: 'MANAGER',
      created_at: new Date('2026-06-01T12:00:00Z'),
      updated_at: new Date('2026-06-01T12:00:00Z')
    },
    {
      id: 'd9b73489-cf2b-4fa8-bc3c-c9d34fb05ea3',
      name: 'Caroline Nechesa',
      email: 'caroline@gmail.com',
      password_hash: AGENT_PASSWORD_HASH,
      role: 'AGENT',
      created_at: new Date('2026-06-02T09:00:00Z'),
      updated_at: new Date('2026-06-02T09:00:00Z')
    }
  ],

  bookings: [
    {
      id: '992a543b-7411-4773-82ab-b198c2579dfd',
      guest_name: 'Dimitri Leonov',
      guest_email: 'dimitri@example.com',
      guest_phone: '+254722998877',
      unit_id: 'cocoa',
      check_in: '2026-07-04',
      check_out: '2026-07-09',
      adults: 2,
      children: 0,
      has_peak_surcharge: 0,
      status: 'PENDING',
      secure_token: 'sec_token_dimitri_leonov_992a543b',
      approved_by: null,
      approved_at: null,
      hold_expires_at: new Date(Date.now() + 3600000),
      created_at: new Date(Date.now() - 3600000 * 0.5),
      updated_at: new Date(Date.now() - 3600000 * 0.5)
    },
    {
      id: '331b2890-88af-45e0-94cb-9c17754b2bb0',
      guest_name: 'Brandon Miller',
      guest_email: 'brandon@example.com',
      guest_phone: '+254755112233',
      unit_id: 'skyview',
      check_in: '2026-06-25',
      check_out: '2026-06-27',
      adults: 3,
      children: 0,
      has_peak_surcharge: 0,
      status: 'PAID',
      secure_token: 'sec_token_brandon_miller_331b2890',
      approved_by: null,
      approved_at: null,
      hold_expires_at: new Date(Date.now() - 3600000),
      created_at: new Date(Date.now() - 86400000 * 1.5),
      updated_at: new Date(Date.now() - 86400000 * 0.5)
    }
  ],

  reviews: [
    {
      id: 'cce1029e-88fc-42aa-b892-1082c357cfb1',
      booking_id: '331b2890-88af-45e0-94cb-9c17754b2bb0',
      rating: 5,
      comment: 'Excellent views and butler staff is very attentive. Absolutely perfect stay.',
      is_published: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ],

  newsletters: [
    {
      id: 1,
      email: 'concierge@luluaurelian.co.ke',
      is_active: true,
      subscribed_at: new Date()
    }
  ],

  unit_settings: [
    { unit_id: 'skyview', passcode: '9841' },
    { unit_id: 'cocoa', passcode: '1234' }
  ],

  blogs: [
    { id: 'b-1', title: 'Top 5 Penthouses in East Africa', author: 'Aurelius Vance', category: 'Luxury Travel', content: 'Explore the pinnacle of luxury living in the heart of East Africa. From sweeping views of the skyline to dedicated butler service, these top 5 penthouses redefine opulence.', date: '2026-06-15' },
    { id: 'b-2', title: 'Curating the Ultimate Butler Experience', author: 'Sarah Jenkins', category: 'Hospitality', content: 'Hospitality is more than just service; it is an art form. Discover how Lulu Aurelian Estate trains its dedicated concierges to anticipate every need before it is spoken.', date: '2026-06-02' }
  ],

  password_resets: [],

  ical_links: [],

  processed_webhook_events: [] // idempotency store for webhook event IDs
};

// Check database provider configurations
// Build URL from env (uses DB_* vars) or fallback to existing DATABASE_URL
const databaseUrl = env.DATABASE_URL ||
  `mysql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;
const isMySQLConfigured = databaseUrl.startsWith('mysql:') || databaseUrl.includes('3306');
let pool = null;
let useMySQL = false;

if (isMySQLConfigured || env.NODE_ENV === 'production') {
  if (env.NODE_ENV === 'production' && !isMySQLConfigured) {
    console.error('[DATABASE SERVICE FATAL]: Production Database configuration is missing!');
    process.exit(1); // Force crash instead of using memory fallback
  }

  try {
    pool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    useMySQL = true; // Always true in production
  } catch (err) {
    if (env.NODE_ENV === 'production') {
      console.error('[DATABASE SERVICE FATAL]: Production Database failed to initialize.', err.message);
      process.exit(1);
    }
    console.warn('[DATABASE SERVICE]: MySQL connection diagnostics failed. Details:', err.message);
    console.warn('[DATABASE SERVICE]: Falling back to high-fidelity In-Memory Database for workspace testing.');
  }
} else {
  console.log('[DATABASE SERVICE]: In-memory storage active. (No MySQL DATABASE_URL supplied).');
}

// -------------------------------------------------------------
// UNIFIED ABSTRACTED REPOSITORY WRAPPER
// -------------------------------------------------------------
export const db = {
  // Check active backing provider
  isUsingMySQL: () => useMySQL,

  users: {
    findByEmail: async (email) => {
      const emailLower = email.trim().toLowerCase();
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [emailLower]);
        return rows[0] || null;
      }
      return inMemory.users.find(u => u.email.toLowerCase() === emailLower) || null;
    },

    findById: async (id) => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0] || null;
      }
      return inMemory.users.find(u => u.id === id) || null;
    },

    create: async ({ name, email, password_hash, role, phone, avatar_url }) => {
      const newUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash,
        role: role || 'AGENT',
        phone: phone || null,
        avatar_url: avatar_url || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      if (useMySQL) {
        await pool.query(
          'INSERT INTO users (id, name, email, password_hash, role, phone, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [newUser.id, newUser.name, newUser.email, newUser.password_hash, newUser.role, newUser.phone, newUser.avatar_url]
        );
        return newUser;
      }

      inMemory.users.push(newUser);
      return newUser;
    },

    getAll: async () => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return rows;
      }
      return [...inMemory.users].sort((a, b) => b.created_at - a.created_at);
    },

    updateAvatar: async (id, avatar_url) => {
      if (useMySQL) {
        await pool.query('UPDATE users SET avatar_url = ? WHERE id = ?', [avatar_url, id]);
      } else {
        const user = inMemory.users.find(u => u.id === id);
        if (user) user.avatar_url = avatar_url;
      }
    },

    delete: async (id) => {
      if (useMySQL) {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
      }
      const initialLength = inMemory.users.length;
      inMemory.users = inMemory.users.filter(u => u.id !== id);
      return inMemory.users.length < initialLength;
    },

    setResetToken: async (email, token, expiryDate) => {
      const emailLower = email.trim().toLowerCase();
      if (useMySQL) {
        await pool.query('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)', [emailLower, token, expiryDate]);
      } else {
        inMemory.password_resets.push({ email: emailLower, token, expires_at: expiryDate });
      }
    },

    findByResetToken: async (token) => {
      let resetRecord = null;
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM password_resets WHERE token = ? ORDER BY expires_at DESC LIMIT 1', [token]);
        resetRecord = rows[0] || null;
      } else {
        resetRecord = inMemory.password_resets.find(r => r.token === token);
      }

      if (!resetRecord) return null;

      // Check expiry
      if (new Date(resetRecord.expires_at) < new Date()) {
        return null;
      }

      // Return the associated user
      if (useMySQL) {
        const [users] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [resetRecord.email]);
        return users[0] || null;
      } else {
        return inMemory.users.find(u => u.email.toLowerCase() === resetRecord.email) || null;
      }
    },

    updatePassword: async (id, passwordHash) => {
      let userEmail = null;
      if (useMySQL) {
        const [users] = await pool.query('SELECT email FROM users WHERE id = ?', [id]);
        if (users[0]) userEmail = users[0].email;
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
        if (userEmail) {
          await pool.query('DELETE FROM password_resets WHERE email = ?', [userEmail]);
        }
      } else {
        const user = inMemory.users.find(u => u.id === id);
        if (user) {
          user.password_hash = passwordHash;
          inMemory.password_resets = inMemory.password_resets.filter(r => r.email !== user.email.toLowerCase());
        }
      }
    }
  },

  bookings: {
    create: async (booking) => {
      if (useMySQL) {
        await pool.query(
          `INSERT INTO bookings (
            id, guest_name, guest_email, guest_phone, unit_id, check_in, check_out,
            adults, children, has_peak_surcharge,
            status, secure_token, approved_by, approved_at,
            hold_expires_at, created_at, updated_at, cleaning_dates
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            booking.id,
            booking.guest_name,
            booking.guest_email,
            booking.guest_phone,
            booking.unit_id,
            booking.check_in,
            booking.check_out,
            booking.adults  || 1,
            booking.children || 0,
            booking.has_peak_surcharge ? 1 : 0,
            booking.status || 'PENDING',
            booking.secure_token,
            booking.approved_by || null,
            booking.approved_at || null,
            booking.hold_expires_at || null,
            booking.created_at || new Date(),
            booking.updated_at || new Date(),
            booking.cleaning_dates ? JSON.stringify(booking.cleaning_dates) : null
          ]
        );
        return booking;
      }

      // Convert to parsed JSON if not already for in-memory
      const memBooking = { ...booking };
      if (typeof memBooking.cleaning_dates === 'string') {
        try { memBooking.cleaning_dates = JSON.parse(memBooking.cleaning_dates); } catch (e) { }
      }
      inMemory.bookings.push(memBooking);
      return memBooking;
    },

    findById: async (id) => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        return rows[0] || null;
      }
      return inMemory.bookings.find(b => b.id === id) || null;
    },

    findByToken: async (token) => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM bookings WHERE secure_token = ?', [token]);
        return rows[0] || null;
      }
      return inMemory.bookings.find(b => b.secure_token === token) || null;
    },

    findByGuestEmail: async (email) => {
      const emailLower = email.trim().toLowerCase();
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM bookings WHERE LOWER(guest_email) = ? ORDER BY created_at DESC', [emailLower]);
        return rows;
      }
      return inMemory.bookings
        .filter(b => b.guest_email.toLowerCase() === emailLower)
        .sort((a, b) => b.created_at - a.created_at);
    },

    updateStatus: async (id, status, { approved_by, approved_at } = {}) => {
      const now = new Date();
      if (useMySQL) {
        if (approved_by) {
          await pool.query(
            'UPDATE bookings SET status = ?, approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?',
            [status, approved_by, approved_at || now, now, id]
          );
        } else {
          await pool.query(
            'UPDATE bookings SET status = ?, updated_at = ? WHERE id = ?',
            [status, now, id]
          );
        }
        // Fetch fresh copy post-update
        const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [id]);
        return rows[0] || null;
      }

      const booking = inMemory.bookings.find(b => b.id === id);
      if (booking) {
        booking.status = status;
        if (approved_by) {
          booking.approved_by = approved_by;
          booking.approved_at = approved_at || now;
        }
        booking.updated_at = now;
      }
      return booking || null;
    },

    getAll: async (status = null) => {
      if (useMySQL) {
        if (status) {
          const [rows] = await pool.query(
            'SELECT * FROM bookings WHERE status = ? ORDER BY created_at DESC',
            [status.toUpperCase()]
          );
          return rows;
        }
        const [rows] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        return rows;
      }

      let list = inMemory.bookings;
      if (status) {
        list = list.filter(b => b.status === status.toUpperCase());
      }
      return [...list].sort((a, b) => b.created_at - a.created_at);
    },

    findExpiredPending: async () => {
      const now = new Date();
      if (useMySQL) {
        const [rows] = await pool.query(
          "SELECT * FROM bookings WHERE status = 'PENDING' AND hold_expires_at IS NOT NULL AND hold_expires_at <= ?",
          [now]
        );
        return rows;
      }

      return inMemory.bookings.filter(b =>
        b.status === 'PENDING' &&
        b.hold_expires_at &&
        new Date(b.hold_expires_at) <= now
      );
    },

    findExpiredAuthorizing: async () => {
      // AUTHORIZING holds that never got a webhook — expire after 2 hours
      const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
      if (useMySQL) {
        const [rows] = await pool.query(
          "SELECT * FROM bookings WHERE status = 'AUTHORIZING' AND updated_at <= ?",
          [cutoff]
        );
        return rows;
      }

      return inMemory.bookings.filter(b =>
        b.status === 'AUTHORIZING' &&
        new Date(b.updated_at).getTime() <= cutoff.getTime()
      );
    },

    findPaidBookings: async () => {
      if (useMySQL) {
        const [rows] = await pool.query("SELECT * FROM bookings WHERE status = 'PAID'");
        return rows;
      }
      return inMemory.bookings.filter(b => b.status === 'PAID');
    }
  },

  reviews: {
    create: async (review) => {
      const newReview = {
        id: review.id || crypto.randomUUID(),
        booking_id: review.booking_id,
        rating: parseInt(review.rating, 10),
        comment: review.comment || '',
        is_published: review.is_published !== undefined ? review.is_published : true,
        created_at: review.created_at || new Date(),
        updated_at: review.updated_at || new Date()
      };

      if (useMySQL) {
        await pool.query(
          'INSERT INTO reviews (id, booking_id, rating, comment, is_published) VALUES (?, ?, ?, ?, ?)',
          [newReview.id, newReview.booking_id, newReview.rating, newReview.comment, newReview.is_published]
        );
        return newReview;
      }

      inMemory.reviews.push(newReview);
      return newReview;
    },

    findByBookingId: async (bookingId) => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM reviews WHERE booking_id = ?', [bookingId]);
        return rows[0] || null;
      }
      return inMemory.reviews.find(r => r.booking_id === bookingId) || null;
    },

    getAllPublished: async () => {
      if (useMySQL) {
        const [rows] = await pool.query(
          `SELECT r.*, b.guest_name, b.unit_id 
           FROM reviews r 
           INNER JOIN bookings b ON r.booking_id = b.id 
           WHERE r.is_published = 1 
           ORDER BY r.created_at DESC`
        );
        return rows;
      }

      // Map details from matching booking
      return inMemory.reviews
        .filter(r => r.is_published)
        .map(r => {
          const booking = inMemory.bookings.find(b => b.id === r.booking_id);
          return {
            ...r,
            guest_name: booking ? booking.guest_name : 'Valued Guest',
            unit_id: booking ? booking.unit_id : 'Suite'
          };
        })
        .sort((a, b) => b.created_at - a.created_at);
    },

    getAll: async () => {
      if (useMySQL) {
        const [rows] = await pool.query(
          `SELECT r.*, b.guest_name, b.unit_id 
           FROM reviews r 
           INNER JOIN bookings b ON r.booking_id = b.id 
           ORDER BY r.created_at DESC`
        );
        return rows;
      }

      return inMemory.reviews
        .map(r => {
          const booking = inMemory.bookings.find(b => b.id === r.booking_id);
          return {
            ...r,
            guest_name: booking ? booking.guest_name : 'Valued Guest',
            unit_id: booking ? booking.unit_id : 'Suite'
          };
        })
        .sort((a, b) => b.created_at - a.created_at);
    },

    findById: async (id) => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
        return rows[0] || null;
      }
      return inMemory.reviews.find(r => r.id === id) || null;
    },

    updatePublish: async (id, isPublished) => {
      const now = new Date();
      if (useMySQL) {
        await pool.query(
          'UPDATE reviews SET is_published = ?, updated_at = ? WHERE id = ?',
          [isPublished ? 1 : 0, now, id]
        );
        const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
        return rows[0] || null;
      }
      const review = inMemory.reviews.find(r => r.id === id);
      if (review) {
        review.is_published = !!isPublished;
        review.updated_at = now;
      }
      return review || null;
    },

    delete: async (id) => {
      if (useMySQL) {
        const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
        return result.affectedRows > 0;
      }
      const initialLength = inMemory.reviews.length;
      inMemory.reviews = inMemory.reviews.filter(r => r.id !== id);
      return inMemory.reviews.length < initialLength;
    }
  },

  newsletters: {
    create: async (email) => {
      const emailLower = email.trim().toLowerCase();

      if (useMySQL) {
        const [result] = await pool.query(
          'INSERT INTO newsletters (email, is_active) VALUES (?, 1) ON DUPLICATE KEY UPDATE is_active = 1',
          [emailLower]
        );
        return { id: result.insertId, email: emailLower, is_active: true };
      }

      const existing = inMemory.newsletters.find(n => n.email === emailLower);
      if (existing) {
        existing.is_active = true;
        return existing;
      }

      const newSub = {
        id: inMemory.newsletters.length + 1,
        email: emailLower,
        is_active: true,
        subscribed_at: new Date()
      };
      inMemory.newsletters.push(newSub);
      return newSub;
    },

    findByEmail: async (email) => {
      const emailLower = email.trim().toLowerCase();
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM newsletters WHERE LOWER(email) = ?', [emailLower]);
        return rows[0] || null;
      }
      return inMemory.newsletters.find(n => n.email === emailLower) || null;
    },

    getActive: async () => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM newsletters WHERE is_active = 1');
        return rows;
      }
      return inMemory.newsletters.filter(n => n.is_active);
    },

    delete: async (id) => {
      if (useMySQL) {
        await pool.query('UPDATE newsletters SET is_active = 0 WHERE id = ?', [id]);
        return true;
      }
      const sub = inMemory.newsletters.find(n => n.id === id);
      if (sub) {
        sub.is_active = false;
        return true;
      }
    }
  },

  payments: {
    create: async (paymentData) => {
      const id = crypto.randomUUID();
      const now = new Date();
      if (useMySQL) {
        await pool.query(
          'INSERT INTO payments (id, booking_id, amount, currency, gateway, transaction_ref, idempotency_key, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, paymentData.booking_id, paymentData.amount, paymentData.currency || 'KES', paymentData.gateway, paymentData.transaction_ref || null, paymentData.idempotency_key || null, paymentData.status || 'PENDING', now, now]
        );
        return { id, ...paymentData, status: paymentData.status || 'PENDING' };
      }
      return null;
    },

    updateStatus: async (transaction_ref, status) => {
      if (useMySQL) {
        await pool.query('UPDATE payments SET status = ?, updated_at = ? WHERE transaction_ref = ?', [status, new Date(), transaction_ref]);
        return true;
      }
      return false;
    },

    findByRef: async (transaction_ref) => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM payments WHERE transaction_ref = ?', [transaction_ref]);
        return rows[0] || null;
      }
      return null;
    },

    // Idempotency: find an existing payment attempt for this booking+key
    findByIdempotencyKey: async (booking_id, idempotency_key) => {
      if (useMySQL) {
        const [rows] = await pool.query(
          'SELECT * FROM payments WHERE booking_id = ? AND idempotency_key = ?',
          [booking_id, idempotency_key]
        );
        return rows[0] || null;
      }
      return null;
    },

    // Idempotency: check if a webhook event_id was already processed
    findProcessedEvent: async (eventId) => {
      if (useMySQL) {
        const [rows] = await pool.query(
          'SELECT id FROM processed_webhook_events WHERE event_id = ?',
          [eventId]
        );
        return rows[0] || null;
      }
      return inMemory.processed_webhook_events.find(e => e.event_id === eventId) || null;
    },

    // Idempotency: record that this webhook event has been handled
    recordProcessedEvent: async (eventId) => {
      if (useMySQL) {
        await pool.query(
          'INSERT IGNORE INTO processed_webhook_events (event_id, processed_at) VALUES (?, ?)',
          [eventId, new Date()]
        );
        return;
      }
      inMemory.processed_webhook_events.push({ event_id: eventId, processed_at: new Date() });
    }
  },

  unit_settings: {
    getPasscode: async (unitId) => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT passcode FROM unit_settings WHERE unit_id = ?', [unitId]);
        if (rows.length > 0) {
          return rows[0].passcode;
        }
        const defaultPin = unitId === 'cocoa' ? '1234' : '9841';
        await pool.query('INSERT IGNORE INTO unit_settings (unit_id, passcode) VALUES (?, ?)', [unitId, defaultPin]);
        return defaultPin;
      }
      const found = inMemory.unit_settings.find(u => u.unit_id === unitId);
      return found ? found.passcode : (unitId === 'cocoa' ? '1234' : '9841');
    },

    setPasscode: async (unitId, passcode) => {
      if (useMySQL) {
        await pool.query(
          'INSERT INTO unit_settings (unit_id, passcode) VALUES (?, ?) ON DUPLICATE KEY UPDATE passcode = ?',
          [unitId, passcode, passcode]
        );
        return true;
      }
      const found = inMemory.unit_settings.find(u => u.unit_id === unitId);
      if (found) {
        found.passcode = passcode;
      } else {
        inMemory.unit_settings.push({ unit_id: unitId, passcode });
      }
      return true;
    },

    getAll: async () => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM unit_settings');
        return rows;
      }
      return inMemory.unit_settings;
    }
  },

  blogs: {
    create: async (blog) => {
      const newBlog = {
        id: blog.id || crypto.randomUUID(),
        title: blog.title,
        author: blog.author || 'Staff',
        category: blog.category,
        content: blog.content,
        date: blog.date || new Date().toISOString().split('T')[0]
      };

      if (useMySQL) {
        // Assume blogs table exists in MySQL if using MySQL
        await pool.query(
          'INSERT INTO blogs (id, title, author, category, content, date) VALUES (?, ?, ?, ?, ?, ?)',
          [newBlog.id, newBlog.title, newBlog.author, newBlog.category, newBlog.content, newBlog.date]
        );
        return newBlog;
      }

      inMemory.blogs.unshift(newBlog);
      return newBlog;
    },

    getAll: async () => {
      if (useMySQL) {
        const [rows] = await pool.query('SELECT * FROM blogs ORDER BY date DESC');
        return rows;
      }
      return [...inMemory.blogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    delete: async (id) => {
      if (useMySQL) {
        const [result] = await pool.query('DELETE FROM blogs WHERE id = ?', [id]);
        return result.affectedRows > 0;
      }
      const initialLength = inMemory.blogs.length;
      inMemory.blogs = inMemory.blogs.filter(b => b.id !== id);
      return inMemory.blogs.length < initialLength;
    }
  }
};

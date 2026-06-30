-- ================================================================
-- LULU AURELIAN ESTATE — Full Schema (Run once on fresh DB)
-- ================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('MANAGER', 'AGENT', 'GUEST') NOT NULL DEFAULT 'GUEST',
  phone VARCHAR(30) NULL,
  avatar_url VARCHAR(500) NULL,
  reset_token VARCHAR(255) NULL,
  reset_expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BOOKINGS TABLE
-- New fields: adults, children, has_peak_surcharge, hold_expires_at
-- New statuses: AUTHORIZING, EXPIRED, PAYMENT_FAILED
-- No longer uses APPROVED (staff approval step removed)
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  guest_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(100) NOT NULL,
  guest_phone VARCHAR(30) NOT NULL,
  unit_id VARCHAR(50) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults TINYINT NOT NULL DEFAULT 1,
  children TINYINT NOT NULL DEFAULT 0,
  has_peak_surcharge TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM(
    'PENDING',
    'AUTHORIZING',
    'PAID',
    'EXPIRED',
    'PAYMENT_FAILED',
    'CANCELLED'
  ) NOT NULL DEFAULT 'PENDING',
  secure_token VARCHAR(255) NOT NULL UNIQUE,
  hold_expires_at TIMESTAMP NULL DEFAULT NULL,
  approved_by VARCHAR(36) NULL DEFAULT NULL,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  cleaning_dates JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_dates CHECK (check_out > check_in),
  CONSTRAINT chk_adults CHECK (adults >= 1 AND adults <= 5),
  CONSTRAINT chk_children CHECK (children >= 0),
  INDEX idx_bookings_guest_email (guest_email),
  INDEX idx_bookings_unit_id (unit_id),
  INDEX idx_bookings_secure_token (secure_token),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_hold_expires (hold_expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PAYMENTS TABLE
-- Added: idempotency_key column, STANBIC gateway
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  gateway ENUM('MPESA', 'PAYPAL', 'STANBIC') NOT NULL,
  transaction_ref VARCHAR(255) NULL,
  idempotency_key VARCHAR(36) NULL,
  status ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_idempotency (booking_id, idempotency_key),
  INDEX idx_payments_booking (booking_id),
  INDEX idx_payments_ref (transaction_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. WEBHOOK IDEMPOTENCY TABLE
-- Prevents duplicate webhook processing
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  booking_id VARCHAR(36) NOT NULL UNIQUE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_reviews_booking_id (booking_id),
  INDEX idx_reviews_is_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. NEWSLETTERS TABLE
CREATE TABLE IF NOT EXISTS newsletters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_newsletters_email (email),
  INDEX idx_newsletters_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. UNIT SETTINGS TABLE
CREATE TABLE IF NOT EXISTS unit_settings (
  unit_id VARCHAR(50) PRIMARY KEY,
  passcode VARCHAR(10) NOT NULL DEFAULT '0000',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PASSWORD RESETS TABLE
CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pr_token (token),
  INDEX idx_pr_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. BLOGS TABLE
CREATE TABLE IF NOT EXISTS blogs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(100) DEFAULT 'Staff',
  category VARCHAR(100),
  content TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

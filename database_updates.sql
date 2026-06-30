-- ================================================================
-- Railway MySQL Migration — Lulu Aurelian Estate
-- MySQL 8.0 compatible (no IF NOT EXISTS on ALTER TABLE)
-- Run each block one at a time in Railway's Query tab.
-- If a statement errors with "Duplicate column name" or
-- "Duplicate key name", that column/index already exists — skip it.
-- ================================================================

-- STEP 1: Add new columns to bookings
ALTER TABLE bookings ADD COLUMN adults TINYINT NOT NULL DEFAULT 1 AFTER check_out;
ALTER TABLE bookings ADD COLUMN children TINYINT NOT NULL DEFAULT 0 AFTER adults;
ALTER TABLE bookings ADD COLUMN has_peak_surcharge TINYINT(1) NOT NULL DEFAULT 0 AFTER children;
ALTER TABLE bookings ADD COLUMN hold_expires_at TIMESTAMP NULL DEFAULT NULL AFTER secure_token;

-- STEP 2: Expand bookings status ENUM
ALTER TABLE bookings MODIFY COLUMN status ENUM(
  'PENDING',
  'AUTHORIZING',
  'PAID',
  'EXPIRED',
  'PAYMENT_FAILED',
  'CANCELLED',
  'APPROVED',
  'DECLINED',
  'CANCELED'
) NOT NULL DEFAULT 'PENDING';

-- STEP 3: Index for cron expiry queries
ALTER TABLE bookings ADD INDEX idx_bookings_hold_expires (hold_expires_at);

-- STEP 4: Add idempotency_key to payments
ALTER TABLE payments ADD COLUMN idempotency_key VARCHAR(36) NULL AFTER transaction_ref;
ALTER TABLE payments ADD UNIQUE KEY uniq_idempotency (booking_id, idempotency_key);

-- STEP 5: Add STANBIC gateway option
ALTER TABLE payments MODIFY COLUMN gateway ENUM('MPESA', 'PAYPAL', 'STANBIC') NOT NULL;

-- STEP 6: Webhook idempotency table
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL UNIQUE,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- STEP 7: Set hold window for any existing PENDING bookings
UPDATE bookings
  SET hold_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR)
  WHERE status = 'PENDING'
  AND hold_expires_at IS NULL;

-- ================================================================
-- Verify with:   DESCRIBE bookings;   DESCRIBE payments;
-- ================================================================

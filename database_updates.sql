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

-- STEP 8: Add welcome details to unit_settings
ALTER TABLE unit_settings ADD COLUMN house_number VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE unit_settings ADD COLUMN wifi_ssid VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE unit_settings ADD COLUMN wifi_password VARCHAR(100) NOT NULL DEFAULT '';

-- Seed or insert defaults
INSERT INTO unit_settings (unit_id, passcode, house_number, wifi_ssid, wifi_password) 
VALUES 
  ('skyview', '9841', '601', 'LuluAurelian_Skyview_5G', 'SkyviewLuxury2026!'),
  ('cocoa', '1234', '402', 'LuluAurelian_Cocoa_5G', 'CocoaLuxury2026!'),
  ('neema', '9841', '201', 'LuluAurelian_Neema_5G', 'NeemaLuxury2026!')
ON DUPLICATE KEY UPDATE 
  house_number = VALUES(house_number),
  wifi_ssid = VALUES(wifi_ssid),
  wifi_password = VALUES(wifi_password);

-- STEP 9: Add unit_pricing table for dynamic live rates (Entire vs 1 Bedroom)
CREATE TABLE IF NOT EXISTS unit_pricing (
  unit_id VARCHAR(50) PRIMARY KEY,
  entire_price DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
  one_bedroom_price DECIMAL(10,2) NOT NULL DEFAULT 4000.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO unit_pricing (unit_id, entire_price, one_bedroom_price) VALUES
  ('skyview', 5500.00, 4000.00),
  ('cocoa', 5000.00, 4000.00),
  ('neema', 5000.00, 4000.00)
ON DUPLICATE KEY UPDATE 
  entire_price = VALUES(entire_price),
  one_bedroom_price = VALUES(one_bedroom_price);

-- STEP 10: Add booking_type column to bookings table
ALTER TABLE bookings ADD COLUMN booking_type VARCHAR(30) NOT NULL DEFAULT 'entire' AFTER unit_id;

-- ================================================================
-- Verify with:   DESCRIBE bookings;   DESCRIBE payments;   DESCRIBE unit_pricing;
-- ================================================================


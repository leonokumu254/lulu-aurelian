import { Router } from 'express';
import {
  requestBooking,
  stanbicCallback,
  getBookings,
  getMyBookings,
  checkBookingStatus,
  initiatePayment,
  getUnitSettings,
  updateUnitSettings,
  cancelBooking,
  getBlockedDates
} from '../controllers/bookingController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

// Guest creates a direct booking (no staff approval required)
router.post('/request', requestBooking);

// Guest checks reservation status via secure_token
router.get('/status', checkBookingStatus);

// Calendar blocked-dates feed (includes PENDING holds)
router.get('/blocked-dates/:unitId', getBlockedDates);

// Stanbic Paybill callback webhook (public — verified by signature)
router.post('/webhook/stanbic', stanbicCallback);

// ─── PROTECTED ROUTES ────────────────────────────────────────────────────────

// Guest initiates Stanbic STK Push payment
router.post('/:id/pay', authMiddleware, requireRole('GUEST', 'MANAGER', 'AGENT'), initiatePayment);

// Fetch guest's own bookings
router.get('/my-bookings', authMiddleware, requireRole('GUEST', 'MANAGER', 'AGENT'), getMyBookings);

// Cancel a booking (only PENDING / AUTHORIZING — PAID bookings must contact management)
router.put('/:id/cancel', authMiddleware, requireRole('GUEST', 'MANAGER', 'AGENT'), cancelBooking);

// Fetch all bookings (Agents & Managers)
router.get('/', authMiddleware, requireRole('MANAGER', 'AGENT'), getBookings);

// Unit settings
router.get('/unit-settings', authMiddleware, requireRole('MANAGER', 'AGENT'), getUnitSettings);
router.put('/unit-settings/:unitId', authMiddleware, requireRole('MANAGER', 'AGENT'), updateUnitSettings);

export default router;

import { Router } from 'express';
import { 
  requestBooking, 
  approveBooking, 
  declineBooking, 
  verifyPaymentWebhook, 
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

// --- PUBLIC ROUTING ---
// Guest triggers initial booking request
router.post('/request', requestBooking);

// Guest checks reservation status using secure_token query parameter (No Login Required)
router.get('/status', checkBookingStatus);

// Get blocked dates for a unit (No Login Required)
router.get('/blocked-dates/:unitId', getBlockedDates);

// M-Pesa webhook callback endpoint (Verified via X-Mpesa-Secret callback key)
router.post('/webhook/mpesa', verifyPaymentWebhook);

// --- PROTECTED ROUTING ---
// Fetch guest's own bookings
router.get('/my-bookings', authMiddleware, requireRole('GUEST', 'MANAGER', 'AGENT'), getMyBookings);

// Guest initiates instant payment
router.post('/:id/pay', authMiddleware, requireRole('GUEST', 'MANAGER', 'AGENT'), initiatePayment);

// Fetch all bookings (Agents & Managers)
router.get('/', authMiddleware, requireRole('MANAGER', 'AGENT'), getBookings);

// Approve a booking, logging approved_at and initiating 3h payment countdown (Agents & Managers)
router.put('/:id/approve', authMiddleware, requireRole('MANAGER', 'AGENT'), approveBooking);

// Decline a booking (Agents & Managers)
router.put('/:id/decline', authMiddleware, requireRole('MANAGER', 'AGENT'), declineBooking);

// Cancel a booking (Guest, Agents, Managers)
router.put('/:id/cancel', authMiddleware, requireRole('GUEST', 'MANAGER', 'AGENT'), cancelBooking);

// Get unit settings (Agents & Managers)
router.get('/unit-settings', authMiddleware, requireRole('MANAGER', 'AGENT'), getUnitSettings);

// Update unit setting passcode (Agents & Managers)
router.put('/unit-settings/:unitId', authMiddleware, requireRole('MANAGER', 'AGENT'), updateUnitSettings);

export default router;

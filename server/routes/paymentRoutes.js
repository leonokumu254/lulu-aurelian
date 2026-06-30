import { Router } from 'express';
import {
  initiateMpesaPayment,
  mpesaCallback
} from '../controllers/paymentController.js';

const router = Router();

// M-Pesa (legacy — kept for backwards compatibility)
router.post('/mpesa/initiate', initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback);

// NOTE: Stanbic STK Push is now handled via /api/bookings/:id/pay
// and the Stanbic callback via /api/bookings/webhook/stanbic

export default router;

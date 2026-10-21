import { Router } from 'express';
import {
  initiateMpesaPayment,
  payheroCallback,
  queryPayheroStatus,
  verifyManualMpesaPayment
} from '../controllers/paymentController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// M-Pesa via PayHero — Initiate STK Push
router.post('/mpesa/initiate', initiateMpesaPayment);

// M-Pesa Manual / SMS Code Verification (Allows guest with booking_id or staff to verify)
router.post('/mpesa/verify-manual', verifyManualMpesaPayment);

// PayHero — STK Push Callback (PayHero server-to-server)
router.post('/payhero/callback', payheroCallback);

// PayHero — STK Push Status Query (supports both POST and GET polling from client)
router.post('/payhero/query', queryPayheroStatus);
router.get('/payhero/query', queryPayheroStatus);

export default router;

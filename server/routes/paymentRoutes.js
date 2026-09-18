import { Router } from 'express';
import {
  initiateMpesaPayment,
  mpesaCallback,
  queryMpesaStatus,
  payheroCallback,
  queryPayheroStatus
} from '../controllers/paymentController.js';

const router = Router();

// M-Pesa Daraja Direct — STK Push (legacy)
router.post('/mpesa/initiate', initiateMpesaPayment);

// M-Pesa Daraja Direct — STK Push Callback (Safaricom server-to-server)
router.post('/mpesa/callback', mpesaCallback);

// M-Pesa Daraja Direct — STK Push Status Query (frontend polling)
router.post('/mpesa/query', queryMpesaStatus);

// PayHero — STK Push Callback (PayHero server-to-server)
router.post('/payhero/callback', payheroCallback);

// PayHero — STK Push Status Query (frontend polling)
router.post('/payhero/query', queryPayheroStatus);

export default router;

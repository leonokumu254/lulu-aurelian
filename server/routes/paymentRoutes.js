import { Router } from 'express';
import {
  initiateMpesaPayment,
  payheroCallback,
  queryPayheroStatus
} from '../controllers/paymentController.js';

const router = Router();

// M-Pesa via PayHero — Initiate STK Push
router.post('/mpesa/initiate', initiateMpesaPayment);

// PayHero — STK Push Callback (PayHero server-to-server)
router.post('/payhero/callback', payheroCallback);

// PayHero — STK Push Status Query (frontend polling)
router.post('/payhero/query', queryPayheroStatus);

export default router;

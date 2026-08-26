import { Router } from 'express';
import {
  initiateMpesaPayment,
  mpesaCallback,
  queryMpesaStatus
} from '../controllers/paymentController.js';

const router = Router();

// M-Pesa Daraja Direct — STK Push
router.post('/mpesa/initiate', initiateMpesaPayment);

// M-Pesa Daraja Direct — STK Push Callback (Safaricom server-to-server)
router.post('/mpesa/callback', mpesaCallback);

// M-Pesa Daraja Direct — STK Push Status Query (frontend polling)
router.post('/mpesa/query', queryMpesaStatus);

export default router;

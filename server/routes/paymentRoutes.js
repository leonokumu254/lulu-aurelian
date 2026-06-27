import { Router } from 'express';
import { 
  initiateMpesaPayment, 
  mpesaCallback, 
  initiatePaypalPayment, 
  capturePaypalPayment 
} from '../controllers/paymentController.js';

const router = Router();

// M-Pesa Routes
router.post('/mpesa/initiate', initiateMpesaPayment);
router.post('/mpesa/callback', mpesaCallback);

// PayPal Routes
router.post('/paypal/initiate', initiatePaypalPayment);
router.post('/paypal/capture', capturePaypalPayment);

export default router;

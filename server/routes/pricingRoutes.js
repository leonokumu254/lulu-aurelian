import { Router } from 'express';
import { getPricing, updatePricing } from '../controllers/pricingController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Public: Guests, booking forms, unit pages fetch current live prices
router.get('/', getPricing);

// Protected: Staff/Manager updates live prices
router.put('/', authMiddleware, requireRole('MANAGER', 'AGENT'), updatePricing);

export default router;

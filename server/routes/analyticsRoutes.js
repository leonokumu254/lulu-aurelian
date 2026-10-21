import { Router } from 'express';
import { getAnalyticsMetrics } from '../controllers/analyticsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Manager and Agent analytics endpoint
router.get('/metrics', authMiddleware, requireRole('MANAGER', 'AGENT'), getAnalyticsMetrics);
router.get('/summary', authMiddleware, requireRole('MANAGER', 'AGENT'), getAnalyticsMetrics);

export default router;

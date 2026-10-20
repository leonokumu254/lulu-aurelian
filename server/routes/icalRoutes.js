import { Router } from 'express';
import { exportICal, importICalSync } from '../controllers/icalController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/export/:unitId', exportICal);
router.post('/sync', authMiddleware, requireRole('MANAGER', 'AGENT'), importICalSync);

export default router;

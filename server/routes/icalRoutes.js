import { Router } from 'express';
import { exportICal, importICalSync } from '../controllers/icalController.js';

const router = Router();

router.get('/export/:unitId', exportICal);
router.post('/sync', importICalSync);

export default router;

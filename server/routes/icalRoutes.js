import { Router } from 'express';
import { exportICal } from '../controllers/icalController.js';

const router = Router();

router.get('/export/:unitId', exportICal);

export default router;

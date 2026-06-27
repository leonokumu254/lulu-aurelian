import { Router } from 'express';
import { subscribe, unsubscribe } from '../controllers/newsletterController.js';

const router = Router();

// Public subscribe and opt-out channels
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

export default router;

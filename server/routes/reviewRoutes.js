import { Router } from 'express';
import { 
  submitReview, 
  getPublishedReviews, 
  moderateReview, 
  deleteReview,
  submitReviewAuthenticated,
  getAllReviews
} from '../controllers/reviewController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { cacheMiddleware, clearCache } from '../middleware/cacheMiddleware.js';

const router = Router();

// --- PUBLIC ROUTING ---
// Get all verified published guest reviews
router.get('/', cacheMiddleware(3600), getPublishedReviews);

// Guest submits review (Requires active secure_token query parameter pointing to a PAID stay)
router.post('/submit', submitReview);

// Logged-in Guest submits review generically
router.post('/', authMiddleware, submitReviewAuthenticated);

// --- PROTECTED STAFF ROUTING ---
// Get all reviews for moderation (Managers only)
router.get('/all', authMiddleware, requireRole('MANAGER'), getAllReviews);

// Moderate review visibility (Publish or retract - Agents & Managers)
router.put('/:id/moderate', authMiddleware, requireRole('MANAGER', 'AGENT'), async (req, res, next) => {
  await clearCache('/api/reviews*');
  next();
}, moderateReview);

// Delete review (Restrict to Managers only)
router.delete('/:id', authMiddleware, requireRole('MANAGER'), async (req, res, next) => {
  await clearCache('/api/reviews*');
  next();
}, deleteReview);

export default router;

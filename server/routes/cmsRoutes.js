import { Router } from 'express';
import { getBlogs, createBlog, deleteBlog, dispatchNewsletter } from '../controllers/cmsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/blogs', getBlogs);

// Protected routes (Agent or Manager)
router.post('/blogs', authMiddleware, requireRole('MANAGER', 'AGENT'), createBlog);
router.delete('/blogs/:id', authMiddleware, requireRole('MANAGER', 'AGENT'), deleteBlog);
router.post('/newsletters/dispatch', authMiddleware, requireRole('MANAGER', 'AGENT'), dispatchNewsletter);

export default router;

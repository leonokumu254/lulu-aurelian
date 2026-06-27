import { Router } from 'express';
import { login, register, getMe, googleLogin, forgotPassword, resetPassword, refresh, logout } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public authentication endpoints
router.post('/login', login);
router.post('/register', register);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Self-profile check (Requires active token)
router.get('/me', authMiddleware, getMe);

export default router;

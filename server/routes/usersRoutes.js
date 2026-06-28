import { Router } from 'express';
import { db } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all users – used by manager/agent portals
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await db.users.getAll();
    // Expose only needed fields (avoid sending password hashes)
    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar_url || '/avatar.svg', 
    }));
    res.json(safeUsers);
  } catch (err) {
    console.error('[USERS ROUTE] fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;

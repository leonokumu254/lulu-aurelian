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

// Onboard/Invite new agent
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Only managers can invite staff.' });
    }

    const { name, email, role } = req.body;
    if (!name || !email || !role) return res.status(400).json({ error: 'Name, email, and role are required.' });

    // Check if user already exists
    const existing = await db.users.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'User already exists.' });

    // Create user with a dummy password
    const crypto = await import('crypto');
    const bcrypt = await import('bcryptjs');
    const dummyPassword = crypto.randomBytes(16).toString('hex');
    const passwordHash = await bcrypt.hash(dummyPassword, 10);

    const newUser = await db.users.create({
      name,
      email,
      password_hash: passwordHash,
      role: role.toUpperCase()
    });

    // Generate invite token (reuse reset token system)
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await db.users.setResetToken(email, token, expiry);

    // Send invitation email
    const { emailService } = await import('../services/emailService.js');
    await emailService.sendAgentInvitation(email, name, role, token);

    res.json({ success: true, message: 'Invitation sent.' });
  } catch (err) {
    console.error('[USERS ROUTE] invite error:', err);
    res.status(500).json({ error: 'Failed to invite agent.' });
  }
});

// Remove agent
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Only managers can remove staff.' });
    }
    const { id } = req.params;
    
    // Prevent removing oneself or the main admin
    const userToDelete = await db.users.findById(id);
    if (!userToDelete) return res.status(404).json({ error: 'User not found' });
    if (userToDelete.email === 'manager@lulu.com' || userToDelete.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove this core account.' });
    }

    await db.users.delete(id);
    res.json({ success: true, message: 'Access revoked.' });
  } catch (err) {
    console.error('[USERS ROUTE] delete error:', err);
    res.status(500).json({ error: 'Failed to remove user.' });
  }
});

export default router;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { env } from '../config/env.js';
import { emailService } from '../services/emailService.js';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID);

const generateTokensAndSetCookies = (res, user) => {
  const accessToken = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.'
      });
    }

    // Lookup user in relational memory
    const user = await db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Access Denied.'
      });
    }

    // Verify Password cipher
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Access Denied.'
      });
    }

    generateTokensAndSetCookies(res, user);

    // Return profile payload
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar_url || null
      }
    });

  } catch (error) {
    next(error);
  }
};

// Guest registration endpoint
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email is already registered
    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email already exists. Please log in instead.'
      });
    }

    // Hash password and create GUEST account
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await db.users.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password_hash: passwordHash,
      role: 'GUEST',
      phone: phone || null
    });

    generateTokensAndSetCookies(res, newUser);

    // Dispatch welcome email asynchronously
    emailService.sendAccountCreationWelcome(newUser.email, newUser.name).catch(err => {
      console.error('[AUTH CONTROLLER]: Failed to dispatch welcome email:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone || ''
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    // req.user populated by authMiddleware
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Session profile no longer exists.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar_url || null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ success: false, error: 'Google access token missing.' });
    }

    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    
    if (!googleRes.ok) {
      return res.status(401).json({ success: false, error: 'Invalid Google access token.' });
    }
    
    const payload = await googleRes.json();
    const email = payload.email.toLowerCase();
    const name = payload.name;
    const avatar = payload.picture;

    let user = await db.users.findByEmail(email);

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      
      user = await db.users.create({
        name: name,
        email: email,
        password_hash: passwordHash,
        role: 'GUEST',
        phone: null,
        avatar_url: avatar
      });

      emailService.sendAccountCreationWelcome(user.email, user.name).catch(err => {
        console.error('[AUTH CONTROLLER]: Failed to dispatch welcome email:', err);
      });
    } else {
      // Update the user's avatar if they already exist
      if (avatar && user.avatar_url !== avatar) {
        await db.users.updateAvatar(user.id, avatar);
        user.avatar_url = avatar;
      }
    }

    generateTokensAndSetCookies(res, user);

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar_url || avatar
      }
    });

  } catch (error) {
    console.error('[GOOGLE AUTH ERROR]:', error);
    return res.status(401).json({ success: false, error: 'Google authentication failed.' });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const user = await db.users.findByEmail(email);
    if (!user) {
      // Return success anyway to prevent email enumeration
      return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate token and expiry
    const resetToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.users.setResetToken(user.email, resetToken, expiresAt);

    const origin = req.headers.origin || 'http://localhost:5173';
    const resetLink = `${origin}/?reset_token=${resetToken}`;

    emailService.sendPasswordReset(user.email, resetLink).catch(err => {
      console.error('[AUTH CONTROLLER]: Failed to dispatch reset email:', err);
    });

    return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, error: 'Token and new password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const user = await db.users.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
    }

    // Check expiry
    if (new Date(user.reset_expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.users.updatePassword(user.id, passwordHash);

    return res.status(200).json({ success: true, message: 'Password has been successfully reset. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'No refresh token provided.' });
    }

    const decoded = jwt.verify(refreshToken, env.JWT_SECRET);
    const user = await db.users.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    generateTokensAndSetCookies(res, user);

    return res.status(200).json({ success: true, message: 'Token refreshed successfully.' });
  } catch (error) {
    // If token is invalid or expired
    return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ── Change password (requires current password) ──────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters.' });
    }

    const user = await db.users.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.users.updatePassword(user.id, passwordHash);

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// ── Update profile (name, phone) ─────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }

    const updated = await db.users.updateProfile(req.user.id, {
      name: name.trim(),
      phone: phone ? phone.trim() : null
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id:    updated.id,
        name:  updated.name,
        email: updated.email,
        phone: updated.phone || '',
        role:  updated.role
      }
    });
  } catch (error) {
    next(error);
  }
};


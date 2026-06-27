import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const authMiddleware = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access Denied. Authorization session token missing.'
      });
    }

    // Verify JWT cipher signature
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: 'Access Denied. Session expired or corrupted security signature.'
        });
      }

      // Attach decoded staff session metadata to request object
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role
      };

      next();
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal system fault during token verification.'
    });
  }
};

// Enforces RBAC constraints (MANAGER, AGENT roles)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthenticated session.'
      });
    }

    if (!allowedRoles.includes(req.user.role.toUpperCase())) {
      return res.status(403).json({
        success: false,
        error: `Access Denied. Required permissions: [${allowedRoles.join(', ')}]. Current role: [${req.user.role}]`
      });
    }

    next();
  };
};

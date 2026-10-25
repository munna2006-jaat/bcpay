import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db.js';
import { IUser } from '../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'earnloop-super-secure-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  adminId?: string;
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; phone: string; role: string };
    const state = dbStore.getState();
    const user = state.users.find(u => u.id === payload.id);

    if (!user) {
      res.status(401).json({ error: 'User session not found or revoked.' });
      return;
    }

    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Allow admin token or direct Admin PIN header
  const adminPinHeader = req.headers['x-admin-pin'] as string;
  const state = dbStore.getState();
  const configuredPin = state.settings['ADMIN_PIN'] || process.env.ADMIN_PIN || 'EarnLoop@Admin#2026';

  if (adminPinHeader && adminPinHeader === configuredPin) {
    req.adminId = 'admin-pin-auth';
    next();
    return;
  }

  // Otherwise check user token with role ADMIN
  requireAuth(req, res, () => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
      req.adminId = req.user.id;
      next();
    } else {
      res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
    }
  });
}

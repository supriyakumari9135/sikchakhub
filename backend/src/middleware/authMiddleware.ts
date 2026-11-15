import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@sikchakhub/shared-types';
import { UserModel } from '../db/mongodb';
import { dbStore } from '../db/store';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  adminRole?: string;
  institutionId?: string;
  status?: string;
  isVerified?: boolean;
  verificationStatus?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'sikchakhub-super-secret-jwt-key-2025';

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    // Verify account active status and hydrate live verification status
    try {
      const liveUser = await UserModel.findOne({ id: decoded.id })
        .select('status isVerified verificationStatus emailVerified phoneVerified')
        .lean() as any;
      if (liveUser && (liveUser.status === 'SUSPENDED' || liveUser.status === 'DEACTIVATED')) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your account is currently ${liveUser.status.toLowerCase()}. Please contact support@sikchakhub.ai.`,
        });
      }
      if (liveUser) {
        const isDualVerified = (liveUser.emailVerified === true && liveUser.phoneVerified === true) || decoded.role === 'ADMIN' || decoded.role === 'HR';
        decoded.isVerified = isDualVerified;
        decoded.verificationStatus = isDualVerified ? 'FULLY_VERIFIED' : (liveUser.verificationStatus || 'PENDING_VERIFICATION');
      }
    } catch (e) {
      const fallbackUser: any = dbStore.getUserById(decoded.id);
      if (fallbackUser && (fallbackUser.status === 'SUSPENDED' || fallbackUser.status === 'DEACTIVATED')) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Your account is currently ${fallbackUser.status.toLowerCase()}. Please contact support@sikchakhub.ai.`,
        });
      }
      if (fallbackUser) {
        const isDualVerified = (fallbackUser.emailVerified === true && fallbackUser.phoneVerified === true) || decoded.role === 'ADMIN' || decoded.role === 'HR';
        decoded.isVerified = isDualVerified;
        decoded.verificationStatus = isDualVerified ? 'FULLY_VERIFIED' : (fallbackUser.verificationStatus || 'PENDING_VERIFICATION');
      }
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

export function optionalJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // Ignored for optional
    }
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Role '${req.user.role}' does not have required permissions.` 
      });
    }
    next();
  };
}

export function requireVerifiedAccount(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  // Admins and HR bypass end-user email/phone OTP verification
  if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
    return next();
  }

  const isFullyVerified = req.user.isVerified === true && req.user.verificationStatus === 'FULLY_VERIFIED';
  if (!isFullyVerified) {
    return res.status(403).json({
      success: false,
      code: 'VERIFICATION_REQUIRED',
      message: 'Full account verification is required. Both your Gmail address and mobile number must be verified with OTP before you can access this service.',
      verificationStatus: req.user.verificationStatus || 'PENDING_VERIFICATION',
    });
  }

  next();
}

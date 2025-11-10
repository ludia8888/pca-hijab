import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { verifyAccessToken } from '../utils/auth';
import { db } from '../db';
import { ADMIN_ROLES } from '../config/roles';
import { logAdminAction } from '../services/adminAuditService';
import type { UserRole } from '../types';

const extractAccessToken = (req: Request): string | undefined => {
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  return token;
};

const decodeRequestToken = (req: Request): { userId: string; role: UserRole } => {
  const token = extractAccessToken(req);
  if (!token) {
    throw new AppError(401, 'Authentication required');
  }

  const decoded = verifyAccessToken(token);
  return {
    userId: decoded.userId,
    role: decoded.role ?? 'user'
  };
};

const attachUserContext = (req: Request, userId: string, role: UserRole): void => {
  req.user = { userId, role };
};

// JWT authentication middleware
export const authenticateUser = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const decoded = decodeRequestToken(req);
    attachUserContext(req, decoded.userId, decoded.role);
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    if (error instanceof Error && error.message.includes('expired')) {
      return next(new AppError(401, 'Token expired'));
    }
    next(new AppError(401, 'Invalid token'));
  }
};

export const authenticateAdmin = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const decoded = decodeRequestToken(req);
    const user = await db.getUserById(decoded.userId);

    if (!user) {
      throw new AppError(401, 'Authentication required');
    }

    const role: UserRole = user.role ?? 'user';

    if (!ADMIN_ROLES.includes(role)) {
      throw new AppError(403, 'Admin permissions are required.');
    }

    attachUserContext(req, user.id, role);
    req.adminUser = {
      userId: user.id,
      email: user.email,
      role
    };

    void logAdminAction('admin_request', {
      path: req.originalUrl,
      method: req.method
    }, req.adminUser);

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error instanceof Error && error.message.includes('expired')) {
      return next(new AppError(401, 'Token expired'));
    }

    next(new AppError(401, 'Failed to verify admin permissions.'));
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const decoded = decodeRequestToken(req);
    attachUserContext(req, decoded.userId, decoded.role);
  } catch (error) {
    if (error instanceof AppError) {
      console.debug('[OptionalAuth] Authentication skipped:', error.message);
    } else if (error instanceof Error) {
      console.debug('[OptionalAuth] Authentication failed (non-blocking):', error.message);
    } else {
      console.debug('[OptionalAuth] Authentication failed (non-blocking):', error);
    }
  }

  next();
};

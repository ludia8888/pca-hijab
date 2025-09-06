import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { verifyAccessToken } from '../utils/auth';
import { config } from '../config/environment';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

// Simple API key authentication for admin endpoints
export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  
  // Use validated admin API key from secure configuration
  const adminApiKey = config.ADMIN_API_KEY;
  
  if (!apiKey || apiKey !== adminApiKey) {
    return next(new AppError(401, 'Unauthorized: Invalid API key'));
  }
  
  next();
};

// JWT authentication middleware
export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // First check cookies
    let token = req.cookies?.accessToken;
    
    // Fallback to Authorization header for API clients
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }
    
    if (!token) {
      throw new AppError(401, 'Authentication required');
    }
    
    const decoded = verifyAccessToken(token);
    
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes('expired')) {
      throw new AppError(401, 'Token expired');
    }
    throw new AppError(401, 'Invalid token');
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // First check cookies
    let token = req.cookies?.accessToken;
    
    // Fallback to Authorization header for API clients
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = { userId: decoded.userId };
    }
  } catch (error) {
    // Log the error for debugging but don't fail the request
    if (error instanceof Error) {
      console.debug('[OptionalAuth] Authentication failed (non-blocking):', error.message);
    } else {
      console.debug('[OptionalAuth] Authentication failed (non-blocking):', error);
    }
    // User is simply not authenticated - continue without user context
  }
  
  next();
};
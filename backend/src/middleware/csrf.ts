import { Request, Response, NextFunction } from 'express';
import Tokens from 'csrf';
import { AppError } from './errorHandler';

const tokens = new Tokens();

// Generate CSRF token
export const generateCSRFToken = (): { secret: string; token: string } => {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  return { secret, token };
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return next();
    }

    const token = req.headers['x-csrf-token'] as string || req.body._csrf;
    const secret = req.cookies.csrfSecret;

    if (!token || !secret) {
      throw new AppError(403, 'CSRF token missing');
    }

    if (!tokens.verify(secret, token)) {
      throw new AppError(403, 'Invalid CSRF token');
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(403, 'CSRF validation failed');
  }
};

// Endpoint to get CSRF token
export const getCSRFToken = (req: Request, res: Response): void => {
  const { secret, token } = generateCSRFToken();
  
  // Store secret in HttpOnly cookie
  res.cookie('csrfSecret', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  
  // Send token to client
  res.json({
    success: true,
    csrfToken: token
  });
};
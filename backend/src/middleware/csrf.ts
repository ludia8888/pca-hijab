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
  console.log('🔐 [CSRF] Protection check for:', req.method, req.path);
  
  try {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      console.log('✅ [CSRF] Skipping for GET request');
      return next();
    }
    
    // Skip CSRF for session creation (new sessions don't have CSRF yet)
    // This is safe because creating a session doesn't perform any sensitive action
    if (req.path === '/sessions' && req.method === 'POST') {
      console.log('✅ [CSRF] Skipping for session creation (Instagram optimization)');
      return next();
    }

    const token = req.headers['x-csrf-token'] as string || req.body._csrf;
    const secret = req.cookies.csrfSecret;
    
    console.log('🔍 [CSRF] Token check:', {
      hasToken: !!token,
      hasSecret: !!secret,
      tokenSource: req.headers['x-csrf-token'] ? 'header' : req.body._csrf ? 'body' : 'none',
      cookies: Object.keys(req.cookies || {})
    });

    if (!token || !secret) {
      console.error('❌ [CSRF] Missing token or secret:', { token: !!token, secret: !!secret });
      throw new AppError(403, 'CSRF token missing');
    }

    const isValid = tokens.verify(secret, token);
    console.log('🎫 [CSRF] Verification result:', isValid);
    
    if (!isValid) {
      console.error('❌ [CSRF] Invalid token');
      throw new AppError(403, 'Invalid CSRF token');
    }

    console.log('✅ [CSRF] Protection passed');
    next();
  } catch (error) {
    console.error('❌ [CSRF] Protection failed:', error);
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
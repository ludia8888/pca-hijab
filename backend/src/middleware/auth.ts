import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Simple API key authentication for admin endpoints
export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] as string | undefined;
  
  // Get admin API key from environment variable
  const adminApiKey = process.env.ADMIN_API_KEY;
  
  if (!adminApiKey) {
    throw new Error('ADMIN_API_KEY environment variable is required');
  }
  
  if (!apiKey || apiKey !== adminApiKey) {
    return next(new AppError(401, 'Unauthorized: Invalid API key'));
  }
  
  next();
};
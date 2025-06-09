import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Simple API key authentication for admin endpoints
export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  // Get admin API key from environment variable
  const adminApiKey = process.env.ADMIN_API_KEY || 'pca-hijab-admin-2024';
  
  if (!apiKey || apiKey !== adminApiKey) {
    return next(new AppError(401, 'Unauthorized: Invalid API key'));
  }
  
  next();
};
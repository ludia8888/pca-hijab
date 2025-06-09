import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateInstagramId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { instagramId } = req.body;
  
  if (!instagramId || typeof instagramId !== 'string') {
    return next(new AppError(400, 'Instagram ID is required'));
  }
  
  // Basic Instagram ID validation
  const instagramIdRegex = /^[a-zA-Z0-9_.]{1,30}$/;
  if (!instagramIdRegex.test(instagramId)) {
    return next(new AppError(400, 'Invalid Instagram ID format'));
  }
  
  next();
};

export const validateRecommendationData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { sessionId, instagramId, personalColorResult, userPreferences } = req.body;
  
  if (!sessionId || !instagramId || !personalColorResult || !userPreferences) {
    return next(new AppError(400, 'Missing required fields'));
  }
  
  // Validate personal color result structure
  if (!personalColorResult.personal_color_en || !personalColorResult.tone_en) {
    return next(new AppError(400, 'Invalid personal color result data'));
  }
  
  // Validate user preferences structure
  if (!userPreferences.style || !Array.isArray(userPreferences.style)) {
    return next(new AppError(400, 'Invalid user preferences: style must be an array'));
  }
  
  next();
};
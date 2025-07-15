/**
 * Authorization middleware for resource ownership verification
 * CRITICAL SECURITY: Ensures users can only access their own resources
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { db } from '../db';

/**
 * Middleware to verify that the authenticated user owns the session
 * MUST be used after authenticateUser middleware
 */
export const verifySessionOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    if (!sessionId) {
      throw new AppError(400, 'Session ID is required');
    }

    // Get session from database
    const session = await db.getSession(sessionId);

    if (!session) {
      throw new AppError(404, 'Session not found');
    }

    // Verify ownership: user must own the session
    if (session.userId !== userId) {
      console.warn(`SECURITY: User ${userId} attempted to access session ${sessionId} owned by ${session.userId}`);
      throw new AppError(403, 'Access denied: You can only access your own sessions');
    }

    // Attach session to request for use in route handler
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify that the authenticated user owns the recommendation
 * MUST be used after authenticateUser middleware
 */
export const verifyRecommendationOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recommendationId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    if (!recommendationId) {
      throw new AppError(400, 'Recommendation ID is required');
    }

    // Get recommendation from database
    const recommendation = await db.getRecommendation(recommendationId);

    if (!recommendation) {
      throw new AppError(404, 'Recommendation not found');
    }

    // Get the associated session to verify ownership
    const session = await db.getSession(recommendation.sessionId);

    if (!session) {
      throw new AppError(404, 'Associated session not found');
    }

    // Verify ownership: user must own the session that created the recommendation
    if (session.userId !== userId) {
      console.warn(`SECURITY: User ${userId} attempted to access recommendation ${recommendationId} owned by ${session.userId}`);
      throw new AppError(403, 'Access denied: You can only access your own recommendations');
    }

    // Attach recommendation to request for use in route handler
    req.recommendation = recommendation;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to verify session ownership for creation (optional auth)
 * Allows anonymous session creation but verifies ownership if user is authenticated
 */
export const verifySessionCreationAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { sessionId } = req.params;

    // If no user is authenticated, allow anonymous session creation
    if (!userId) {
      return next();
    }

    // If user is authenticated and sessionId is provided, verify ownership
    if (sessionId) {
      const session = await db.getSession(sessionId);
      
      if (session && session.userId && session.userId !== userId) {
        console.warn(`SECURITY: User ${userId} attempted to modify session ${sessionId} owned by ${session.userId}`);
        throw new AppError(403, 'Access denied: You can only modify your own sessions');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Extend Express Request type to include attached resources
declare global {
  namespace Express {
    interface Request {
      session?: any; // Session object from database
      recommendation?: any; // Recommendation object from database
    }
  }
}
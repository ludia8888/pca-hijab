import { Router } from 'express';
import { db } from '../db';
import { validateRecommendationData } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { authenticateUser, authenticateAdmin } from '../middleware/auth';
import { verifyRecommendationOwnership, verifySessionOwnership } from '../middleware/authorization';
import { maskUserId } from '../utils/logging';
import type { Recommendation } from '../types';

const router = Router();

// POST /api/recommendations - Create a new recommendation request (SECURED)
router.post('/', authenticateUser, validateRecommendationData, async (req, res, next) => {
  try {
    const { sessionId, personalColorResult, userPreferences } = req.body;
    const userId = req.user!.userId;
    
    // Verify session exists and user owns it
    const session = await db.getSession(sessionId);
    if (!session) {
      throw new AppError(400, 'Invalid session ID');
    }
    
    // Security check: verify session ownership
    if (session.userId !== userId) {
      console.warn(`SECURITY: User ${maskUserId(userId)} attempted to create recommendation for session ${sessionId} owned by ${maskUserId(session.userId || 'unknown')}`);
      throw new AppError(403, 'Access denied: You can only create recommendations for your own sessions');
    }
    
    console.info(`Recommendation creation attempt - SessionID: ${sessionId}, User: ${maskUserId(userId)}`);
    
    // Create recommendation
    const recommendation = await db.createRecommendation({
      sessionId,
      instagramId: 'anonymous',
      personalColorResult,
      userPreferences,
      status: 'pending'
    });
    
    console.info(`Recommendation created successfully - ID: ${recommendation.id}, User: ${maskUserId(userId)}`);
    
    res.status(201).json({
      success: true,
      message: 'Recommendation request submitted successfully',
      recommendationId: recommendation.id
    });
  } catch (error) {
    console.error(`Recommendation creation failed - User: ${maskUserId(req.user?.userId || 'unknown')}`, error);
    next(error);
  }
});

// GET /api/recommendations/:recommendationId - Get recommendation status (SECURED)
router.get('/:recommendationId', authenticateUser, verifyRecommendationOwnership, async (req, res, next) => {
  try {
    // Recommendation is already verified and attached by middleware
    const recommendation = req.recommendation;
    
    console.info(`Recommendation accessed - ID: ${recommendation.id}, User: ${maskUserId(req.user!.userId)}`);
    
    res.json({
      success: true,
      data: {
        id: recommendation.id,
        status: recommendation.status,
        createdAt: recommendation.createdAt,
        updatedAt: recommendation.updatedAt
      }
    });
  } catch (error) {
    console.error(`Recommendation access failed - RecommendationID: ${req.params.recommendationId}, User: ${maskUserId(req.user?.userId || 'unknown')}`, error);
    next(error);
  }
});

// GET /api/recommendations - Get all recommendations (ADMIN ONLY - SECURED)
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const { status } = req.query;
    
    console.info(`Admin recommendations list accessed - Status filter: ${status || 'all'}`);
    
    const recommendations = status 
      ? await db.getRecommendationsByStatus(status as Recommendation['status'])
      : await db.getAllRecommendations();
    
    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Admin recommendations list access failed:', error);
    next(error);
  }
});

// PATCH /api/recommendations/:recommendationId/status - Update recommendation status (ADMIN ONLY - SECURED)
router.patch('/:recommendationId/status', authenticateAdmin, async (req, res, next) => {
  try {
    const { recommendationId } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'completed'].includes(status)) {
      throw new AppError(400, 'Invalid status value');
    }
    
    console.info(`Admin updating recommendation status - ID: ${recommendationId}, Status: ${status}`);
    
    const recommendation = await db.updateRecommendationStatus(recommendationId, status);
    
    if (!recommendation) {
      throw new AppError(404, 'Recommendation not found');
    }
    
    console.info(`Recommendation status updated successfully - ID: ${recommendationId}, New Status: ${status}`);
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        id: recommendation.id,
        status: recommendation.status,
        updatedAt: recommendation.updatedAt
      }
    });
  } catch (error) {
    console.error(`Admin recommendation status update failed - ID: ${req.params.recommendationId}`, error);
    next(error);
  }
});

// GET /api/recommendations/debug - Debug endpoint (DEVELOPMENT + ADMIN ONLY - SECURED)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug', authenticateAdmin, async (_req, res, next) => {
    try {
      console.info('Admin debug endpoint accessed - retrieving all recommendations');
      
      const recommendations = await db.getAllRecommendations();
      
      res.json({
        success: true,
        count: recommendations.length,
        recommendations: recommendations.map(rec => ({
          id: rec.id,
          sessionId: rec.sessionId,
          instagramId: rec.instagramId,
          status: rec.status,
          personalColor: rec.personalColorResult.personal_color_en || 'N/A',
          createdAt: rec.createdAt,
          preferences: rec.userPreferences
        }))
      });
    } catch (error) {
      console.error('Admin debug endpoint failed:', error);
      next(error);
    }
  });
}

export const recommendationRouter = router;
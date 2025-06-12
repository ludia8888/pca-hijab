import { Router } from 'express';
import { db } from '../db';
import { validateRecommendationData } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import type { Recommendation } from '../types';

const router = Router();

// POST /api/recommendations - Create a new recommendation request
router.post('/', validateRecommendationData, async (req, res, next) => {
  try {
    const { sessionId, instagramId, personalColorResult, userPreferences } = req.body;
    
    // Verify session exists
    const session = await db.getSession(sessionId);
    if (!session) {
      throw new AppError(400, 'Invalid session ID');
    }
    
    // Create recommendation
    const recommendation = await db.createRecommendation({
      sessionId,
      instagramId,
      personalColorResult,
      userPreferences,
      status: 'pending'
    });
    
    
    res.status(201).json({
      success: true,
      message: 'Recommendation request submitted successfully',
      data: {
        recommendationId: recommendation.id,
        status: recommendation.status
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/recommendations/:recommendationId - Get recommendation status
router.get('/:recommendationId', async (req, res, next) => {
  try {
    const { recommendationId } = req.params;
    
    const recommendation = await db.getRecommendation(recommendationId);
    
    if (!recommendation) {
      throw new AppError(404, 'Recommendation not found');
    }
    
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
    next(error);
  }
});

// GET /api/recommendations - Get all recommendations (admin endpoint)
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    
    const recommendations = status 
      ? await db.getRecommendationsByStatus(status as Recommendation['status'])
      : await db.getAllRecommendations();
    
    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/recommendations/:recommendationId/status - Update recommendation status
router.patch('/:recommendationId/status', async (req, res, next) => {
  try {
    const { recommendationId } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'completed'].includes(status)) {
      throw new AppError(400, 'Invalid status value');
    }
    
    const recommendation = await db.updateRecommendationStatus(recommendationId, status);
    
    if (!recommendation) {
      throw new AppError(404, 'Recommendation not found');
    }
    
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
    next(error);
  }
});

export const recommendationRouter = router;
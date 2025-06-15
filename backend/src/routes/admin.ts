import { Router } from 'express';
import { db } from '../db';
import { authenticateAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import type { Recommendation } from '../types';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// GET /api/admin/recommendations - Get all recommendations with filters
router.get('/recommendations', async (req, res, next) => {
  try {
    const { status, limit = '50', offset = '0' } = req.query;
    
    // Validate pagination parameters
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new AppError(400, 'Invalid limit parameter (1-100)');
    }
    
    if (isNaN(offsetNum) || offsetNum < 0) {
      throw new AppError(400, 'Invalid offset parameter');
    }
    
    let recommendations: Recommendation[];
    
    if (status) {
      recommendations = await db.getRecommendationsByStatus(status as Recommendation['status']);
    } else {
      recommendations = await db.getAllRecommendations();
    }
    
    // Apply pagination
    const paginatedRecommendations = recommendations.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      success: true,
      data: {
        recommendations: paginatedRecommendations,
        total: recommendations.length,
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/recommendations/:id - Get single recommendation details
router.get('/recommendations/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const recommendation = await db.getRecommendation(id);
    
    if (!recommendation) {
      throw new AppError(404, 'Recommendation not found');
    }
    
    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/recommendations/:id/status - Update recommendation status
router.patch('/recommendations/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['pending', 'processing', 'completed'].includes(status)) {
      throw new AppError(400, 'Invalid status');
    }
    
    const updatedRecommendation = await db.updateRecommendationStatus(
      id, 
      status as Recommendation['status']
    );
    
    if (!updatedRecommendation) {
      throw new AppError(404, 'Recommendation not found');
    }
    
    console.info(`Recommendation ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: updatedRecommendation
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/statistics - Get overall statistics
router.get('/statistics', async (_req, res, next) => {
  try {
    const recommendations = await db.getAllRecommendations();
    
    const statistics = {
      total: recommendations.length,
      byStatus: {
        pending: recommendations.filter(r => r.status === 'pending').length,
        processing: recommendations.filter(r => r.status === 'processing').length,
        completed: recommendations.filter(r => r.status === 'completed').length
      },
      byPersonalColor: recommendations.reduce((acc, rec) => {
        // Handle both old and new format
        const color = rec.personalColorResult?.personal_color_en || 
                      rec.personalColorResult?.personal_color || 
                      'unknown';
        acc[color] = (acc[color] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentRequests: recommendations.slice(0, 5).map(rec => ({
        id: rec.id,
        instagramId: rec.instagramId,
        personalColor: rec.personalColorResult?.personal_color_en || 
                       rec.personalColorResult?.personal_color || 
                       'N/A',
        status: rec.status,
        createdAt: rec.createdAt
      }))
    };
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error in /api/admin/statistics:', error);
    next(error);
  }
});

export const adminRouter = router;
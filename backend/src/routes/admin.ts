import { Router } from 'express';
import { db } from '../db';
import { authenticateAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import type { Recommendation } from '../types';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// GET /api/admin/verify - Verify admin API key
router.get('/verify', (_req, res) => {
  // If we reach here, the API key is valid (authenticated by middleware)
  res.json({
    success: true,
    message: 'API key is valid'
  });
});

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

// GET /api/admin/users - Get all users/sessions
router.get('/users', async (_req, res, next) => {
  try {
    if (!db.getAllSessions) {
      throw new AppError(501, 'User management not available with current database');
    }
    
    const sessions = await db.getAllSessions();
    const recommendations = await db.getAllRecommendations();
    
    // Create a map of sessionId to recommendation for easy lookup
    const sessionRecommendationMap = new Map<string, Recommendation>();
    recommendations.forEach(rec => {
      if (rec.sessionId) {
        sessionRecommendationMap.set(rec.sessionId, rec);
      }
    });
    
    // Transform sessions to user-friendly format with recommendation data
    const users = sessions.map(session => {
      const recommendation = sessionRecommendationMap.get(session.id);
      return {
        id: session.id,
        instagramId: session.instagramId,
        personalColor: recommendation?.personalColorResult?.personal_color_en || null,
        personalColorKo: recommendation?.personalColorResult?.personal_color_ko || null,
        uploadedImageUrl: recommendation?.uploadedImageUrl || null,
        requestedAt: session.createdAt,
        completedAt: recommendation?.status === 'completed' ? recommendation.updatedAt : null,
        status: recommendation?.status || 'no_request',
        hasRecommendation: !!recommendation
      };
    });
    
    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:userId - Delete a user/session
router.delete('/users/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!db.deleteSession) {
      throw new AppError(501, 'User deletion not available with current database');
    }
    
    // Get session info before deletion
    const session = await db.getSession(userId);
    if (!session) {
      throw new AppError(404, '사용자를 찾을 수 없습니다');
    }
    
    // Delete the session (this will also delete associated recommendations)
    const deleted = await db.deleteSession(userId);
    
    if (deleted) {
      console.info(`User ${userId} (${session.instagramId}) deleted by admin`);
      res.json({
        success: true,
        message: '사용자가 삭제되었습니다',
        deletedUser: {
          id: userId,
          instagramId: session.instagramId
        }
      });
    } else {
      throw new AppError(500, '사용자 삭제에 실패했습니다');
    }
  } catch (error) {
    next(error);
  }
});

export const adminRouter = router;
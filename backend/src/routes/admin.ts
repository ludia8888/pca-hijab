import { Router } from 'express';
import { db } from '../db';
import { authenticateAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import type { Recommendation, JourneyStatus, Priority } from '../types';

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
        personalColor: session.analysisResult?.personal_color_en || recommendation?.personalColorResult?.personal_color_en || null,
        personalColorKo: session.analysisResult?.personal_color_ko || recommendation?.personalColorResult?.personal_color_ko || null,
        uploadedImageUrl: session.uploadedImageUrl || recommendation?.uploadedImageUrl || null,
        requestedAt: session.createdAt,
        completedAt: session.analysisResult ? (session.updatedAt || session.createdAt) : 
                    (recommendation?.status === 'completed' ? recommendation.updatedAt : null),
        status: recommendation?.status || (session.analysisResult ? 'analysis_only' : 'no_analysis'),
        hasRecommendation: !!recommendation,
        hasAnalysis: !!session.analysisResult
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

// POST /api/admin/users/:userId/status - Update user journey status
router.post('/users/:userId/status', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    
    const validStatuses = [
      'just_started', 'diagnosis_pending', 'diagnosis_done', 'offer_sent',
      'recommendation_requested', 'recommendation_processing', 'recommendation_completed', 'inactive'
    ];
    
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(400, 'Invalid status');
    }
    
    // Get current status for logging
    const session = await db.getSession(userId);
    if (!session) {
      throw new AppError(404, 'User not found');
    }
    
    // Update in database
    const updated = await (db as any).updateJourneyStatus(userId, status);
    if (!updated) {
      throw new AppError(500, 'Failed to update status');
    }
    
    // Log the action
    await (db as any).addAdminAction(
      userId,
      'status_update',
      {
        old_status: session.journeyStatus || 'unknown',
        new_status: status
      }
    );
    
    console.info(`User ${userId} status updated from ${session.journeyStatus} to ${status}`);
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        userId,
        oldStatus: session.journeyStatus,
        newStatus: status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/:userId/priority - Update user priority
router.post('/users/:userId/priority', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { priority } = req.body;
    
    const validPriorities = ['urgent', 'high', 'medium', 'low'];
    
    if (!priority || !validPriorities.includes(priority)) {
      throw new AppError(400, 'Invalid priority');
    }
    
    // Get current priority for logging
    const session = await db.getSession(userId);
    if (!session) {
      throw new AppError(404, 'User not found');
    }
    
    // Update in database
    const updated = await (db as any).updatePriority(userId, priority);
    if (!updated) {
      throw new AppError(500, 'Failed to update priority');
    }
    
    // Log the action
    await (db as any).addAdminAction(
      userId,
      'priority_update',
      {
        old_priority: session.priority || 'medium',
        new_priority: priority
      }
    );
    
    console.info(`User ${userId} priority updated from ${session.priority} to ${priority}`);
    
    res.json({
      success: true,
      message: 'Priority updated successfully',
      data: {
        userId,
        oldPriority: session.priority,
        newPriority: priority,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/users/:userId/message - Toggle message status
router.post('/users/:userId/message', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { messageType, sent } = req.body;
    
    const validMessageTypes = ['diagnosis_reminder', 'reactivation', 'followup'];
    
    if (!messageType || !validMessageTypes.includes(messageType)) {
      throw new AppError(400, 'Invalid message type');
    }
    
    if (typeof sent !== 'boolean') {
      throw new AppError(400, 'Invalid sent status - must be boolean');
    }
    
    // Verify session exists
    const session = await db.getSession(userId);
    if (!session) {
      throw new AppError(404, 'User not found');
    }
    
    // Record message if sent is true
    if (sent) {
      const recorded = await (db as any).recordMessageSent(userId, messageType);
      if (!recorded) {
        throw new AppError(500, 'Failed to record message');
      }
    }
    
    // Log the action
    await (db as any).addAdminAction(
      userId,
      'message_status_update',
      {
        message_type: messageType,
        sent
      }
    );
    
    console.info(`User ${userId} message ${messageType} marked as ${sent ? 'sent' : 'not sent'}`);
    
    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: {
        userId,
        messageType,
        sent,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/dashboard/data - Get unified dashboard data
router.get('/dashboard/data', async (req, res, next) => {
  try {
    // Get unified user view from database
    const users = await (db as any).getUnifiedUserView();
    
    // Transform data to match the frontend unified user view format
    const transformedUsers = await Promise.all(users.map(async (user: any) => {
      // Get admin actions for this user
      const actions = await (db as any).getAdminActions(user.id);
      
      return {
        id: user.id,
        instagramId: user.instagram_id,
        journeyStatus: user.journey_status || 'just_started',
        priority: user.priority || 'medium',
        personalColor: user.analysis_result ? {
          season: user.analysis_result.personal_color_en?.toLowerCase() || 'unknown',
          seasonKo: user.analysis_result.personal_color_ko || '알 수 없음',
          confidence: user.analysis_result.confidence || 0.85,
          analysisDate: user.analysis_result ? user.last_active_at : undefined
        } : undefined,
        recommendation: user.recommendation_id ? {
          id: user.recommendation_id,
          status: user.recommendation_status,
          requestedAt: user.recommendation_requested_at,
          completedAt: user.recommendation_status === 'completed' ? user.recommendation_updated_at : undefined,
          preferences: {
            style: [],
            priceRange: undefined,
            occasions: []
          }
        } : undefined,
        timeline: {
          registeredAt: user.registered_at,
          lastActiveAt: user.last_active_at,
          diagnosisAt: user.analysis_result ? user.last_active_at : undefined,
          recommendationRequestedAt: user.recommendation_requested_at,
          recommendationCompletedAt: user.recommendation_status === 'completed' ? user.recommendation_updated_at : undefined
        },
        actions: actions.map(action => ({
          id: action.id,
          type: action.action_type,
          description: `${action.action_type}: ${JSON.stringify(action.action_details)}`,
          performedAt: action.performed_at,
          performedBy: action.performed_by
        })),
        insights: {
          isNewUser: user.is_new_user,
          isAtRisk: user.journey_status === 'diagnosis_done' && !user.recommendation_id && user.days_since_last_activity > 3,
          hasStalled: user.journey_status === 'recommendation_requested' && user.days_since_last_activity > 7,
          daysSinceLastActivity: parseInt(user.days_since_last_activity) || 0,
          conversionStage: getConversionStage(user, { status: user.recommendation_status })
        }
      };
    }));
    
    res.json({
      success: true,
      data: {
        users: transformedUsers,
        total: transformedUsers.length
      }
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to determine journey status
function getJourneyStatus(session: any, recommendation: any): string {
  if (recommendation) {
    switch (recommendation.status) {
      case 'pending': return 'recommendation_requested';
      case 'processing': return 'recommendation_processing';
      case 'completed': return 'recommendation_completed';
    }
  }
  
  if (session.analysisResult) {
    return 'diagnosis_done';
  }
  
  if (session.uploadedImageUrl) {
    return 'diagnosis_pending';
  }
  
  return 'just_started';
}

// Helper function to determine conversion stage
function getConversionStage(session: any, recommendation: any): string {
  if (recommendation?.status === 'completed') return 'completed';
  if (recommendation) return 'recommendation';
  if (session.analysisResult) return 'diagnosis';
  return 'discovery';
}

export const adminRouter = router;
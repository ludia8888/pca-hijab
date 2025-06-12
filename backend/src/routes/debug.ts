import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Debug endpoint - only available in development
if (process.env.NODE_ENV === 'development') {
  // GET /api/debug/data - Get all data (sessions and recommendations)
  router.get('/data', async (_req, res) => {
    try {
      // For in-memory DB, we'll get recommendations which contain session info
      const recommendations = await db.getAllRecommendations();
      
      // Extract unique sessions from recommendations
      const sessionsMap = new Map();
      recommendations.forEach(rec => {
        if (!sessionsMap.has(rec.sessionId)) {
          sessionsMap.set(rec.sessionId, {
            sessionId: rec.sessionId,
            instagramId: rec.instagramId,
            createdAt: rec.createdAt
          });
        }
      });
      
      // If getAllSessions is available, use it
      const sessions = db.getAllSessions 
        ? await db.getAllSessions()
        : Array.from(sessionsMap.values());
      
      res.json({
        success: true,
        data: {
          sessions: {
            count: sessions.length,
            items: sessions
          },
          recommendations: {
            count: recommendations.length,
            items: recommendations
          }
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // GET /api/debug/recommendations - Get all recommendations
  router.get('/recommendations', async (_req, res) => {
    try {
      const recommendations = await db.getAllRecommendations();
      res.json({
        success: true,
        count: recommendations.length,
        recommendations: recommendations
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // GET /api/debug/stats - Get statistics
  router.get('/stats', async (_req, res) => {
    try {
      const recommendations = await db.getAllRecommendations();
      
      // Calculate statistics
      const stats = {
        total: recommendations.length,
        byStatus: {
          pending: recommendations.filter(r => r.status === 'pending').length,
          processing: recommendations.filter(r => r.status === 'processing').length,
          completed: recommendations.filter(r => r.status === 'completed').length
        },
        byPersonalColor: {} as Record<string, number>,
        recent: recommendations.slice(-5).reverse() // Last 5, most recent first
      };
      
      // Count by personal color
      recommendations.forEach(rec => {
        const color = rec.personalColorResult.personal_color_en || 'unknown';
        stats.byPersonalColor[color] = (stats.byPersonalColor[color] || 0) + 1;
      });
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
}

export const debugRouter = router;
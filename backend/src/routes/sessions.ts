import { Router } from 'express';
import { db } from '../db';
import { validateInstagramId } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// POST /api/sessions - Create a new session
router.post('/', validateInstagramId, async (req, res, next) => {
  try {
    const { instagramId } = req.body;
    
    // Create session
    const session = await db.createSession(instagramId);
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        sessionId: session.id,
        instagramId: session.instagramId
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/sessions/:sessionId - Get session details
router.get('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const session = await db.getSession(sessionId);
    
    if (!session) {
      throw new AppError(404, 'Session not found');
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
});

export const sessionRouter = router;
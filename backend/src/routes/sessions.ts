import { Router } from 'express';
import { db } from '../db';
import { validateInstagramId } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { optionalAuth, authenticateUser } from '../middleware/auth';
import { 
  verifySessionOwnership, 
  verifySessionCreationAuth 
} from '../middleware/authorization';

const router = Router();

// POST /api/sessions - Create a new session
router.post('/', optionalAuth, validateInstagramId, async (req, res, next) => {
  try {
    const { instagramId } = req.body;
    const clientIp = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const userId = req.user?.userId;
    
    console.info(`Session creation attempt - Instagram: @${instagramId}, IP: ${clientIp}, UA: ${userAgent}, User: ${userId || 'anonymous'}`);
    
    // Create session with optional userId
    const session = await db.createSession(instagramId, userId);
    
    console.info(`Session created successfully - ID: ${session.id}, Instagram: @${instagramId}, User: ${userId || 'anonymous'}`);
    
    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: {
        sessionId: session.id,
        instagramId: session.instagramId,
        userId: session.userId
      }
    });
  } catch (error) {
    console.error(`Session creation failed - Instagram: @${req.body.instagramId}, Error:`, error);
    next(error);
  }
});

// GET /api/sessions/:sessionId - Get session details (SECURED)
router.get('/:sessionId', authenticateUser, verifySessionOwnership, async (req, res, next) => {
  try {
    // Session is already verified and attached by middleware
    const session = req.session;
    
    console.info(`Session accessed - ID: ${session.id}, User: ${req.user!.userId}`);
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error(`Session access failed - SessionID: ${req.params.sessionId}, User: ${req.user?.userId}`, error);
    next(error);
  }
});

// PATCH /api/sessions/:sessionId - Update session with analysis result (SECURED)
router.patch('/:sessionId', authenticateUser, verifySessionOwnership, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { uploadedImageUrl, analysisResult } = req.body;
    
    // Session is already verified and attached by middleware
    const session = req.session;
    
    console.info(`Session update attempt - ID: ${sessionId}, User: ${req.user!.userId}`);
    
    // Update session with new data
    const updatedSession = await db.updateSession?.(sessionId, {
      uploadedImageUrl,
      analysisResult
    });
    
    if (!updatedSession) {
      throw new AppError(500, 'Failed to update session');
    }
    
    console.info(`Session ${sessionId} updated with analysis result`);
    
    res.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    next(error);
  }
});

export const sessionRouter = router;
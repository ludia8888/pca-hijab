import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { sessionRouter } from './routes/sessions';
import { recommendationRouter } from './routes/recommendations';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { db } from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database on startup
if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set in production');
  process.exit(1);
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Check database connectivity if using PostgreSQL
    let dbHealthy = true;
    if (process.env.DATABASE_URL && db.testConnection) {
      dbHealthy = await db.testConnection();
    }
    
    res.json({ 
      status: dbHealthy ? 'ok' : 'degraded', 
      service: 'pca-hijab-backend',
      timestamp: new Date().toISOString(),
      database: dbHealthy ? 'connected' : 'disconnected'
    });
  } catch {
    res.status(503).json({
      status: 'error',
      service: 'pca-hijab-backend',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Routes
app.use('/api/sessions', sessionRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/admin', adminRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
  console.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
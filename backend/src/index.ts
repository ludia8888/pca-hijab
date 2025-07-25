import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

// Initialize and validate environment configuration early
import { env, config } from './config/environment';

import { sessionRouter } from './routes/sessions';
import { recommendationRouter } from './routes/recommendations';
import { adminRouter } from './routes/admin';
import { debugRouter } from './routes/debug';
import { authRouter } from './routes/auth';
// import { analyticsRouter } from './routes/analytics';
import { errorHandler } from './middleware/errorHandler';
import { getCSRFToken } from './middleware/csrf';
import { db } from './db';
import { tokenCleanupService } from './services/tokenCleanupService';
// import { initializeGA4Client } from './services/ga4';

const app = express();
const PORT = config.PORT;

// Log secure environment configuration
env.logConfiguration();

// Trust proxy for HTTPS detection behind reverse proxies (Vercel, AWS, etc.)
app.set('trust proxy', true);

// HTTPS enforcement middleware - MUST be before other middleware
app.use((req: Request, res: Response, next) => {
  // Only enforce HTTPS in production
  if (env.isProduction()) {
    // Check if request is not HTTPS
    if (!req.secure && req.get('X-Forwarded-Proto') !== 'https') {
      console.warn(`HTTPS: Redirecting insecure request from ${req.get('host')}${req.url}`);
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
    
    // Also check for insecure headers that proxies might set
    const forwarded = req.get('X-Forwarded-Proto');
    if (forwarded && forwarded.split(',')[0].trim() !== 'https') {
      console.warn(`HTTPS: Redirecting based on X-Forwarded-Proto: ${forwarded}`);
      return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
  }
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
}));
app.use(compression());
app.use(cookieParser());
// Parse CLIENT_URL for multiple origins with environment-specific security
const allowedOrigins = config.CLIENT_URL 
  ? config.CLIENT_URL.split(',').map(url => url.trim())
  : env.isProduction()
    ? [
        // PRODUCTION: Only HTTPS origins allowed
        'https://noorai-ashy.vercel.app', 
        'https://pca-hijab.vercel.app',
        'https://noorai.vercel.app',
        'https://pca-hijab-frontend.vercel.app'
      ]
    : [
        // DEVELOPMENT: Allow localhost for development
        'http://localhost:3000', 
        'http://localhost:5173', 
        'http://localhost:5174',
        'https://noorai-ashy.vercel.app', 
        'https://pca-hijab.vercel.app',
        'https://noorai.vercel.app',
        'https://pca-hijab-frontend.vercel.app'
      ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or postman)
    if (!origin) return callback(null, true);
    
    // In production, be very strict
    if (env.isProduction()) {
      // Only allow HTTPS origins and explicitly whitelisted origins
      if (allowedOrigins.includes(origin) || (origin.includes('vercel.app') && origin.startsWith('https://'))) {
        return callback(null, true);
      }
      console.warn(`CORS: Blocked unauthorized origin in production: ${origin}`);
      callback(new Error('CORS policy violation - origin not allowed'));
    } else {
      // In development, allow localhost and whitelisted origins
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS: Blocked origin in development: ${origin}`);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24 hours
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests for all routes
app.options('*', (req: Request, res: Response) => {
  const origin = req.headers.origin;
  
  // In production, be very strict about origins
  if (env.isProduction()) {
    if (origin && (origin.includes('vercel.app') && origin.includes('https://') || allowedOrigins.includes(origin))) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      // SECURITY: Never use wildcard in production
      console.warn(`CORS: Blocked unauthorized origin in production: ${origin}`);
      return res.status(403).json({ error: 'CORS policy violation' });
    }
  } else {
    // In development, allow localhost but still be cautious
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1') || allowedOrigins.includes(origin))) {
      res.header('Access-Control-Allow-Origin', origin);
    } else {
      console.warn(`CORS: Blocked unknown origin in development: ${origin}`);
      return res.status(403).json({ error: 'CORS policy violation' });
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, Accept, Origin, X-Requested-With, x-csrf-token');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'PCA-HIJAB Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sessions: '/api/sessions',
      recommendations: '/api/recommendations',
      admin: '/api/admin'
    }
  });
});

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

// CSRF token endpoint
app.get('/api/csrf-token', getCSRFToken);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/recommendations', recommendationRouter);
app.use('/api/admin', adminRouter);
// app.use('/api/analytics', analyticsRouter);
app.use('/api/debug', debugRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize GA4 client
// initializeGA4Client().catch(console.error);

// Start server
app.listen(PORT, () => {
  console.info(`🚀 Server is running on port ${PORT}`);
  console.info(`📦 Environment: ${config.NODE_ENV}`);
  
  if (env.isProduction()) {
    console.info('🔒 Production mode: All security validations active');
  } else {
    console.info('🔧 Development mode: Additional debugging enabled');
  }
  
  // Initialize token cleanup service
  console.info('🧹 Token cleanup service initialized');
  const cleanupStatus = tokenCleanupService.getStatus();
  console.info('🧹 Cleanup service status:', {
    schedulerEnabled: cleanupStatus.schedulerEnabled,
    environment: cleanupStatus.environment
  });
});
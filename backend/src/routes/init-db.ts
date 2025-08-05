import { Router } from 'express';
import { Pool } from 'pg';

// Create a direct pool connection for initialization
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const router = Router();

// TEMPORARY ROUTE - REMOVE AFTER INITIALIZATION
router.get('/init-database-emergency', async (req, res) => {
  try {
    // Only allow in development or with secret key
    const secretKey = req.query.key;
    if (process.env.NODE_ENV === 'production' && secretKey !== process.env.ADMIN_API_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        instagram_id VARCHAR(30),
        email_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        reset_password_token VARCHAR(255),
        reset_password_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Sessions table
      `CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(50) PRIMARY KEY,
        instagram_id VARCHAR(30),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        uploaded_image_url TEXT,
        analysis_result JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price INTEGER NOT NULL,
        thumbnail_url TEXT NOT NULL,
        detail_image_urls TEXT[] DEFAULT '{}',
        personal_colors TEXT[] NOT NULL,
        description TEXT,
        shopee_link TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Contents table
      `CREATE TABLE IF NOT EXISTS contents (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        slug VARCHAR(255) UNIQUE NOT NULL,
        thumbnail_url TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        category VARCHAR(50) NOT NULL,
        tags TEXT[] DEFAULT '{}',
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        published_at TIMESTAMP WITH TIME ZONE,
        meta_description TEXT,
        meta_keywords TEXT,
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Recommendations table
      `CREATE TABLE IF NOT EXISTS recommendations (
        id VARCHAR(50) PRIMARY KEY,
        session_id VARCHAR(50) REFERENCES sessions(id) ON DELETE CASCADE,
        instagram_id VARCHAR(30) NOT NULL,
        user_preferences JSONB,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        dm_sent_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Refresh tokens table
      `CREATE TABLE IF NOT EXISTS refresh_tokens (
        id VARCHAR(50) PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) UNIQUE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    const results = [];
    for (const query of queries) {
      try {
        await pool.query(query);
        results.push({ success: true, table: query.match(/CREATE TABLE.*?(\w+)/)?.[1] || 'unknown' });
      } catch (error: any) {
        results.push({ success: false, error: error.message, table: query.match(/CREATE TABLE.*?(\w+)/)?.[1] || 'unknown' });
      }
    }

    res.json({
      message: 'Database initialization attempted',
      results
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export const initDbRouter = router;
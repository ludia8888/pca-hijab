import { Pool } from 'pg';
import type { Session, Recommendation } from '../types';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export class PostgresDatabase {
  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Database connected at:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Initialize database schema
  async initialize(): Promise<void> {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('Database schema initialized');
    } catch (error) {
      console.error('Failed to initialize database schema:', error);
      // In production, schema should be managed by migrations
      if (process.env.NODE_ENV === 'production') {
        console.log('Skipping schema initialization in production');
      }
    }
  }

  // Sessions
  async createSession(instagramId: string): Promise<Session> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const query = `
      INSERT INTO sessions (id, instagram_id)
      VALUES ($1, $2)
      RETURNING id, instagram_id, created_at
    `;
    
    const result = await pool.query(query, [sessionId, instagramId]);
    return {
      id: result.rows[0].id,
      instagramId: result.rows[0].instagram_id,
      createdAt: result.rows[0].created_at,
    };
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const query = `
      SELECT id, instagram_id, created_at
      FROM sessions
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [sessionId]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    return {
      id: result.rows[0].id,
      instagramId: result.rows[0].instagram_id,
      createdAt: result.rows[0].created_at,
    };
  }

  // Recommendations
  async createRecommendation(
    data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Recommendation> {
    const recommendationId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const query = `
      INSERT INTO recommendations 
      (id, session_id, instagram_id, personal_color_result, user_preferences, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      recommendationId,
      data.sessionId,
      data.instagramId,
      JSON.stringify(data.personalColorResult),
      JSON.stringify(data.userPreferences),
      data.status || 'pending',
    ]);
    
    return this.mapRecommendationRow(result.rows[0]);
  }

  async getRecommendation(recommendationId: string): Promise<Recommendation | undefined> {
    const query = `
      SELECT * FROM recommendations
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [recommendationId]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    return this.mapRecommendationRow(result.rows[0]);
  }

  async updateRecommendationStatus(
    recommendationId: string,
    status: Recommendation['status']
  ): Promise<Recommendation | undefined> {
    const query = `
      UPDATE recommendations
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, recommendationId]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    return this.mapRecommendationRow(result.rows[0]);
  }

  async getAllRecommendations(): Promise<Recommendation[]> {
    const query = `
      SELECT * FROM recommendations
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => this.mapRecommendationRow(row));
  }

  async getRecommendationsByStatus(status: Recommendation['status']): Promise<Recommendation[]> {
    const query = `
      SELECT * FROM recommendations
      WHERE status = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [status]);
    return result.rows.map(row => this.mapRecommendationRow(row));
  }

  // Helper method to map database row to Recommendation type
  private mapRecommendationRow(row: any): Recommendation {
    return {
      id: row.id,
      sessionId: row.session_id,
      instagramId: row.instagram_id,
      personalColorResult: row.personal_color_result,
      userPreferences: row.user_preferences,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Close database connection
  async close(): Promise<void> {
    await pool.end();
  }
}

// Export singleton instance
export const db = new PostgresDatabase();
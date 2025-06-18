import { Pool } from 'pg';
import type { Session, Recommendation, PersonalColorResult, UserPreferences } from '../types';

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false }
    : process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export class PostgresDatabase {
  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await pool.query('SELECT NOW()');
      console.info('Database connected at:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  // Initialize database schema
  async initialize(): Promise<void> {
    try {
      // For now, we'll handle schema initialization manually or through migrations
      // This is just a placeholder to avoid require() usage
      console.info('Database schema should be initialized manually or through migrations');
    } catch (error) {
      console.error('Failed to initialize database schema:', error);
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
      SELECT id, instagram_id, uploaded_image_url, analysis_result, created_at, updated_at
      FROM sessions
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [sessionId]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
    let analysisResult: PersonalColorResult | undefined;
    
    if (row.analysis_result) {
      if (typeof row.analysis_result === 'string') {
        analysisResult = JSON.parse(row.analysis_result);
      } else {
        analysisResult = row.analysis_result as PersonalColorResult;
      }
    }
    
    return {
      id: row.id,
      instagramId: row.instagram_id,
      uploadedImageUrl: row.uploaded_image_url,
      analysisResult,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getAllSessions(): Promise<Session[]> {
    const query = `
      SELECT id, instagram_id, uploaded_image_url, analysis_result, created_at, updated_at
      FROM sessions
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    return result.rows.map(row => {
      let analysisResult: PersonalColorResult | undefined;
      
      if (row.analysis_result) {
        if (typeof row.analysis_result === 'string') {
          analysisResult = JSON.parse(row.analysis_result);
        } else {
          analysisResult = row.analysis_result as PersonalColorResult;
        }
      }
      
      return {
        id: row.id,
        instagramId: row.instagram_id,
        uploadedImageUrl: row.uploaded_image_url,
        analysisResult,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  }

  async updateSession(
    sessionId: string, 
    updateData: { uploadedImageUrl?: string; analysisResult?: PersonalColorResult }
  ): Promise<Session | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;
    
    if (updateData.uploadedImageUrl !== undefined) {
      fields.push(`uploaded_image_url = $${paramIndex++}`);
      values.push(updateData.uploadedImageUrl);
    }
    
    if (updateData.analysisResult !== undefined) {
      fields.push(`analysis_result = $${paramIndex++}`);
      values.push(JSON.stringify(updateData.analysisResult));
    }
    
    if (fields.length === 0) {
      // No fields to update, return the existing session
      return this.getSession(sessionId);
    }
    
    fields.push(`updated_at = NOW()`);
    values.push(sessionId);
    
    const query = `
      UPDATE sessions
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, instagram_id, uploaded_image_url, analysis_result, created_at, updated_at
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    const row = result.rows[0];
    let analysisResult: PersonalColorResult | undefined;
    
    if (row.analysis_result) {
      if (typeof row.analysis_result === 'string') {
        analysisResult = JSON.parse(row.analysis_result);
      } else {
        analysisResult = row.analysis_result as PersonalColorResult;
      }
    }
    
    return {
      id: row.id,
      instagramId: row.instagram_id,
      uploadedImageUrl: row.uploaded_image_url,
      analysisResult,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // First, delete all recommendations associated with this session
      const deleteRecommendationsQuery = `
        DELETE FROM recommendations
        WHERE session_id = $1
      `;
      await client.query(deleteRecommendationsQuery, [sessionId]);
      
      // Then, delete the session itself
      const deleteSessionQuery = `
        DELETE FROM sessions
        WHERE id = $1
        RETURNING id
      `;
      const result = await client.query(deleteSessionQuery, [sessionId]);
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Return true if a session was deleted, false otherwise
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error deleting session:', error);
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  }

  // Recommendations
  async createRecommendation(
    data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Recommendation> {
    const recommendationId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const query = `
      INSERT INTO recommendations 
      (id, session_id, instagram_id, personal_color_result, user_preferences, uploaded_image_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      recommendationId,
      data.sessionId,
      data.instagramId,
      JSON.stringify(data.personalColorResult),
      JSON.stringify(data.userPreferences),
      data.uploadedImageUrl || null,
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
  private mapRecommendationRow(row: {
    id: string;
    session_id: string;
    instagram_id: string;
    personal_color_result: unknown;
    user_preferences: unknown;
    uploaded_image_url?: string;
    status: string;
    created_at: Date;
    updated_at: Date;
  }): Recommendation {
    // Parse JSON data if it's returned as a string
    let personalColorResult: PersonalColorResult;
    let userPreferences: UserPreferences;
    
    if (typeof row.personal_color_result === 'string') {
      personalColorResult = JSON.parse(row.personal_color_result);
    } else {
      personalColorResult = row.personal_color_result as PersonalColorResult;
    }
    
    if (typeof row.user_preferences === 'string') {
      userPreferences = JSON.parse(row.user_preferences);
    } else {
      userPreferences = row.user_preferences as UserPreferences;
    }
    
    return {
      id: row.id,
      sessionId: row.session_id,
      instagramId: row.instagram_id,
      personalColorResult,
      userPreferences,
      uploadedImageUrl: row.uploaded_image_url,
      status: row.status as Recommendation['status'],
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
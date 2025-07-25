import { Pool } from 'pg';
import type { Session, Recommendation, PersonalColorResult, UserPreferences, User, RefreshToken } from '../types';

// Secure SSL configuration for database connections
const getSSLConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return false; // No SSL for development without DATABASE_URL
  }
  
  // Production SSL configuration
  if (process.env.NODE_ENV === 'production') {
    // More secure SSL configuration
    if (databaseUrl.includes('render.com') || databaseUrl.includes('railway.app')) {
      // Some cloud providers require specific SSL handling
      return { 
        rejectUnauthorized: false // Only for specific cloud providers
      };
    } else {
      // Default secure SSL configuration
      return {
        rejectUnauthorized: true,
        require: true
      };
    }
  }
  
  // Development - allow non-SSL connections
  return false;
};

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSSLConfig(),
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

  // Generic query method for token cleanup service
  async query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number | null }> {
    try {
      const result = await pool.query(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount
      };
    } catch (error) {
      console.error('Database query failed:', error);
      throw error;
    }
  }

  // Sessions
  async createSession(instagramId: string, userId?: string): Promise<Session> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const query = `
      INSERT INTO sessions (id, instagram_id, user_id, journey_status, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, instagram_id, user_id, journey_status, priority, created_at
    `;
    
    const result = await pool.query(query, [sessionId, instagramId, userId || null, 'just_started', 'medium']);
    return {
      id: result.rows[0].id,
      instagramId: result.rows[0].instagram_id,
      userId: result.rows[0].user_id,
      journeyStatus: result.rows[0].journey_status,
      priority: result.rows[0].priority,
      createdAt: result.rows[0].created_at,
    };
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const query = `
      SELECT id, instagram_id, uploaded_image_url, analysis_result, 
             journey_status, priority, offer_sent_at, notes,
             created_at, updated_at
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

  // Admin Features - Journey Status and Priority Management
  async updateJourneyStatus(sessionId: string, status: string): Promise<boolean> {
    const query = `
      UPDATE sessions 
      SET journey_status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    try {
      const result = await pool.query(query, [status, sessionId]);
      
      // If status is 'offer_sent', update offer_sent_at
      if (status === 'offer_sent' && result.rowCount && result.rowCount > 0) {
        await pool.query(
          'UPDATE sessions SET offer_sent_at = NOW() WHERE id = $1',
          [sessionId]
        );
      }
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Failed to update journey status:', error);
      return false;
    }
  }

  async updatePriority(sessionId: string, priority: string): Promise<boolean> {
    const query = `
      UPDATE sessions 
      SET priority = $1, updated_at = NOW()
      WHERE id = $2
    `;
    
    try {
      const result = await pool.query(query, [priority, sessionId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Failed to update priority:', error);
      return false;
    }
  }

  async recordMessageSent(
    sessionId: string, 
    messageType: string, 
    sentBy: string = 'admin'
  ): Promise<boolean> {
    const query = `
      INSERT INTO message_history (session_id, message_type, sent_by)
      VALUES ($1, $2, $3)
    `;
    
    try {
      await pool.query(query, [sessionId, messageType, sentBy]);
      return true;
    } catch (error) {
      console.error('Failed to record message sent:', error);
      return false;
    }
  }

  async addAdminAction(
    sessionId: string,
    actionType: string,
    actionDetails: any,
    performedBy: string = 'admin'
  ): Promise<boolean> {
    const query = `
      INSERT INTO admin_actions (session_id, action_type, action_details, performed_by)
      VALUES ($1, $2, $3, $4)
    `;
    
    try {
      await pool.query(query, [sessionId, actionType, JSON.stringify(actionDetails), performedBy]);
      return true;
    } catch (error) {
      console.error('Failed to add admin action:', error);
      return false;
    }
  }

  async getAdminActions(sessionId: string): Promise<any[]> {
    const query = `
      SELECT * FROM admin_actions
      WHERE session_id = $1
      ORDER BY performed_at DESC
    `;
    
    try {
      const result = await pool.query(query, [sessionId]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get admin actions:', error);
      return [];
    }
  }

  async getMessageHistory(sessionId: string): Promise<any[]> {
    const query = `
      SELECT * FROM message_history
      WHERE session_id = $1
      ORDER BY sent_at DESC
    `;
    
    try {
      const result = await pool.query(query, [sessionId]);
      return result.rows;
    } catch (error) {
      console.error('Failed to get message history:', error);
      return [];
    }
  }

  // Get unified user view for admin dashboard
  async getUnifiedUserView(): Promise<any[]> {
    const query = `
      SELECT 
        s.id,
        s.instagram_id,
        s.journey_status,
        s.priority,
        s.created_at as registered_at,
        s.updated_at as last_active_at,
        s.analysis_result,
        s.offer_sent_at,
        r.id as recommendation_id,
        r.status as recommendation_status,
        r.created_at as recommendation_requested_at,
        r.updated_at as recommendation_updated_at,
        CASE 
          WHEN s.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days' THEN true
          ELSE false
        END as is_new_user,
        EXTRACT(days FROM (CURRENT_TIMESTAMP - s.updated_at)) as days_since_last_activity
      FROM sessions s
      LEFT JOIN recommendations r ON s.id = r.session_id
      ORDER BY s.updated_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Failed to get unified user view:', error);
      return [];
    }
  }

  // User methods
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, full_name, instagram_id, email_verified, verification_token, verification_token_expires)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.email,
      data.passwordHash,
      data.fullName,
      data.instagramId || null,
      data.emailVerified || false,
      data.verificationToken || null,
      data.verificationTokenExpires || null
    ]);
    
    return this.mapUserRow(result.rows[0]);
  }

  async getUserById(userId: string): Promise<User | undefined> {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    return this.mapUserRow(result.rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    return this.mapUserRow(result.rows[0]);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (updates.email !== undefined) {
      updateFields.push(`email = $${valueIndex++}`);
      values.push(updates.email);
    }
    if (updates.passwordHash !== undefined) {
      updateFields.push(`password_hash = $${valueIndex++}`);
      values.push(updates.passwordHash);
    }
    if (updates.fullName !== undefined) {
      updateFields.push(`full_name = $${valueIndex++}`);
      values.push(updates.fullName);
    }
    if (updates.emailVerified !== undefined) {
      updateFields.push(`email_verified = $${valueIndex++}`);
      values.push(updates.emailVerified);
    }
    if (updates.verificationToken !== undefined) {
      updateFields.push(`verification_token = $${valueIndex++}`);
      values.push(updates.verificationToken);
    }
    if (updates.resetPasswordToken !== undefined) {
      updateFields.push(`reset_password_token = $${valueIndex++}`);
      values.push(updates.resetPasswordToken);
    }
    if (updates.resetPasswordExpires !== undefined) {
      updateFields.push(`reset_password_expires = $${valueIndex++}`);
      values.push(updates.resetPasswordExpires);
    }

    if (updateFields.length === 0) {
      return this.getUserById(userId);
    }

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    return this.mapUserRow(result.rows[0]);
  }

  // Refresh token methods
  async createRefreshToken(data: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.userId,
      data.token,
      data.expiresAt
    ]);
    
    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      token: result.rows[0].token,
      expiresAt: result.rows[0].expires_at,
      createdAt: result.rows[0].created_at
    };
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    const query = `
      SELECT * FROM refresh_tokens 
      WHERE token = $1 AND expires_at > NOW()
    `;
    
    const result = await pool.query(query, [token]);
    
    if (result.rows.length === 0) {
      return undefined;
    }
    
    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      token: result.rows[0].token,
      expiresAt: result.rows[0].expires_at,
      createdAt: result.rows[0].created_at
    };
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
    const query = `DELETE FROM refresh_tokens WHERE token = $1`;
    const result = await pool.query(query, [token]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const query = `DELETE FROM refresh_tokens WHERE user_id = $1`;
    await pool.query(query, [userId]);
  }

  // Get user by verification token (only non-expired tokens)
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    if (!token) {
      return undefined;
    }

    const query = `
      SELECT * FROM users 
      WHERE verification_token = $1 
        AND email_verified = FALSE
        AND (verification_token_expires IS NULL OR verification_token_expires > CURRENT_TIMESTAMP)
    `;
    
    try {
      const result = await pool.query(query, [token]);
      if (result.rows.length === 0) {
        return undefined;
      }
      return this.mapUserRow(result.rows[0]);
    } catch (error) {
      console.error('Failed to get user by verification token:', error);
      return undefined;
    }
  }

  // Get user by password reset token
  async getUserByResetToken(token: string): Promise<User | undefined> {
    if (!token) {
      return undefined;
    }

    const query = `
      SELECT * FROM users 
      WHERE reset_password_token = $1 
      AND reset_password_expires > CURRENT_TIMESTAMP
    `;
    
    try {
      const result = await pool.query(query, [token]);
      if (result.rows.length === 0) {
        return undefined;
      }
      return this.mapUserRow(result.rows[0]);
    } catch (error) {
      console.error('Failed to get user by reset token:', error);
      return undefined;
    }
  }

  // Verify email address
  async verifyUserEmail(userId: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET email_verified = TRUE, verification_token = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Failed to verify user email:', error);
      return false;
    }
  }

  // Reset user password
  async resetUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const query = `
      UPDATE users 
      SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    try {
      const result = await pool.query(query, [newPasswordHash, userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Failed to reset user password:', error);
      return false;
    }
  }

  // Clean up expired reset tokens (for maintenance)
  async cleanupExpiredResetTokens(): Promise<void> {
    const query = `
      UPDATE users 
      SET reset_password_token = NULL, reset_password_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE reset_password_expires < CURRENT_TIMESTAMP
    `;
    
    try {
      const result = await pool.query(query);
      if (result.rowCount && result.rowCount > 0) {
        console.info(`Cleaned up ${result.rowCount} expired reset tokens`);
      }
    } catch (error) {
      console.error('Failed to cleanup expired reset tokens:', error);
    }
  }

  // Helper method to map database row to User type
  private mapUserRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      fullName: row.full_name,
      instagramId: row.instagram_id,
      emailVerified: row.email_verified,
      verificationToken: row.verification_token,
      verificationTokenExpires: row.verification_token_expires,
      resetPasswordToken: row.reset_password_token,
      resetPasswordExpires: row.reset_password_expires,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// Export singleton instance
export const db = new PostgresDatabase();
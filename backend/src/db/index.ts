import { Session, Recommendation, User, RefreshToken } from '../types';
import { db as postgresDb } from './postgres';

// In-memory storage as fallback for development
class InMemoryDatabase {
  private sessions: Map<string, Session> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();

  // Sessions
  async createSession(instagramId: string, userId?: string): Promise<Session> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: Session = {
      id: sessionId,
      instagramId,
      userId,
      createdAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateSession(sessionId: string, updates: Partial<Pick<Session, 'uploadedImageUrl' | 'analysisResult'>>): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        ...updates,
        updatedAt: new Date()
      };
      this.sessions.set(sessionId, updatedSession);
      return updatedSession;
    }
    return undefined;
  }

  // Recommendations
  async createRecommendation(data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recommendation> {
    const recommendationId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const recommendation: Recommendation = {
      ...data,
      id: recommendationId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.recommendations.set(recommendationId, recommendation);
    return recommendation;
  }

  async getRecommendation(recommendationId: string): Promise<Recommendation | undefined> {
    return this.recommendations.get(recommendationId);
  }

  async updateRecommendationStatus(recommendationId: string, status: Recommendation['status']): Promise<Recommendation | undefined> {
    const recommendation = this.recommendations.get(recommendationId);
    if (recommendation) {
      recommendation.status = status;
      recommendation.updatedAt = new Date();
      this.recommendations.set(recommendationId, recommendation);
    }
    return recommendation;
  }

  // Get all recommendations (for admin/manual processing)
  async getAllRecommendations(): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  // Test connection (for health checks)
  async testConnection(): Promise<boolean> {
    return true; // In-memory DB is always available
  }

  async getRecommendationsByStatus(status: Recommendation['status']): Promise<Recommendation[]> {
    const recs = await this.getAllRecommendations();
    return recs.filter(rec => rec.status === status);
  }
  
  // Debug methods (for development only)
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async clearAllData(): Promise<void> {
    this.sessions.clear();
    this.recommendations.clear();
    this.users.clear();
    this.refreshTokens.clear();
  }

  // User methods
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const user: User = {
      ...data,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(userId, user);
    return user;
  }

  async getUserById(userId: string): Promise<User | undefined> {
    return this.users.get(userId);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date()
      };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Refresh token methods
  async createRefreshToken(data: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
    const tokenId = `refresh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const refreshToken: RefreshToken = {
      ...data,
      id: tokenId,
      createdAt: new Date()
    };
    
    this.refreshTokens.set(tokenId, refreshToken);
    return refreshToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return Array.from(this.refreshTokens.values()).find(rt => rt.token === token);
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
    const refreshToken = await this.getRefreshToken(token);
    if (refreshToken) {
      return this.refreshTokens.delete(refreshToken.id);
    }
    return false;
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const userTokens = Array.from(this.refreshTokens.values()).filter(rt => rt.userId === userId);
    userTokens.forEach(rt => this.refreshTokens.delete(rt.id));
  }

  // Delete a specific session
  async deleteSession(sessionId: string): Promise<boolean> {
    const existed = this.sessions.has(sessionId);
    if (existed) {
      this.sessions.delete(sessionId);
      // Also delete associated recommendations
      const recommendations = Array.from(this.recommendations.values());
      for (const rec of recommendations) {
        if (rec.sessionId === sessionId) {
          this.recommendations.delete(rec.id);
        }
      }
      console.info(`Session ${sessionId} and associated data deleted`);
    }
    return existed;
  }
}

// Database interface to ensure consistency
interface Database {
  createSession(instagramId: string, userId?: string): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  updateSession?(sessionId: string, updates: Partial<Pick<Session, 'uploadedImageUrl' | 'analysisResult'>>): Promise<Session | undefined>;
  createRecommendation(data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recommendation>;
  getRecommendation(recommendationId: string): Promise<Recommendation | undefined>;
  updateRecommendationStatus(recommendationId: string, status: Recommendation['status']): Promise<Recommendation | undefined>;
  getAllRecommendations(): Promise<Recommendation[]>;
  getRecommendationsByStatus(status: Recommendation['status']): Promise<Recommendation[]>;
  testConnection?(): Promise<boolean>;
  // User methods
  createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  getUserById(userId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | undefined>;
  // Refresh token methods
  createRefreshToken(data: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<boolean>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
  // Debug methods
  getAllSessions?(): Promise<Session[]>;
  clearAllData?(): Promise<void>;
  deleteSession?(sessionId: string): Promise<boolean>;
}

// Use PostgreSQL if DATABASE_URL is set, otherwise use in-memory
const usePostgres = !!process.env.DATABASE_URL;

// Secure logging - never log actual DATABASE_URL content
if (process.env.NODE_ENV !== 'production') {
  console.log('Database configuration:', {
    hasConnectionString: !!process.env.DATABASE_URL,
    databaseType: usePostgres ? 'PostgreSQL' : 'In-Memory'
  });
} else {
  // In production, only log that database is configured
  console.info(`Database type: ${usePostgres ? 'PostgreSQL' : 'In-Memory'}`);
}

export const db: Database = usePostgres ? postgresDb : new InMemoryDatabase();

// Initialize database on startup
if (usePostgres) {
  void postgresDb.testConnection().then(connected => {
    if (connected) {
      console.info('Using PostgreSQL database');
      // Initialize schema only in development
      if (process.env.NODE_ENV !== 'production') {
        postgresDb.initialize().catch(console.error);
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        console.error('FATAL: PostgreSQL connection failed in production');
        process.exit(1);
      }
      console.warn('PostgreSQL connection failed, falling back to in-memory database');
    }
  });
} else {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: DATABASE_URL is required in production');
    process.exit(1);
  }
  console.warn('⚠️  Using in-memory database (DATA WILL BE LOST ON RESTART)');
  console.info('Set DATABASE_URL environment variable to use PostgreSQL');
}
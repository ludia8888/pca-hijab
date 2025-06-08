import { Session, Recommendation } from '../types';
import { db as postgresDb, PostgresDatabase } from './postgres';

// In-memory storage as fallback for development
class InMemoryDatabase {
  private sessions: Map<string, Session> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();

  // Sessions
  async createSession(instagramId: string): Promise<Session> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: Session = {
      id: sessionId,
      instagramId,
      createdAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
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

  async getRecommendationsByStatus(status: Recommendation['status']): Promise<Recommendation[]> {
    const recs = await this.getAllRecommendations();
    return recs.filter(rec => rec.status === status);
  }
}

// Use PostgreSQL if DATABASE_URL is set, otherwise use in-memory
const usePostgres = !!process.env.DATABASE_URL;

export const db = usePostgres ? postgresDb : new InMemoryDatabase();

// Initialize database on startup
if (usePostgres) {
  postgresDb.testConnection().then(connected => {
    if (connected) {
      console.log('Using PostgreSQL database');
      // Initialize schema only in development
      if (process.env.NODE_ENV !== 'production') {
        postgresDb.initialize().catch(console.error);
      }
    } else {
      console.warn('PostgreSQL connection failed, falling back to in-memory database');
    }
  });
} else {
  console.log('Using in-memory database (DATABASE_URL not set)');
}
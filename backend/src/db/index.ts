import { Session, Recommendation } from '../types';

// In-memory storage for MVP
// TODO: Replace with PostgreSQL in production
class InMemoryDatabase {
  private sessions: Map<string, Session> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();

  // Sessions
  createSession(instagramId: string): Session {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: Session = {
      id: sessionId,
      instagramId,
      createdAt: new Date()
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  // Recommendations
  createRecommendation(data: Omit<Recommendation, 'id' | 'createdAt' | 'updatedAt'>): Recommendation {
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

  getRecommendation(recommendationId: string): Recommendation | undefined {
    return this.recommendations.get(recommendationId);
  }

  updateRecommendationStatus(recommendationId: string, status: Recommendation['status']): Recommendation | undefined {
    const recommendation = this.recommendations.get(recommendationId);
    if (recommendation) {
      recommendation.status = status;
      recommendation.updatedAt = new Date();
      this.recommendations.set(recommendationId, recommendation);
    }
    return recommendation;
  }

  // Get all recommendations (for admin/manual processing)
  getAllRecommendations(): Recommendation[] {
    return Array.from(this.recommendations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getRecommendationsByStatus(status: Recommendation['status']): Recommendation[] {
    return this.getAllRecommendations().filter(rec => rec.status === status);
  }
}

export const db = new InMemoryDatabase();
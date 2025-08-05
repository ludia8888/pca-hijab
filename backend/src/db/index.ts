import { Session, Recommendation, User, RefreshToken, Product, ProductCategory, PersonalColorType, Content, ContentCategory, ContentStatus } from '../types';
import { db as postgresDb } from './postgres';

// In-memory storage as fallback for development
class InMemoryDatabase {
  private sessions: Map<string, Session> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private users: Map<string, User> = new Map();
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private products: Map<string, Product> = new Map();
  private contents: Map<string, Content> = new Map();

  // Sessions
  async createSession(instagramId: string | null, userId?: string): Promise<Session> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: Session = {
      id: sessionId,
      instagramId: instagramId || undefined,
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
  
  // Products
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const product: Product = {
      ...data,
      id: productId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.products.set(productId, product);
    return product;
  }

  async getProduct(productId: string): Promise<Product | undefined> {
    return this.products.get(productId);
  }

  async updateProduct(productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | undefined> {
    const product = this.products.get(productId);
    if (product) {
      const updatedProduct = {
        ...product,
        ...updates,
        updatedAt: new Date()
      };
      this.products.set(productId, updatedProduct);
      return updatedProduct;
    }
    return undefined;
  }

  async deleteProduct(productId: string): Promise<boolean> {
    return this.products.delete(productId);
  }

  async deleteAllProducts(): Promise<void> {
    this.products.clear();
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProductsByCategory(category: ProductCategory): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProductsByPersonalColor(personalColor: PersonalColorType): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.personalColors.includes(personalColor))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getProductsByCategoryAndPersonalColor(category: ProductCategory, personalColor: PersonalColorType): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => 
        product.category === category && 
        product.personalColors.includes(personalColor)
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async clearAllData(): Promise<void> {
    this.sessions.clear();
    this.recommendations.clear();
    this.users.clear();
    this.refreshTokens.clear();
    this.products.clear();
    this.contents.clear();
  }

  // Content methods
  async createContent(data: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<Content> {
    const contentId = `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const content: Content = {
      ...data,
      id: contentId,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: data.status === 'published' ? new Date() : undefined
    };
    
    this.contents.set(contentId, content);
    return content;
  }

  async getContent(contentId: string): Promise<Content | undefined> {
    const content = this.contents.get(contentId);
    if (content) {
      // Increment view count
      content.viewCount++;
      content.updatedAt = new Date();
      this.contents.set(contentId, content);
    }
    return content;
  }

  async getContentBySlug(slug: string): Promise<Content | undefined> {
    const content = Array.from(this.contents.values()).find(c => c.slug === slug);
    if (content) {
      // Increment view count
      content.viewCount++;
      content.updatedAt = new Date();
      this.contents.set(content.id, content);
    }
    return content;
  }

  async updateContent(contentId: string, updates: Partial<Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>>): Promise<Content | undefined> {
    const content = this.contents.get(contentId);
    if (content) {
      const updatedContent = {
        ...content,
        ...updates,
        updatedAt: new Date(),
        publishedAt: updates.status === 'published' && !content.publishedAt ? new Date() : content.publishedAt
      };
      this.contents.set(contentId, updatedContent);
      return updatedContent;
    }
    return undefined;
  }

  async deleteContent(contentId: string): Promise<boolean> {
    return this.contents.delete(contentId);
  }

  async getAllContents(filters?: { category?: ContentCategory; status?: ContentStatus }): Promise<Content[]> {
    let contents = Array.from(this.contents.values());
    
    if (filters?.category) {
      contents = contents.filter(content => content.category === filters.category);
    }
    
    if (filters?.status) {
      contents = contents.filter(content => content.status === filters.status);
    }
    
    return contents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateContentStatus(contentId: string, status: ContentStatus): Promise<Content | undefined> {
    const content = this.contents.get(contentId);
    if (content) {
      content.status = status;
      content.updatedAt = new Date();
      if (status === 'published' && !content.publishedAt) {
        content.publishedAt = new Date();
      }
      this.contents.set(contentId, content);
      return content;
    }
    return undefined;
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

  // Email verification methods
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    if (!token) return undefined;
    return Array.from(this.users.values()).find(user => 
      user.verificationToken === token && !user.emailVerified
    );
  }

  async verifyUserEmail(userId: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (user) {
      user.emailVerified = true;
      user.verificationToken = undefined;
      user.updatedAt = new Date();
      this.users.set(userId, user);
      return true;
    }
    return false;
  }

  // Password reset methods
  async getUserByResetToken(token: string): Promise<User | undefined> {
    if (!token) return undefined;
    const now = new Date();
    return Array.from(this.users.values()).find(user => 
      user.resetPasswordToken === token && 
      user.resetPasswordExpires && 
      user.resetPasswordExpires > now
    );
  }

  async resetUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (user) {
      user.passwordHash = newPasswordHash;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.updatedAt = new Date();
      this.users.set(userId, user);
      return true;
    }
    return false;
  }

  async cleanupExpiredResetTokens(): Promise<void> {
    const now = new Date();
    let cleaned = 0;
    for (const [userId, user] of this.users.entries()) {
      if (user.resetPasswordExpires && user.resetPasswordExpires < now) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.updatedAt = new Date();
        this.users.set(userId, user);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.info(`Cleaned up ${cleaned} expired reset tokens`);
    }
  }
}

// Database interface to ensure consistency
interface Database {
  createSession(instagramId: string | null, userId?: string): Promise<Session>;
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
  // Email verification methods
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  verifyUserEmail(userId: string): Promise<boolean>;
  // Password reset methods
  getUserByResetToken(token: string): Promise<User | undefined>;
  resetUserPassword(userId: string, newPasswordHash: string): Promise<boolean>;
  cleanupExpiredResetTokens?(): Promise<void>;
  // Refresh token methods
  createRefreshToken(data: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<boolean>;
  deleteUserRefreshTokens(userId: string): Promise<void>;
  // Debug methods
  getAllSessions?(): Promise<Session[]>;
  // Product methods
  createProduct?(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  getProduct?(productId: string): Promise<Product | undefined>;
  updateProduct?(productId: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product | undefined>;
  deleteProduct?(productId: string): Promise<boolean>;
  deleteAllProducts?(): Promise<void>;
  getAllProducts?(): Promise<Product[]>;
  getProductsByCategory?(category: ProductCategory): Promise<Product[]>;
  getProductsByPersonalColor?(personalColor: PersonalColorType): Promise<Product[]>;
  getProductsByCategoryAndPersonalColor?(category: ProductCategory, personalColor: PersonalColorType): Promise<Product[]>;
  clearAllData?(): Promise<void>;
  deleteSession?(sessionId: string): Promise<boolean>;
  // Content methods
  createContent?(data: Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<Content>;
  getContent?(contentId: string): Promise<Content | undefined>;
  getContentBySlug?(slug: string): Promise<Content | undefined>;
  updateContent?(contentId: string, updates: Partial<Omit<Content, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>>): Promise<Content | undefined>;
  deleteContent?(contentId: string): Promise<boolean>;
  getAllContents?(filters?: { category?: ContentCategory; status?: ContentStatus }): Promise<Content[]>;
  updateContentStatus?(contentId: string, status: ContentStatus): Promise<Content | undefined>;
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
import { Session, Recommendation, User, RefreshToken, Product, ProductCategory, PersonalColorType, Content, ContentCategory, ContentStatus } from '../types';
import { stubDb } from './stub';

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

// Force use of stub database to avoid any database connections
console.info('🔌 Database mode: STUB (no database connection required)');
console.info('✅ All user authentication is stubbed');
console.info('🔑 Admin access via API key only');

export const db: Database = stubDb;
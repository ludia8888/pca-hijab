import type {
  AuthenticatedRequestUser,
  AdminContext,
  Recommendation,
  RateLimitInfo,
  Session
} from './index';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
      adminUser?: AdminContext;
      session?: Session;
      recommendation?: Recommendation;
      rateLimit?: RateLimitInfo;
    }
  }
}

export {};

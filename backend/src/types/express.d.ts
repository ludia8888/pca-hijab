import type {
  AuthenticatedRequestUser,
  Recommendation,
  RateLimitInfo,
  Session
} from './index';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedRequestUser;
      session?: Session;
      recommendation?: Recommendation;
      rateLimit?: RateLimitInfo;
    }
  }
}

export {};

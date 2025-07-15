export * from './client';
export * from './personalColor';
export * from './recommendation';
export * from './session';
export * from './auth';

// Convenience exports for easier use
import { PersonalColorAPI } from './personalColor';
import { RecommendationAPI } from './recommendation';
import { SessionAPI, type SessionUpdateData } from './session';
import { AuthAPI } from './auth';
export { PersonalColorAPI, RecommendationAPI, SessionAPI, AuthAPI };
export type { SessionUpdateData };

// Convenience functions
export const analyzeImage = (file: File, debug = false) => PersonalColorAPI.analyzeImage(file, debug);
export const updateSession = (sessionId: string, updateData: SessionUpdateData) => SessionAPI.updateSession(sessionId, updateData);
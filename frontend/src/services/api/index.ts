export * from './client';
export * from './personalColor';

// Convenience exports for easier use
import { PersonalColorAPI } from './personalColor';
export { PersonalColorAPI };
export const analyzeImage = (file: File, debug = false) => PersonalColorAPI.analyzeImage(file, debug);
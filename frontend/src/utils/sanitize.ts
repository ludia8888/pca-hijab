import DOMPurify from 'dompurify';

// Configure DOMPurify for safe sanitization
const config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  SANITIZE_DOM: true
};

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitize plain text input (remove all HTML tags)
 */
export const sanitizeText = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], KEEP_CONTENT: true });
};

/**
 * Sanitize user input for display
 * More restrictive than sanitizeHtml
 */
export const sanitizeUserInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    SANITIZE_DOM: true
  });
};

/**
 * Escape HTML entities
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
  const sanitized = sanitizeText(email).toLowerCase().trim();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitize name fields
 */
export const sanitizeName = (name: string): string => {
  return sanitizeText(name)
    .replace(/[^\p{L}\p{N}\s.-]/gu, '') // Allow letters, numbers, spaces, dots, hyphens
    .trim()
    .slice(0, 100); // Limit length
};

/**
 * Sanitize search queries
 */
export const sanitizeSearchQuery = (query: string): string => {
  return sanitizeText(query)
    .replace(/[<>'"]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 200); // Limit length
};
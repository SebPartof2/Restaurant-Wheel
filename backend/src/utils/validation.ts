// Input validation utilities

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
  return password.length >= minLength;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate restaurant state
 */
export function isValidRestaurantState(state: string): boolean {
  return ['pending', 'active', 'upcoming', 'visited'].includes(state);
}

/**
 * Validate rating value
 */
export function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 10;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim();
}

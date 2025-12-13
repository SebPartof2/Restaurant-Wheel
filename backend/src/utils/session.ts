// Session management utilities

/**
 * Generate a secure random session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Generate a random 5-character alphanumeric signup code
 */
export function generateSignupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const array = new Uint8Array(5);
  crypto.getRandomValues(array);
  for (let i = 0; i < 5; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

/**
 * Calculate session expiration date
 */
export function getSessionExpiry(days: number = 30): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Format date for SQLite
 */
export function toSQLiteDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Parse session cookie from request
 */
export function getSessionFromCookie(cookieHeader: string | null, cookieName: string): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith(`${cookieName}=`));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1];
}

/**
 * Create session cookie string
 */
export function createSessionCookie(sessionId: string, cookieName: string, expiryDate: Date): string {
  const expires = expiryDate.toUTCString();
  return `${cookieName}=${sessionId}; HttpOnly; Secure; SameSite=None; Path=/; Expires=${expires}`;
}

/**
 * Create cookie to delete session
 */
export function deleteSessionCookie(cookieName: string): string {
  return `${cookieName}=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0`;
}

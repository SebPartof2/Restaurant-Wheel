// CORS middleware

import type { Context, Next } from 'hono';
import type { Env } from '../types';

/**
 * CORS middleware
 */
export async function corsMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const origin = c.req.header('Origin');
  const allowedOrigin = c.env.FRONTEND_URL;

  // Set CORS headers
  if (origin === allowedOrigin || c.env.ENVIRONMENT === 'development') {
    c.header('Access-Control-Allow-Origin', origin || allowedOrigin);
    c.header('Access-Control-Allow-Credentials', 'true');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}

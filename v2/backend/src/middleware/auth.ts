// Authentication middleware

import type { Context, Next } from 'hono';
import type { Env, RequestContext } from '../types';
import { AuthService } from '../services/auth-service';
import { createDbService } from '../services/db';
import { getSessionFromCookie } from '../utils/session';
import { config } from '../config';

/**
 * Middleware to check if user is authenticated
 * Adds user to context if valid session exists
 */
export async function authMiddleware(c: Context<{ Bindings: Env; Variables: RequestContext }>, next: Next) {
  const cookieHeader = c.req.header('Cookie');
  const sessionId = getSessionFromCookie(cookieHeader, config.session.cookieName);

  if (sessionId) {
    const db = createDbService(c.env);
    const authService = new AuthService(db);
    const user = await authService.validateSession(sessionId);

    if (user) {
      c.set('user', user);
      c.set('session_id', sessionId);
    }
  }

  await next();
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export async function requireAuth(c: Context<{ Bindings: Env; Variables: RequestContext }>, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
}

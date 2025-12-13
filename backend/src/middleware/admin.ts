// Admin authorization middleware

import type { Context, Next } from 'hono';
import type { Env, RequestContext } from '../types';

/**
 * Middleware to require admin privileges
 * Must be used after requireAuth middleware
 */
export async function requireAdmin(c: Context<{ Bindings: Env; Variables: RequestContext }>, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  if (!user.is_admin) {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }

  await next();
}

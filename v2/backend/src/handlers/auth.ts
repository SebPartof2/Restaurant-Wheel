// Authentication handlers

import type { Context } from 'hono';
import type { Env, RequestContext } from '../types';
import type { SignupRequest, LoginRequest, VerifyCodeRequest, User } from '../../../shared/types';
import { AuthService } from '../services/auth-service';
import { createDbService } from '../services/db';
import { createSessionCookie, deleteSessionCookie } from '../utils/session';
import { config } from '../config';
import { sanitizeString } from '../utils/validation';

/**
 * POST /api/auth/verify-code
 * Verify a signup code and return the associated email
 */
export async function handleVerifyCode(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const body = await c.req.json<VerifyCodeRequest>();
    const signupCode = sanitizeString(body.signup_code).toUpperCase();

    if (!signupCode) {
      return c.json({ error: 'Signup code is required' }, 400);
    }

    const db = createDbService(c.env);

    // Find user with this signup code
    const user = await db.queryOne<User>(
      'SELECT id, email, name, is_provisional FROM users WHERE signup_code = ?',
      [signupCode]
    );

    if (!user || !user.is_provisional) {
      return c.json({ error: 'Invalid signup code' }, 400);
    }

    return c.json({ email: user.email, name: user.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify code';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/auth/signup
 */
export async function handleSignup(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const body = await c.req.json<SignupRequest>();
    const { signup_code, email, password, name } = body;

    if (!signup_code || !email || !password) {
      return c.json({ error: 'Signup code, email, and password are required' }, 400);
    }

    const db = createDbService(c.env);
    const authService = new AuthService(db);

    const result = await authService.signup(signup_code, email, password, name);

    // Set session cookie
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + config.session.expiryDays);
    const cookie = createSessionCookie(result.session_id, config.session.cookieName, expiryDate);

    return c.json(
      { user: result.user },
      201,
      { 'Set-Cookie': cookie }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/auth/login
 */
export async function handleLogin(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const body = await c.req.json<LoginRequest>();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const db = createDbService(c.env);
    const authService = new AuthService(db);

    const result = await authService.login(email, password);

    // Set session cookie
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + config.session.expiryDays);
    const cookie = createSessionCookie(result.session_id, config.session.cookieName, expiryDate);

    return c.json(
      { user: result.user },
      200,
      { 'Set-Cookie': cookie }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return c.json({ error: message }, 401);
  }
}

/**
 * POST /api/auth/logout
 */
export async function handleLogout(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  const sessionId = c.get('session_id');

  if (sessionId) {
    const db = createDbService(c.env);
    const authService = new AuthService(db);
    await authService.logout(sessionId);
  }

  // Delete session cookie
  const cookie = deleteSessionCookie(config.session.cookieName);

  return c.json(
    { message: 'Logged out successfully' },
    200,
    { 'Set-Cookie': cookie }
  );
}

/**
 * GET /api/auth/me
 */
export async function handleGetMe(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  const user = c.get('user');

  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  return c.json({ user });
}

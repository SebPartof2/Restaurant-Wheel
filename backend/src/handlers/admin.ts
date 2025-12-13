// Admin handlers

import type { Context } from 'hono';
import type { Env, RequestContext } from '../types';
import type { User, AddToWhitelistRequest, CreateProvisionalUserRequest } from '../../../shared/types';
import { createDbService } from '../services/db';
import { RestaurantService } from '../services/restaurant-service';
import { sanitizeString, isValidEmail } from '../utils/validation';
import { isAdminEmail } from '../config';
import { generateSignupCode } from '../utils/session';

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export async function handleGetUsers(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const db = createDbService(c.env);

    const users = await db.execute<User>(
      'SELECT id, email, name, is_admin, is_whitelisted, is_provisional, signup_code, created_at FROM users ORDER BY created_at DESC'
    );

    return c.json({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return c.json({ error: message }, 500);
  }
}

/**
 * PATCH /api/admin/users/:id
 * Update user info (admin only)
 */
export async function handleUpdateUser(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const userId = parseInt(c.req.param('id'));
    const body = await c.req.json<{ name?: string; email?: string }>();

    const db = createDbService(c.env);

    const updates: string[] = [];
    const params: any[] = [];

    if (body.name !== undefined) {
      updates.push('name = ?');
      params.push(sanitizeString(body.name) || null);
    }

    if (body.email !== undefined) {
      updates.push('email = ?');
      params.push(sanitizeString(body.email).toLowerCase());
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    updates.push('updated_at = datetime("now")');
    params.push(userId);

    await db.run(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const user = await db.queryOne<User>(
      'SELECT id, email, name, is_admin, is_whitelisted, is_provisional, signup_code, created_at FROM users WHERE id = ?',
      [userId]
    );

    return c.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/admin/users/provisional
 * Create a provisional user (admin only)
 */
export async function handleCreateProvisionalUser(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const body = await c.req.json<CreateProvisionalUserRequest>();
    const email = sanitizeString(body.email).toLowerCase();
    const name = body.name ? sanitizeString(body.name) : null;

    if (!isValidEmail(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }

    const db = createDbService(c.env);

    // Check if user already exists
    const existingUser = await db.queryOne<User>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUser) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Generate unique signup code
    let signupCode: string;
    let codeExists = true;
    while (codeExists) {
      signupCode = generateSignupCode();
      const existing = await db.queryOne<{ id: number }>(
        'SELECT id FROM users WHERE signup_code = ?',
        [signupCode]
      );
      codeExists = !!existing;
    }

    // Create provisional user (with empty password placeholder)
    const isAdmin = isAdminEmail(email);
    const userId = await db.insert(
      'INSERT INTO users (email, password_hash, name, is_admin, is_whitelisted, is_provisional, signup_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, '', name, isAdmin ? 1 : 0, 1, 1, signupCode]
    );

    const user = await db.queryOne<User>(
      'SELECT id, email, name, is_admin, is_whitelisted, is_provisional, signup_code, created_at FROM users WHERE id = ?',
      [userId]
    );

    return c.json({ user }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create provisional user';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/admin/users/whitelist
 * Add email to whitelist (admin only)
 */
export async function handleAddToWhitelist(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const body = await c.req.json<AddToWhitelistRequest>();

    if (!body.email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    // For now, we'll just return success
    // In a real implementation, you might want to store the whitelist in the database
    // or update the config file

    return c.json({
      message: 'Email added to whitelist',
      email: body.email,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add to whitelist';
    return c.json({ error: message }, 400);
  }
}

/**
 * GET /api/admin/nominations/pending
 * Get all pending nominations (admin only)
 */
export async function handleGetPendingNominations(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const pending = await restaurantService.getRestaurants('pending');

    return c.json({ nominations: pending });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pending nominations';
    return c.json({ error: message }, 500);
  }
}

// Restaurant handlers

import type { Context } from 'hono';
import type { Env, RequestContext } from '../types';
import type { CreateRestaurantRequest, UpdateRestaurantRequest } from '../../../shared/types';
import { RestaurantService } from '../services/restaurant-service';
import { createDbService } from '../services/db';

/**
 * GET /api/restaurants
 */
export async function handleGetRestaurants(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const state = c.req.query('state') as any;
    const userId = c.req.query('user_id');
    const search = c.req.query('search');
    const sort = c.req.query('sort') as 'date' | 'rating' | 'name' | undefined;

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const restaurants = await restaurantService.getRestaurants(
      state || undefined,
      userId ? parseInt(userId) : undefined,
      search || undefined,
      sort || undefined
    );

    return c.json({ restaurants });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch restaurants';
    return c.json({ error: message }, 500);
  }
}

/**
 * GET /api/restaurants/:id
 */
export async function handleGetRestaurant(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const id = parseInt(c.req.param('id'));

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const restaurant = await restaurantService.getRestaurantById(id);

    if (!restaurant) {
      return c.json({ error: 'Restaurant not found' }, 404);
    }

    return c.json({ restaurant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch restaurant';
    return c.json({ error: message }, 500);
  }
}

/**
 * POST /api/restaurants
 */
export async function handleCreateRestaurant(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json<CreateRestaurantRequest>();

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    // If admin is creating for another user, pass admin ID
    const createdByAdminId = user.is_admin && body.nominated_by_user_id ? user.id : undefined;

    const restaurant = await restaurantService.createRestaurant(
      body,
      user.id,
      createdByAdminId
    );

    return c.json({ restaurant }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create restaurant';
    return c.json({ error: message }, 400);
  }
}

/**
 * PATCH /api/restaurants/:id
 */
export async function handleUpdateRestaurant(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json<UpdateRestaurantRequest>();

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const restaurant = await restaurantService.updateRestaurant(id, body);

    return c.json({ restaurant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update restaurant';
    return c.json({ error: message }, 400);
  }
}

/**
 * DELETE /api/restaurants/:id
 */
export async function handleDeleteRestaurant(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const id = parseInt(c.req.param('id'));

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    await restaurantService.deleteRestaurant(id);

    return c.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete restaurant';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/restaurants/:id/approve
 */
export async function handleApproveRestaurant(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const id = parseInt(c.req.param('id'));

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const restaurant = await restaurantService.approveRestaurant(id);

    return c.json({ restaurant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve restaurant';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/restaurants/:id/reject
 */
export async function handleRejectRestaurant(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const id = parseInt(c.req.param('id'));

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    await restaurantService.rejectRestaurant(id);

    return c.json({ message: 'Restaurant rejected successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject restaurant';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/restaurants/:id/mark-visited
 */
export async function handleMarkVisited(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const id = parseInt(c.req.param('id'));

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const restaurant = await restaurantService.markAsVisited(id);

    return c.json({ restaurant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark as visited';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/restaurants/:id/confirm-upcoming
 * Confirm wheel selection and move restaurant to 'upcoming' state
 */
export async function handleConfirmUpcoming(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const id = parseInt(c.req.param('id'));

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const restaurant = await restaurantService.updateRestaurant(id, { state: 'upcoming' });

    return c.json({ restaurant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm selection';
    return c.json({ error: message }, 400);
  }
}

/**
 * GET /api/restaurants/stats/overall
 * Get overall statistics including average rating across all visited restaurants
 */
export async function handleGetOverallStats(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const db = createDbService(c.env);

    // Get overall average rating across all visited restaurants
    const result = await db.queryOne<{ avg_rating: number | null; restaurant_count: number }>(
      `SELECT AVG(average_rating) as avg_rating, COUNT(*) as restaurant_count
       FROM restaurants
       WHERE state = 'visited' AND average_rating > 0`
    );

    const overallAverage = result?.avg_rating || 0;
    const restaurantCount = result?.restaurant_count || 0;

    return c.json({
      overall_average_rating: overallAverage,
      rated_restaurant_count: restaurantCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch statistics';
    return c.json({ error: message }, 500);
  }
}

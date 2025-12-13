// Wheel handlers

import type { Context } from 'hono';
import type { Env, RequestContext } from '../types';
import type { SpinWheelRequest } from '../../../shared/types';
import { RestaurantService } from '../services/restaurant-service';
import { createDbService } from '../services/db';

/**
 * GET /api/wheel/active
 * Get all active restaurants for the wheel
 */
export async function handleGetActiveRestaurants(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const excludeFastFood = c.req.query('exclude_fast_food') === 'true';

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    const restaurants = await restaurantService.getActiveRestaurants(excludeFastFood);

    return c.json({ restaurants });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch active restaurants';
    return c.json({ error: message }, 500);
  }
}

/**
 * POST /api/wheel/spin
 * Spin the wheel and select a restaurant (admin only)
 */
export async function handleSpinWheel(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const body = await c.req.json<SpinWheelRequest>();
    const excludeFastFood = body.exclude_fast_food || false;

    const db = createDbService(c.env);
    const restaurantService = new RestaurantService(db);

    // Get active restaurants
    const activeRestaurants = await restaurantService.getActiveRestaurants(excludeFastFood);

    if (activeRestaurants.length === 0) {
      return c.json({ error: 'No active restaurants available for spinning' }, 400);
    }

    // Randomly select one restaurant
    const randomIndex = Math.floor(Math.random() * activeRestaurants.length);
    const selectedRestaurant = activeRestaurants[randomIndex];

    // Return the selected restaurant WITHOUT changing state
    // Admin will manually confirm to move to 'upcoming'
    return c.json({ restaurant: selectedRestaurant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to spin wheel';
    return c.json({ error: message }, 500);
  }
}

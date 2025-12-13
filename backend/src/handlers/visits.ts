// Visits/Ratings handlers

import type { Context } from 'hono';
import type { Env, RequestContext } from '../types';
import type { MarkAttendanceRequest, SubmitRatingRequest } from '../../../shared/types';
import { RatingService } from '../services/rating-service';
import { createDbService } from '../services/db';

/**
 * GET /api/visits/:restaurantId
 * Get all visits/ratings for a restaurant
 */
export async function handleGetVisits(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const restaurantId = parseInt(c.req.param('restaurantId'));

    const db = createDbService(c.env);
    const ratingService = new RatingService(db);

    const visits = await ratingService.getVisitsForRestaurant(restaurantId);

    return c.json({ visits });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch visits';
    return c.json({ error: message }, 500);
  }
}

/**
 * POST /api/visits/:restaurantId/attendance
 * Mark which users attended (admin only)
 */
export async function handleMarkAttendance(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const restaurantId = parseInt(c.req.param('restaurantId'));
    const body = await c.req.json<MarkAttendanceRequest>();

    if (!body.user_ids || body.user_ids.length === 0) {
      return c.json({ error: 'At least one user ID is required' }, 400);
    }

    const db = createDbService(c.env);
    const ratingService = new RatingService(db);

    await ratingService.markAttendance(restaurantId, body.user_ids);

    return c.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark attendance';
    return c.json({ error: message }, 400);
  }
}

/**
 * POST /api/visits/:restaurantId/rate
 * Submit or update a rating
 */
export async function handleSubmitRating(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const restaurantId = parseInt(c.req.param('restaurantId'));
    const body = await c.req.json<SubmitRatingRequest>();

    console.log('Received rating submission:', { user_id: body.user_id, rating: body.rating, type: typeof body.rating });

    if (!body.user_id || typeof body.rating !== 'number' || isNaN(body.rating)) {
      return c.json({ error: 'user_id and valid rating are required' }, 400);
    }

    // Allow any numeric rating (no upper limit, but must be positive)
    if (body.rating <= 0) {
      console.log('Rating must be positive:', body.rating);
      return c.json({ error: 'Rating must be a positive number' }, 400);
    }

    const db = createDbService(c.env);
    const ratingService = new RatingService(db);

    const visit = await ratingService.submitRating(restaurantId, body.user_id, body.rating);

    return c.json({ visit });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit rating';
    return c.json({ error: message }, 400);
  }
}

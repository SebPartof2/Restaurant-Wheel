// Statistics handlers

import type { Context } from 'hono';
import type { Env, RequestContext } from '../types';
import { StatisticsService } from '../services/statistics-service';
import { createDbService } from '../services/db';

/**
 * GET /api/statistics
 * Get comprehensive statistics (available to all authenticated users)
 */
export async function handleGetStatistics(c: Context<{ Bindings: Env; Variables: RequestContext }>) {
  try {
    const db = createDbService(c.env);
    const statsService = new StatisticsService(db);

    const statistics = await statsService.getStatistics();

    return c.json({ statistics });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get statistics';
    console.error('Statistics error:', error);
    return c.json({ error: message }, 500);
  }
}

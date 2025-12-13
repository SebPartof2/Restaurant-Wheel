// Rating service

import type { Visit } from '../../../shared/types';
import { DatabaseService } from './db';
import { isValidRating } from '../utils/validation';

export class RatingService {
  constructor(private db: DatabaseService) {}

  /**
   * Get all visits for a restaurant
   */
  async getVisitsForRestaurant(restaurantId: number): Promise<Visit[]> {
    const rows = await this.db.execute<any>(
      `SELECT v.*,
              u.id as visitor_id, u.email as visitor_email, u.name as visitor_name,
              u.is_admin as visitor_is_admin, u.is_whitelisted as visitor_is_whitelisted,
              u.is_provisional as visitor_is_provisional, u.created_at as visitor_created_at
       FROM visits v
       LEFT JOIN users u ON v.user_id = u.id
       WHERE v.restaurant_id = ?`,
      [restaurantId]
    );

    // Transform rows to include nested user object
    return rows.map(row => ({
      id: row.id,
      restaurant_id: row.restaurant_id,
      user_id: row.user_id,
      attended: row.attended,
      rating: row.rating,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: row.visitor_id ? {
        id: row.visitor_id,
        email: row.visitor_email,
        name: row.visitor_name,
        is_admin: row.visitor_is_admin,
        is_whitelisted: row.visitor_is_whitelisted,
        is_provisional: row.visitor_is_provisional,
        created_at: row.visitor_created_at
      } : undefined
    }));
  }

  /**
   * Mark users who attended a visit
   */
  async markAttendance(restaurantId: number, userIds: number[]): Promise<void> {
    if (userIds.length === 0) {
      throw new Error('At least one user must attend');
    }

    // Create or update visit records for each user
    for (const userId of userIds) {
      const existing = await this.db.queryOne<Visit>(
        'SELECT * FROM visits WHERE restaurant_id = ? AND user_id = ?',
        [restaurantId, userId]
      );

      if (existing) {
        // Update existing visit
        await this.db.run(
          'UPDATE visits SET attended = ?, updated_at = datetime("now") WHERE id = ?',
          [1, existing.id]
        );
      } else {
        // Create new visit
        await this.db.insert(
          'INSERT INTO visits (restaurant_id, user_id, attended) VALUES (?, ?, ?)',
          [restaurantId, userId, 1]
        );
      }
    }
  }

  /**
   * Submit a rating for a user
   */
  async submitRating(restaurantId: number, userId: number, rating: number): Promise<Visit> {
    if (!isValidRating(rating)) {
      throw new Error('Rating must be a positive number');
    }

    // Check if visit exists
    const existing = await this.db.queryOne<Visit>(
      'SELECT * FROM visits WHERE restaurant_id = ? AND user_id = ?',
      [restaurantId, userId]
    );

    if (!existing) {
      // Create visit with rating
      const id = await this.db.insert(
        'INSERT INTO visits (restaurant_id, user_id, attended, rating) VALUES (?, ?, ?, ?)',
        [restaurantId, userId, 1, rating]
      );

      const visit = await this.db.queryOne<Visit>(
        'SELECT * FROM visits WHERE id = ?',
        [id]
      );

      if (!visit) {
        throw new Error('Failed to create visit');
      }

      // Recalculate average rating
      await this.recalculateAverageRating(restaurantId);

      return visit;
    } else {
      // Update existing visit
      await this.db.run(
        'UPDATE visits SET rating = ?, attended = ?, updated_at = datetime("now") WHERE id = ?',
        [rating, 1, existing.id]
      );

      const visit = await this.db.queryOne<Visit>(
        'SELECT * FROM visits WHERE id = ?',
        [existing.id]
      );

      if (!visit) {
        throw new Error('Failed to update visit');
      }

      // Recalculate average rating
      await this.recalculateAverageRating(restaurantId);

      return visit;
    }
  }

  /**
   * Recalculate average rating for a restaurant
   */
  async recalculateAverageRating(restaurantId: number): Promise<void> {
    const result = await this.db.queryOne<{ avg_rating: number | null }>(
      `SELECT AVG(rating) as avg_rating
       FROM visits
       WHERE restaurant_id = ? AND rating IS NOT NULL AND attended = 1`,
      [restaurantId]
    );

    const avgRating = result?.avg_rating || 0;

    await this.db.run(
      'UPDATE restaurants SET average_rating = ? WHERE id = ?',
      [avgRating, restaurantId]
    );
  }

  /**
   * Get visit for a specific user and restaurant
   */
  async getVisit(restaurantId: number, userId: number): Promise<Visit | null> {
    return await this.db.queryOne<Visit>(
      'SELECT * FROM visits WHERE restaurant_id = ? AND user_id = ?',
      [restaurantId, userId]
    );
  }
}

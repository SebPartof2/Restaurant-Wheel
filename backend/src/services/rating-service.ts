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
    return await this.db.execute<Visit>(
      'SELECT * FROM visits WHERE restaurant_id = ?',
      [restaurantId]
    );
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
      throw new Error('Rating must be between 1 and 10');
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

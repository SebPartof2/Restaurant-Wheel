// Restaurant service

import type { Restaurant, CreateRestaurantRequest, UpdateRestaurantRequest, RestaurantState } from '../../../shared/types';
import { DatabaseService } from './db';
import { sanitizeString, isValidUrl, isValidRestaurantState } from '../utils/validation';

export class RestaurantService {
  constructor(private db: DatabaseService) {}

  /**
   * Get all restaurants with optional filtering
   */
  async getRestaurants(state?: RestaurantState, userId?: number): Promise<Restaurant[]> {
    let query = 'SELECT * FROM restaurants';
    const params: any[] = [];

    if (state) {
      query += ' WHERE state = ?';
      params.push(state);
    } else if (userId) {
      query += ' WHERE nominated_by_user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC';

    return await this.db.execute<Restaurant>(query, params);
  }

  /**
   * Get a single restaurant by ID
   */
  async getRestaurantById(id: number): Promise<Restaurant | null> {
    return await this.db.queryOne<Restaurant>(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );
  }

  /**
   * Create a new restaurant nomination
   */
  async createRestaurant(
    data: CreateRestaurantRequest,
    nominatedByUserId: number,
    createdByAdminId?: number
  ): Promise<Restaurant> {
    const name = sanitizeString(data.name);
    const address = sanitizeString(data.address);

    if (!name || !address) {
      throw new Error('Name and address are required');
    }

    // If admin is creating on behalf of user, use that user ID
    const nomByUserId = data.nominated_by_user_id || nominatedByUserId;

    const id = await this.db.insert(
      `INSERT INTO restaurants
       (name, address, is_fast_food, nominated_by_user_id, created_by_admin_id, state)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, address, data.is_fast_food ? 1 : 0, nomByUserId, createdByAdminId || null, 'pending']
    );

    const restaurant = await this.getRestaurantById(id);
    if (!restaurant) {
      throw new Error('Failed to create restaurant');
    }

    return restaurant;
  }

  /**
   * Update a restaurant
   */
  async updateRestaurant(id: number, data: UpdateRestaurantRequest): Promise<Restaurant> {
    const restaurant = await this.getRestaurantById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(sanitizeString(data.name));
    }

    if (data.address !== undefined) {
      updates.push('address = ?');
      params.push(sanitizeString(data.address));
    }

    if (data.is_fast_food !== undefined) {
      updates.push('is_fast_food = ?');
      params.push(data.is_fast_food ? 1 : 0);
    }

    if (data.menu_link !== undefined) {
      if (data.menu_link && !isValidUrl(data.menu_link)) {
        throw new Error('Invalid menu link URL');
      }
      updates.push('menu_link = ?');
      params.push(data.menu_link);
    }

    if (data.photo_link !== undefined) {
      if (data.photo_link && !isValidUrl(data.photo_link)) {
        throw new Error('Invalid photo link URL');
      }
      updates.push('photo_link = ?');
      params.push(data.photo_link);
    }

    if (data.state !== undefined) {
      if (!isValidRestaurantState(data.state)) {
        throw new Error('Invalid restaurant state');
      }
      updates.push('state = ?');
      params.push(data.state);

      // If marking as visited, set visited_at timestamp (unless explicitly provided)
      if (data.state === 'visited' && data.visited_at === undefined) {
        updates.push('visited_at = datetime("now")');
      }
    }

    // Handle explicit visited_at update
    if (data.visited_at !== undefined) {
      updates.push('visited_at = ?');
      params.push(data.visited_at);
    }

    // Handle reservation_datetime update
    if (data.reservation_datetime !== undefined) {
      updates.push('reservation_datetime = ?');
      params.push(data.reservation_datetime);
    }

    if (updates.length === 0) {
      return restaurant;
    }

    updates.push('updated_at = datetime("now")');
    params.push(id);

    await this.db.run(
      `UPDATE restaurants SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updated = await this.getRestaurantById(id);
    if (!updated) {
      throw new Error('Failed to update restaurant');
    }

    return updated;
  }

  /**
   * Delete a restaurant
   */
  async deleteRestaurant(id: number): Promise<void> {
    const changes = await this.db.run(
      'DELETE FROM restaurants WHERE id = ?',
      [id]
    );

    if (changes === 0) {
      throw new Error('Restaurant not found');
    }
  }

  /**
   * Approve a pending restaurant (set to active)
   */
  async approveRestaurant(id: number): Promise<Restaurant> {
    return await this.updateRestaurant(id, { state: 'active' });
  }

  /**
   * Reject a pending restaurant (delete it)
   */
  async rejectRestaurant(id: number): Promise<void> {
    const restaurant = await this.getRestaurantById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (restaurant.state !== 'pending') {
      throw new Error('Only pending restaurants can be rejected');
    }

    await this.deleteRestaurant(id);
  }

  /**
   * Mark an upcoming restaurant as visited
   */
  async markAsVisited(id: number): Promise<Restaurant> {
    const restaurant = await this.getRestaurantById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    if (restaurant.state !== 'upcoming') {
      throw new Error('Only upcoming restaurants can be marked as visited');
    }

    return await this.updateRestaurant(id, { state: 'visited' });
  }

  /**
   * Get all active restaurants (for wheel)
   */
  async getActiveRestaurants(excludeFastFood: boolean = false): Promise<Restaurant[]> {
    let query = 'SELECT * FROM restaurants WHERE state = ?';
    const params: any[] = ['active'];

    if (excludeFastFood) {
      query += ' AND is_fast_food = ?';
      params.push(0);
    }

    return await this.db.execute<Restaurant>(query, params);
  }
}

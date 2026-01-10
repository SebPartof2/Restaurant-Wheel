// Restaurant service

import type { Restaurant, CreateRestaurantRequest, UpdateRestaurantRequest, RestaurantState } from '../../../shared/types';
import { DatabaseService } from './db';
import { sanitizeString, isValidUrl, isValidRestaurantState } from '../utils/validation';

export class RestaurantService {
  constructor(private db: DatabaseService) {}

  /**
   * Get all restaurants with optional filtering
   */
  async getRestaurants(
    state?: RestaurantState,
    userId?: number,
    search?: string,
    sort?: 'date' | 'rating' | 'name'
  ): Promise<Restaurant[]> {
    let query = `
      SELECT r.*,
             u.id as nominator_id, u.email as nominator_email, u.name as nominator_name,
             u.is_admin as nominator_is_admin, u.is_whitelisted as nominator_is_whitelisted,
             u.is_provisional as nominator_is_provisional, u.created_at as nominator_created_at
      FROM restaurants r
      LEFT JOIN users u ON r.nominated_by_user_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (state) {
      conditions.push('r.state = ?');
      params.push(state);
    }

    if (userId) {
      conditions.push('r.nominated_by_user_id = ?');
      params.push(userId);
    }

    if (search) {
      conditions.push('(LOWER(r.name) LIKE ? OR LOWER(r.address) LIKE ?)');
      const searchPattern = `%${search.toLowerCase()}%`;
      params.push(searchPattern, searchPattern);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Apply sorting
    switch (sort) {
      case 'name':
        query += ' ORDER BY LOWER(r.name) ASC';
        break;
      case 'rating':
        query += ' ORDER BY r.average_rating DESC, r.name ASC';
        break;
      case 'date':
      default:
        query += ' ORDER BY r.created_at DESC';
        break;
    }

    const rows = await this.db.execute<any>(query, params);

    // Transform rows to include nested user object
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      is_fast_food: row.is_fast_food,
      menu_link: row.menu_link,
      photo_link: row.photo_link,
      state: row.state,
      nominated_by_user_id: row.nominated_by_user_id,
      created_by_admin_id: row.created_by_admin_id,
      average_rating: row.average_rating,
      created_at: row.created_at,
      updated_at: row.updated_at,
      visited_at: row.visited_at,
      reservation_datetime: row.reservation_datetime,
      nominated_by: row.nominator_id ? {
        id: row.nominator_id,
        email: row.nominator_email,
        name: row.nominator_name,
        is_admin: row.nominator_is_admin,
        is_whitelisted: row.nominator_is_whitelisted,
        is_provisional: row.nominator_is_provisional,
        created_at: row.nominator_created_at
      } : undefined
    }));
  }

  /**
   * Get a single restaurant by ID
   */
  async getRestaurantById(id: number): Promise<Restaurant | null> {
    const row = await this.db.queryOne<any>(
      `SELECT r.*,
              u.id as nominator_id, u.email as nominator_email, u.name as nominator_name,
              u.is_admin as nominator_is_admin, u.is_whitelisted as nominator_is_whitelisted,
              u.is_provisional as nominator_is_provisional, u.created_at as nominator_created_at
       FROM restaurants r
       LEFT JOIN users u ON r.nominated_by_user_id = u.id
       WHERE r.id = ?`,
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      address: row.address,
      is_fast_food: row.is_fast_food,
      menu_link: row.menu_link,
      photo_link: row.photo_link,
      state: row.state,
      nominated_by_user_id: row.nominated_by_user_id,
      created_by_admin_id: row.created_by_admin_id,
      average_rating: row.average_rating,
      created_at: row.created_at,
      updated_at: row.updated_at,
      visited_at: row.visited_at,
      reservation_datetime: row.reservation_datetime,
      nominated_by: row.nominator_id ? {
        id: row.nominator_id,
        email: row.nominator_email,
        name: row.nominator_name,
        is_admin: row.nominator_is_admin,
        is_whitelisted: row.nominator_is_whitelisted,
        is_provisional: row.nominator_is_provisional,
        created_at: row.nominator_created_at
      } : undefined
    };
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
    let query = `
      SELECT r.*,
             u.id as nominator_id, u.email as nominator_email, u.name as nominator_name,
             u.is_admin as nominator_is_admin, u.is_whitelisted as nominator_is_whitelisted,
             u.is_provisional as nominator_is_provisional, u.created_at as nominator_created_at
      FROM restaurants r
      LEFT JOIN users u ON r.nominated_by_user_id = u.id
      WHERE r.state = ?
    `;
    const params: any[] = ['active'];

    if (excludeFastFood) {
      query += ' AND r.is_fast_food = ?';
      params.push(0);
    }

    const rows = await this.db.execute<any>(query, params);

    // Transform rows to include nested user object
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      address: row.address,
      is_fast_food: row.is_fast_food,
      menu_link: row.menu_link,
      photo_link: row.photo_link,
      state: row.state,
      nominated_by_user_id: row.nominated_by_user_id,
      created_by_admin_id: row.created_by_admin_id,
      average_rating: row.average_rating,
      created_at: row.created_at,
      updated_at: row.updated_at,
      visited_at: row.visited_at,
      reservation_datetime: row.reservation_datetime,
      nominated_by: row.nominator_id ? {
        id: row.nominator_id,
        email: row.nominator_email,
        name: row.nominator_name,
        is_admin: row.nominator_is_admin,
        is_whitelisted: row.nominator_is_whitelisted,
        is_provisional: row.nominator_is_provisional,
        created_at: row.nominator_created_at
      } : undefined
    }));
  }
}

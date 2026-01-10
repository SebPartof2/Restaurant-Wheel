import type {
  Restaurant,
  User,
  Visit,
  RestaurantPhoto,
  Statistics,
  SpinWheelResponse
} from '../../../shared/types';

/**
 * Centralized API client for The Wheel v2
 * Handles all communication with the backend API
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = import.meta.env.VITE_API_URL || '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic fetch wrapper with credentials
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================
  // Restaurant APIs
  // ==================

  /**
   * Get restaurants with optional filters
   */
  async getRestaurants(params?: {
    state?: 'pending' | 'active' | 'upcoming' | 'visited';
    search?: string;
    sort?: 'date' | 'rating' | 'name';
    limit?: number;
    offset?: number;
  }): Promise<{ restaurants: Restaurant[] }> {
    const query = new URLSearchParams();
    if (params?.state) query.append('state', params.state);
    if (params?.search) query.append('search', params.search);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const queryString = query.toString();
    return this.fetch(`/restaurants${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get single restaurant by ID
   */
  async getRestaurant(id: number): Promise<{ restaurant: Restaurant }> {
    return this.fetch(`/restaurants/${id}`);
  }

  /**
   * Create new restaurant nomination
   */
  async createRestaurant(data: {
    name: string;
    address: string;
    is_fast_food: boolean;
    menu_link?: string;
    photo_link?: string;
  }): Promise<{ restaurant: Restaurant }> {
    return this.fetch('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update restaurant (admin only)
   */
  async updateRestaurant(
    id: number,
    data: Partial<Restaurant>
  ): Promise<{ restaurant: Restaurant }> {
    return this.fetch(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete restaurant (admin only)
   */
  async deleteRestaurant(id: number): Promise<{ success: boolean }> {
    return this.fetch(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Approve pending restaurant (admin only)
   */
  async approveRestaurant(id: number): Promise<{ restaurant: Restaurant }> {
    return this.fetch(`/restaurants/${id}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject pending restaurant (admin only)
   */
  async rejectRestaurant(id: number): Promise<{ success: boolean }> {
    return this.fetch(`/restaurants/${id}/reject`, {
      method: 'POST',
    });
  }

  /**
   * Confirm upcoming restaurant (admin only)
   */
  async confirmUpcoming(
    id: number,
    data: { reservation_datetime: string }
  ): Promise<{ restaurant: Restaurant }> {
    return this.fetch(`/restaurants/${id}/confirm-upcoming`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Mark restaurant as visited (admin only)
   */
  async markVisited(
    id: number,
    data: { visit_date: string }
  ): Promise<{ restaurant: Restaurant; visit: Visit }> {
    return this.fetch(`/restaurants/${id}/mark-visited`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get overall restaurant statistics
   */
  async getOverallStats(): Promise<{
    total_restaurants: number;
    average_rating: number | null;
    visited_count: number;
  }> {
    return this.fetch('/restaurants/stats/overall');
  }

  // ==================
  // Wheel APIs
  // ==================

  /**
   * Get active restaurants for wheel
   */
  async getActiveRestaurants(excludeFastFood?: boolean): Promise<{
    restaurants: Restaurant[];
  }> {
    const query = excludeFastFood ? '?exclude_fast_food=true' : '';
    return this.fetch(`/wheel/active${query}`);
  }

  /**
   * Spin the wheel (admin only)
   */
  async spinWheel(excludeFastFood?: boolean): Promise<SpinWheelResponse> {
    return this.fetch('/wheel/spin', {
      method: 'POST',
      body: JSON.stringify({ exclude_fast_food: excludeFastFood || false }),
    });
  }

  // ==================
  // Visit APIs
  // ==================

  /**
   * Get visits for a restaurant
   */
  async getVisits(restaurantId: number): Promise<{ visits: Visit[] }> {
    return this.fetch(`/visits/${restaurantId}`);
  }

  /**
   * Mark user attendance for a visit (admin only)
   */
  async markAttendance(
    restaurantId: number,
    data: { user_id: number; attended: boolean }
  ): Promise<{ visit: Visit }> {
    return this.fetch(`/visits/${restaurantId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Submit rating for a visit (admin only)
   */
  async submitRating(
    restaurantId: number,
    data: { user_id: number; rating: number }
  ): Promise<{ visit: Visit }> {
    return this.fetch(`/visits/${restaurantId}/rate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================
  // Photo APIs
  // ==================

  /**
   * Upload photo to restaurant
   */
  async uploadPhoto(
    restaurantId: number,
    file: File,
    isPrimary: boolean = false,
    caption?: string
  ): Promise<{ photo: RestaurantPhoto }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_primary', isPrimary ? 'true' : 'false');
    if (caption) formData.append('caption', caption);

    const response = await fetch(
      `${this.baseUrl}/restaurants/${restaurantId}/photos`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get photos for a restaurant
   */
  async getPhotos(restaurantId: number): Promise<{ photos: RestaurantPhoto[] }> {
    return this.fetch(`/restaurants/${restaurantId}/photos`);
  }

  /**
   * Get all photos (for photo feed)
   */
  async getAllPhotos(params?: {
    sort?: 'recent' | 'restaurant';
    restaurant_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<{ photos: RestaurantPhoto[] }> {
    // Note: This endpoint may need to be added to backend
    // For now, we'll fetch all restaurants and aggregate photos
    const restaurants = await this.getRestaurants();
    const allPhotos: RestaurantPhoto[] = [];

    for (const restaurant of restaurants.restaurants) {
      const { photos } = await this.getPhotos(restaurant.id!);
      allPhotos.push(...photos);
    }

    // Sort by recent
    if (params?.sort === 'recent') {
      allPhotos.sort((a, b) =>
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    }

    // Filter by restaurant
    let filtered = params?.restaurant_id
      ? allPhotos.filter(p => p.restaurant_id === params.restaurant_id)
      : allPhotos;

    // Apply pagination
    const offset = params?.offset || 0;
    const limit = params?.limit || filtered.length;
    filtered = filtered.slice(offset, offset + limit);

    return { photos: filtered };
  }

  /**
   * Update photo metadata
   */
  async updatePhoto(
    restaurantId: number,
    photoId: number,
    data: { caption?: string; is_primary?: boolean }
  ): Promise<{ photo: RestaurantPhoto }> {
    return this.fetch(`/restaurants/${restaurantId}/photos/${photoId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete photo
   */
  async deletePhoto(restaurantId: number, photoId: number): Promise<{ success: boolean }> {
    return this.fetch(`/restaurants/${restaurantId}/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  // ==================
  // Statistics APIs
  // ==================

  /**
   * Get comprehensive statistics
   */
  async getStatistics(): Promise<{ statistics: Statistics }> {
    return this.fetch('/statistics');
  }

  // ==================
  // Admin APIs
  // ==================

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<{ users: User[] }> {
    return this.fetch('/admin/users');
  }

  /**
   * Update user (admin only)
   */
  async updateUser(
    id: number,
    data: Partial<User>
  ): Promise<{ user: User }> {
    return this.fetch(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Add user to whitelist (admin only)
   */
  async addToWhitelist(email: string): Promise<{ success: boolean }> {
    return this.fetch('/admin/users/whitelist', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Remove user from whitelist (admin only)
   */
  async removeFromWhitelist(email: string): Promise<{ success: boolean }> {
    return this.fetch('/admin/users/whitelist', {
      method: 'DELETE',
      body: JSON.stringify({ email }),
    });
  }

  /**
   * Create provisional user (admin only)
   */
  async createProvisionalUser(data: {
    email: string;
    given_name?: string;
    family_name?: string;
  }): Promise<{ user: User }> {
    return this.fetch('/admin/users/provisional', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get pending nominations (admin only)
   */
  async getPendingNominations(): Promise<{ restaurants: Restaurant[] }> {
    return this.fetch('/admin/nominations/pending');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// API client service

import type {
  User,
  SignupRequest,
  LoginRequest,
  VerifyCodeRequest,
  Restaurant,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
  SpinWheelRequest,
  Visit,
  MarkAttendanceRequest,
  SubmitRatingRequest,
  AddToWhitelistRequest,
  RestaurantState,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ======================
  // Auth API
  // ======================
  async verifyCode(data: VerifyCodeRequest): Promise<{ email: string; name?: string }> {
    return this.request('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signup(data: SignupRequest): Promise<{ user: User }> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<{ user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  // ======================
  // Restaurants API
  // ======================
  async getRestaurants(state?: RestaurantState): Promise<{ restaurants: Restaurant[] }> {
    const query = state ? `?state=${state}` : '';
    return this.request(`/restaurants${query}`);
  }

  async getRestaurant(id: number): Promise<{ restaurant: Restaurant }> {
    return this.request(`/restaurants/${id}`);
  }

  async createRestaurant(data: CreateRestaurantRequest): Promise<{ restaurant: Restaurant }> {
    return this.request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRestaurant(id: number, data: UpdateRestaurantRequest): Promise<{ restaurant: Restaurant }> {
    return this.request(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRestaurant(id: number): Promise<{ message: string }> {
    return this.request(`/restaurants/${id}`, {
      method: 'DELETE',
    });
  }

  async approveRestaurant(id: number): Promise<{ restaurant: Restaurant }> {
    return this.request(`/restaurants/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectRestaurant(id: number): Promise<{ message: string }> {
    return this.request(`/restaurants/${id}/reject`, {
      method: 'POST',
    });
  }

  async confirmRestaurantUpcoming(id: number): Promise<{ restaurant: Restaurant }> {
    return this.request(`/restaurants/${id}/confirm-upcoming`, {
      method: 'POST',
    });
  }

  async markRestaurantVisited(id: number): Promise<{ restaurant: Restaurant }> {
    return this.request(`/restaurants/${id}/mark-visited`, {
      method: 'POST',
    });
  }

  // ======================
  // Wheel API
  // ======================
  async getActiveRestaurants(excludeFastFood: boolean = false): Promise<{ restaurants: Restaurant[] }> {
    const query = excludeFastFood ? '?exclude_fast_food=true' : '';
    return this.request(`/wheel/active${query}`);
  }

  async spinWheel(data: SpinWheelRequest): Promise<{ restaurant: Restaurant }> {
    return this.request('/wheel/spin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ======================
  // Visits API
  // ======================
  async getVisits(restaurantId: number): Promise<{ visits: Visit[] }> {
    return this.request(`/visits/${restaurantId}`);
  }

  async markAttendance(restaurantId: number, data: MarkAttendanceRequest): Promise<{ message: string }> {
    return this.request(`/visits/${restaurantId}/attendance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async submitRating(restaurantId: number, data: SubmitRatingRequest): Promise<{ visit: Visit }> {
    return this.request(`/visits/${restaurantId}/rate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ======================
  // Admin API
  // ======================
  async getUsers(): Promise<{ users: User[] }> {
    return this.request('/admin/users');
  }

  async updateUser(id: number, data: { name?: string; email?: string }): Promise<{ user: User }> {
    return this.request(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async addToWhitelist(data: AddToWhitelistRequest): Promise<{ message: string; email: string }> {
    return this.request('/admin/users/whitelist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingNominations(): Promise<{ nominations: Restaurant[] }> {
    return this.request('/admin/nominations/pending');
  }

  async createProvisionalUser(data: { email: string; name?: string }): Promise<{ user: User }> {
    return this.request('/admin/users/provisional', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ======================
  // Statistics API
  // ======================
  async getOverallStats(): Promise<{ overall_average_rating: number; rated_restaurant_count: number }> {
    return this.request('/restaurants/stats/overall');
  }

  async getStatistics(): Promise<{ statistics: import('../../../shared/types').Statistics }> {
    return this.request('/statistics');
  }
}

export const api = new ApiClient();

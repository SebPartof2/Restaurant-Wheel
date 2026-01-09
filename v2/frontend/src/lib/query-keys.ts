/**
 * Query key factory for React Query
 * Provides consistent, type-safe query keys for all API endpoints
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'currentUser'] as const,
  },

  // Restaurants
  restaurants: {
    all: ['restaurants'] as const,
    lists: () => [...queryKeys.restaurants.all, 'list'] as const,
    list: (filters?: {
      state?: string;
      search?: string;
      sort?: string;
      limit?: number;
      offset?: number;
    }) => [...queryKeys.restaurants.lists(), filters] as const,
    details: () => [...queryKeys.restaurants.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.restaurants.details(), id] as const,
    stats: () => [...queryKeys.restaurants.all, 'stats'] as const,
  },

  // Wheel
  wheel: {
    all: ['wheel'] as const,
    active: (excludeFastFood?: boolean) =>
      [...queryKeys.wheel.all, 'active', { excludeFastFood }] as const,
  },

  // Visits
  visits: {
    all: ['visits'] as const,
    byRestaurant: (restaurantId: number) =>
      [...queryKeys.visits.all, 'restaurant', restaurantId] as const,
  },

  // Photos
  photos: {
    all: ['photos'] as const,
    byRestaurant: (restaurantId: number) =>
      [...queryKeys.photos.all, 'restaurant', restaurantId] as const,
    feed: (filters?: {
      sort?: string;
      restaurant_id?: number;
      limit?: number;
      offset?: number;
    }) => [...queryKeys.photos.all, 'feed', filters] as const,
  },

  // Statistics
  statistics: {
    all: ['statistics'] as const,
    comprehensive: () => [...queryKeys.statistics.all, 'comprehensive'] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    users: () => [...queryKeys.admin.all, 'users'] as const,
    pendingNominations: () => [...queryKeys.admin.all, 'pendingNominations'] as const,
  },
} as const;

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';

interface UseRestaurantsParams {
  state?: 'pending' | 'active' | 'upcoming' | 'visited';
  search?: string;
  sort?: 'date' | 'rating' | 'name';
  limit?: number;
  offset?: number;
}

/**
 * Hook to fetch restaurants with optional filters
 */
export function useRestaurants(params?: UseRestaurantsParams) {
  return useQuery({
    queryKey: queryKeys.restaurants.list(params),
    queryFn: () => apiClient.getRestaurants(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch overall restaurant statistics
 */
export function useRestaurantStats() {
  return useQuery({
    queryKey: queryKeys.restaurants.stats(),
    queryFn: () => apiClient.getOverallStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

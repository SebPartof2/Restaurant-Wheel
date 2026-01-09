import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';

/**
 * Hook to fetch a single restaurant by ID
 */
export function useRestaurant(id: number | undefined) {
  return useQuery({
    queryKey: queryKeys.restaurants.detail(id!),
    queryFn: () => apiClient.getRestaurant(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

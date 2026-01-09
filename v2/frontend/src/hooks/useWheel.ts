import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';

/**
 * Hook to fetch active restaurants for the wheel
 */
export function useActiveRestaurants(excludeFastFood?: boolean) {
  return useQuery({
    queryKey: queryKeys.wheel.active(excludeFastFood),
    queryFn: () => apiClient.getActiveRestaurants(excludeFastFood),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to spin the wheel (admin only)
 */
export function useSpinWheel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (excludeFastFood?: boolean) => apiClient.spinWheel(excludeFastFood),
    onSuccess: () => {
      // Invalidate all restaurant queries since states will change
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wheel.all });
    },
  });
}

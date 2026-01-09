import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';

/**
 * Hook to fetch visits for a restaurant
 */
export function useVisits(restaurantId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.visits.byRestaurant(restaurantId!),
    queryFn: () => apiClient.getVisits(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to mark user attendance (admin only)
 */
export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      userId,
      attended,
    }: {
      restaurantId: number;
      userId: number;
      attended: boolean;
    }) => apiClient.markAttendance(restaurantId, { user_id: userId, attended }),
    onSuccess: (_result, variables) => {
      // Invalidate visits for this restaurant
      queryClient.invalidateQueries({
        queryKey: queryKeys.visits.byRestaurant(variables.restaurantId),
      });
    },
  });
}

/**
 * Hook to submit rating (admin only)
 */
export function useSubmitRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      userId,
      rating,
    }: {
      restaurantId: number;
      userId: number;
      rating: number;
    }) => apiClient.submitRating(restaurantId, { user_id: userId, rating }),
    onSuccess: (_result, variables) => {
      // Invalidate visits for this restaurant
      queryClient.invalidateQueries({
        queryKey: queryKeys.visits.byRestaurant(variables.restaurantId),
      });
      // Invalidate restaurant details (average rating will change)
      queryClient.invalidateQueries({
        queryKey: queryKeys.restaurants.detail(variables.restaurantId),
      });
      // Invalidate statistics (ratings will change)
      queryClient.invalidateQueries({ queryKey: queryKeys.statistics.all });
    },
  });
}

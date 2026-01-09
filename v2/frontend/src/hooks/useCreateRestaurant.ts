import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';

interface CreateRestaurantData {
  name: string;
  address: string;
  is_fast_food: boolean;
  menu_link?: string;
  photo_link?: string;
}

/**
 * Hook to create a new restaurant nomination
 */
export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRestaurantData) => apiClient.createRestaurant(data),
    onSuccess: () => {
      // Invalidate restaurants list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
  });
}

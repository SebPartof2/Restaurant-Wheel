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

interface AdminCreateRestaurantData extends CreateRestaurantData {
  nominated_by_user_id: number;
  bypass_approval?: boolean;
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

/**
 * Hook for admin to create restaurant on behalf of a user
 */
export function useCreateRestaurantAsAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdminCreateRestaurantData) => apiClient.createRestaurant(data as any),
    onSuccess: () => {
      // Invalidate restaurants list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
      // Invalidate pending nominations if not bypassing approval
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingNominations() });
    },
  });
}

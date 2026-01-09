import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';
import type { Restaurant } from '../../../shared/types';

/**
 * Hook to update a restaurant (admin only)
 */
export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Restaurant> }) =>
      apiClient.updateRestaurant(id, data),
    onSuccess: (_result, variables) => {
      // Invalidate the specific restaurant detail
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.detail(variables.id) });
      // Invalidate all restaurant lists
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.lists() });
    },
  });
}

/**
 * Hook to delete a restaurant (admin only)
 */
export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteRestaurant(id),
    onSuccess: () => {
      // Invalidate all restaurant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
    },
  });
}

/**
 * Hook to approve a pending restaurant (admin only)
 */
export function useApproveRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.approveRestaurant(id),
    onSuccess: (_result, id) => {
      // Invalidate the specific restaurant and all lists
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingNominations() });
    },
  });
}

/**
 * Hook to reject a pending restaurant (admin only)
 */
export function useRejectRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.rejectRestaurant(id),
    onSuccess: () => {
      // Invalidate all restaurant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingNominations() });
    },
  });
}

/**
 * Hook to confirm upcoming restaurant reservation (admin only)
 */
export function useConfirmUpcoming() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reservation_datetime }: { id: number; reservation_datetime: string }) =>
      apiClient.confirmUpcoming(id, { reservation_datetime }),
    onSuccess: (_result, variables) => {
      // Invalidate the specific restaurant and all lists
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.lists() });
    },
  });
}

/**
 * Hook to mark restaurant as visited (admin only)
 */
export function useMarkVisited() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, visit_date }: { id: number; visit_date: string }) =>
      apiClient.markVisited(id, { visit_date }),
    onSuccess: (_result, variables) => {
      // Invalidate the specific restaurant, all lists, and visits
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurants.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.visits.byRestaurant(variables.id) });
    },
  });
}

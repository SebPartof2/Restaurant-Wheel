import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';
import type { User } from '../../../shared/types';

/**
 * Hook to fetch all users (admin only)
 */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users(),
    queryFn: () => apiClient.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update a user (admin only)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) =>
      apiClient.updateUser(id, data),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
}

/**
 * Hook to add user to whitelist (admin only)
 */
export function useAddToWhitelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => apiClient.addToWhitelist(email),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
}

/**
 * Hook to remove user from whitelist (admin only)
 */
export function useRemoveFromWhitelist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => apiClient.removeFromWhitelist(email),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
}

/**
 * Hook to create provisional user (admin only)
 */
export function useCreateProvisionalUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; given_name?: string; family_name?: string }) =>
      apiClient.createProvisionalUser(data),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
}

/**
 * Hook to fetch pending nominations (admin only)
 */
export function usePendingNominations() {
  return useQuery({
    queryKey: queryKeys.admin.pendingNominations(),
    queryFn: () => apiClient.getPendingNominations(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

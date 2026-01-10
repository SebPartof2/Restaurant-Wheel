import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';

/**
 * Hook to fetch photos for a restaurant
 */
export function usePhotos(restaurantId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.photos.byRestaurant(restaurantId!),
    queryFn: () => apiClient.getPhotos(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all photos (for photo feed)
 */
export function usePhotoFeed(params?: {
  sort?: 'recent' | 'restaurant';
  restaurant_id?: number;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.photos.feed(params),
    queryFn: () => apiClient.getAllPhotos(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Alias for usePhotoFeed
 */
export const useAllPhotos = usePhotoFeed;

/**
 * Hook to upload a photo
 */
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      file,
      isPrimary,
      caption,
    }: {
      restaurantId: number;
      file: File;
      isPrimary?: boolean;
      caption?: string;
    }) => apiClient.uploadPhoto(restaurantId, file, isPrimary, caption),
    onSuccess: (_result, variables) => {
      // Invalidate photos for this restaurant
      queryClient.invalidateQueries({
        queryKey: queryKeys.photos.byRestaurant(variables.restaurantId),
      });
      // Invalidate photo feed
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.feed() });
    },
  });
}

/**
 * Hook to update photo metadata (caption, is_primary)
 */
export function useUpdatePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      restaurantId,
      photoId,
      caption,
      is_primary,
    }: {
      restaurantId: number;
      photoId: number;
      caption?: string;
      is_primary?: boolean;
    }) => apiClient.updatePhoto(restaurantId, photoId, { caption, is_primary }),
    onSuccess: (_result, variables) => {
      // Invalidate photos for this restaurant
      queryClient.invalidateQueries({
        queryKey: queryKeys.photos.byRestaurant(variables.restaurantId),
      });
      // Invalidate photo feed
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.feed() });
    },
  });
}

/**
 * Hook to delete a photo
 */
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, photoId }: { restaurantId: number; photoId: number }) =>
      apiClient.deletePhoto(restaurantId, photoId),
    onSuccess: (_result, variables) => {
      // Invalidate photos for this restaurant
      queryClient.invalidateQueries({
        queryKey: queryKeys.photos.byRestaurant(variables.restaurantId),
      });
      // Invalidate photo feed
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.feed() });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../lib/query-keys';

/**
 * Hook to fetch comprehensive statistics
 */
export function useStatistics() {
  return useQuery({
    queryKey: queryKeys.statistics.comprehensive(),
    queryFn: () => apiClient.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { DashboardStats } from '../types';

export function useDashboard() {
    return useQuery<DashboardStats>({
        queryKey: ['dashboard'],
        queryFn: async () => {
            const response = await endpoints.dashboard();
            return response.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchInterval: 1000 * 60 * 2, // Refresh every 2 minutes
    });
}

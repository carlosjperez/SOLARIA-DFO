import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { Agent } from '../types';

export function useAgents() {
    return useQuery<Agent[]>({
        queryKey: ['agents'],
        queryFn: async () => {
            const response = await endpoints.agents.list();
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useAgent(id: number) {
    return useQuery<Agent>({
        queryKey: ['agent', id],
        queryFn: async () => {
            const response = await endpoints.agents.get(id);
            return response.data;
        },
        enabled: !!id,
    });
}

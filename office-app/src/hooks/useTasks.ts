import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { Task, TaskStatus, Priority } from '../types';

interface UseTasksParams {
    projectId?: number;
    status?: TaskStatus;
    priority?: Priority;
}

export function useTasks(params?: UseTasksParams) {
    return useQuery<Task[]>({
        queryKey: ['tasks', params],
        queryFn: async () => {
            const response = await endpoints.tasks.list(params as Record<string, unknown>);
            return response.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

export function useTask(id: number) {
    return useQuery<Task>({
        queryKey: ['task', id],
        queryFn: async () => {
            const response = await endpoints.tasks.get(id);
            return response.data;
        },
        enabled: !!id,
    });
}

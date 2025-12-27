import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { Project } from '../types';

export function useProjects() {
    return useQuery<Project[]>({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await endpoints.projects.list();
            // API returns {projects: [...], count: n} - extract the array
            const data = response.data;
            return Array.isArray(data) ? data : data.projects || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useProject(id: number) {
    return useQuery<Project>({
        queryKey: ['project', id],
        queryFn: async () => {
            const response = await endpoints.projects.get(id);
            return response.data;
        },
        enabled: !!id,
    });
}

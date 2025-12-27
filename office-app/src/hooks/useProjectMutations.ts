/**
 * useProjectMutations
 * React Query mutations for project CRUD operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { ProjectStatus, Priority } from '../types';

export interface ProjectFormData {
    name: string;
    code?: string;
    description?: string;
    client?: string;
    status: ProjectStatus;
    priority: Priority;
    budget?: number;
    deadline?: string;
}

export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ProjectFormData) => {
            const response = await endpoints.projects.create(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<ProjectFormData> }) => {
            const response = await endpoints.projects.update(id, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

export function useDeleteProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            // Note: Delete endpoint would need to be added to api.ts
            const response = await endpoints.projects.update(id, { status: 'cancelled' as ProjectStatus });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

// Convenience hook that returns all mutations
export function useProjectMutations() {
    return {
        create: useCreateProject(),
        update: useUpdateProject(),
        delete: useDeleteProject(),
    };
}

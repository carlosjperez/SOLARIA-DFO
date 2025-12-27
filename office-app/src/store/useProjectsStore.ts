import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { Project, ProjectStatus } from '../types';

// View mode for projects list
export type ProjectsViewMode = 'cards' | 'table' | 'kanban';

// Sort options
export type ProjectsSortField = 'name' | 'client' | 'status' | 'deadline' | 'budget' | 'progress';
export type SortDirection = 'asc' | 'desc';

// Filter state
interface ProjectsFilters {
    status: ProjectStatus | 'all';
    search: string;
    clientId: number | null;
}

// Store state
interface ProjectsState {
    // View preferences
    viewMode: ProjectsViewMode;
    setViewMode: (mode: ProjectsViewMode) => void;

    // Filters
    filters: ProjectsFilters;
    setFilter: <K extends keyof ProjectsFilters>(key: K, value: ProjectsFilters[K]) => void;
    resetFilters: () => void;

    // Sorting
    sortField: ProjectsSortField;
    sortDirection: SortDirection;
    setSorting: (field: ProjectsSortField, direction?: SortDirection) => void;

    // Selected project for detail view
    selectedProjectId: number | null;
    setSelectedProjectId: (id: number | null) => void;

    // Drawer state
    isDrawerOpen: boolean;
    drawerMode: 'view' | 'edit' | 'create';
    openDrawer: (mode: 'view' | 'edit' | 'create', projectId?: number) => void;
    closeDrawer: () => void;
}

// Default filters
const defaultFilters: ProjectsFilters = {
    status: 'all',
    search: '',
    clientId: null,
};

// Create store
export const useProjectsStore = create<ProjectsState>((set) => ({
    // View mode with localStorage persistence
    viewMode: (localStorage.getItem('projects-view') as ProjectsViewMode) || 'table',
    setViewMode: (mode) => {
        localStorage.setItem('projects-view', mode);
        set({ viewMode: mode });
    },

    // Filters
    filters: defaultFilters,
    setFilter: (key, value) =>
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        })),
    resetFilters: () => set({ filters: defaultFilters }),

    // Sorting
    sortField: 'deadline',
    sortDirection: 'asc',
    setSorting: (field, direction) =>
        set((state) => ({
            sortField: field,
            sortDirection: direction ?? (state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc'),
        })),

    // Selected project
    selectedProjectId: null,
    setSelectedProjectId: (id) => set({ selectedProjectId: id }),

    // Drawer
    isDrawerOpen: false,
    drawerMode: 'view',
    openDrawer: (mode, projectId) =>
        set({
            isDrawerOpen: true,
            drawerMode: mode,
            selectedProjectId: projectId ?? null,
        }),
    closeDrawer: () =>
        set({
            isDrawerOpen: false,
            selectedProjectId: null,
        }),
}));

// Query keys
export const projectsQueryKeys = {
    all: ['projects'] as const,
    list: (filters?: Partial<ProjectsFilters>) => ['projects', 'list', filters] as const,
    detail: (id: number) => ['projects', 'detail', id] as const,
    tasks: (projectId: number) => ['projects', projectId, 'tasks'] as const,
    stats: () => ['projects', 'stats'] as const,
};

// Hook: Fetch projects list with filters
export function useProjectsFiltered(filters?: Partial<ProjectsFilters>) {
    return useQuery({
        queryKey: projectsQueryKeys.list(filters),
        queryFn: async () => {
            const response = await endpoints.projects.list();
            const data = response.data;
            let projects = Array.isArray(data) ? data : data.projects || [];

            // Apply client-side filters
            if (filters?.status && filters.status !== 'all') {
                projects = projects.filter((p: Project) => p.status === filters.status);
            }
            if (filters?.search) {
                const query = filters.search.toLowerCase();
                projects = projects.filter(
                    (p: Project) =>
                        p.name.toLowerCase().includes(query) ||
                        p.client?.toLowerCase().includes(query) ||
                        p.code?.toLowerCase().includes(query)
                );
            }
            if (filters?.clientId) {
                projects = projects.filter((p: Project) => (p as Project & { officeClientId?: number }).officeClientId === filters.clientId);
            }

            return projects as Project[];
        },
        staleTime: 30000, // 30 seconds
    });
}

// Hook: Fetch single project with details
export function useProjectDetail(id: number | null) {
    return useQuery({
        queryKey: projectsQueryKeys.detail(id!),
        queryFn: async () => {
            const response = await endpoints.projects.get(id!);
            return response.data as Project & {
                tasks?: { id: number; title: string; status: string; progress: number }[];
                client?: { id: number; name: string };
            };
        },
        enabled: id !== null,
    });
}

// Hook: Fetch project tasks
export function useProjectTasks(projectId: number | null) {
    return useQuery({
        queryKey: projectsQueryKeys.tasks(projectId!),
        queryFn: async () => {
            const response = await endpoints.tasks.list({ project_id: projectId });
            const data = response.data;
            return Array.isArray(data) ? data : data.tasks || [];
        },
        enabled: projectId !== null,
    });
}

// Hook: Create project mutation
export function useCreateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<Project>) => {
            const response = await endpoints.projects.create(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
        },
    });
}

// Hook: Update project mutation
export function useUpdateProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
            const response = await endpoints.projects.update(id, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: projectsQueryKeys.detail(variables.id) });
        },
    });
}

// Utility: Calculate project health
export function calculateProjectHealth(project: Project): {
    status: 'healthy' | 'at-risk' | 'critical';
    score: number;
    factors: string[];
} {
    const factors: string[] = [];
    let score = 100;

    // Check deadline
    if (project.deadline) {
        const deadline = new Date(project.deadline);
        const now = new Date();
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft < 0) {
            score -= 40;
            factors.push('Deadline vencido');
        } else if (daysLeft < 7 && project.progress < 80) {
            score -= 25;
            factors.push('Deadline proximo con bajo progreso');
        } else if (daysLeft < 14 && project.progress < 60) {
            score -= 15;
            factors.push('Progreso lento');
        }
    }

    // Check status
    if (project.status === 'blocked' || project.status === 'on_hold') {
        score -= 30;
        factors.push(project.status === 'blocked' ? 'Bloqueado' : 'En pausa');
    }

    // Check progress consistency
    if (project.status === 'development' && project.progress < 25) {
        score -= 10;
        factors.push('Inicio lento');
    }

    // Determine status
    let status: 'healthy' | 'at-risk' | 'critical' = 'healthy';
    if (score < 50) {
        status = 'critical';
    } else if (score < 75) {
        status = 'at-risk';
    }

    return { status, score: Math.max(0, score), factors };
}

export default useProjectsStore;

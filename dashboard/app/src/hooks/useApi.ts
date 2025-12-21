import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    projectsApi,
    tasksApi,
    agentsApi,
    memoriesApi,
    dashboardApi,
    authApi,
} from '@/lib/api';
import type { Project, Task, TaskItem, Agent, Memory, ActivityLog, DashboardStats } from '@/types';

// Auth hooks
export function useVerifyAuth() {
    return useQuery({
        queryKey: ['auth', 'verify'],
        queryFn: () => authApi.verify(),
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Dashboard hooks
export function useDashboardOverview() {
    return useQuery({
        queryKey: ['dashboard', 'overview'],
        queryFn: async () => {
            const { data } = await dashboardApi.getOverview();
            // API returns nested structure, transform to flat DashboardStats
            const raw = data.data || data;
            return {
                totalProjects: raw.projects?.total_projects || 0,
                activeProjects: raw.projects?.active_projects || 0,
                completedProjects: raw.projects?.completed_projects || 0,
                totalTasks: raw.tasks?.total_tasks || 0,
                completedTasks: raw.tasks?.completed_tasks || 0,
                pendingTasks: raw.tasks?.pending_tasks || 0,
                inProgressTasks: raw.tasks?.in_progress_tasks || 0,
                totalAgents: raw.agents?.total_agents || 0,
                activeAgents: raw.agents?.active_agents || 0,
                totalMemories: raw.memories?.total_memories || 0,
                criticalAlerts: raw.alerts?.critical_alerts || 0,
            } as DashboardStats;
        },
        refetchInterval: 30000, // Refresh every 30 seconds
    });
}

export function useDashboardAlerts() {
    return useQuery({
        queryKey: ['dashboard', 'alerts'],
        queryFn: async () => {
            const { data } = await dashboardApi.getAlerts();
            // API returns alerts array directly or wrapped
            return data.data || data.alerts || data || [];
        },
        refetchInterval: 15000, // Refresh every 15 seconds
    });
}

// Projects hooks
export function useProjects() {
    return useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const { data } = await projectsApi.getAll();
            // API returns { projects: [...] } not { data: [...] }
            return (data.projects || data.data || []) as Project[];
        },
    });
}

export function useProject(id: number) {
    return useQuery({
        queryKey: ['projects', id],
        queryFn: async () => {
            const { data } = await projectsApi.getById(id);
            return data.data as Project;
        },
        enabled: !!id,
    });
}

export function useCreateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Project>) => projectsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });
}

export function useUpdateProject() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Project> }) =>
            projectsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['projects', id] });
        },
    });
}

// Tasks hooks
export function useTasks(filters?: { projectId?: number; status?: string }) {
    return useQuery({
        queryKey: ['tasks', filters],
        queryFn: async () => {
            const { data } = await tasksApi.getAll(filters);
            // API returns tasks array directly or wrapped
            return (data.tasks || data.data || data || []) as Task[];
        },
    });
}

export function useTask(id: number) {
    return useQuery({
        queryKey: ['tasks', id],
        queryFn: async () => {
            const { data } = await tasksApi.getById(id);
            return data.data as Task;
        },
        enabled: !!id,
    });
}

export function useCreateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Task>) => tasksApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useUpdateTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) =>
            tasksApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['tasks', id] });
        },
    });
}

export function useCompleteTask() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            tasksApi.complete(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

// Agents hooks
export function useAgents() {
    return useQuery({
        queryKey: ['agents'],
        queryFn: async () => {
            const { data } = await agentsApi.getAll();
            // API returns agents array directly or wrapped
            return (data.agents || data.data || data || []) as Agent[];
        },
        refetchInterval: 10000, // Refresh every 10 seconds for real-time status
    });
}

export function useAgent(id: number) {
    return useQuery({
        queryKey: ['agents', id],
        queryFn: async () => {
            const { data } = await agentsApi.getById(id);
            return data.data as Agent;
        },
        enabled: !!id,
    });
}

export function useAgentTasks(agentId: number, status?: string) {
    return useQuery({
        queryKey: ['agents', agentId, 'tasks', status],
        queryFn: async () => {
            const { data } = await agentsApi.getTasks(agentId, status);
            return data.data as Task[];
        },
        enabled: !!agentId,
    });
}

// Memories hooks
export function useMemories(filters?: { projectId?: number; tags?: string[] }) {
    return useQuery({
        queryKey: ['memories', filters],
        queryFn: async () => {
            const { data } = await memoriesApi.getAll(filters);
            // API returns { memories: [...] }
            return (data.memories || data.data || data || []) as Memory[];
        },
    });
}

export function useMemory(id: number) {
    return useQuery({
        queryKey: ['memories', id],
        queryFn: async () => {
            const { data } = await memoriesApi.getById(id);
            return data.data as Memory;
        },
        enabled: !!id,
    });
}

export function useSearchMemories(query: string, tags?: string[]) {
    return useQuery({
        queryKey: ['memories', 'search', query, tags],
        queryFn: async () => {
            const { data } = await memoriesApi.search(query, tags);
            // API returns { memories: [...] } or array directly
            return (data.memories || data.data || data || []) as Memory[];
        },
        enabled: query.length > 2,
    });
}

export function useMemoryTags() {
    return useQuery({
        queryKey: ['memories', 'tags'],
        queryFn: async () => {
            const { data } = await memoriesApi.getTags();
            // API returns { tags: [...] } or array directly
            return data.tags || data.data || data || [];
        },
    });
}

export function useMemoryStats() {
    return useQuery({
        queryKey: ['memories', 'stats'],
        queryFn: async () => {
            const { data } = await memoriesApi.getStats();
            // API returns stats object directly
            return data.data || data;
        },
    });
}

export function useCreateMemory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Memory>) => memoriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories'] });
        },
    });
}

export function useBoostMemory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, amount }: { id: number; amount?: number }) =>
            memoriesApi.boost(id, amount),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['memories'] });
            queryClient.invalidateQueries({ queryKey: ['memories', id] });
        },
    });
}

// ============================================================
// TaskItems hooks (subtasks)
// ============================================================

export function useTaskItems(taskId: number) {
    return useQuery({
        queryKey: ['tasks', taskId, 'items'],
        queryFn: async () => {
            const { data } = await tasksApi.getItems(taskId);
            // API returns { items: [...] } or array directly
            return (data.items || data.data || data || []) as TaskItem[];
        },
        enabled: !!taskId,
    });
}

export function useCreateTaskItems() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, items }: { taskId: number; items: Partial<TaskItem>[] }) =>
            tasksApi.createItems(taskId, items),
        onSuccess: (_, { taskId }) => {
            // Invalidate task items list
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'items'] });
            // Invalidate parent task (progress recalc)
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
            // Invalidate tasks list (for card progress display)
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });
}

export function useCompleteTaskItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            taskId,
            itemId,
            notes,
            actualMinutes,
        }: {
            taskId: number;
            itemId: number;
            notes?: string;
            actualMinutes?: number;
        }) => tasksApi.completeItem(taskId, itemId, { notes, actual_minutes: actualMinutes }),
        onSuccess: (_, { taskId }) => {
            // Invalidate task items list
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'items'] });
            // Invalidate parent task (progress recalc)
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
            // Invalidate tasks list (for card progress display)
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            // Invalidate dashboard stats
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}

// ============================================================
// Activity hooks
// ============================================================

export function useActivityLogs(projectId?: number, limit?: number) {
    return useQuery({
        queryKey: ['activity', projectId, limit],
        queryFn: async () => {
            const params: Record<string, unknown> = { limit: limit || 50 };
            if (projectId) params.project_id = projectId;
            const { data } = await dashboardApi.getActivity(limit);
            // API returns { logs: [...] } or array directly
            return (data.logs || data.data || data || []) as ActivityLog[];
        },
        refetchInterval: 30000, // Refresh every 30 seconds for live updates
    });
}

export function useProjectActivity(projectId: number, limit?: number) {
    return useQuery({
        queryKey: ['projects', projectId, 'activity', limit],
        queryFn: async () => {
            const { data } = await dashboardApi.getActivity(limit);
            // Filter by project if API doesn't support param
            const logs = (data.logs || data.data || data || []) as ActivityLog[];
            return logs.filter((log) => log.projectId === projectId);
        },
        enabled: !!projectId,
        refetchInterval: 15000, // Refresh every 15 seconds for project detail
    });
}

// ============================================================
// Project extended hooks
// ============================================================

export function useProjectTasks(projectId: number) {
    return useQuery({
        queryKey: ['projects', projectId, 'tasks'],
        queryFn: async () => {
            const { data } = await tasksApi.getAll({ project_id: projectId });
            return (data.tasks || data.data || data || []) as Task[];
        },
        enabled: !!projectId,
        refetchInterval: 10000, // Refresh every 10 seconds for real-time
    });
}

export function useProjectAgents(projectId: number) {
    return useQuery({
        queryKey: ['projects', projectId, 'agents'],
        queryFn: async () => {
            const { data } = await agentsApi.getAll();
            // API might not filter by project, do client-side
            const agents = (data.agents || data.data || data || []) as Agent[];
            // TODO: Filter by project when API supports it
            return agents;
        },
        enabled: !!projectId,
        refetchInterval: 10000,
    });
}

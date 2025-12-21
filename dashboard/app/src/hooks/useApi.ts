import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    projectsApi,
    tasksApi,
    tagsApi,
    agentsApi,
    memoriesApi,
    dashboardApi,
    authApi,
    epicsApi,
    sprintsApi,
} from '@/lib/api';
import type { Project, Task, TaskItem, TaskTag, Agent, Memory, ActivityLog, DashboardStats, Epic, Sprint } from '@/types';

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
            // API returns { project: {...}, tasks: [...] }
            return (data.project || data.data || data) as Project;
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
// Task Tags hooks
// ============================================================

export function useAllTags() {
    return useQuery({
        queryKey: ['tags'],
        queryFn: async () => {
            const { data } = await tagsApi.getAll();
            // API returns { tags: [...] }
            return (data.tags || data.data || data || []) as TaskTag[];
        },
        staleTime: 1000 * 60 * 5, // Tags change infrequently, cache for 5 min
    });
}

export function useTaskTags(taskId: number) {
    return useQuery({
        queryKey: ['tasks', taskId, 'tags'],
        queryFn: async () => {
            const { data } = await tasksApi.getTags(taskId);
            // API returns { task_id, tags: [...] }
            return (data.tags || data.data || data || []) as TaskTag[];
        },
        enabled: !!taskId,
    });
}

export function useAddTaskTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, tagId }: { taskId: number; tagId: number }) =>
            tasksApi.addTag(taskId, tagId),
        onSuccess: (_, { taskId }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'tags'] });
            queryClient.invalidateQueries({ queryKey: ['tags'] }); // Update usage count
        },
    });
}

export function useAddTaskTagByName() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, tagName }: { taskId: number; tagName: string }) =>
            tasksApi.addTagByName(taskId, tagName),
        onSuccess: (_, { taskId }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'tags'] });
            queryClient.invalidateQueries({ queryKey: ['tags'] }); // Update usage count
        },
    });
}

export function useRemoveTaskTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ taskId, tagId }: { taskId: number; tagId: number }) =>
            tasksApi.removeTag(taskId, tagId),
        onSuccess: (_, { taskId }) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', taskId, 'tags'] });
            queryClient.invalidateQueries({ queryKey: ['tags'] }); // Update usage count
        },
    });
}

export function useTasksByTag(tagName: string, enabled = true) {
    return useQuery({
        queryKey: ['tasks', 'by-tag', tagName],
        queryFn: async () => {
            const { data } = await tagsApi.getTasksByTag(tagName);
            return (data.tasks || data.data || data || []) as Task[];
        },
        enabled: enabled && !!tagName,
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

// ============================================================
// Project Code Validation hooks
// ============================================================

export function useCheckProjectCode(code: string) {
    return useQuery({
        queryKey: ['projects', 'check-code', code],
        queryFn: async () => {
            const { data } = await projectsApi.checkCode(code);
            return data as { available: boolean; code: string; message: string };
        },
        enabled: code.length === 3 && /^[A-Za-z]{3}$/.test(code),
        staleTime: 1000 * 30, // Cache for 30 seconds
    });
}

// ============================================================
// Epics hooks
// ============================================================

export function useProjectEpics(projectId: number) {
    return useQuery({
        queryKey: ['projects', projectId, 'epics'],
        queryFn: async () => {
            const { data } = await epicsApi.getByProject(projectId);
            return (data.epics || data.data || data || []) as Epic[];
        },
        enabled: !!projectId,
    });
}

export function useCreateEpic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: Partial<Epic> }) =>
            epicsApi.create(projectId, data as Record<string, unknown>),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'epics'] });
        },
    });
}

export function useUpdateEpic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; projectId: number; data: Partial<Epic> }) =>
            epicsApi.update(id, data as Record<string, unknown>),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'epics'] });
        },
    });
}

export function useDeleteEpic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: number; projectId: number }) =>
            epicsApi.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'epics'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Tasks may have epic assignments
        },
    });
}

// ============================================================
// Sprints hooks
// ============================================================

export function useProjectSprints(projectId: number) {
    return useQuery({
        queryKey: ['projects', projectId, 'sprints'],
        queryFn: async () => {
            const { data } = await sprintsApi.getByProject(projectId);
            return (data.sprints || data.data || data || []) as Sprint[];
        },
        enabled: !!projectId,
    });
}

export function useCreateSprint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: Partial<Sprint> }) =>
            sprintsApi.create(projectId, data as Record<string, unknown>),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'sprints'] });
        },
    });
}

export function useUpdateSprint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; projectId: number; data: Partial<Sprint> }) =>
            sprintsApi.update(id, data as Record<string, unknown>),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'sprints'] });
        },
    });
}

export function useDeleteSprint() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id }: { id: number; projectId: number }) =>
            sprintsApi.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'sprints'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Tasks may have sprint assignments
        },
    });
}

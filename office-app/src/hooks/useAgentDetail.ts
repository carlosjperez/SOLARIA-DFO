import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { AgentDetail, AgentPerformanceHistory, Task } from '../types';

/**
 * Hook to fetch a single agent with full details
 */
export function useAgentDetail(id: number) {
    return useQuery<AgentDetail>({
        queryKey: ['agent-detail', id],
        queryFn: async () => {
            const response = await endpoints.agents.get(id);
            return response.data;
        },
        enabled: !!id && id > 0,
    });
}

/**
 * Hook to fetch agent's assigned tasks
 */
export function useAgentTasks(agentId: number) {
    return useQuery<Task[]>({
        queryKey: ['agent-tasks', agentId],
        queryFn: async () => {
            const response = await endpoints.agents.getTasks(agentId);
            const data = response.data;
            return Array.isArray(data) ? data : data.tasks || [];
        },
        enabled: !!agentId && agentId > 0,
    });
}

/**
 * Hook to fetch agent performance metrics and history
 */
export function useAgentPerformance(agentId: number) {
    return useQuery<{
        current: AgentDetail['metrics'];
        history: AgentPerformanceHistory[];
    }>({
        queryKey: ['agent-performance', agentId],
        queryFn: async () => {
            const response = await endpoints.agents.getPerformance(agentId);
            return response.data;
        },
        enabled: !!agentId && agentId > 0,
    });
}

/**
 * Hook to fetch agent's projects (derived from tasks)
 */
export function useAgentProjects(agentId: number) {
    return useQuery({
        queryKey: ['agent-projects', agentId],
        queryFn: async () => {
            const response = await endpoints.agents.getTasks(agentId);
            const tasks = Array.isArray(response.data) ? response.data : response.data.tasks || [];

            // Extract unique projects from tasks
            const projectMap = new Map();
            tasks.forEach((task: Task) => {
                if (task.project_id && task.project_name) {
                    if (!projectMap.has(task.project_id)) {
                        projectMap.set(task.project_id, {
                            id: task.project_id,
                            name: task.project_name,
                            tasks_count: 1,
                            tasks_completed: task.status === 'completed' ? 1 : 0,
                        });
                    } else {
                        const project = projectMap.get(task.project_id);
                        project.tasks_count++;
                        if (task.status === 'completed') project.tasks_completed++;
                    }
                }
            });

            return Array.from(projectMap.values());
        },
        enabled: !!agentId && agentId > 0,
    });
}

/**
 * Composite hook to fetch all agent detail data at once
 */
export function useAgentFullDetail(id: number) {
    const agentQuery = useAgentDetail(id);
    const tasksQuery = useAgentTasks(id);
    const performanceQuery = useAgentPerformance(id);
    const projectsQuery = useAgentProjects(id);

    return {
        agent: agentQuery.data,
        tasks: tasksQuery.data || [],
        performance: performanceQuery.data,
        projects: projectsQuery.data || [],
        isLoading: agentQuery.isLoading,
        isError: agentQuery.isError,
        error: agentQuery.error,
        refetch: () => {
            agentQuery.refetch();
            tasksQuery.refetch();
            performanceQuery.refetch();
            projectsQuery.refetch();
        },
    };
}

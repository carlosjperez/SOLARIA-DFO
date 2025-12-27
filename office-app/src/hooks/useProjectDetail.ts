import { useQuery } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { ProjectDetail, ProjectDocument, ProjectSprint, ProjectEpic, Task } from '../types';

/**
 * Hook to fetch a single project with full details
 */
export function useProjectDetail(id: number) {
    return useQuery<ProjectDetail>({
        queryKey: ['project-detail', id],
        queryFn: async () => {
            const response = await endpoints.projects.get(id);
            return response.data;
        },
        enabled: !!id && id > 0,
    });
}

/**
 * Hook to fetch project tasks
 */
export function useProjectTasks(projectId: number) {
    return useQuery<Task[]>({
        queryKey: ['project-tasks', projectId],
        queryFn: async () => {
            const response = await endpoints.tasks.list({ project_id: projectId });
            const data = response.data;
            return Array.isArray(data) ? data : data.tasks || [];
        },
        enabled: !!projectId && projectId > 0,
    });
}

/**
 * Hook to fetch project team (agents assigned to project tasks)
 */
export function useProjectTeam(projectId: number) {
    return useQuery({
        queryKey: ['project-team', projectId],
        queryFn: async () => {
            // Get tasks for project and extract unique agents
            const response = await endpoints.tasks.list({ project_id: projectId });
            const tasks = Array.isArray(response.data) ? response.data : response.data.tasks || [];

            // Extract unique agents from tasks
            const agentMap = new Map();
            tasks.forEach((task: Task) => {
                if (task.assigned_agent_id && task.agent_name) {
                    if (!agentMap.has(task.assigned_agent_id)) {
                        agentMap.set(task.assigned_agent_id, {
                            id: task.assigned_agent_id,
                            name: task.agent_name,
                            tasks_count: 1,
                            tasks_completed: task.status === 'completed' ? 1 : 0,
                        });
                    } else {
                        const agent = agentMap.get(task.assigned_agent_id);
                        agent.tasks_count++;
                        if (task.status === 'completed') agent.tasks_completed++;
                    }
                }
            });

            return Array.from(agentMap.values());
        },
        enabled: !!projectId && projectId > 0,
    });
}

/**
 * Hook to fetch project documents
 */
export function useProjectDocuments(projectId: number) {
    return useQuery<ProjectDocument[]>({
        queryKey: ['project-documents', projectId],
        queryFn: async () => {
            const response = await endpoints.projects.getDocuments(projectId);
            return response.data || [];
        },
        enabled: !!projectId && projectId > 0,
    });
}

/**
 * Hook to fetch project sprints (phases)
 */
export function useProjectSprints(projectId: number) {
    return useQuery<ProjectSprint[]>({
        queryKey: ['project-sprints', projectId],
        queryFn: async () => {
            const response = await endpoints.projects.getSprints(projectId);
            return response.data || [];
        },
        enabled: !!projectId && projectId > 0,
    });
}

/**
 * Hook to fetch project epics
 */
export function useProjectEpics(projectId: number) {
    return useQuery<ProjectEpic[]>({
        queryKey: ['project-epics', projectId],
        queryFn: async () => {
            const response = await endpoints.projects.getEpics(projectId);
            return response.data || [];
        },
        enabled: !!projectId && projectId > 0,
    });
}

/**
 * Composite hook to fetch all project detail data at once
 */
export function useProjectFullDetail(id: number) {
    const projectQuery = useProjectDetail(id);
    const tasksQuery = useProjectTasks(id);
    const teamQuery = useProjectTeam(id);
    const documentsQuery = useProjectDocuments(id);
    const sprintsQuery = useProjectSprints(id);
    const epicsQuery = useProjectEpics(id);

    return {
        project: projectQuery.data,
        tasks: tasksQuery.data || [],
        team: teamQuery.data || [],
        documents: documentsQuery.data || [],
        sprints: sprintsQuery.data || [],
        epics: epicsQuery.data || [],
        isLoading: projectQuery.isLoading,
        isError: projectQuery.isError,
        error: projectQuery.error,
        refetch: () => {
            projectQuery.refetch();
            tasksQuery.refetch();
            teamQuery.refetch();
            documentsQuery.refetch();
            sprintsQuery.refetch();
            epicsQuery.refetch();
        },
    };
}

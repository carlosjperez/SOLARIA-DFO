import type { Project, Task, TaskItem, Epic, Sprint } from '@/types';
export declare function useVerifyAuth(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useDashboardOverview(): import("@tanstack/react-query").UseQueryResult<DashboardStats, Error>;
export declare function useDashboardAlerts(): import("@tanstack/react-query").UseQueryResult<any[], Error>;
export declare function useProjects(): import("@tanstack/react-query").UseQueryResult<Project[], Error>;
export declare function useProject(id: number): import("@tanstack/react-query").UseQueryResult<Project, Error>;
export declare function useCreateProject(): import("@tanstack/react-query").UseMutationResult<unknown, Error, Project, unknown>;
export declare function useUpdateProject(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    data: Partial<Project>;
}, unknown>;
export declare function useTasks(filters?: {
    projectId?: number;
    status?: string;
}): import("@tanstack/react-query").UseQueryResult<Task[], Error>;
export declare function useTask(id: number): import("@tanstack/react-query").UseQueryResult<Task, Error>;
export declare function useCreateTask(): import("@tanstack/react-query").UseMutationResult<unknown, Error, Task, unknown>;
export declare function useUpdateTask(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    data: Partial<Task>;
}, unknown>;
export declare function useCompleteTask(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    notes?: string;
}, unknown>;
export declare function useAgents(): import("@tanstack/react-query").UseQueryResult<Agent[], Error>;
export declare function useAgent(id: number): import("@tanstack/react-query").UseQueryResult<Agent, Error>;
export declare function useAgentTasks(agentId: number, status?: string): import("@tanstack/react-query").UseQueryResult<Task[], Error>;
export declare function useMemories(filters?: {
    projectId?: number;
    tags?: string[];
}): import("@tanstack/react-query").UseQueryResult<Memory[], Error>;
export declare function useMemory(id: number): import("@tanstack/react-query").UseQueryResult<Memory, Error>;
export declare function useSearchMemories(query: string, tags?: string[]): import("@tanstack/react-query").UseQueryResult<Memory[], Error>;
export declare function useMemoryTags(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useMemoryStats(): import("@tanstack/react-query").UseQueryResult<any, Error>;
export declare function useCreateMemory(): import("@tanstack/react-query").UseMutationResult<unknown, Error, Memory, unknown>;
export declare function useBoostMemory(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    amount?: number;
}, unknown>;
export declare function useTaskItems(taskId: number): import("@tanstack/react-query").UseQueryResult<TaskItem[], Error>;
export declare function useCreateTaskItems(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    taskId: number;
    items: Partial<TaskItem>[];
}, unknown>;
export declare function useCompleteTaskItem(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    taskId: number;
    itemId: number;
    notes?: string;
    actualMinutes?: number;
}, unknown>;
export declare function useAllTags(): import("@tanstack/react-query").UseQueryResult<TaskTag[], Error>;
export declare function useTaskTags(taskId: number): import("@tanstack/react-query").UseQueryResult<TaskTag[], Error>;
export declare function useAddTaskTag(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    taskId: number;
    tagId: number;
}, unknown>;
export declare function useAddTaskTagByName(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    taskId: number;
    tagName: string;
}, unknown>;
export declare function useRemoveTaskTag(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    taskId: number;
    tagId: number;
}, unknown>;
export declare function useTasksByTag(tagName: string, enabled?: boolean): import("@tanstack/react-query").UseQueryResult<Task[], Error>;
export declare function useActivityLogs(projectId?: number, limit?: number): import("@tanstack/react-query").UseQueryResult<ActivityLog[], Error>;
export declare function useProjectActivity(projectId: number, limit?: number): import("@tanstack/react-query").UseQueryResult<ActivityLog[], Error>;
export declare function useProjectTasks(projectId: number): import("@tanstack/react-query").UseQueryResult<Task[], Error>;
export declare function useProjectAgents(projectId: number): import("@tanstack/react-query").UseQueryResult<Agent[], Error>;
export declare function useCheckProjectCode(code: string): import("@tanstack/react-query").UseQueryResult<{
    available: boolean;
    code: string;
    message: string;
}, Error>;
export declare function useProjectEpics(projectId: number): import("@tanstack/react-query").UseQueryResult<Epic[], Error>;
export declare function useCreateEpic(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    projectId: number;
    data: Partial<Epic>;
}, unknown>;
export declare function useUpdateEpic(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    projectId: number;
    data: Partial<Epic>;
}, unknown>;
export declare function useDeleteEpic(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    projectId: number;
}, unknown>;
export declare function useProjectSprints(projectId: number): import("@tanstack/react-query").UseQueryResult<Sprint[], Error>;
export declare function useCreateSprint(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    projectId: number;
    data: Partial<Sprint>;
}, unknown>;
export declare function useUpdateSprint(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    projectId: number;
    data: Partial<Sprint>;
}, unknown>;
export declare function useDeleteSprint(): import("@tanstack/react-query").UseMutationResult<unknown, Error, {
    id: number;
    projectId: number;
}, unknown>;

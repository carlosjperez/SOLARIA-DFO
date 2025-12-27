export { useProjects, useProject } from './useProjects';
export { useProjectMutations, useCreateProject, useUpdateProject, useDeleteProject } from './useProjectMutations';
export { useDashboard } from './useDashboard';
export { useTasks, useTask } from './useTasks';
export { useAgents, useAgent } from './useAgents';

// Detail page hooks
export {
    useClients,
    useClient,
    useClientContacts,
    useClientProjects,
    useClientPayments,
    useClientDetail,
    useClientMutations,
} from './useClients';

export {
    useProjectDetail,
    useProjectTasks,
    useProjectTeam,
    useProjectDocuments,
    useProjectSprints,
    useProjectEpics,
    useProjectFullDetail,
} from './useProjectDetail';

export {
    useAgentDetail,
    useAgentTasks,
    useAgentPerformance,
    useAgentProjects,
    useAgentFullDetail,
} from './useAgentDetail';

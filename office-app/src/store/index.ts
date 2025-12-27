/**
 * Stores - Barrel Export
 */

// UI Store
export { useUIStore } from './useUIStore';

// Module Stores
export {
    useClientsStore,
    useClients,
    useClient,
    useCreateClient,
    useUpdateClient,
    useDeleteClient,
    clientsQueryKeys,
} from './useClientsStore';

export {
    useProjectsStore,
    useProjectsFiltered,
    useProjectDetail,
    useProjectTasks,
    useCreateProject,
    useUpdateProject,
    projectsQueryKeys,
    calculateProjectHealth,
} from './useProjectsStore';

export {
    useAgentsStore,
    useAgentsFiltered,
    useAgentDetail,
    useUpdateAgentStatus,
    agentsQueryKeys,
    calculateAgentPerformance,
    isAIAgent,
    ROLE_LABELS,
    STATUS_CONFIG,
} from './useAgentsStore';

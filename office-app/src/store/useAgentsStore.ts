import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { Agent, AgentStatus, AgentRole } from '../types';

// Agent type
export type AgentType = 'human' | 'ai' | 'all';

// View mode
export type AgentsViewMode = 'cards' | 'list';

// Filter state
interface AgentsFilters {
    type: AgentType;
    status: AgentStatus | 'all';
    role: AgentRole | 'all';
    search: string;
}

// Store state
interface AgentsState {
    // View preferences
    viewMode: AgentsViewMode;
    setViewMode: (mode: AgentsViewMode) => void;

    // Filters
    filters: AgentsFilters;
    setFilter: <K extends keyof AgentsFilters>(key: K, value: AgentsFilters[K]) => void;
    resetFilters: () => void;

    // Selected agent for detail view
    selectedAgentId: number | null;
    setSelectedAgentId: (id: number | null) => void;

    // Drawer state
    isDrawerOpen: boolean;
    drawerMode: 'view' | 'edit';
    openDrawer: (mode: 'view' | 'edit', agentId: number) => void;
    closeDrawer: () => void;
}

// Default filters
const defaultFilters: AgentsFilters = {
    type: 'all',
    status: 'all',
    role: 'all',
    search: '',
};

// Create store
export const useAgentsStore = create<AgentsState>((set) => ({
    // View mode with localStorage persistence
    viewMode: (localStorage.getItem('agents-view') as AgentsViewMode) || 'cards',
    setViewMode: (mode) => {
        localStorage.setItem('agents-view', mode);
        set({ viewMode: mode });
    },

    // Filters
    filters: defaultFilters,
    setFilter: (key, value) =>
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        })),
    resetFilters: () => set({ filters: defaultFilters }),

    // Selected agent
    selectedAgentId: null,
    setSelectedAgentId: (id) => set({ selectedAgentId: id }),

    // Drawer
    isDrawerOpen: false,
    drawerMode: 'view',
    openDrawer: (mode, agentId) =>
        set({
            isDrawerOpen: true,
            drawerMode: mode,
            selectedAgentId: agentId,
        }),
    closeDrawer: () =>
        set({
            isDrawerOpen: false,
            selectedAgentId: null,
        }),
}));

// Query keys
export const agentsQueryKeys = {
    all: ['agents'] as const,
    list: (filters?: Partial<AgentsFilters>) => ['agents', 'list', filters] as const,
    detail: (id: number) => ['agents', 'detail', id] as const,
    tasks: (agentId: number) => ['agents', agentId, 'tasks'] as const,
};

// Hook: Fetch agents list
export function useAgentsFiltered(filters?: Partial<AgentsFilters>) {
    return useQuery({
        queryKey: agentsQueryKeys.list(filters),
        queryFn: async () => {
            const response = await endpoints.agents.list();
            let agents = response.data as Agent[];

            // Apply type filter
            if (filters?.type && filters.type !== 'all') {
                if (filters.type === 'ai') {
                    agents = agents.filter((a) => a.name.startsWith('SOLARIA-'));
                } else {
                    agents = agents.filter((a) => !a.name.startsWith('SOLARIA-'));
                }
            }

            // Apply status filter
            if (filters?.status && filters.status !== 'all') {
                agents = agents.filter((a) => a.status === filters.status);
            }

            // Apply role filter
            if (filters?.role && filters.role !== 'all') {
                agents = agents.filter((a) => a.role === filters.role);
            }

            // Apply search filter
            if (filters?.search) {
                const query = filters.search.toLowerCase();
                agents = agents.filter(
                    (a) =>
                        a.name.toLowerCase().includes(query) ||
                        a.role.toLowerCase().includes(query) ||
                        a.description?.toLowerCase().includes(query)
                );
            }

            return agents;
        },
        staleTime: 30000, // 30 seconds
    });
}

// Hook: Fetch single agent with details
export function useAgentDetail(id: number | null) {
    return useQuery({
        queryKey: agentsQueryKeys.detail(id!),
        queryFn: async () => {
            const response = await endpoints.agents.get(id!);
            return response.data as Agent & {
                current_task?: { id: number; title: string; status: string };
                recent_activity?: { action: string; timestamp: string }[];
            };
        },
        enabled: id !== null,
    });
}

// Hook: Update agent status mutation
export function useUpdateAgentStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status: _status }: { id: number; status: AgentStatus }) => {
            // Assuming there's an endpoint to update status
            const response = await endpoints.agents.get(id); // Placeholder
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: agentsQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: agentsQueryKeys.detail(variables.id) });
        },
    });
}

// Utility: Calculate agent performance
export function calculateAgentPerformance(agent: Agent): {
    efficiency: number;
    rating: 'excellent' | 'good' | 'average' | 'poor';
} {
    const efficiency = agent.tasks_assigned > 0
        ? Math.round((agent.tasks_completed / agent.tasks_assigned) * 100)
        : 0;

    let rating: 'excellent' | 'good' | 'average' | 'poor' = 'average';
    if (efficiency >= 90) rating = 'excellent';
    else if (efficiency >= 75) rating = 'good';
    else if (efficiency >= 50) rating = 'average';
    else rating = 'poor';

    return { efficiency, rating };
}

// Utility: Check if agent is AI
export function isAIAgent(agent: Agent): boolean {
    return agent.name.startsWith('SOLARIA-');
}

// Role labels
export const ROLE_LABELS: Record<AgentRole, string> = {
    project_manager: 'Project Manager',
    architect: 'Arquitecto',
    developer: 'Desarrollador',
    tester: 'QA Tester',
    analyst: 'Analista',
    designer: 'Diseñador',
    devops: 'DevOps',
    technical_writer: 'Tech Writer',
    security_auditor: 'Auditor Seguridad',
    deployment_specialist: 'Deploy Specialist',
};

// Status configuration
export const STATUS_CONFIG: Record<AgentStatus, { label: string; color: string; bgColor: string }> = {
    active: { label: 'Activo', color: 'text-green-700', bgColor: 'bg-green-100' },
    busy: { label: 'Ocupado', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    inactive: { label: 'Inactivo', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    error: { label: 'Error', color: 'text-red-700', bgColor: 'bg-red-100' },
    maintenance: { label: 'Mantenimiento', color: 'text-purple-700', bgColor: 'bg-purple-100' },
};

export default useAgentsStore;

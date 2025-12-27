import { create } from 'zustand';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints, OfficeClient, OfficeContact } from '@lib/api';

// Client status type
export type ClientStatus = 'prospect' | 'active' | 'inactive' | 'churned';

// View mode for clients list
export type ClientsViewMode = 'cards' | 'table';

// Sort options
export type ClientsSortField = 'name' | 'status' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

// Filter state
interface ClientsFilters {
    status: ClientStatus | 'all';
    search: string;
}

// Store state
interface ClientsState {
    // View preferences
    viewMode: ClientsViewMode;
    setViewMode: (mode: ClientsViewMode) => void;

    // Filters
    filters: ClientsFilters;
    setFilter: <K extends keyof ClientsFilters>(key: K, value: ClientsFilters[K]) => void;
    resetFilters: () => void;

    // Sorting
    sortField: ClientsSortField;
    sortDirection: SortDirection;
    setSorting: (field: ClientsSortField, direction?: SortDirection) => void;

    // Selected client for detail view
    selectedClientId: number | null;
    setSelectedClientId: (id: number | null) => void;

    // Drawer state
    isDrawerOpen: boolean;
    drawerMode: 'view' | 'edit' | 'create';
    openDrawer: (mode: 'view' | 'edit' | 'create', clientId?: number) => void;
    closeDrawer: () => void;
}

// Default filters
const defaultFilters: ClientsFilters = {
    status: 'all',
    search: '',
};

// Create store
export const useClientsStore = create<ClientsState>((set) => ({
    // View mode with localStorage persistence
    viewMode: (localStorage.getItem('clients-view') as ClientsViewMode) || 'cards',
    setViewMode: (mode) => {
        localStorage.setItem('clients-view', mode);
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
    sortField: 'name',
    sortDirection: 'asc',
    setSorting: (field, direction) =>
        set((state) => ({
            sortField: field,
            sortDirection: direction ?? (state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc'),
        })),

    // Selected client
    selectedClientId: null,
    setSelectedClientId: (id) => set({ selectedClientId: id }),

    // Drawer
    isDrawerOpen: false,
    drawerMode: 'view',
    openDrawer: (mode, clientId) =>
        set({
            isDrawerOpen: true,
            drawerMode: mode,
            selectedClientId: clientId ?? null,
        }),
    closeDrawer: () =>
        set({
            isDrawerOpen: false,
            selectedClientId: null,
        }),
}));

// Query keys
export const clientsQueryKeys = {
    all: ['clients'] as const,
    list: (filters?: Partial<ClientsFilters>) => ['clients', 'list', filters] as const,
    detail: (id: number) => ['clients', 'detail', id] as const,
    contacts: (clientId: number) => ['clients', clientId, 'contacts'] as const,
    stats: () => ['clients', 'stats'] as const,
};

// Hook: Fetch clients list
export function useClients(filters?: Partial<ClientsFilters>) {
    return useQuery({
        queryKey: clientsQueryKeys.list(filters),
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (filters?.status && filters.status !== 'all') {
                params.status = filters.status;
            }
            if (filters?.search) {
                params.search = filters.search;
            }
            const response = await endpoints.office.clients.list(params);
            return response.data as OfficeClient[];
        },
        staleTime: 30000, // 30 seconds
    });
}

// Hook: Fetch single client
export function useClient(id: number | null) {
    return useQuery({
        queryKey: clientsQueryKeys.detail(id!),
        queryFn: async () => {
            const response = await endpoints.office.clients.get(id!);
            return response.data as OfficeClient & { contacts: OfficeContact[]; projects: unknown[] };
        },
        enabled: id !== null,
    });
}

// Hook: Fetch client contacts
export function useClientContacts(clientId: number | null) {
    return useQuery({
        queryKey: clientsQueryKeys.contacts(clientId!),
        queryFn: async () => {
            const response = await endpoints.office.contacts.list(clientId!);
            return response.data as OfficeContact[];
        },
        enabled: clientId !== null,
    });
}

// Hook: Fetch clients stats
export function useClientsStats() {
    return useQuery({
        queryKey: clientsQueryKeys.stats(),
        queryFn: async () => {
            const response = await endpoints.office.clients.stats();
            return response.data as {
                total: number;
                byStatus: Record<ClientStatus, number>;
                recentActivity: number;
            };
        },
        staleTime: 60000, // 1 minute
    });
}

// Hook: Create client mutation
export function useCreateClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<OfficeClient>) => {
            const response = await endpoints.office.clients.create(data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
        },
    });
}

// Hook: Update client mutation
export function useUpdateClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<OfficeClient> }) => {
            const response = await endpoints.office.clients.update(id, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(variables.id) });
        },
    });
}

// Hook: Delete client mutation
export function useDeleteClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await endpoints.office.clients.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.all });
        },
    });
}

// Hook: Create contact mutation
export function useCreateContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ clientId, data }: { clientId: number; data: Partial<OfficeContact> }) => {
            const response = await endpoints.office.contacts.create(clientId, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.contacts(variables.clientId) });
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.detail(variables.clientId) });
        },
    });
}

// Hook: Update contact mutation
export function useUpdateContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            clientId,
            contactId,
            data,
        }: {
            clientId: number;
            contactId: number;
            data: Partial<OfficeContact>;
        }) => {
            const response = await endpoints.office.contacts.update(clientId, contactId, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.contacts(variables.clientId) });
        },
    });
}

// Hook: Delete contact mutation
export function useDeleteContact() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ clientId, contactId }: { clientId: number; contactId: number }) => {
            await endpoints.office.contacts.delete(clientId, contactId);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: clientsQueryKeys.contacts(variables.clientId) });
        },
    });
}

export default useClientsStore;

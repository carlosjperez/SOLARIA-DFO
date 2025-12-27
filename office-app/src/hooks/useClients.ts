import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@lib/api';
import type { OfficeClient, ClientContact, ClientPayment } from '../types';

/**
 * Hook to fetch all office clients
 */
export function useClients() {
    return useQuery<OfficeClient[]>({
        queryKey: ['office-clients'],
        queryFn: async () => {
            const response = await endpoints.clients.list();
            const data = response.data;
            return Array.isArray(data) ? data : data.clients || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch a single client with all related data
 */
export function useClient(id: number) {
    return useQuery<OfficeClient>({
        queryKey: ['office-client', id],
        queryFn: async () => {
            const response = await endpoints.clients.get(id);
            return response.data;
        },
        enabled: !!id && id > 0,
    });
}

/**
 * Hook to fetch client contacts
 */
export function useClientContacts(clientId: number) {
    return useQuery<ClientContact[]>({
        queryKey: ['client-contacts', clientId],
        queryFn: async () => {
            const response = await endpoints.clients.getContacts(clientId);
            return response.data;
        },
        enabled: !!clientId && clientId > 0,
    });
}

/**
 * Hook to fetch client's projects
 */
export function useClientProjects(clientId: number) {
    return useQuery({
        queryKey: ['client-projects', clientId],
        queryFn: async () => {
            const response = await endpoints.clients.getProjects(clientId);
            const data = response.data;
            // Handle both array and object responses
            return Array.isArray(data) ? data : data.projects || [];
        },
        enabled: !!clientId && clientId > 0,
    });
}

/**
 * Hook to fetch client's payments
 */
export function useClientPayments(clientId: number) {
    return useQuery<ClientPayment[]>({
        queryKey: ['client-payments', clientId],
        queryFn: async () => {
            const response = await endpoints.payments.list({ client_id: clientId });
            const data = response.data;
            return Array.isArray(data) ? data : data.payments || [];
        },
        enabled: !!clientId && clientId > 0,
    });
}

/**
 * Composite hook to fetch all client detail data at once
 */
export function useClientDetail(id: number) {
    const clientQuery = useClient(id);
    const contactsQuery = useClientContacts(id);
    const projectsQuery = useClientProjects(id);
    const paymentsQuery = useClientPayments(id);

    return {
        client: clientQuery.data,
        contacts: contactsQuery.data || [],
        projects: projectsQuery.data || [],
        payments: paymentsQuery.data || [],
        isLoading: clientQuery.isLoading,
        isError: clientQuery.isError || contactsQuery.isError,
        error: clientQuery.error || contactsQuery.error,
        refetch: () => {
            clientQuery.refetch();
            contactsQuery.refetch();
            projectsQuery.refetch();
            paymentsQuery.refetch();
        },
    };
}

/**
 * Mutation hooks for client CRUD operations
 */
export function useClientMutations() {
    const queryClient = useQueryClient();

    const createClient = useMutation({
        mutationFn: (data: Partial<OfficeClient>) => endpoints.clients.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['office-clients'] });
        },
    });

    const updateClient = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<OfficeClient> }) =>
            endpoints.clients.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['office-clients'] });
            queryClient.invalidateQueries({ queryKey: ['office-client', id] });
        },
    });

    const deleteClient = useMutation({
        mutationFn: (id: number) => endpoints.clients.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['office-clients'] });
        },
    });

    const createContact = useMutation({
        mutationFn: ({ clientId, data }: { clientId: number; data: Partial<ClientContact> }) =>
            endpoints.clients.createContact(clientId, data),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: ['client-contacts', clientId] });
        },
    });

    const updateContact = useMutation({
        mutationFn: ({
            clientId,
            contactId,
            data,
        }: {
            clientId: number;
            contactId: number;
            data: Partial<ClientContact>;
        }) => endpoints.clients.updateContact(clientId, contactId, data),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: ['client-contacts', clientId] });
        },
    });

    const deleteContact = useMutation({
        mutationFn: ({ clientId, contactId }: { clientId: number; contactId: number }) =>
            endpoints.clients.deleteContact(clientId, contactId),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: ['client-contacts', clientId] });
        },
    });

    return {
        createClient,
        updateClient,
        deleteClient,
        createContact,
        updateContact,
        deleteContact,
    };
}

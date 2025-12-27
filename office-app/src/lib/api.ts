import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/office/login';
        }
        return Promise.reject(error);
    }
);

// Types for Office CRM
export interface OfficeClient {
    id: number;
    name: string;
    fiscalName?: string;
    rfc?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    status: 'prospect' | 'active' | 'inactive' | 'churned';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface OfficeContact {
    id: number;
    clientId: number;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    isPrimary: boolean;
}

export interface OfficePayment {
    id: number;
    clientId: number;
    projectId?: number;
    amount: number;
    currency: string;
    concept: string;
    status: 'pending' | 'paid' | 'overdue' | 'cancelled';
    dueDate?: string;
    paidAt?: string;
}

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    language: string;
    dashboardLayout: string;
    notifications: Record<string, boolean>;
}

// API endpoints
export const endpoints = {
    // Dashboard
    dashboard: () => api.get('/public/dashboard'),

    // Projects
    projects: {
        list: () => api.get('/public/projects'),
        get: (id: number) => api.get(`/projects/${id}`),
        create: (data: unknown) => api.post('/projects', data),
        update: (id: number, data: unknown) => api.put(`/projects/${id}`, data),
    },

    // Tasks
    tasks: {
        list: (params?: Record<string, unknown>) => api.get('/public/tasks', { params }),
        get: (id: number) => api.get(`/tasks/${id}`),
        create: (data: unknown) => api.post('/tasks', data),
        update: (id: number, data: unknown) => api.put(`/tasks/${id}`, data),
        complete: (id: number) => api.put(`/tasks/${id}/complete`),
    },

    // Agents
    agents: {
        list: () => api.get('/agents'),
        get: (id: number) => api.get(`/agents/${id}`),
    },

    // Auth
    auth: {
        login: (credentials: { username: string; password: string }) =>
            api.post('/auth/login', credentials),
        logout: () => api.post('/auth/logout'),
        verify: () => api.get('/auth/verify'),
    },

    // Office CRM
    office: {
        // Dashboard
        dashboard: () => api.get('/office/dashboard'),

        // Clients
        clients: {
            list: (params?: { status?: string; search?: string }) =>
                api.get('/office/clients', { params }),
            get: (id: number) => api.get(`/office/clients/${id}`),
            create: (data: Partial<OfficeClient>) => api.post('/office/clients', data),
            update: (id: number, data: Partial<OfficeClient>) =>
                api.put(`/office/clients/${id}`, data),
            delete: (id: number) => api.delete(`/office/clients/${id}`),
            stats: () => api.get('/office/clients/stats'),
        },

        // Contacts
        contacts: {
            list: (clientId: number) => api.get(`/office/clients/${clientId}/contacts`),
            create: (clientId: number, data: Partial<OfficeContact>) =>
                api.post(`/office/clients/${clientId}/contacts`, data),
            update: (clientId: number, contactId: number, data: Partial<OfficeContact>) =>
                api.put(`/office/clients/${clientId}/contacts/${contactId}`, data),
            delete: (clientId: number, contactId: number) =>
                api.delete(`/office/clients/${clientId}/contacts/${contactId}`),
        },

        // Payments
        payments: {
            list: (params?: { clientId?: number; status?: string }) =>
                api.get('/office/payments', { params }),
            get: (id: number) => api.get(`/office/payments/${id}`),
            create: (data: Partial<OfficePayment>) => api.post('/office/payments', data),
            update: (id: number, data: Partial<OfficePayment>) =>
                api.put(`/office/payments/${id}`, data),
            markPaid: (id: number) => api.put(`/office/payments/${id}/paid`),
        },

        // Permissions
        permissions: {
            list: () => api.get('/office/permissions'),
            check: (permission: string) =>
                api.get(`/office/permissions/check/${permission}`),
            my: () => api.get('/office/permissions/my'),
        },

        // User Preferences
        preferences: {
            get: () => api.get('/office/preferences'),
            update: (data: Partial<UserPreferences>) =>
                api.put('/office/preferences', data),
        },
    },
};

export default api;

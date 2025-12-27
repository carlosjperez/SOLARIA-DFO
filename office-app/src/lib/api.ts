import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Only use credentials for same-origin requests (proxy mode)
    withCredentials: API_BASE_URL.startsWith('/'),
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
        delete: (id: number) => api.delete(`/projects/${id}`),
        // Project related data
        getClient: (id: number) => api.get(`/projects/${id}/client`),
        getDocuments: (id: number) => api.get(`/projects/${id}/documents`),
        getEpics: (id: number) => api.get(`/projects/${id}/epics`),
        getSprints: (id: number) => api.get(`/projects/${id}/sprints`),
    },

    // Tasks
    tasks: {
        list: (params?: Record<string, unknown>) => api.get('/public/tasks', { params }),
        get: (id: number) => api.get(`/tasks/${id}`),
        create: (data: unknown) => api.post('/tasks', data),
        update: (id: number, data: unknown) => api.put(`/tasks/${id}`, data),
        complete: (id: number) => api.put(`/tasks/${id}/complete`),
        getItems: (id: number) => api.get(`/tasks/${id}/items`),
    },

    // Agents
    agents: {
        list: () => api.get('/agents'),
        get: (id: number) => api.get(`/agents/${id}`),
        getPerformance: (id: number) => api.get(`/agents/${id}/performance`),
        getTasks: (agentId: number) => api.get('/tasks', { params: { agent_id: agentId } }),
    },

    // Office Clients
    clients: {
        list: () => api.get('/office/clients'),
        get: (id: number) => api.get(`/office/clients/${id}`),
        create: (data: unknown) => api.post('/office/clients', data),
        update: (id: number, data: unknown) => api.put(`/office/clients/${id}`, data),
        delete: (id: number) => api.delete(`/office/clients/${id}`),
        // Client related data
        getContacts: (id: number) => api.get(`/office/clients/${id}/contacts`),
        createContact: (clientId: number, data: unknown) => api.post(`/office/clients/${clientId}/contacts`, data),
        updateContact: (clientId: number, contactId: number, data: unknown) =>
            api.put(`/office/clients/${clientId}/contacts/${contactId}`, data),
        deleteContact: (clientId: number, contactId: number) =>
            api.delete(`/office/clients/${clientId}/contacts/${contactId}`),
        getProjects: (id: number) => api.get(`/office/clients/${id}/projects`),
    },

    // Office Payments
    payments: {
        list: (params?: Record<string, unknown>) => api.get('/office/payments', { params }),
        get: (id: number) => api.get(`/office/payments/${id}`),
        create: (data: unknown) => api.post('/office/payments', data),
        update: (id: number, data: unknown) => api.put(`/office/payments/${id}`, data),
    },

    // Activity Logs
    logs: {
        list: (params?: Record<string, unknown>) => api.get('/logs', { params }),
        audit: (params?: Record<string, unknown>) => api.get('/logs/audit', { params }),
    },

    // Auth
    auth: {
        login: (credentials: { username: string; password: string }) =>
            api.post('/auth/login', credentials),
        logout: () => api.post('/auth/logout'),
        verify: () => api.get('/auth/verify'),
    },
};

export default api;

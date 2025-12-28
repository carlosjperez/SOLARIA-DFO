import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Convert snake_case to camelCase
function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Recursively transform object keys from snake_case to camelCase
function transformKeys(obj: unknown): unknown {
    if (Array.isArray(obj)) {
        return obj.map(transformKeys);
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            const camelKey = snakeToCamel(key);
            result[camelKey] = transformKeys(value);
        }
        return result;
    }
    return obj;
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to transform snake_case to camelCase and handle auth errors
api.interceptors.response.use(
    (response) => {
        // Transform response data from snake_case to camelCase
        if (response.data) {
            response.data = transformKeys(response.data);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            // Use import.meta.env.BASE_URL for correct path in subdirectory deployments
            window.location.href = `${import.meta.env.BASE_URL}login`;
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (username: string, password: string) =>
        api.post('/auth/login', { username, password }),
    verify: () => api.get('/auth/verify'),
    logout: () => api.post('/auth/logout'),
};

// Projects API
export const projectsApi = {
    getAll: () => api.get('/projects'),
    getById: (id: number) => api.get(`/projects/${id}`),
    create: (data: Record<string, unknown>) => api.post('/projects', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/projects/${id}`, data),
    delete: (id: number) => api.delete(`/projects/${id}`),
    checkCode: (code: string) => api.get(`/projects/check-code/${code}`),
};

// Epics API
export const epicsApi = {
    getByProject: (projectId: number) => api.get(`/projects/${projectId}/epics`),
    getById: (id: number) => api.get(`/epics/${id}`),
    create: (projectId: number, data: Record<string, unknown>) =>
        api.post(`/projects/${projectId}/epics`, data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/epics/${id}`, data),
    delete: (id: number) => api.delete(`/epics/${id}`),
};

// Sprints API
export const sprintsApi = {
    getByProject: (projectId: number) => api.get(`/projects/${projectId}/sprints`),
    getById: (id: number) => api.get(`/sprints/${id}`),
    getFullHierarchy: (id: number) => api.get(`/sprints/${id}/full`),
    create: (projectId: number, data: Record<string, unknown>) =>
        api.post(`/projects/${projectId}/sprints`, data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/sprints/${id}`, data),
    delete: (id: number) => api.delete(`/sprints/${id}`),
};

// Tasks API
export const tasksApi = {
    getAll: (params?: Record<string, unknown>) => api.get('/tasks', { params }),
    getById: (id: number) => api.get(`/tasks/${id}`),
    create: (data: Record<string, unknown>) => api.post('/tasks', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/tasks/${id}`, data),
    complete: (id: number, notes?: string) => api.put(`/tasks/${id}/complete`, { notes }),
    delete: (id: number) => api.delete(`/tasks/${id}`),
    getItems: (taskId: number) => api.get(`/tasks/${taskId}/items`),
    createItems: (taskId: number, items: unknown[]) => api.post(`/tasks/${taskId}/items`, { items }),
    completeItem: (taskId: number, itemId: number, data?: Record<string, unknown>) =>
        api.put(`/tasks/${taskId}/items/${itemId}/complete`, data),
    // Tags API
    getTags: (taskId: number) => api.get(`/tasks/${taskId}/tags`),
    addTag: (taskId: number, tagId: number) => api.post(`/tasks/${taskId}/tags`, { tag_id: tagId }),
    addTagByName: (taskId: number, tagName: string) => api.post(`/tasks/${taskId}/tags`, { tag_name: tagName }),
    removeTag: (taskId: number, tagId: number) => api.delete(`/tasks/${taskId}/tags/${tagId}`),
};

// Tags API
export const tagsApi = {
    getAll: () => api.get('/tags'),
    getTasksByTag: (tagName: string, params?: Record<string, unknown>) =>
        api.get(`/tasks/by-tag/${tagName}`, { params }),
};

// Agents API
export const agentsApi = {
    getAll: () => api.get('/agents'),
    getById: (id: number) => api.get(`/agents/${id}`),
    updateStatus: (id: number, status: string, currentTask?: string) =>
        api.put(`/agents/${id}/status`, { status, currentTask }),
    getTasks: (id: number, status?: string) =>
        api.get(`/agents/${id}/tasks`, { params: { status } }),
};

// Memories API
export const memoriesApi = {
    getAll: (params?: Record<string, unknown>) => api.get('/memories', { params }),
    getById: (id: number) => api.get(`/memories/${id}`),
    search: (query: string, tags?: string[]) =>
        api.get('/memories/search', { params: { q: query, tags: tags?.join(',') } }),
    create: (data: Record<string, unknown>) => api.post('/memories', data),
    update: (id: number, data: Record<string, unknown>) => api.put(`/memories/${id}`, data),
    delete: (id: number) => api.delete(`/memories/${id}`),
    boost: (id: number, amount?: number) => api.post(`/memories/${id}/boost`, { amount }),
    getRelated: (id: number) => api.get(`/memories/${id}/related`),
    getTags: () => api.get('/memories/tags'),
    getStats: () => api.get('/memories/stats'),
};

// Dashboard API
export const dashboardApi = {
    getOverview: () => api.get('/dashboard/overview'),
    getAlerts: () => api.get('/dashboard/alerts'),
    getActivity: (limit?: number) => api.get('/activity', { params: { limit } }),
};

// C-Suite API
export const csuiteApi = {
    getCEO: () => api.get('/csuite/ceo'),
    getCTO: () => api.get('/csuite/cto'),
    getCOO: () => api.get('/csuite/coo'),
    getCFO: () => api.get('/csuite/cfo'),
};

// Inline Documents API
export const documentsApi = {
    getByProject: (projectId: number, type?: string) =>
        api.get(`/projects/${projectId}/documents/inline`, { params: { type } }),
    getById: (id: number) => api.get(`/documents/inline/${id}`),
    create: (projectId: number, data: Record<string, unknown>) =>
        api.post(`/projects/${projectId}/documents/inline`, data),
    update: (id: number, data: Record<string, unknown>) =>
        api.put(`/documents/inline/${id}`, data),
    delete: (id: number) => api.delete(`/documents/inline/${id}`),
    search: (query: string, projectId?: number, type?: string) =>
        api.get('/documents/inline/search', { params: { query, project_id: projectId, type } }),
};

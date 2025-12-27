import axios from 'axios';
import { useAuthStore } from '@/store/auth';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
// Convert snake_case to camelCase
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
// Recursively transform object keys from snake_case to camelCase
function transformKeys(obj) {
    if (Array.isArray(obj)) {
        return obj.map(transformKeys);
    }
    if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
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
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
// Response interceptor to transform snake_case to camelCase and handle auth errors
api.interceptors.response.use((response) => {
    // Transform response data from snake_case to camelCase
    if (response.data) {
        response.data = transformKeys(response.data);
    }
    return response;
}, (error) => {
    if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        // Use import.meta.env.BASE_URL for correct path in subdirectory deployments
        window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    return Promise.reject(error);
});
// Auth API
export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    verify: () => api.get('/auth/verify'),
    logout: () => api.post('/auth/logout'),
};
// Projects API
export const projectsApi = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    checkCode: (code) => api.get(`/projects/check-code/${code}`),
};
// Epics API
export const epicsApi = {
    getByProject: (projectId) => api.get(`/projects/${projectId}/epics`),
    create: (projectId, data) => api.post(`/projects/${projectId}/epics`, data),
    update: (id, data) => api.put(`/epics/${id}`, data),
    delete: (id) => api.delete(`/epics/${id}`),
};
// Sprints API
export const sprintsApi = {
    getByProject: (projectId) => api.get(`/projects/${projectId}/sprints`),
    create: (projectId, data) => api.post(`/projects/${projectId}/sprints`, data),
    update: (id, data) => api.put(`/sprints/${id}`, data),
    delete: (id) => api.delete(`/sprints/${id}`),
};
// Tasks API
export const tasksApi = {
    getAll: (params) => api.get('/tasks', { params }),
    getById: (id) => api.get(`/tasks/${id}`),
    create: (data) => api.post('/tasks', data),
    update: (id, data) => api.put(`/tasks/${id}`, data),
    complete: (id, notes) => api.put(`/tasks/${id}/complete`, { notes }),
    delete: (id) => api.delete(`/tasks/${id}`),
    getItems: (taskId) => api.get(`/tasks/${taskId}/items`),
    createItems: (taskId, items) => api.post(`/tasks/${taskId}/items`, { items }),
    completeItem: (taskId, itemId, data) => api.put(`/tasks/${taskId}/items/${itemId}/complete`, data),
    // Tags API
    getTags: (taskId) => api.get(`/tasks/${taskId}/tags`),
    addTag: (taskId, tagId) => api.post(`/tasks/${taskId}/tags`, { tag_id: tagId }),
    addTagByName: (taskId, tagName) => api.post(`/tasks/${taskId}/tags`, { tag_name: tagName }),
    removeTag: (taskId, tagId) => api.delete(`/tasks/${taskId}/tags/${tagId}`),
};
// Tags API
export const tagsApi = {
    getAll: () => api.get('/tags'),
    getTasksByTag: (tagName, params) => api.get(`/tasks/by-tag/${tagName}`, { params }),
};
// Agents API
export const agentsApi = {
    getAll: () => api.get('/agents'),
    getById: (id) => api.get(`/agents/${id}`),
    updateStatus: (id, status, currentTask) => api.put(`/agents/${id}/status`, { status, currentTask }),
    getTasks: (id, status) => api.get(`/agents/${id}/tasks`, { params: { status } }),
};
// Memories API
export const memoriesApi = {
    getAll: (params) => api.get('/memories', { params }),
    getById: (id) => api.get(`/memories/${id}`),
    search: (query, tags) => api.get('/memories/search', { params: { q: query, tags: tags?.join(',') } }),
    create: (data) => api.post('/memories', data),
    update: (id, data) => api.put(`/memories/${id}`, data),
    delete: (id) => api.delete(`/memories/${id}`),
    boost: (id, amount) => api.post(`/memories/${id}/boost`, { amount }),
    getRelated: (id) => api.get(`/memories/${id}/related`),
    getTags: () => api.get('/memories/tags'),
    getStats: () => api.get('/memories/stats'),
};
// Dashboard API
export const dashboardApi = {
    getOverview: () => api.get('/dashboard/overview'),
    getAlerts: () => api.get('/dashboard/alerts'),
    getActivity: (limit) => api.get('/activity', { params: { limit } }),
};
// C-Suite API
export const csuiteApi = {
    getCEO: () => api.get('/csuite/ceo'),
    getCTO: () => api.get('/csuite/cto'),
    getCOO: () => api.get('/csuite/coo'),
    getCFO: () => api.get('/csuite/cfo'),
};
//# sourceMappingURL=api.js.map
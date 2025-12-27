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
};

export default api;

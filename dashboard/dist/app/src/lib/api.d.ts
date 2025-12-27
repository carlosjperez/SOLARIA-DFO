export declare const api: import("axios").AxiosInstance;
export declare const authApi: {
    login: (username: string, password: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    verify: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    logout: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const projectsApi: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getById: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    checkCode: (code: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const epicsApi: {
    getByProject: (projectId: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (projectId: number, data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const sprintsApi: {
    getByProject: (projectId: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (projectId: number, data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const tasksApi: {
    getAll: (params?: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getById: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    complete: (id: number, notes?: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getItems: (taskId: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    createItems: (taskId: number, items: unknown[]) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    completeItem: (taskId: number, itemId: number, data?: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getTags: (taskId: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    addTag: (taskId: number, tagId: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    addTagByName: (taskId: number, tagName: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    removeTag: (taskId: number, tagId: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const tagsApi: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getTasksByTag: (tagName: string, params?: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const agentsApi: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getById: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    updateStatus: (id: number, status: string, currentTask?: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getTasks: (id: number, status?: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const memoriesApi: {
    getAll: (params?: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getById: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    search: (query: string, tags?: string[]) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: Record<string, unknown>) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    boost: (id: number, amount?: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getRelated: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getTags: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getStats: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const dashboardApi: {
    getOverview: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getAlerts: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getActivity: (limit?: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export declare const csuiteApi: {
    getCEO: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getCTO: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getCOO: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getCFO: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};

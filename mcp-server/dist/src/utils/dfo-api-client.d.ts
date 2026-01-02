/**
 * DFO Dashboard API Client
 *
 * @author ECO-Lambda | DFO 4.0 Refactor
 * @date 2026-01-01
 * @task DFO-206
 *
 * HTTP client for interacting with Dashboard API REST endpoints.
 * Provides JWT authentication, retry logic, and error handling.
 */
interface ApiClientConfig {
    baseUrl: string;
    token?: string;
    retries?: number;
    retryDelayMs?: number;
    timeout?: number;
}
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
        suggestion?: string;
    };
    metadata?: {
        timestamp: string;
        request_id?: string;
        execution_time_ms?: number;
        version?: string;
    };
}
interface QueueJobPayload {
    taskId: number;
    agentId: number;
    metadata?: {
        priority?: 'critical' | 'high' | 'medium' | 'low';
        estimatedHours?: number;
        retryCount?: number;
    };
    context?: {
        dependencies?: number[];
        relatedTasks?: number[];
        memoryIds?: number[];
    };
    mcpConfigs?: Array<{
        serverName: string;
        serverUrl: string;
        authType: 'bearer' | 'basic' | 'api_key' | 'none';
        authCredentials?: Record<string, unknown>;
        enabled: boolean;
    }>;
}
interface JobStatusResponse {
    jobId: string;
    taskId: number;
    taskCode: string;
    agentId: number;
    agentName?: string;
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'cancelled';
    progress: number;
    result?: any;
    error?: any;
    startedAt?: string;
    completedAt?: string;
}
interface CancelJobResponse {
    jobId: string;
    status: 'cancelled';
    cancelledAt: string;
}
interface WorkerStatusResponse {
    workers: Array<{
        name: string;
        status: 'active' | 'idle' | 'stopped';
        currentJob?: string;
        processedJobs: number;
    }>;
    queue: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    };
}
export declare class DFOApiClient {
    private config;
    constructor(config: ApiClientConfig);
    /**
     * Make HTTP request with retry logic and exponential backoff
     */
    private request;
    /**
     * Queue a new agent execution job
     * POST /api/agent-execution/queue
     */
    queueJob(payload: QueueJobPayload): Promise<ApiResponse<{
        jobId: string;
        taskId: number;
        taskCode: string;
        agentId: number;
        agentName: string;
        projectId: number;
        status: string;
        priority: string;
        queuedAt: string;
    }>>;
    /**
     * Get job status
     * GET /api/agent-execution/jobs/:id
     */
    getJobStatus(jobId: string): Promise<ApiResponse<JobStatusResponse>>;
    /**
     * Cancel a job
     * POST /api/agent-execution/jobs/:id/cancel
     */
    cancelJob(jobId: string): Promise<ApiResponse<CancelJobResponse>>;
    /**
     * Get worker status
     * GET /api/agent-execution/workers
     */
    getWorkerStatus(): Promise<ApiResponse<WorkerStatusResponse>>;
    /**
     * Update JWT token
     */
    setToken(token: string): void;
    /**
     * Get current configuration (for debugging)
     */
    getConfig(): Readonly<ApiClientConfig>;
}
/**
 * Get singleton DFO API client instance
 */
export declare function getDFOApiClient(config?: ApiClientConfig): DFOApiClient;
/**
 * Reset singleton (for testing)
 */
export declare function resetDFOApiClient(): void;
export {};

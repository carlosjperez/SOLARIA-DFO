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

// ============================================================================
// Types
// ============================================================================

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

interface ListJobsResponse {
    jobs: JobStatusResponse[];
    count: number;
    filters: {
        projectId?: number;
        agentId?: number;
        statuses: string[];
        limit: number;
    };
}

// ============================================================================
// GitHub Actions Types
// ============================================================================

interface TriggerWorkflowPayload {
    owner: string;
    repo: string;
    workflowId: string;
    ref: string;
    inputs?: Record<string, string | number | boolean>;
    projectId: number;
    taskId?: number;
}

interface TriggerWorkflowResponse {
    workflowId: number;
    runId: number;
    githubRunId: number;
    owner: string;
    repo: string;
    ref: string;
    triggeredAt: string;
}

interface WorkflowStatusResponse {
    runId: number;
    githubRunId: number;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
    runNumber: number;
    htmlUrl: string;
    startedAt: string;
    completedAt?: string;
    durationSeconds?: number;
}

interface CreateIssuePayload {
    owner: string;
    repo: string;
    title: string;
    body: string;
    labels?: string[];
    assignees?: string[];
    taskId: number;
    projectId: number;
}

interface CreateIssueResponse {
    issueNumber: number;
    issueUrl: string;
    taskLinkId: number;
}

interface CreatePRPayload {
    owner: string;
    repo: string;
    title: string;
    body: string;
    head: string;
    base: string;
    labels?: string[];
    assignees?: string[];
    taskId: number;
    projectId: number;
}

interface CreatePRResponse {
    prNumber: number;
    prUrl: string;
    taskLinkId: number;
    head: string;
    base: string;
}

// ============================================================================
// DFO API Client Class
// ============================================================================

export class DFOApiClient {
    private config: Required<ApiClientConfig>;

    constructor(config: ApiClientConfig) {
        this.config = {
            baseUrl: config.baseUrl || process.env.DFO_API_URL || 'https://dfo.solaria.agency',
            token: config.token || process.env.DFO_API_TOKEN || '',
            retries: config.retries ?? 3,
            retryDelayMs: config.retryDelayMs ?? 1000,
            timeout: config.timeout ?? 30000,
        };

        // Remove trailing slash from baseUrl
        this.config.baseUrl = this.config.baseUrl.replace(/\/$/, '');
    }

    /**
     * Make HTTP request with retry logic and exponential backoff
     */
    private async request<T = any>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        body?: any
    ): Promise<ApiResponse<T>> {
        const url = `${this.config.baseUrl}${endpoint}`;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                };

                if (this.config.token) {
                    headers['Authorization'] = `Bearer ${this.config.token}`;
                }

                const response = await fetch(url, {
                    method,
                    headers,
                    body: body ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // Parse JSON response
                const data = (await response.json()) as ApiResponse<T>;

                // Handle HTTP errors
                if (!response.ok) {
                    // If response has error structure, return it
                    if (data.error) {
                        return data;
                    }

                    // Otherwise create error response
                    return {
                        success: false,
                        error: {
                            code: `HTTP_${response.status}`,
                            message: response.statusText || 'Request failed',
                            details: { status: response.status, url },
                        },
                    };
                }

                return data;
            } catch (error: any) {
                lastError = error;

                // Don't retry on auth errors (401, 403)
                if (error.message?.includes('401') || error.message?.includes('403')) {
                    return {
                        success: false,
                        error: {
                            code: 'AUTH_ERROR',
                            message: 'Authentication failed',
                            details: { originalError: error.message },
                            suggestion: 'Check DFO_API_TOKEN environment variable',
                        },
                    };
                }

                // If not last attempt, wait and retry with exponential backoff
                if (attempt < this.config.retries) {
                    const delay = this.config.retryDelayMs * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                }
            }
        }

        // All retries exhausted
        return {
            success: false,
            error: {
                code: 'REQUEST_FAILED',
                message: lastError?.message || 'Failed to connect to DFO API',
                details: {
                    url,
                    retries: this.config.retries,
                    lastError: lastError?.message,
                },
                suggestion: 'Check that DFO API is running and accessible',
            },
        };
    }

    // ========================================================================
    // Agent Execution API Methods
    // ========================================================================

    /**
     * Queue a new agent execution job
     * POST /api/agent-execution/queue
     */
    async queueJob(payload: QueueJobPayload): Promise<ApiResponse<{
        jobId: string;
        taskId: number;
        taskCode: string;
        agentId: number;
        agentName: string;
        projectId: number;
        status: string;
        priority: string;
        queuedAt: string;
    }>> {
        return this.request('POST', '/api/agent-execution/queue', payload);
    }

    /**
     * Get job status
     * GET /api/agent-execution/jobs/:id
     */
    async getJobStatus(jobId: string): Promise<ApiResponse<JobStatusResponse>> {
        return this.request('GET', `/api/agent-execution/jobs/${jobId}`);
    }

    /**
     * Cancel a job
     * POST /api/agent-execution/jobs/:id/cancel
     */
    async cancelJob(jobId: string): Promise<ApiResponse<CancelJobResponse>> {
        return this.request('POST', `/api/agent-execution/jobs/${jobId}/cancel`);
    }

    /**
     * List jobs with optional filtering
     * GET /api/agent-execution/jobs?projectId=X&agentId=Y&limit=100&statuses=waiting,active
     */
    async listJobs(options: {
        projectId?: number;
        agentId?: number;
        limit?: number;
        statuses?: string[];
    } = {}): Promise<ApiResponse<ListJobsResponse>> {
        const params = new URLSearchParams();

        if (options.projectId !== undefined) {
            params.append('projectId', options.projectId.toString());
        }

        if (options.agentId !== undefined) {
            params.append('agentId', options.agentId.toString());
        }

        if (options.limit !== undefined) {
            params.append('limit', options.limit.toString());
        }

        if (options.statuses && options.statuses.length > 0) {
            params.append('statuses', options.statuses.join(','));
        }

        const queryString = params.toString();
        const endpoint = queryString ? `/api/agent-execution/jobs?${queryString}` : '/api/agent-execution/jobs';

        return this.request('GET', endpoint);
    }

    /**
     * Get worker status
     * GET /api/agent-execution/workers
     */
    async getWorkerStatus(): Promise<ApiResponse<WorkerStatusResponse>> {
        return this.request('GET', '/api/agent-execution/workers');
    }

    // ========================================================================
    // GitHub Actions API Methods
    // ========================================================================

    /**
     * Trigger a GitHub Actions workflow
     * POST /api/github/trigger-workflow
     */
    async triggerWorkflow(payload: TriggerWorkflowPayload): Promise<ApiResponse<TriggerWorkflowResponse>> {
        return this.request('POST', '/api/github/trigger-workflow', payload);
    }

    /**
     * Get workflow run status
     * GET /api/github/workflow-status/:run_id
     */
    async getWorkflowStatus(runId: number): Promise<ApiResponse<WorkflowStatusResponse>> {
        return this.request('GET', `/api/github/workflow-status/${runId}`);
    }

    /**
     * Create a GitHub issue from a task
     * POST /api/github/create-issue
     */
    async createIssue(payload: CreateIssuePayload): Promise<ApiResponse<CreateIssueResponse>> {
        return this.request('POST', '/api/github/create-issue', payload);
    }

    /**
     * Create a GitHub pull request from a task
     * POST /api/github/create-pr
     */
    async createPR(payload: CreatePRPayload): Promise<ApiResponse<CreatePRResponse>> {
        return this.request('POST', '/api/github/create-pr', payload);
    }

    // ========================================================================
    // Utility Methods
    // ========================================================================

    /**
     * Update JWT token
     */
    setToken(token: string): void {
        this.config.token = token;
    }

    /**
     * Get current configuration (for debugging)
     */
    getConfig(): Readonly<ApiClientConfig> {
        return {
            baseUrl: this.config.baseUrl,
            retries: this.config.retries,
            retryDelayMs: this.config.retryDelayMs,
            timeout: this.config.timeout,
            // Don't expose token
            token: this.config.token ? '***' : undefined,
        };
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let _instance: DFOApiClient | null = null;

/**
 * Get singleton DFO API client instance
 */
export function getDFOApiClient(config?: ApiClientConfig): DFOApiClient {
    if (!_instance) {
        _instance = new DFOApiClient(config || {
            baseUrl: process.env.DFO_API_URL || 'https://dfo.solaria.agency',
            token: process.env.DFO_API_TOKEN,
        });
    }
    return _instance;
}

/**
 * Reset singleton (for testing)
 */
export function resetDFOApiClient(): void {
    _instance = null;
}

// ============================================================================
// Type Exports
// ============================================================================

export type {
    ApiClientConfig,
    ApiResponse,
    QueueJobPayload,
    JobStatusResponse,
    CancelJobResponse,
    WorkerStatusResponse,
    ListJobsResponse,
    TriggerWorkflowPayload,
    TriggerWorkflowResponse,
    WorkflowStatusResponse,
    CreateIssuePayload,
    CreateIssueResponse,
    CreatePRPayload,
    CreatePRResponse,
};

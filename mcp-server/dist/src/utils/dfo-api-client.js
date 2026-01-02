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
// DFO API Client Class
// ============================================================================
export class DFOApiClient {
    config;
    constructor(config) {
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
    async request(method, endpoint, body) {
        const url = `${this.config.baseUrl}${endpoint}`;
        let lastError = null;
        for (let attempt = 0; attempt <= this.config.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                const headers = {
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
                const data = (await response.json());
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
            }
            catch (error) {
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
    async queueJob(payload) {
        return this.request('POST', '/api/agent-execution/queue', payload);
    }
    /**
     * Get job status
     * GET /api/agent-execution/jobs/:id
     */
    async getJobStatus(jobId) {
        return this.request('GET', `/api/agent-execution/jobs/${jobId}`);
    }
    /**
     * Cancel a job
     * POST /api/agent-execution/jobs/:id/cancel
     */
    async cancelJob(jobId) {
        return this.request('POST', `/api/agent-execution/jobs/${jobId}/cancel`);
    }
    /**
     * Get worker status
     * GET /api/agent-execution/workers
     */
    async getWorkerStatus() {
        return this.request('GET', '/api/agent-execution/workers');
    }
    // ========================================================================
    // Utility Methods
    // ========================================================================
    /**
     * Update JWT token
     */
    setToken(token) {
        this.config.token = token;
    }
    /**
     * Get current configuration (for debugging)
     */
    getConfig() {
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
let _instance = null;
/**
 * Get singleton DFO API client instance
 */
export function getDFOApiClient(config) {
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
export function resetDFOApiClient() {
    _instance = null;
}
//# sourceMappingURL=dfo-api-client.js.map
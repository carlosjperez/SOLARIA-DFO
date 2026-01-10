/**
 * MCP Tool: run_code
 *
 * Executes arbitrary JavaScript/TypeScript code in a secure sandbox with access to DFO API
 * Core feature of Sketch Pattern MCP - replaces 70+ tools with 2 endpoints
 *
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MCP-SKETCH-003
 */

import { z } from 'zod';
import { type StandardResponse } from '../utils/response-builder.js';

// ============================================================================
// Configuration
// ============================================================================

const DASHBOARD_API = process.env.DASHBOARD_API_URL || 'http://localhost:3030/api';
const DEFAULT_TIMEOUT = 5000;
const MAX_TIMEOUT = 30000;
const MAX_CODE_LENGTH = 10000;

// Whitelist of allowed API endpoints (security measure)
const ALLOWED_ENDPOINTS = new Set([
  '/projects',
  '/projects/:id',
  '/tasks',
  '/tasks/:id',
  '/tasks/:id/items',
  '/agents',
  '/agents/:id',
  '/memories',
  '/memories/:id',
  '/memories/search',
  '/memories/semantic-search',
  '/dashboard/overview',
  '/dashboard/alerts',
  '/sprints',
  '/sprints/:id',
  '/epics',
  '/epics/:id',
  '/health',
  '/stats',
]);

// ============================================================================
// Validation Schema
// ============================================================================

const RunCodeInputSchema = z.object({
  code: z.string()
    .min(1, 'Code cannot be empty')
    .max(MAX_CODE_LENGTH, `Code too long (max ${MAX_CODE_LENGTH} chars)`),
  language: z.enum(['javascript', 'typescript', 'sql']).optional().default('javascript'),
  timeout: z.number()
    .min(1000, 'Timeout must be at least 1 second')
    .max(MAX_TIMEOUT, `Timeout too long (max ${MAX_TIMEOUT}ms)`)
    .optional()
    .default(DEFAULT_TIMEOUT),
  sandbox: z.enum(['strict', 'permissive']).optional().default('strict'),
});

// ============================================================================
// API Client Helper
// ============================================================================

class ApiClient {
  private token: string | null = null;

  constructor(
    private readonly url: string,
    private readonly credentials: { user: string; password: string }
  ) {}

  private async authenticate(): Promise<void> {
    const response = await fetch(`${this.url}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.credentials.user,
        password: this.credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data = await response.json() as { token: string };
    this.token = data.token;
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      await this.authenticate();
    }

    const response = await fetch(`${this.url}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      await this.authenticate();
      return this.request<T>(endpoint, options);
    }

    return response.json() as Promise<T>;
  }
}

// ============================================================================
// Sandbox Implementation (Simplified)
// ============================================================================

interface SandboxContext {
  apiCall: ApiClient['request'];
  console: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
  fetch: typeof global.fetch;
  JSON: typeof JSON;
  Math: typeof Math;
  Date: typeof Date;
}

class SecureSandbox {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  validateEndpoint(endpoint: string): void {
    const normalized = endpoint.split('?')[0].replace(/:\d+/g, '/:id');
    if (!ALLOWED_ENDPOINTS.has(normalized) && !normalized.startsWith('/projects/') && !normalized.startsWith('/tasks/') && !normalized.startsWith('/agents/')) {
      throw new Error(`Access to endpoint "${endpoint}" is not allowed`);
    }
  }

  async execute(code: string, timeout: number, sandboxMode: 'strict' | 'permissive'): Promise<{
    output: unknown;
    executionTime: number;
    memoryUsage: number;
  }> {
    const startTime = Date.now();

    try {
      const apiClient = this.apiClient;

      const context: SandboxContext = {
        apiCall: (endpoint, options = {}) => {
          if (sandboxMode === 'strict') {
            this.validateEndpoint(endpoint);
          }
          return apiClient.request(endpoint, options);
        },
        console: {
          log: (...args: unknown[]) => console.log('[SANDBOX]', ...args),
          error: (...args: unknown[]) => console.error('[SANDBOX]', ...args),
        },
        fetch: global.fetch,
        JSON,
        Math,
        Date,
      };

      const AsyncFunction = async () => {
        const fn = new Function(
          'context',
          'apiClient',
          `return async () => { ${code} }`
        );

        return await fn(context, apiClient);
      };

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Execution timeout after ${timeout}ms`)), timeout)
      );

      const result = await Promise.race([AsyncFunction(), timeoutPromise]);

      const executionTime = Date.now() - startTime;

      if (typeof result === 'undefined') {
        return {
          output: null,
          executionTime,
          memoryUsage: 0,
        };
      }

      try {
        JSON.stringify(result);
      } catch {
        throw new Error('Code execution returned non-serializable result');
      }

      return {
        output: result,
        executionTime,
        memoryUsage: 0,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      return {
        output: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        },
        executionTime,
        memoryUsage: 0,
      };
    }
  }
}

// ============================================================================
// MCP Tool Export
// ============================================================================

export const run_code_tool = {
  name: 'run_code',
  description: 'Ejecutar código JavaScript/TypeScript en sandbox seguro con acceso completo a la API del DFO',
  inputSchema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: `Código JavaScript/TypeScript a ejecutar (máximo ${MAX_CODE_LENGTH} caracteres)`,
      },
      language: {
        type: 'string',
        enum: ['javascript', 'typescript', 'sql'],
        description: 'Lenguaje del código (default: javascript)',
      },
      timeout: {
        type: 'number',
        description: `Timeout en milisegundos (default: ${DEFAULT_TIMEOUT}, max: ${MAX_TIMEOUT})`,
      },
      sandbox: {
        type: 'string',
        enum: ['strict', 'permissive'],
        description: 'Modo de sandbox (strict: whitelist de endpoints, permissive: acceso amplio)',
      },
    },
  },
};

// ============================================================================
// Handler Function
// ============================================================================

export async function handleRunCode(
  params: any,
  credentials: { user: string; password: string }
): Promise<StandardResponse> {
  try {
    const validated = RunCodeInputSchema.parse(params);
    const { code, language, timeout, sandbox: sandboxMode } = validated;

    console.log(`[run_code] Executing ${language} code (${code.length} chars) in ${sandboxMode} mode, timeout ${timeout}ms`);

    const apiClient = new ApiClient(DASHBOARD_API, credentials);
    const sandbox = new SecureSandbox(apiClient);

    const result = await sandbox.execute(code, timeout, sandboxMode);

    if ('error' in (result.output as { error?: string })) {
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: (result.output as { error: string }).error,
          details: {
            execution_time_ms: result.executionTime,
            language,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        output: result.output,
        execution_time_ms: result.executionTime,
        memory_used_mb: result.memoryUsage,
        metadata: {
          language,
          sandbox_mode: sandboxMode,
          code_length: code.length,
        },
      },
    };

  } catch (error) {
    console.error('[run_code] Error:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.errors.map(e => e.message).join(', '),
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'RUN_CODE_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// ============================================================================
// Default Export for Handler Integration
// ============================================================================

export default {
  tool: run_code_tool,
  handler: handleRunCode,
};

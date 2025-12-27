/**
 * Standard Response Builder Utilities
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-002
 *
 * Utilities for building consistent JSON responses across all DFO endpoints
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export interface ResponseMetadata {
  timestamp?: string;
  request_id?: string;
  execution_time_ms?: number;
  version?: string;
}

export interface StandardSuccessResponse<T = any> {
  success: true;
  data: T;
  metadata?: ResponseMetadata;
  format?: 'json' | 'human';
  formatted?: string;
}

export interface ErrorObject {
  code: string;
  message: string;
  details?: any;
  field?: string;
  suggestion?: string;
}

export interface StandardErrorResponse {
  success: false;
  error: ErrorObject;
  metadata?: ResponseMetadata;
}

export type StandardResponse<T = any> = StandardSuccessResponse<T> | StandardErrorResponse;

// ============================================================================
// Response Builder Class
// ============================================================================

export class ResponseBuilder {
  private startTime: number;
  private requestId?: string;
  private version: string;

  constructor(options: { requestId?: string; version?: string } = {}) {
    this.startTime = Date.now();
    this.requestId = options.requestId || this.generateRequestId();
    this.version = options.version || '1.0.0';
  }

  /**
   * Build a successful response
   */
  success<T>(data: T, options: {
    format?: 'json' | 'human';
    formatted?: string;
    includeMetadata?: boolean;
  } = {}): StandardSuccessResponse<T> {
    const { format = 'json', formatted, includeMetadata = true } = options;

    const response: StandardSuccessResponse<T> = {
      success: true,
      data,
    };

    if (includeMetadata) {
      response.metadata = {
        timestamp: new Date().toISOString(),
        request_id: this.requestId,
        execution_time_ms: Date.now() - this.startTime,
        version: this.version,
      };
    }

    if (format === 'human' && formatted) {
      response.format = 'human';
      response.formatted = formatted;
    }

    return response;
  }

  /**
   * Build an error response
   */
  error(error: ErrorObject | string, options: {
    includeMetadata?: boolean;
  } = {}): StandardErrorResponse {
    const { includeMetadata = true } = options;

    const errorObj: ErrorObject = typeof error === 'string'
      ? { code: 'UNKNOWN_ERROR', message: error }
      : error;

    const response: StandardErrorResponse = {
      success: false,
      error: errorObj,
    };

    if (includeMetadata) {
      response.metadata = {
        timestamp: new Date().toISOString(),
        request_id: this.requestId,
      };
    }

    return response;
  }

  /**
   * Build error from exception
   */
  errorFromException(error: any, defaultCode: string = 'INTERNAL_ERROR'): StandardErrorResponse {
    // Handle custom errors with code property
    if (error.code && error.message) {
      return this.error({
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return this.error({
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details: error.errors,
        suggestion: 'Check the input parameters and try again',
      });
    }

    // Handle database errors
    if (error.code?.startsWith('ER_')) {
      return this.error({
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        details: { sqlError: error.code, message: error.message },
        suggestion: 'Check database connectivity and query syntax',
      });
    }

    // Generic error
    return this.error({
      code: defaultCode,
      message: error.message || 'An unexpected error occurred',
      details: { error: error.toString() },
    });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Quick success response builder
 */
export function successResponse<T>(
  data: T,
  options?: { format?: 'json' | 'human'; formatted?: string }
): StandardSuccessResponse<T> {
  const builder = new ResponseBuilder();
  return builder.success(data, options);
}

/**
 * Quick error response builder
 */
export function errorResponse(
  code: string,
  message: string,
  details?: any
): StandardErrorResponse {
  const builder = new ResponseBuilder();
  return builder.error({ code, message, details });
}

/**
 * Wrap async endpoint execution with standard error handling
 */
export async function wrapEndpoint<T>(
  executor: () => Promise<T>,
  options: {
    format?: 'json' | 'human';
    formatter?: (data: T) => string;
    version?: string;
  } = {}
): Promise<StandardResponse<T>> {
  const builder = new ResponseBuilder({ version: options.version });

  try {
    const data = await executor();

    const formatted = options.format === 'human' && options.formatter
      ? options.formatter(data)
      : undefined;

    return builder.success(data, {
      format: options.format,
      formatted,
    });
  } catch (error) {
    return builder.errorFromException(error);
  }
}

// ============================================================================
// Common Error Builders
// ============================================================================

export const CommonErrors = {
  notFound: (entity: string, id: number | string): ErrorObject => ({
    code: `${entity.toUpperCase()}_NOT_FOUND`,
    message: `${entity} with ID ${id} not found`,
    details: { entity, id },
    suggestion: `Verify the ${entity} ID exists and try again`,
  }),

  duplicate: (entity: string, field: string, value: any): ErrorObject => ({
    code: `DUPLICATE_${entity.toUpperCase()}`,
    message: `${entity} with ${field} '${value}' already exists`,
    details: { entity, field, value },
    suggestion: 'Use a different value or enable upsert mode',
  }),

  invalidInput: (field: string, reason: string): ErrorObject => ({
    code: 'INVALID_INPUT',
    message: `Invalid ${field}: ${reason}`,
    field,
    suggestion: 'Check the input format and try again',
  }),

  permissionDenied: (action: string, resource: string): ErrorObject => ({
    code: 'PERMISSION_DENIED',
    message: `You don't have permission to ${action} ${resource}`,
    details: { action, resource },
    suggestion: 'Contact your administrator to request access',
  }),

  databaseError: (operation: string): ErrorObject => ({
    code: 'DATABASE_ERROR',
    message: `Database ${operation} failed`,
    suggestion: 'Check database connectivity and try again later',
  }),
};

// ============================================================================
// Response Validation
// ============================================================================

const StandardResponseSchema = z.discriminatedUnion('success', [
  z.object({
    success: z.literal(true),
    data: z.any(),
    metadata: z.object({
      timestamp: z.string().datetime().optional(),
      request_id: z.string().optional(),
      execution_time_ms: z.number().min(0).optional(),
      version: z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/).optional(),
    }).optional(),
    format: z.enum(['json', 'human']).optional(),
    formatted: z.string().optional(),
  }),
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string().min(1),
      message: z.string().min(1),
      details: z.any().optional(),
      field: z.string().optional(),
      suggestion: z.string().optional(),
    }),
    metadata: z.object({
      timestamp: z.string().datetime().optional(),
      request_id: z.string().optional(),
    }).optional(),
  }),
]);

/**
 * Validate a response against the standard schema
 */
export function validateResponse(response: unknown): {
  valid: boolean;
  errors?: z.ZodError;
} {
  try {
    StandardResponseSchema.parse(response);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    return { valid: false };
  }
}

/**
 * Assert response is valid (throws if not)
 */
export function assertValidResponse(response: unknown): asserts response is StandardResponse {
  const result = validateResponse(response);
  if (!result.valid) {
    throw new Error(`Invalid response format: ${JSON.stringify(result.errors)}`);
  }
}

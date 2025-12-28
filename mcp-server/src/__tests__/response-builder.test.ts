/**
 * Response Builder Utilities Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-002
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ResponseBuilder,
  successResponse,
  errorResponse,
  wrapEndpoint,
  CommonErrors,
  validateResponse,
} from '../utils/response-builder';

describe('ResponseBuilder', () => {
  let builder: ResponseBuilder;

  beforeEach(() => {
    builder = new ResponseBuilder({ version: '2.0.0' });
  });

  describe('success responses', () => {
    it('should create basic success response', () => {
      const data = { tasks: [], total: 0 };
      const response = builder.success(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.timestamp).toBeDefined();
      expect(response.metadata?.version).toBe('2.0.0');
    });

    it('should include execution time in metadata', () => {
      const response = builder.success({ test: true });

      expect(response.metadata?.execution_time_ms).toBeGreaterThanOrEqual(0);
    });

    it('should generate unique request IDs', () => {
      const builder1 = new ResponseBuilder();
      const builder2 = new ResponseBuilder();

      const response1 = builder1.success({});
      const response2 = builder2.success({});

      expect(response1.metadata?.request_id).toBeDefined();
      expect(response2.metadata?.request_id).toBeDefined();
      expect(response1.metadata?.request_id).not.toBe(response2.metadata?.request_id);
    });

    it('should support human format with formatted output', () => {
      const data = { tasks: [] };
      const formatted = 'No tasks found.';

      const response = builder.success(data, {
        format: 'human',
        formatted,
      });

      expect(response.format).toBe('human');
      expect(response.formatted).toBe(formatted);
    });

    it('should support disabling metadata', () => {
      const response = builder.success({ test: true }, {
        includeMetadata: false,
      });

      expect(response.metadata).toBeUndefined();
    });
  });

  describe('error responses', () => {
    it('should create basic error response', () => {
      const response = builder.error({
        code: 'TEST_ERROR',
        message: 'Test error message',
      });

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('TEST_ERROR');
      expect(response.error.message).toBe('Test error message');
      expect(response.metadata).toBeDefined();
    });

    it('should accept string error shorthand', () => {
      const response = builder.error('Something went wrong');

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('UNKNOWN_ERROR');
      expect(response.error.message).toBe('Something went wrong');
    });

    it('should include error details when provided', () => {
      const response = builder.error({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'email', reason: 'invalid format' },
        suggestion: 'Use a valid email address',
      });

      expect(response.error.details).toEqual({ field: 'email', reason: 'invalid format' });
      expect(response.error.suggestion).toBe('Use a valid email address');
    });
  });

  describe('errorFromException', () => {
    it('should handle custom errors with code', () => {
      const customError = {
        code: 'CUSTOM_ERROR',
        message: 'Custom error occurred',
        details: { info: 'test' },
      };

      const response = builder.errorFromException(customError);

      expect(response.error.code).toBe('CUSTOM_ERROR');
      expect(response.error.message).toBe('Custom error occurred');
      expect(response.error.details).toEqual({ info: 'test' });
    });

    it('should handle Zod validation errors', () => {
      const zodError = {
        name: 'ZodError',
        errors: [
          { path: ['email'], message: 'Invalid email' },
        ],
      };

      const response = builder.errorFromException(zodError);

      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.message).toContain('validation failed');
      expect(response.error.suggestion).toBeDefined();
    });

    it('should handle database errors', () => {
      const dbError = {
        code: 'ER_DUP_ENTRY',
        message: 'Duplicate entry',
      };

      const response = builder.errorFromException(dbError);

      expect(response.error.code).toBe('DATABASE_ERROR');
      expect(response.error.message).toContain('Database operation failed');
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Something broke');

      const response = builder.errorFromException(genericError);

      expect(response.error.code).toBe('INTERNAL_ERROR');
      expect(response.error.message).toBe('Something broke');
    });
  });
});

describe('Helper Functions', () => {
  describe('successResponse', () => {
    it('should create success response quickly', () => {
      const response = successResponse({ test: true });

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ test: true });
      expect(response.metadata).toBeDefined();
    });

    it('should support format parameter', () => {
      const response = successResponse(
        { test: true },
        { format: 'human', formatted: 'Test output' }
      );

      expect(response.format).toBe('human');
      expect(response.formatted).toBe('Test output');
    });
  });

  describe('errorResponse', () => {
    it('should create error response quickly', () => {
      const response = errorResponse('NOT_FOUND', 'Resource not found');

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('NOT_FOUND');
      expect(response.error.message).toBe('Resource not found');
    });

    it('should support details parameter', () => {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'Invalid input',
        { field: 'email' }
      );

      expect(response.error.details).toEqual({ field: 'email' });
    });
  });

  describe('wrapEndpoint', () => {
    it('should wrap successful execution', async () => {
      const executor = async () => ({ result: 'success' });

      const response = await wrapEndpoint(executor);

      expect(response.success).toBe(true);
      expect((response as any).data).toEqual({ result: 'success' });
      expect((response as any).metadata).toBeDefined();
    });

    it('should catch and format errors', async () => {
      const executor = async () => {
        throw new Error('Test error');
      };

      const response = await wrapEndpoint(executor);

      expect(response.success).toBe(false);
      expect((response as any).error.message).toBe('Test error');
    });

    it('should apply formatter for human format', async () => {
      const executor = async () => ({ count: 5 });
      const formatter = (data: any) => `Found ${data.count} items`;

      const response = await wrapEndpoint(executor, {
        format: 'human',
        formatter,
      });

      expect(response.success).toBe(true);
      expect((response as any).formatted).toBe('Found 5 items');
    });

    it('should include version in metadata', async () => {
      const executor = async () => ({ test: true });

      const response = await wrapEndpoint(executor, { version: '3.0.0' });

      expect(response.success).toBe(true);
      expect((response as any).metadata.version).toBe('3.0.0');
    });
  });
});

describe('CommonErrors', () => {
  describe('notFound', () => {
    it('should create not found error', () => {
      const error = CommonErrors.notFound('task', 123);

      expect(error.code).toBe('TASK_NOT_FOUND');
      expect(error.message).toContain('task with ID 123 not found');
      expect(error.details).toEqual({ entity: 'task', id: 123 });
      expect(error.suggestion).toBeDefined();
    });
  });

  describe('duplicate', () => {
    it('should create duplicate error', () => {
      const error = CommonErrors.duplicate('user', 'email', 'test@example.com');

      expect(error.code).toBe('DUPLICATE_USER');
      expect(error.message).toContain('email');
      expect(error.message).toContain('test@example.com');
      expect(error.details).toEqual({
        entity: 'user',
        field: 'email',
        value: 'test@example.com',
      });
    });
  });

  describe('invalidInput', () => {
    it('should create invalid input error', () => {
      const error = CommonErrors.invalidInput('version', 'must follow semver format');

      expect(error.code).toBe('INVALID_INPUT');
      expect(error.message).toContain('version');
      expect(error.message).toContain('must follow semver format');
      expect(error.field).toBe('version');
    });
  });

  describe('permissionDenied', () => {
    it('should create permission denied error', () => {
      const error = CommonErrors.permissionDenied('delete', 'project');

      expect(error.code).toBe('PERMISSION_DENIED');
      expect(error.message).toContain('delete');
      expect(error.message).toContain('project');
      expect(error.details).toEqual({ action: 'delete', resource: 'project' });
    });
  });

  describe('databaseError', () => {
    it('should create database error', () => {
      const error = CommonErrors.databaseError('insert');

      expect(error.code).toBe('DATABASE_ERROR');
      expect(error.message).toContain('insert');
      expect(error.suggestion).toBeDefined();
    });
  });
});

describe('Response Validation', () => {
  describe('validateResponse', () => {
    it('should validate correct success response', () => {
      const response = {
        success: true,
        data: { test: true },
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      };

      const result = validateResponse(response);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should validate correct error response', () => {
      const response = {
        success: false,
        error: {
          code: 'TEST_ERROR',
          message: 'Test error',
        },
      };

      const result = validateResponse(response);

      expect(result.valid).toBe(true);
    });

    it('should reject invalid response structure', () => {
      const response = {
        success: true,
        // Missing 'data' field
      };

      const result = validateResponse(response);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject invalid timestamp format', () => {
      const response = {
        success: true,
        data: {},
        metadata: {
          timestamp: 'invalid-date',
        },
      };

      const result = validateResponse(response);

      expect(result.valid).toBe(false);
    });

    it('should reject invalid version format', () => {
      const response = {
        success: true,
        data: {},
        metadata: {
          version: '1.0', // Invalid semver (missing PATCH)
        },
      };

      const result = validateResponse(response);

      expect(result.valid).toBe(false);
    });

    it('should accept human format responses', () => {
      const response = {
        success: true,
        data: { tasks: [] },
        format: 'human',
        formatted: 'No tasks found.',
      };

      const result = validateResponse(response);

      expect(result.valid).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  it('should create consistent responses across different paths', async () => {
    // Test that all methods produce valid responses
    const builder = new ResponseBuilder();

    const success1 = builder.success({ test: 1 });
    const success2 = successResponse({ test: 2 });
    const success3 = await wrapEndpoint(async () => ({ test: 3 }));

    expect(validateResponse(success1).valid).toBe(true);
    expect(validateResponse(success2).valid).toBe(true);
    expect(validateResponse(success3).valid).toBe(true);

    const error1 = builder.error('TEST_ERROR', 'Test');
    const error2 = errorResponse('TEST_ERROR', 'Test');
    const error3 = await wrapEndpoint(async () => {
      throw new Error('Test');
    });

    expect(validateResponse(error1).valid).toBe(true);
    expect(validateResponse(error2).valid).toBe(true);
    expect(validateResponse(error3).valid).toBe(true);
  });
});

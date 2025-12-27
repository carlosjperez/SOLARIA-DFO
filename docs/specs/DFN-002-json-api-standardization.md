# DFN-002: JSON-First API Standardization Specification

**Author:** ECO-Lambda | DFO Enhancement Plan
**Date:** 2025-12-27
**Task:** DFN-002
**Status:** Draft

---

## Executive Summary

Standardize all DFO MCP endpoint responses to follow consistent JSON structure with optional human-readable formatting, comprehensive error handling, and JSON Schema validation.

**Goals:**
- ✅ Consistent response structure across all 50+ endpoints
- ✅ Machine-parseable JSON by default
- ✅ Optional human-readable format for CLI/debugging
- ✅ Predictable error handling
- ✅ Type-safe validation with JSON Schema

---

## 1. Standard Response Structure

### Success Response

```typescript
interface StandardSuccessResponse<T = any> {
  success: true;
  data: T;
  metadata?: {
    timestamp?: string;        // ISO 8601
    request_id?: string;       // For tracing
    execution_time_ms?: number;
    version?: string;          // API version
  };
  format?: 'json' | 'human';
}
```

### Error Response

```typescript
interface StandardErrorResponse {
  success: false;
  error: {
    code: string;              // Machine-readable error code
    message: string;           // Human-readable message
    details?: any;             // Additional context
    field?: string;            // For validation errors
    suggestion?: string;       // How to fix
  };
  metadata?: {
    timestamp?: string;
    request_id?: string;
  };
}
```

### Error Codes Taxonomy

| Category | Code Pattern | Example | HTTP Status |
|----------|--------------|---------|-------------|
| Not Found | `*_NOT_FOUND` | `TASK_NOT_FOUND`, `AGENT_NOT_FOUND` | 404 |
| Validation | `INVALID_*` | `INVALID_SEMVER`, `INVALID_JSON` | 400 |
| Duplicate | `DUPLICATE_*` | `DUPLICATE_TASK`, `DUPLICATE_CAPABILITY` | 409 |
| Permission | `PERMISSION_*` | `PERMISSION_DENIED`, `UNAUTHORIZED` | 403 |
| Database | `DATABASE_*` | `DATABASE_ERROR`, `QUERY_TIMEOUT` | 500 |
| External | `EXTERNAL_*` | `EXTERNAL_SERVICE_ERROR` | 502 |

---

## 2. Format Parameter

All endpoints MUST support optional `format` parameter:

```typescript
interface FormatParameter {
  format?: 'json' | 'human';  // Default: 'json'
}
```

### JSON Format (Default)

```json
{
  "success": true,
  "data": {
    "task_id": 451,
    "title": "Agent Capabilities Registry en DFO",
    "status": "completed",
    "progress": 100
  }
}
```

### Human Format

```json
{
  "success": true,
  "data": {
    "task_id": 451,
    "title": "Agent Capabilities Registry en DFO",
    "status": "completed",
    "progress": 100
  },
  "formatted": "✅ Task DFN-001: Agent Capabilities Registry en DFO\nStatus: Completed (100%)\nCompleted at: 2025-12-27 11:11:06"
}
```

**Rules:**
- `format=json`: Return structured data only
- `format=human`: Include both `data` AND `formatted` string for display

---

## 3. Endpoint Migration Plan

### Phase 1: Core Task Management (Week 1)

| Endpoint | Current Issues | Migration Priority |
|----------|----------------|-------------------|
| `list_tasks` | ✅ Already JSON | Update metadata |
| `get_task` | ✅ Already JSON | Add format param |
| `create_task` | ✅ Already JSON | Standardize errors |
| `update_task` | ✅ Already JSON | Add validation |
| `complete_task` | ✅ Already JSON | Add metadata |
| `list_task_items` | ✅ Already JSON | Add format param |
| `complete_task_item` | ✅ Already JSON | Standardize response |

### Phase 2: Project & Sprint Management (Week 2)

| Endpoint | Current Issues | Migration Priority |
|----------|----------------|-------------------|
| `list_projects` | Check consistency | Medium |
| `get_project` | Check consistency | Medium |
| `create_project` | Check validation | High |
| `list_sprints` | Check consistency | Medium |
| `create_sprint` | Check validation | High |
| `list_epics` | Check consistency | Medium |

### Phase 3: Documents & Memory (Week 3)

| Endpoint | Current Issues | Migration Priority |
|----------|----------------|-------------------|
| `create_inline_document` | ⚠️ Returns HTML | **CRITICAL** |
| `get_inline_document` | Unknown | High |
| `list_inline_documents` | Unknown | Medium |
| `search_documents` | Unknown | High |
| `memory_create` | Check consistency | Medium |
| `memory_search` | Check consistency | High |

### Phase 4: New Endpoints (Week 4)

| Endpoint | Status | Priority |
|----------|--------|----------|
| `register_agent_capabilities` | ✅ Implements standard | Reference |
| `get_agent_capabilities` | ✅ Implements standard | Reference |
| `list_all_capabilities` | ✅ Implements standard | Reference |
| `deactivate_capability` | ✅ Implements standard | Reference |

---

## 4. JSON Schema Validation

### Schema Definition

```typescript
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

// Success response schema
const successResponseSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: { type: 'object' },
    metadata: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        request_id: { type: 'string' },
        execution_time_ms: { type: 'number', minimum: 0 },
        version: { type: 'string', pattern: '^[0-9]+\\.[0-9]+\\.[0-9]+$' }
      }
    },
    format: { type: 'string', enum: ['json', 'human'] }
  }
};

// Error response schema
const errorResponseSchema = {
  type: 'object',
  required: ['success', 'error'],
  properties: {
    success: { type: 'boolean', const: false },
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: { type: 'string', minLength: 1 },
        message: { type: 'string', minLength: 1 },
        details: {},
        field: { type: 'string' },
        suggestion: { type: 'string' }
      }
    },
    metadata: {
      type: 'object',
      properties: {
        timestamp: { type: 'string', format: 'date-time' },
        request_id: { type: 'string' }
      }
    }
  }
};
```

### Validation Middleware

```typescript
import { z } from 'zod';

// Zod schemas (preferred for TypeScript)
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

// Validation function
export function validateResponse(response: unknown): boolean {
  try {
    StandardResponseSchema.parse(response);
    return true;
  } catch (error) {
    console.error('Response validation failed:', error);
    return false;
  }
}
```

---

## 5. Implementation Examples

### Example 1: Migrating list_tasks

**Before:**
```typescript
export const listTasks = {
  async execute(params: any) {
    const tasks = await db.query('SELECT * FROM tasks WHERE project_id = ?', [params.project_id]);
    return tasks; // Raw array
  }
};
```

**After:**
```typescript
export const listTasks = {
  inputSchema: z.object({
    project_id: z.number().optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
    format: z.enum(['json', 'human']).default('json'),
  }),

  async execute(params: z.infer<typeof inputSchema>) {
    const startTime = Date.now();

    try {
      const tasks = await db.query(
        'SELECT * FROM tasks WHERE project_id = ?',
        [params.project_id]
      );

      const response: StandardSuccessResponse = {
        success: true,
        data: {
          tasks,
          total: tasks.length,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          execution_time_ms: Date.now() - startTime,
          version: '1.0.0',
        },
      };

      // Add human-readable format if requested
      if (params.format === 'human') {
        response.formatted = formatTasksHuman(tasks);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to retrieve tasks',
          details: { error: error.message },
          suggestion: 'Check database connectivity and try again',
        },
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
};
```

### Example 2: Human Formatting Utility

```typescript
function formatTasksHuman(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const lines = [
    `Found ${tasks.length} task${tasks.length === 1 ? '' : 's'}:`,
    '',
  ];

  tasks.forEach((task, index) => {
    const statusIcon = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
      blocked: '🚫',
    }[task.status] || '❓';

    lines.push(
      `${index + 1}. ${statusIcon} ${task.task_code}: ${task.title}`,
      `   Status: ${task.status} | Progress: ${task.progress}%`,
      `   Assigned: ${task.agent_name || 'Unassigned'}`,
      ''
    );
  });

  return lines.join('\n');
}
```

---

## 6. Testing Requirements

### Unit Tests

```typescript
describe('JSON API Standardization', () => {
  it('should return success response with metadata', async () => {
    const response = await listTasks.execute({ project_id: 1 });

    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.metadata?.timestamp).toBeDefined();
    expect(response.metadata?.execution_time_ms).toBeGreaterThan(0);
  });

  it('should return error response for invalid input', async () => {
    const response = await listTasks.execute({ project_id: 'invalid' });

    expect(response.success).toBe(false);
    expect(response.error.code).toBeDefined();
    expect(response.error.message).toBeDefined();
  });

  it('should include formatted output when format=human', async () => {
    const response = await listTasks.execute({
      project_id: 1,
      format: 'human'
    });

    expect(response.formatted).toBeDefined();
    expect(response.formatted).toContain('Found');
  });

  it('should validate response against schema', async () => {
    const response = await listTasks.execute({ project_id: 1 });

    expect(validateResponse(response)).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('API Consistency', () => {
  const endpoints = [
    'list_tasks',
    'get_task',
    'create_task',
    'update_task',
    // ... all endpoints
  ];

  endpoints.forEach(endpoint => {
    it(`${endpoint} should follow standard response format`, async () => {
      const response = await testEndpoint(endpoint);
      expect(validateResponse(response)).toBe(true);
    });
  });
});
```

---

## 7. Documentation Updates

### OpenAPI/Swagger Schema

```yaml
components:
  schemas:
    StandardSuccessResponse:
      type: object
      required:
        - success
        - data
      properties:
        success:
          type: boolean
          enum: [true]
        data:
          type: object
        metadata:
          $ref: '#/components/schemas/ResponseMetadata'
        format:
          type: string
          enum: [json, human]
        formatted:
          type: string

    StandardErrorResponse:
      type: object
      required:
        - success
        - error
      properties:
        success:
          type: boolean
          enum: [false]
        error:
          $ref: '#/components/schemas/ErrorObject'
        metadata:
          $ref: '#/components/schemas/ResponseMetadata'

    ResponseMetadata:
      type: object
      properties:
        timestamp:
          type: string
          format: date-time
        request_id:
          type: string
        execution_time_ms:
          type: number
          minimum: 0
        version:
          type: string
          pattern: '^[0-9]+\.[0-9]+\.[0-9]+$'

    ErrorObject:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
        field:
          type: string
        suggestion:
          type: string
```

---

## 8. Migration Checklist

### Per Endpoint

- [ ] Review current response format
- [ ] Add `format` parameter to input schema
- [ ] Wrap response in standard structure
- [ ] Add execution time tracking
- [ ] Implement error standardization
- [ ] Create human formatter function
- [ ] Add Zod/JSON Schema validation
- [ ] Write unit tests
- [ ] Update OpenAPI documentation
- [ ] Test with real MCP clients

### Global

- [ ] Create shared response builder utilities
- [ ] Create shared error builder utilities
- [ ] Create validation middleware
- [ ] Create formatter registry
- [ ] Update MCP server initialization
- [ ] Create migration guide for consumers
- [ ] Version bump API (1.0.0 → 2.0.0)

---

## 9. Breaking Changes & Compatibility

### Strategy: Dual Response Mode (Transition Period)

```typescript
interface EndpointConfig {
  legacy_mode?: boolean;  // Default: false
}

export function buildResponse(data: any, config: EndpointConfig = {}) {
  if (config.legacy_mode) {
    // Return old format for backward compatibility
    return data;
  }

  // Return new standard format
  return {
    success: true,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
    },
  };
}
```

### Deprecation Timeline

- **Week 1-2:** Implement new format, keep legacy as default
- **Week 3-4:** Switch default to new format, legacy available via flag
- **Week 5-8:** Announce deprecation of legacy mode
- **Week 9+:** Remove legacy mode

---

## 10. Success Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Response consistency | ~40% | 100% | Automated validation |
| Error clarity | Low | High | Developer survey |
| API discoverability | Medium | High | Documentation coverage |
| Client integration time | ~2h | <30min | Onboarding metrics |
| Breaking changes | High | Zero | Semver compliance |

---

## 11. Next Steps

1. ✅ Create this specification
2. ⏳ Implement shared utilities (`response-builder.ts`, `validators.ts`)
3. ⏳ Migrate Phase 1 endpoints (task management)
4. ⏳ Create integration test suite
5. ⏳ Update OpenAPI documentation
6. ⏳ Migrate remaining phases
7. ⏳ Publish API v2.0.0

---

**Status:** Ready for implementation
**Estimated Effort:** 6 hours
**Dependencies:** None
**Blocking:** DFN-003, DFN-004, DFN-005

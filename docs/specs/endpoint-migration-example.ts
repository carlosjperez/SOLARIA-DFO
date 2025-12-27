/**
 * Endpoint Migration Example
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-002
 *
 * Example showing how to migrate an existing endpoint to the new standard
 */

import { z } from 'zod';
import { ResponseBuilder, wrapEndpoint, CommonErrors } from '../utils/response-builder';
import { Formatters } from '../utils/formatters';
import { db } from '../database';

// ============================================================================
// BEFORE: Legacy Implementation
// ============================================================================

export const listTasksLegacy = {
  async execute(params: any) {
    try {
      // Raw SQL query
      const tasks = await db.query(
        'SELECT * FROM tasks WHERE project_id = ?',
        [params.project_id]
      );

      // Return raw array - inconsistent structure
      return tasks;
    } catch (error) {
      // Inconsistent error format
      return {
        error: error.message,
      };
    }
  },
};

// Problems with legacy:
// ❌ No input validation
// ❌ Inconsistent response structure
// ❌ No metadata (timestamp, execution time)
// ❌ No human-readable format option
// ❌ Poor error handling
// ❌ No type safety

// ============================================================================
// AFTER: Standardized Implementation (Method 1 - Manual)
// ============================================================================

const ListTasksInputSchema = z.object({
  project_id: z.number().int().positive().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assigned_agent_id: z.number().int().positive().optional(),
  format: z.enum(['json', 'human']).default('json'),
});

export const listTasksStandard = {
  name: 'list_tasks',
  description: 'List tasks with optional filtering',
  inputSchema: ListTasksInputSchema,

  async execute(params: z.infer<typeof ListTasksInputSchema>) {
    const builder = new ResponseBuilder({ version: '2.0.0' });

    try {
      // Build query dynamically
      let query = 'SELECT * FROM tasks WHERE 1=1';
      const queryParams: any[] = [];

      if (params.project_id) {
        query += ' AND project_id = ?';
        queryParams.push(params.project_id);
      }

      if (params.status) {
        query += ' AND status = ?';
        queryParams.push(params.status);
      }

      if (params.priority) {
        query += ' AND priority = ?';
        queryParams.push(params.priority);
      }

      if (params.assigned_agent_id) {
        query += ' AND assigned_agent_id = ?';
        queryParams.push(params.assigned_agent_id);
      }

      query += ' ORDER BY created_at DESC';

      // Execute query
      const tasks = await db.query(query, queryParams);

      // Build response data
      const data = {
        tasks,
        total: tasks.length,
        filters: {
          project_id: params.project_id,
          status: params.status,
          priority: params.priority,
          assigned_agent_id: params.assigned_agent_id,
        },
      };

      // Human-readable format if requested
      const formatted = params.format === 'human'
        ? Formatters.taskList(tasks)
        : undefined;

      return builder.success(data, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      // Standardized error handling
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return builder.error(CommonErrors.databaseError('query'));
      }

      return builder.errorFromException(error);
    }
  },
};

// Benefits of standardized version:
// ✅ Input validation with Zod
// ✅ Consistent response structure
// ✅ Automatic metadata (timestamp, execution time, version)
// ✅ Human-readable format option
// ✅ Comprehensive error handling
// ✅ Full type safety

// ============================================================================
// AFTER: Standardized Implementation (Method 2 - wrapEndpoint utility)
// ============================================================================

export const listTasksSimple = {
  name: 'list_tasks',
  description: 'List tasks with optional filtering',
  inputSchema: ListTasksInputSchema,

  async execute(params: z.infer<typeof ListTasksInputSchema>) {
    return wrapEndpoint(
      async () => {
        // Just the business logic - error handling is automatic
        let query = 'SELECT * FROM tasks WHERE 1=1';
        const queryParams: any[] = [];

        if (params.project_id) {
          query += ' AND project_id = ?';
          queryParams.push(params.project_id);
        }

        if (params.status) {
          query += ' AND status = ?';
          queryParams.push(params.status);
        }

        query += ' ORDER BY created_at DESC';

        const tasks = await db.query(query, queryParams);

        return {
          tasks,
          total: tasks.length,
          filters: {
            project_id: params.project_id,
            status: params.status,
          },
        };
      },
      {
        format: params.format,
        formatter: (data) => Formatters.taskList(data.tasks),
        version: '2.0.0',
      }
    );
  },
};

// Even simpler - wrapEndpoint handles:
// ✅ Response building
// ✅ Error catching and formatting
// ✅ Metadata generation
// ✅ Human formatting

// ============================================================================
// Example Responses
// ============================================================================

// Legacy response (inconsistent):
const legacyResponse = [
  { id: 1, title: 'Task 1', status: 'pending' },
  { id: 2, title: 'Task 2', status: 'in_progress' },
];

// Standard response (format=json):
const standardJsonResponse = {
  success: true,
  data: {
    tasks: [
      { id: 1, title: 'Task 1', status: 'pending' },
      { id: 2, title: 'Task 2', status: 'in_progress' },
    ],
    total: 2,
    filters: {
      status: 'pending',
    },
  },
  metadata: {
    timestamp: '2025-12-27T11:15:00.000Z',
    request_id: 'req_1735300500_abc123def',
    execution_time_ms: 45,
    version: '2.0.0',
  },
};

// Standard response (format=human):
const standardHumanResponse = {
  success: true,
  data: {
    tasks: [
      { id: 1, title: 'Task 1', status: 'pending' },
      { id: 2, title: 'Task 2', status: 'in_progress' },
    ],
    total: 2,
  },
  metadata: {
    timestamp: '2025-12-27T11:15:00.000Z',
    request_id: 'req_1735300500_abc123def',
    execution_time_ms: 45,
    version: '2.0.0',
  },
  format: 'human',
  formatted: `
Found 2 tasks:

1. ⏳ DFO-001: Task 1
   Status: pending | Progress: 0% | Assigned: Unassigned

2. 🔄 DFO-002: Task 2
   Status: in_progress | Progress: 50% | Assigned: Agent 11
  `.trim(),
};

// ============================================================================
// Migration Checklist
// ============================================================================

/*
For each endpoint, follow these steps:

1. [ ] Add Zod input schema with validation
2. [ ] Replace raw DB queries with parameterized queries
3. [ ] Wrap response in ResponseBuilder.success()
4. [ ] Add format parameter support
5. [ ] Create human formatter function
6. [ ] Replace raw error returns with ResponseBuilder.error()
7. [ ] Add specific error handling (not found, duplicate, etc.)
8. [ ] Write unit tests for both formats
9. [ ] Update OpenAPI documentation
10. [ ] Test with real MCP client

Estimated time per endpoint: 30-45 minutes
*/

/**
 * Dependency Tree Visualization Endpoint
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-008
 *
 * ASCII tree visualization for task dependencies
 */

import { z } from 'zod';
import { ResponseBuilder, CommonErrors } from '../utils/response-builder.js'
import { db, type Database } from '../database.js'
import { Tool } from '../types/mcp.js'

const VERSION = '2.0.0';

// ============================================================================
// Validation Schema
// ============================================================================

const GetDependencyTreeInputSchema = z.object({
  task_id: z.number().int().positive(),
  direction: z.enum(['upstream', 'downstream', 'both']).default('downstream'),
  max_depth: z.number().int().min(1).max(10).default(5),
  show_status: z.boolean().default(true),
  show_progress: z.boolean().default(true),
  format: z.enum(['json', 'human', 'ascii']).default('ascii'),
});

// ============================================================================
// Type Definitions
// ============================================================================

interface TreeNode {
  task_id: number;
  task_code: string;
  title: string;
  status: string;
  progress: number;
  dependency_type?: string;
  children: TreeNode[];
  depth: number;
}

interface TreeStats {
  total_nodes: number;
  max_depth_reached: number;
  blocked_count: number;
  completed_count: number;
  in_progress_count: number;
  pending_count: number;
}

// ============================================================================
// Status Icons
// ============================================================================

const STATUS_ICONS: Record<string, string> = {
  completed: '✓',
  in_progress: '⏳',
  pending: '○',
  blocked: '🚫',
};

const STATUS_COLORS: Record<string, string> = {
  completed: '\x1b[32m', // Green
  in_progress: '\x1b[33m', // Yellow
  pending: '\x1b[90m', // Gray
  blocked: '\x1b[31m', // Red
};

const RESET_COLOR = '\x1b[0m';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a task exists
 */
async function taskExists(taskId: number, dbInstance: Database = db): Promise<boolean> {
  const result = await dbInstance.query('SELECT id FROM tasks WHERE id = ?', [taskId]);
  return result.length > 0;
}

/**
 * Get task info by ID
 */
async function getTaskInfo(taskId: number, dbInstance: Database = db): Promise<TreeNode | null> {
  const result = await dbInstance.query(
    `SELECT
      t.id as task_id,
      CONCAT(p.code, '-', t.task_number) as task_code,
      t.title,
      t.status,
      t.progress
    FROM tasks t
    JOIN projects p ON t.project_id = p.id
    WHERE t.id = ?`,
    [taskId]
  );

  if (result.length === 0) return null;

  return {
    ...result[0],
    children: [],
    depth: 0,
  };
}

/**
 * Build dependency tree recursively
 */
async function buildTree(
  taskId: number,
  direction: 'upstream' | 'downstream',
  maxDepth: number,
  currentDepth: number = 0,
  visited: Set<number> = new Set(),
  dbInstance: Database = db
): Promise<TreeNode | null> {
  // Prevent infinite loops
  if (visited.has(taskId) || currentDepth > maxDepth) {
    return null;
  }

  visited.add(taskId);

  const taskInfo = await getTaskInfo(taskId, dbInstance);
  if (!taskInfo) return null;

  taskInfo.depth = currentDepth;

  // Get children based on direction
  const query =
    direction === 'downstream'
      ? `SELECT
          td.task_id as child_id,
          td.dependency_type,
          t.status
        FROM task_dependencies td
        JOIN tasks t ON td.task_id = t.id
        WHERE td.depends_on_task_id = ?`
      : `SELECT
          td.depends_on_task_id as child_id,
          td.dependency_type,
          t.status
        FROM task_dependencies td
        JOIN tasks t ON td.depends_on_task_id = t.id
        WHERE td.task_id = ?`;

  const children = await dbInstance.query(query, [taskId]);

  // Recursively build children
  for (const child of children) {
    const childNode = await buildTree(
      child.child_id,
      direction,
      maxDepth,
      currentDepth + 1,
      visited,
      dbInstance
    );
    if (childNode) {
      childNode.dependency_type = child.dependency_type;
      // Check if blocked
      if (direction === 'downstream' && taskInfo.status !== 'completed') {
        if (child.status === 'pending' || child.status === 'in_progress') {
          // This task is blocked by the parent
        }
      }
      taskInfo.children.push(childNode);
    }
  }

  return taskInfo;
}

/**
 * Calculate tree statistics
 */
function calculateStats(root: TreeNode): TreeStats {
  const stats: TreeStats = {
    total_nodes: 0,
    max_depth_reached: 0,
    blocked_count: 0,
    completed_count: 0,
    in_progress_count: 0,
    pending_count: 0,
  };

  function traverse(node: TreeNode) {
    stats.total_nodes++;
    stats.max_depth_reached = Math.max(stats.max_depth_reached, node.depth);

    switch (node.status) {
      case 'completed':
        stats.completed_count++;
        break;
      case 'in_progress':
        stats.in_progress_count++;
        break;
      case 'pending':
        stats.pending_count++;
        break;
      case 'blocked':
        stats.blocked_count++;
        break;
    }

    node.children.forEach(traverse);
  }

  traverse(root);
  return stats;
}

/**
 * Build ASCII tree string
 */
function buildAsciiTree(
  node: TreeNode,
  prefix: string = '',
  isLast: boolean = true,
  isRoot: boolean = true,
  showStatus: boolean = true,
  showProgress: boolean = true,
  useColors: boolean = false
): string {
  const connector = isRoot ? '' : isLast ? '└── ' : '├── ';
  const extension = isRoot ? '' : isLast ? '    ' : '│   ';

  const statusIcon = showStatus ? STATUS_ICONS[node.status] || '?' : '';
  const progress = showProgress ? `[${node.progress}%]` : '';

  let color = '';
  let reset = '';
  if (useColors) {
    color = STATUS_COLORS[node.status] || '';
    reset = RESET_COLOR;
  }

  let line = `${prefix}${connector}${color}${node.task_code}: ${node.title} ${statusIcon} ${progress}${reset}\n`;

  node.children.forEach((child, i) => {
    const childIsLast = i === node.children.length - 1;
    line += buildAsciiTree(
      child,
      prefix + extension,
      childIsLast,
      false,
      showStatus,
      showProgress,
      useColors
    );
  });

  return line;
}

/**
 * Format human-readable summary
 */
function formatHumanSummary(root: TreeNode, stats: TreeStats, direction: string): string {
  const lines = [
    `📊 Dependency Tree: ${root.task_code}`,
    `Direction: ${direction}`,
    '',
    `Statistics:`,
    `  Total nodes: ${stats.total_nodes}`,
    `  Max depth: ${stats.max_depth_reached}`,
    `  Completed: ${stats.completed_count}`,
    `  In Progress: ${stats.in_progress_count}`,
    `  Pending: ${stats.pending_count}`,
    `  Blocked: ${stats.blocked_count}`,
    '',
    'Tree:',
    buildAsciiTree(root, '', true, true, true, true, false),
  ];

  return lines.join('\n');
}

// ============================================================================
// Endpoint Implementation
// ============================================================================

export const getDependencyTree: Tool = {
  name: 'get_dependency_tree',
  description: 'Generate ASCII tree visualization of task dependencies with status indicators',
  inputSchema: GetDependencyTreeInputSchema,

  async execute(params: z.infer<typeof GetDependencyTreeInputSchema>, _testDb?: Database) {
    const builder = new ResponseBuilder({ version: VERSION });
    const dbInstance = _testDb || db;

    try {
      // Validate and apply schema defaults
      const validatedParams = GetDependencyTreeInputSchema.parse(params);

      // Check task exists
      if (!(await taskExists(validatedParams.task_id, dbInstance))) {
        return builder.error(CommonErrors.notFound('task', validatedParams.task_id));
      }

      // Build tree(s) based on direction
      let trees: { upstream?: TreeNode; downstream?: TreeNode } = {};

      if (validatedParams.direction === 'upstream' || validatedParams.direction === 'both') {
        const upstream = await buildTree(validatedParams.task_id, 'upstream', validatedParams.max_depth, 0, new Set(), dbInstance);
        if (upstream) trees.upstream = upstream;
      }

      if (validatedParams.direction === 'downstream' || validatedParams.direction === 'both') {
        const downstream = await buildTree(validatedParams.task_id, 'downstream', validatedParams.max_depth, 0, new Set(), dbInstance);
        if (downstream) trees.downstream = downstream;
      }

      // Get root node for single direction
      const primaryTree = trees.downstream || trees.upstream;
      if (!primaryTree) {
        return builder.error({
          code: 'TREE_BUILD_ERROR',
          message: 'Failed to build dependency tree',
          suggestion: 'Check if the task has any dependencies',
        });
      }

      const stats = calculateStats(primaryTree);

      const data = {
        root: primaryTree,
        upstream: trees.upstream,
        downstream: trees.downstream,
        stats,
        direction: validatedParams.direction,
      };

      // Generate formatted output based on format
      let formatted: string | undefined;

      if (validatedParams.format === 'ascii') {
        formatted = buildAsciiTree(
          primaryTree,
          '',
          true,
          true,
          validatedParams.show_status,
          validatedParams.show_progress,
          false
        );
      } else if (validatedParams.format === 'human') {
        formatted = formatHumanSummary(primaryTree, stats, validatedParams.direction);
      }

      return builder.success(data, {
        format: validatedParams.format === 'json' ? 'json' : 'human',
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

// ============================================================================
// Export
// ============================================================================

export const dependencyTreeTools = [getDependencyTree];

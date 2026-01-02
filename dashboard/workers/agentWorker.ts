/**
 * SOLARIA DFO - Agent Execution Worker
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * BullMQ worker process that consumes agent execution jobs from the
 * 'agent-execution' queue and delegates execution to assigned agents.
 *
 * Features:
 * - Concurrent job processing (5 workers)
 * - Exponential backoff retry (3 attempts)
 * - Context loading (dependencies, memories, related tasks)
 * - Real-time progress updates
 * - Graceful shutdown handling
 *
 * @example
 * ```bash
 * # Run worker
 * node workers/agentWorker.js
 *
 * # Worker will process jobs from 'agent-execution' queue
 * # Jobs are queued by AgentExecutionService
 * ```
 */

import { Worker, Job } from 'bullmq';
import mysql, { Connection } from 'mysql2/promise';
import { createRedisConnection, QueueNames, getWorkerOptions } from '../config/queue.js';
import type { AgentJobData, JobResult, AgentJob, WorkerContext } from '../types/queue.js';
import { getMCPClientManager } from '../../mcp-server/dist/src/client/mcp-client-manager.js';

// Simple Tool type definition (compatible with MCP SDK)
interface Tool {
    name: string;
    description?: string;
    inputSchema?: unknown;
}

// ============================================================================
// Database Connection
// ============================================================================

let db: Connection;

/**
 * Initialize database connection with retry logic
 */
async function connectToDatabase(): Promise<Connection> {
    const maxRetries = 10;
    const retryDelay = 5000; // 5 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[agentWorker] Attempting database connection (${attempt}/${maxRetries})...`);

            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'solaria_construction',
            });

            console.log('[agentWorker] ✓ Database connected successfully');
            return connection;
        } catch (error: any) {
            console.error(`[agentWorker] Database connection attempt ${attempt} failed:`, error.message);

            if (attempt < maxRetries) {
                console.log(`[agentWorker] Retrying in ${retryDelay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            } else {
                throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
            }
        }
    }

    throw new Error('Database connection failed');
}

// ============================================================================
// MCP Configuration Loading
// ============================================================================

/**
 * Agent MCP Configuration from database
 */
interface AgentMCPConfig {
    id: number;
    agent_id: number;
    server_name: string;
    server_url: string;
    auth_type: 'bearer' | 'basic' | 'api_key' | 'none';
    auth_credentials: Record<string, unknown> | null;
    enabled: boolean;
    transport_type: 'http' | 'stdio' | 'sse';
    config_options: Record<string, unknown> | null;
    last_connected_at: Date | null;
    connection_status: 'connected' | 'disconnected' | 'error';
    last_error: string | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Load enabled MCP server configurations for a specific agent
 *
 * Queries agent_mcp_configs table to retrieve all active external MCP server
 * configurations that this agent should connect to. Only returns enabled configs.
 *
 * @param agentId - Agent ID to load configurations for
 * @returns Array of MCP configuration objects
 *
 * @example
 * const configs = await loadAgentMCPConfigs(11);
 * // Returns: [{ server_name: 'context7', server_url: 'https://...', ... }]
 */
async function loadAgentMCPConfigs(agentId: number): Promise<AgentMCPConfig[]> {
    const startTime = Date.now();

    try {
        console.log(`[agentWorker] Loading MCP configs for agent ${agentId}...`);

        const [rows] = await db.execute(
            `SELECT
                id,
                agent_id,
                server_name,
                server_url,
                auth_type,
                auth_credentials,
                enabled,
                transport_type,
                config_options,
                last_connected_at,
                connection_status,
                last_error,
                created_at,
                updated_at
             FROM agent_mcp_configs
             WHERE agent_id = ? AND enabled = 1
             ORDER BY server_name ASC`,
            [agentId]
        );

        const configs = rows as AgentMCPConfig[];
        const queryTime = Date.now() - startTime;

        console.log(`[agentWorker] ✓ Loaded ${configs.length} enabled MCP config(s) in ${queryTime}ms`);

        if (configs.length === 0) {
            console.log(`[agentWorker] ℹ No enabled MCP configs found for agent ${agentId} - agent will use local tools only`);
        }

        return configs;
    } catch (error: any) {
        const queryTime = Date.now() - startTime;

        console.error(`[agentWorker] ✗ Failed to load MCP configs for agent ${agentId} after ${queryTime}ms`);
        console.error(`[agentWorker]   Error: ${error.message}`);

        if (error.code) {
            console.error(`[agentWorker]   Code: ${error.code}`);
        }

        if (error.stack) {
            console.error(`[agentWorker]   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
        }

        // Fail-safe: Return empty array - agent can still execute with local tools only
        console.warn(`[agentWorker] ⚠ Continuing with local tools only (external MCP servers unavailable)`);

        return [];
    }
}

/**
 * Connect to external MCP servers and discover available tools
 *
 * Establishes connections to all configured external MCP servers and performs
 * tool discovery. Uses connection pooling (reuses existing connections) and
 * implements fail-soft error handling (failures on individual servers don't
 * block execution).
 *
 * @param configs - Array of MCP configurations to connect to
 * @returns Object containing connected server names and discovered tools map
 *
 * @example
 * const { connectedServers, availableTools } = await connectExternalServers(configs);
 * // connectedServers: ['context7', 'playwright']
 * // availableTools: Map { 'context7' => [...tools], 'playwright' => [...tools] }
 */
async function connectExternalServers(
    configs: AgentMCPConfig[]
): Promise<{ connectedServers: string[]; availableTools: Map<string, Tool[]> }> {
    const connectedServers: string[] = [];
    const availableTools: Map<string, Tool[]> = new Map();

    if (configs.length === 0) {
        console.log('[agentWorker] No MCP configs provided, skipping external server connections');
        return { connectedServers, availableTools };
    }

    console.log(`[agentWorker] Connecting to ${configs.length} external MCP server(s)...`);

    const manager = getMCPClientManager();
    const connectionStartTime = Date.now();

    for (const config of configs) {
        try {
            console.log(`[agentWorker]   → ${config.server_name}...`);

            // Check if already connected (connection pooling)
            if (manager.isConnected(config.server_name)) {
                console.log(`[agentWorker]     ✓ Already connected (reusing connection)`);
            } else {
                // Parse auth config
                let authConfig: any = { type: 'none' };

                if (config.auth_type !== 'none' && config.auth_credentials) {
                    if (config.auth_type === 'bearer') {
                        authConfig = {
                            type: 'bearer' as const,
                            token: config.auth_credentials.token || '',
                        };
                    } else if (config.auth_type === 'api_key') {
                        authConfig = {
                            type: 'api-key' as const,
                            key: config.auth_credentials.key || '',
                            header: config.auth_credentials.header || 'X-API-Key',
                        };
                    } else if (config.auth_type === 'basic') {
                        authConfig = {
                            type: 'basic' as const,
                            username: config.auth_credentials.username || '',
                            password: config.auth_credentials.password || '',
                        };
                    }
                }

                // Connect to MCP server
                await manager.connect({
                    name: config.server_name,
                    transport: {
                        type: config.transport_type,
                        url: config.server_url,
                    },
                    auth: authConfig,
                    healthCheck: {
                        enabled: true,
                        interval: 60000,
                        timeout: 10000,
                    },
                    retry: {
                        maxAttempts: 3,
                        backoffMs: 2000,
                    },
                });

                console.log(`[agentWorker]     ✓ Connected successfully`);
            }

            // Discover available tools
            const tools = await manager.listTools(config.server_name);
            availableTools.set(config.server_name, tools);
            connectedServers.push(config.server_name);

            console.log(`[agentWorker]     📋 Discovered ${tools.length} tool(s)`);
        } catch (error: any) {
            console.error(`[agentWorker]     ✗ Connection failed: ${error.message}`);

            // Enhanced error logging
            if (error.code) {
                console.error(`[agentWorker]       Code: ${error.code}`);
            }

            console.error(`[agentWorker]       URL: ${config.server_url}`);
            console.error(`[agentWorker]       Transport: ${config.transport_type}`);
            console.error(`[agentWorker]       Auth: ${config.auth_type}`);

            if (error.stack) {
                console.error(`[agentWorker]       Stack: ${error.stack.split('\n').slice(0, 2).join('\n')}`);
            }

            // Continue with other servers (fail-soft approach - don't throw)
        }
    }

    const connectionTime = Date.now() - connectionStartTime;
    const totalTools = Array.from(availableTools.values()).reduce((sum, tools) => sum + tools.length, 0);
    const successRate = configs.length > 0 ? Math.round((connectedServers.length / configs.length) * 100) : 0;
    const avgToolsPerServer = connectedServers.length > 0 ? Math.round(totalTools / connectedServers.length) : 0;

    // Summary logging with metrics
    console.log(
        `[agentWorker] ✓ MCP Connection Summary: ${connectedServers.length}/${configs.length} servers (${successRate}% success), ${totalTools} tools discovered, ${connectionTime}ms`
    );

    if (connectedServers.length > 0) {
        console.log(`[agentWorker]   Average: ${avgToolsPerServer} tools/server`);
    }

    // Critical: All servers failed
    if (configs.length > 0 && connectedServers.length === 0) {
        console.error(`[agentWorker] ✗ CRITICAL: All ${configs.length} MCP server(s) failed to connect - agent will have NO external tools`);
    }
    // Warning: Some servers failed
    else if (connectedServers.length < configs.length) {
        const failedCount = configs.length - connectedServers.length;
        console.warn(`[agentWorker] ⚠ ${failedCount} MCP server(s) failed to connect (${successRate}% success rate)`);
    }

    return { connectedServers, availableTools };
}

// ============================================================================
// Context Loading
// ============================================================================

/**
 * Load task context (dependencies, related tasks, memories)
 *
 * Provides the agent with all necessary context to execute the task:
 * - Task details and subtasks
 * - Dependency information
 * - Related tasks for reference
 * - Relevant memories from previous sessions
 *
 * @param jobData - Job data with task and project info
 * @returns Context object for agent execution
 */
async function loadTaskContext(jobData: AgentJobData): Promise<Record<string, unknown>> {
    const { taskId, projectId } = jobData;

    console.log(`[agentWorker] Loading context for task ${taskId}...`);

    // 1. Load task details with items
    const [taskRows] = await db.execute(
        `SELECT
            t.*,
            p.name as project_name,
            p.code as project_code,
            e.name as epic_name,
            s.name as sprint_name,
            (SELECT COUNT(*) FROM task_items WHERE task_id = t.id) as items_total,
            (SELECT COUNT(*) FROM task_items WHERE task_id = t.id AND is_completed = 1) as items_completed
        FROM tasks t
        LEFT JOIN projects p ON t.project_id = p.id
        LEFT JOIN epics e ON t.epic_id = e.id
        LEFT JOIN sprints s ON t.sprint_id = s.id
        WHERE t.id = ?`,
        [taskId]
    );

    const task = (taskRows as any[])[0];

    if (!task) {
        throw new Error(`Task ${taskId} not found in database`);
    }

    // Load task items (subtasks)
    const [itemRows] = await db.execute(
        `SELECT * FROM task_items WHERE task_id = ? ORDER BY sort_order ASC`,
        [taskId]
    );

    const items = itemRows as any[];

    console.log(`[agentWorker] Task loaded: ${task.title} (${items.length} items)`);

    // 2. Load dependencies (both blocks and depends_on)
    const [depRows] = await db.execute(
        `SELECT
            td.*,
            t1.title as source_task_title,
            t1.status as source_task_status,
            t2.title as target_task_title,
            t2.status as target_task_status
        FROM task_dependencies td
        LEFT JOIN tasks t1 ON td.source_task_id = t1.id
        LEFT JOIN tasks t2 ON td.target_task_id = t2.id
        WHERE td.source_task_id = ? OR td.target_task_id = ?
        ORDER BY td.created_at DESC`,
        [taskId, taskId]
    );

    const dependencies = depRows as any[];

    console.log(`[agentWorker] Loaded ${dependencies.length} dependencies`);

    // 3. Load related tasks (same epic or sprint)
    const relatedTasksQuery = task.epic_id
        ? `SELECT t.* FROM tasks t WHERE t.epic_id = ? AND t.id != ? LIMIT 10`
        : task.sprint_id
          ? `SELECT t.* FROM tasks t WHERE t.sprint_id = ? AND t.id != ? LIMIT 10`
          : null;

    let relatedTasks: any[] = [];

    if (relatedTasksQuery) {
        const relatedId = task.epic_id || task.sprint_id;
        const [relatedRows] = await db.execute(relatedTasksQuery, [relatedId, taskId]);
        relatedTasks = relatedRows as any[];

        console.log(`[agentWorker] Loaded ${relatedTasks.length} related tasks`);
    }

    // 4. Load relevant memories
    // Search for memories tagged with task code, project, or relevant keywords
    const searchTerms = [
        task.task_code,
        task.project_code,
        task.title.split(' ').slice(0, 3).join(' '), // First 3 words of title
    ]
        .filter(Boolean)
        .join(' ');

    const [memoryRows] = await db.execute(
        `SELECT m.*
        FROM memories m
        WHERE (m.project_id = ? OR m.project_id IS NULL)
          AND (
            MATCH(m.content, m.summary) AGAINST(? IN BOOLEAN MODE)
            OR EXISTS (
              SELECT 1 FROM memory_tags mt
              JOIN memory_tag_links mtl ON mt.id = mtl.tag_id
              WHERE mtl.memory_id = m.id
                AND mt.name IN ('decision', 'context', 'learning')
            )
          )
        ORDER BY m.importance DESC, m.created_at DESC
        LIMIT 10`,
        [projectId, searchTerms]
    );

    const memories = memoryRows as any[];

    console.log(`[agentWorker] Loaded ${memories.length} relevant memories`);

    // Return complete context
    return {
        task: {
            ...task,
            items,
            items_pending: items.filter((i) => !i.is_completed),
            items_completed_count: items.filter((i) => i.is_completed).length,
        },
        dependencies: {
            all: dependencies,
            blockers: dependencies.filter(
                (d) => d.target_task_id === taskId && d.dependency_type === 'blocks' && d.source_task_status !== 'completed'
            ),
            blocks: dependencies.filter((d) => d.source_task_id === taskId && d.dependency_type === 'blocks'),
            depends_on: dependencies.filter((d) => d.source_task_id === taskId && d.dependency_type === 'depends_on'),
        },
        relatedTasks,
        memories: memories.map((m) => ({
            id: m.id,
            content: m.content,
            summary: m.summary,
            importance: m.importance,
            created_at: m.created_at,
        })),
        metadata: {
            loaded_at: new Date().toISOString(),
            project_name: task.project_name,
            epic_name: task.epic_name,
            sprint_name: task.sprint_name,
        },
    };
}

// ============================================================================
// Job Processing
// ============================================================================

/**
 * Process agent execution job
 *
 * Main job processor that:
 * 1. Loads task context
 * 2. Connects to external MCP servers (if configured)
 * 3. Delegates execution to the assigned agent
 * 4. Updates task progress and items
 * 5. Returns execution result
 *
 * @param job - BullMQ job with AgentJobData payload
 * @returns JobResult with execution status and metrics
 */
async function processAgentJob(job: AgentJob): Promise<JobResult> {
    const startTime = Date.now();
    const { taskId, taskCode, agentId, agentName, projectId, mcpConfigs, metadata } = job.data;

    // Declare connectedServers outside try block for cleanup access in finally
    let connectedServers: string[] = [];

    console.log(`[agentWorker] =========================================`);
    console.log(`[agentWorker] Processing job ${job.id}`);
    console.log(`[agentWorker] Task: ${taskCode} - Agent: ${agentName}`);
    console.log(`[agentWorker] Priority: ${metadata?.priority || 'medium'}`);
    console.log(`[agentWorker] =========================================`);

    try {
        // ========================================================================
        // Phase 1: Context Loading (0-20%)
        // ========================================================================

        await job.updateProgress(5);
        console.log(`[agentWorker] [1/5] Loading task context...`);

        const context = await loadTaskContext(job.data);
        const task = context.task as any;
        const items = task.items as any[];
        const itemsPending = task.items_pending as any[];

        console.log(`[agentWorker] Context loaded:`);
        console.log(`[agentWorker]   - Task: ${task.title}`);
        console.log(`[agentWorker]   - Items: ${items.length} total, ${itemsPending.length} pending`);
        console.log(`[agentWorker]   - Dependencies: ${(context.dependencies as any).all.length}`);
        console.log(`[agentWorker]   - Memories: ${(context.memories as any[]).length}`);

        await job.updateProgress(20);

        // ========================================================================
        // Phase 2: Validation (20-30%)
        // ========================================================================

        console.log(`[agentWorker] [2/5] Validating execution conditions...`);

        // Check for blockers
        const blockers = (context.dependencies as any).blockers || [];
        if (blockers.length > 0) {
            console.warn(`[agentWorker] ⚠ Task has ${blockers.length} active blockers`);
            blockers.forEach((blocker: any) => {
                console.warn(
                    `[agentWorker]   - Blocked by: ${blocker.source_task_title} (${blocker.source_task_status})`
                );
            });

            // Return blocked status
            const executionTimeMs = Date.now() - startTime;
            return {
                success: false,
                taskId,
                taskCode,
                itemsCompleted: task.items_completed_count,
                itemsTotal: items.length,
                progress: task.progress || 0,
                executionTimeMs,
                error: {
                    message: `Task blocked by ${blockers.length} incomplete dependencies`,
                    code: 'TASK_BLOCKED',
                },
                taskStatus: 'blocked',
            };
        }

        // Update task status to in_progress
        await db.execute('UPDATE tasks SET status = ?, started_at = NOW() WHERE id = ?', ['in_progress', taskId]);

        console.log(`[agentWorker] ✓ No blockers, proceeding with execution`);
        await job.updateProgress(30);

        // ========================================================================
        // Phase 3: MCP Server Connection (30-40%)
        // ========================================================================

        console.log(`[agentWorker] [3/5] Connecting to MCP servers...`);

        // Load MCP configs from database (DFO-197: DB-driven config)
        const mcpConfigs = await loadAgentMCPConfigs(job.data.agentId);

        // Connect to external servers and discover tools (DFO-197: Refactored)
        const connectionResult = await connectExternalServers(mcpConfigs);
        connectedServers = connectionResult.connectedServers; // Update outer scope variable for cleanup in finally
        const availableTools = connectionResult.availableTools;

        await job.updateProgress(40);

        // ========================================================================
        // Phase 4: Agent Execution (40-90%)
        // ========================================================================

        console.log(`[agentWorker] [4/5] Executing agent...`);

        // ========================================================================
        // DFO-197: Generate External Tools Summary for Agent Context
        // ========================================================================

        interface ExternalToolsSummary {
            servers: {
                name: string;
                connected: boolean;
                tools_count: number;
                tools: {
                    name: string;
                    description?: string;
                    usage: string;
                }[];
            }[];
            total_servers: number;
            total_tools: number;
        }

        const externalToolsSummary: ExternalToolsSummary = {
            servers: Array.from(availableTools.entries()).map(([serverName, tools]) => ({
                name: serverName,
                connected: true,
                tools_count: tools.length,
                tools: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    usage: `Use proxy_external_tool with server_name="${serverName}", tool_name="${tool.name}"`,
                })),
            })),
            total_servers: connectedServers.length,
            total_tools: Array.from(availableTools.values()).reduce((sum, tools) => sum + tools.length, 0),
        };

        if (externalToolsSummary.total_tools > 0) {
            console.log(`[agentWorker] ✓ External tools summary generated:`);
            console.log(`[agentWorker]   Servers: ${externalToolsSummary.total_servers}`);
            console.log(`[agentWorker]   Total tools: ${externalToolsSummary.total_tools}`);

            externalToolsSummary.servers.forEach((server) => {
                console.log(`[agentWorker]   ${server.name}: ${server.tools_count} tools`);
                server.tools.slice(0, 3).forEach((tool) => {
                    console.log(`[agentWorker]      - ${tool.name}: ${tool.description || 'No description'}`);
                });
                if (server.tools.length > 3) {
                    console.log(`[agentWorker]      ... and ${server.tools.length - 3} more`);
                }
            });
        }

        // ========================================================================
        // DFO-197: Build Agent Execution Context with External Tools
        // ========================================================================

        const agentContext = {
            task: {
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
            },
            project: {
                id: context.project_id,
                name: context.project_name,
            },
            items_pending: itemsPending.map((item: any) => ({
                id: item.id,
                title: item.title,
                description: item.description,
                estimated_minutes: item.estimated_minutes,
            })),
            dependencies: context.dependencies,
            related_tasks: context.related_tasks,
            memories: context.memories,
            external_tools: externalToolsSummary,
        };

        // ========================================================================
        // Agent Prompt with External Tools Injection (DFO-197)
        // ========================================================================

        const agentPrompt = `
You are SOLARIA Agent ${job.data.agentId} executing task #${taskId}.

## Task Details
**Title:** ${task.title}
**Description:** ${task.description || 'No description provided'}
**Priority:** ${task.priority}
**Status:** ${task.status}

## Pending Subtasks (${itemsPending.length})
${itemsPending
    .map(
        (item: any, index: number) => `
${index + 1}. ${item.title}
   ${item.description ? `Description: ${item.description}` : ''}
   ${item.estimated_minutes ? `Estimated: ${item.estimated_minutes} minutes` : ''}
`
    )
    .join('\n')}

${
    externalToolsSummary.total_tools > 0
        ? `
## External MCP Tools Available (${externalToolsSummary.total_tools} tools from ${externalToolsSummary.total_servers} servers)

You have access to external tools from the following MCP servers:

${externalToolsSummary.servers
    .map(
        (server) => `
### ${server.name} (${server.tools_count} tools)
${server.tools
    .map(
        (tool) => `- **${tool.name}**: ${tool.description || 'No description'}
  Usage: ${tool.usage}
  Example:
  \`\`\`
  proxy_external_tool({
    server_name: "${server.name}",
    tool_name: "${tool.name}",
    params: { /* tool-specific parameters */ },
    format: "human"
  })
  \`\`\`
`
    )
    .join('\n')}
`
    )
    .join('\n')}

## How to Use External Tools
Call the DFO tool "proxy_external_tool" with:
- **server_name**: The server name (e.g., "context7", "playwright", "coderabbit")
- **tool_name**: The specific tool name from the list above
- **params**: Parameters for that tool (see tool documentation)
- **format**: "json" or "human" (human recommended for readability)

These external tools extend your capabilities beyond DFO's built-in tools.
`
        : '## No External Tools Available\nYou are working with DFO built-in tools only.'
}

## Your Mission
Execute the pending subtasks listed above. Use external tools when they can help accomplish the work more efficiently.

Report progress as you complete each subtask.
`.trim();

        // ========================================================================
        // Agent Execution (Placeholder - Real implementation pending)
        // ========================================================================

        const output: string[] = [];
        output.push(`✓ Agent context prepared with ${externalToolsSummary.total_tools} external tools`);
        output.push('');
        output.push('--- Agent Execution Placeholder ---');
        output.push('Real agent execution will be implemented in future phase.');
        output.push('Context is fully prepared with external tools injection.');
        output.push('');
        output.push('Agent Prompt Preview (first 500 chars):');
        output.push(agentPrompt.substring(0, 500) + '...');

        // Simulate progress updates
        for (let progress = 40; progress <= 90; progress += 10) {
            await job.updateProgress(progress);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log(`[agentWorker] ✓ Agent context built with external tools`);
        console.log(`[agentWorker] ℹ Agent prompt length: ${agentPrompt.length} characters`);
        if (externalToolsSummary.total_tools > 0) {
            console.log(`[agentWorker] ℹ External tools injected: ${externalToolsSummary.total_tools} from ${externalToolsSummary.total_servers} servers`);
        }

        await job.updateProgress(90);

        // ========================================================================
        // Phase 5: Finalization (90-100%)
        // ========================================================================

        console.log(`[agentWorker] [5/5] Finalizing execution...`);

        // Calculate metrics
        const executionTimeMs = Date.now() - startTime;
        const itemsCompleted = task.items_completed_count;
        const itemsTotal = items.length;
        const progressPercent = itemsTotal > 0 ? Math.round((itemsCompleted / itemsTotal) * 100) : 100;

        // Determine final task status
        const taskStatus: JobResult['taskStatus'] = progressPercent === 100 ? 'completed' : 'in_progress';

        // Update task status if completed
        if (taskStatus === 'completed') {
            await db.execute('UPDATE tasks SET status = ?, completed_at = NOW(), progress = 100 WHERE id = ?', [
                'completed',
                taskId,
            ]);
            console.log(`[agentWorker] ✓ Task marked as completed`);
        } else {
            await db.execute('UPDATE tasks SET progress = ? WHERE id = ?', [progressPercent, taskId]);
            console.log(`[agentWorker] Task progress updated: ${progressPercent}%`);
        }

        await job.updateProgress(100);

        // Build result
        const result: JobResult = {
            success: true,
            taskId,
            taskCode,
            itemsCompleted,
            itemsTotal,
            progress: progressPercent,
            executionTimeMs,
            taskStatus,
            output: output.join('\n'),
        };

        console.log(`[agentWorker] =========================================`);
        console.log(`[agentWorker] ✓ Job ${job.id} completed successfully`);
        console.log(`[agentWorker] Time: ${executionTimeMs}ms`);
        console.log(`[agentWorker] Progress: ${progressPercent}% (${itemsCompleted}/${itemsTotal} items)`);
        console.log(`[agentWorker] Status: ${taskStatus}`);
        console.log(`[agentWorker] =========================================`);

        return result;
    } catch (error: any) {
        const executionTimeMs = Date.now() - startTime;

        console.error(`[agentWorker] =========================================`);
        console.error(`[agentWorker] ✗ Job ${job.id} failed`);
        console.error(`[agentWorker] Error: ${error.message}`);
        console.error(`[agentWorker] =========================================`);

        // Update task status to blocked
        await db.execute('UPDATE tasks SET status = ? WHERE id = ?', ['blocked', taskId]);

        // Build error result
        const result: JobResult = {
            success: false,
            taskId,
            taskCode,
            itemsCompleted: 0,
            itemsTotal: 0,
            progress: 0,
            executionTimeMs,
            error: {
                message: error.message,
                code: error.code || 'EXECUTION_ERROR',
                stack: error.stack,
            },
            taskStatus: 'blocked',
        };

        return result;
    } finally {
        // ========================================================================
        // DFO-197: Cleanup MCP Connections (MANDATORY)
        // ========================================================================

        console.log('[agentWorker] Cleaning up MCP connections...');

        // Check if connectedServers was defined (may be undefined if job failed early)
        if (typeof connectedServers !== 'undefined' && connectedServers.length > 0) {
            const manager = getMCPClientManager();
            let disconnectedCount = 0;
            let errorCount = 0;

            for (const serverName of connectedServers) {
                try {
                    console.log(`[agentWorker]   → Disconnecting ${serverName}...`);
                    await manager.disconnect(serverName);
                    disconnectedCount++;
                    console.log(`[agentWorker]     ✓ Disconnected`);
                } catch (error: any) {
                    errorCount++;
                    console.warn(`[agentWorker]     ⚠ Failed to disconnect ${serverName}: ${error.message}`);
                    // Best-effort: continue with other servers (don't throw)
                }
            }

            const successRate = Math.round((disconnectedCount / connectedServers.length) * 100);
            console.log(
                `[agentWorker] ✓ Cleanup complete: ${disconnectedCount}/${connectedServers.length} servers disconnected (${successRate}% success rate)`
            );

            if (errorCount > 0) {
                console.warn(`[agentWorker] ⚠ ${errorCount} disconnect error(s) occurred (non-fatal)`);
            }
        } else {
            console.log('[agentWorker] No MCP connections to clean up');
        }
    }
}

// ============================================================================
// Worker Instance
// ============================================================================

/**
 * Create BullMQ Worker instance
 */
const worker = new Worker<AgentJobData, JobResult>(
    QueueNames.AGENT_EXECUTION,
    processAgentJob,
    getWorkerOptions()
);

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Calculate retry delay using exponential backoff
 * Formula: delay * (2 ^ attemptsMade)
 * @param attemptsMade - Number of failed attempts
 * @returns Delay in milliseconds
 */
function getRetryDelay(attemptsMade: number): number {
    const baseDelay = 5000; // 5 seconds (from queue config)
    return baseDelay * Math.pow(2, attemptsMade - 1);
}

/**
 * Job completed successfully
 */
worker.on('completed', async (job: AgentJob, result: JobResult) => {
    console.log(
        `[agentWorker] ✓ Job ${job.id} completed: ${result.taskCode} (${result.executionTimeMs}ms)`
    );

    try {
        // Update agent_jobs table
        await db.execute(
            `UPDATE agent_jobs
             SET status = 'completed',
                 job_result = ?,
                 completed_at = NOW(),
                 execution_time_ms = ?,
                 progress = 100
             WHERE bullmq_job_id = ?`,
            [JSON.stringify(result), result.executionTimeMs, job.id]
        );

        console.log(`[agentWorker] ✓ Database updated for job ${job.id}`);
    } catch (error: any) {
        console.error(`[agentWorker] ✗ Failed to update database for job ${job.id}:`, error.message);
    }
});

/**
 * Job failed after all retry attempts
 */
worker.on('failed', async (job: AgentJob | undefined, error: Error) => {
    if (!job) {
        console.error('[agentWorker] ✗ Job failed without job data:', error.message);
        return;
    }

    const attemptsMade = job.attemptsMade || 0;
    const maxAttempts = job.opts.attempts || 3;
    const isPermanentFailure = attemptsMade >= maxAttempts;

    console.error(
        `[agentWorker] ✗ Job ${job.id} failed (attempt ${attemptsMade}/${maxAttempts}):`,
        error.message
    );

    try {
        if (isPermanentFailure) {
            // Job failed permanently after all retries
            console.error(`[agentWorker] ✗ Job ${job.id} failed permanently after ${attemptsMade} attempts`);

            await db.execute(
                `UPDATE agent_jobs
                 SET status = 'failed',
                     attempts_made = ?,
                     last_error = ?,
                     error_stack = ?,
                     completed_at = NOW()
                 WHERE bullmq_job_id = ?`,
                [attemptsMade, error.message, error.stack || '', job.id]
            );
        } else {
            // Job will be retried
            console.warn(
                `[agentWorker] ⚠ Job ${job.id} will retry in ${getRetryDelay(attemptsMade)}ms (exponential backoff)`
            );

            await db.execute(
                `UPDATE agent_jobs
                 SET status = 'delayed',
                     attempts_made = ?,
                     last_error = ?
                 WHERE bullmq_job_id = ?`,
                [attemptsMade, error.message, job.id]
            );
        }

        console.log(`[agentWorker] ✓ Database updated for failed job ${job.id}`);
    } catch (dbError: any) {
        console.error(`[agentWorker] ✗ Failed to update database for job ${job.id}:`, dbError.message);
    }
});

/**
 * Job started (active)
 */
worker.on('active', async (job: AgentJob) => {
    console.log(`[agentWorker] ▶ Job ${job.id} started: ${job.data.taskCode}`);

    try {
        await db.execute(
            `UPDATE agent_jobs
             SET status = 'active',
                 started_at = NOW()
             WHERE bullmq_job_id = ?`,
            [job.id]
        );
    } catch (error: any) {
        console.error(`[agentWorker] ✗ Failed to update status for job ${job.id}:`, error.message);
    }
});

/**
 * Job progress update
 */
worker.on('progress', async (job: AgentJob, progress: number | object) => {
    const progressValue = typeof progress === 'number' ? progress : 0;
    console.log(`[agentWorker] Progress update: Job ${job.id} at ${progressValue}%`);

    try {
        // Update agent_jobs progress
        await db.execute(
            `UPDATE agent_jobs
             SET progress = ?
             WHERE bullmq_job_id = ?`,
            [progressValue, job.id]
        );

        // TODO (DFO-187): Emit WebSocket event for real-time UI update
        // - Socket.IO broadcast to project room
        // - Event: 'agent_job_progress'
        // - Payload: { jobId, taskId, taskCode, progress }
    } catch (error: any) {
        console.error(`[agentWorker] ✗ Failed to update progress for job ${job.id}:`, error.message);
    }
});

/**
 * Worker ready
 */
worker.on('ready', () => {
    console.log('[agentWorker] =========================================');
    console.log('[agentWorker] SOLARIA DFO - Agent Execution Worker');
    console.log('[agentWorker] =========================================');
    console.log(`[agentWorker] Queue: ${QueueNames.AGENT_EXECUTION}`);
    console.log(`[agentWorker] Concurrency: ${getWorkerOptions().concurrency}`);
    console.log('[agentWorker] Status: READY');
    console.log('[agentWorker] =========================================');
});

/**
 * Worker error (critical)
 */
worker.on('error', (error: Error) => {
    console.error('[agentWorker] =========================================');
    console.error('[agentWorker] CRITICAL WORKER ERROR');
    console.error('[agentWorker] =========================================');
    console.error('[agentWorker] Error:', error.message);
    console.error('[agentWorker] Stack:', error.stack);
    console.error('[agentWorker] =========================================');

    // TODO (DFO-187): Emit critical alert
    // - Log to error tracking system (Sentry, etc.)
    // - Emit WebSocket alert to dashboard
    // - Send notification to operations team
});

/**
 * Job stalled (appears stuck)
 */
worker.on('stalled', async (jobId: string) => {
    console.warn('[agentWorker] ⚠ Job stalled (appears stuck):', jobId);

    try {
        // Mark job as delayed in database
        await db.execute(
            `UPDATE agent_jobs
             SET status = 'delayed',
                 last_error = 'Job stalled and will be retried'
             WHERE bullmq_job_id = ?`,
            [jobId]
        );

        console.log(`[agentWorker] ✓ Stalled job ${jobId} marked for retry`);
    } catch (error: any) {
        console.error(`[agentWorker] ✗ Failed to update stalled job ${jobId}:`, error.message);
    }
});

/**
 * Queue drained (all jobs processed)
 */
worker.on('drained', () => {
    console.log('[agentWorker] ℹ Queue drained - all jobs processed, waiting for new jobs...');
});

/**
 * Worker paused
 */
worker.on('paused', () => {
    console.log('[agentWorker] ⏸ Worker paused');
});

/**
 * Worker resumed
 */
worker.on('resumed', () => {
    console.log('[agentWorker] ▶ Worker resumed');
});

// ============================================================================
// Graceful Shutdown
// ============================================================================

/**
 * Shutdown handler
 *
 * Ensures graceful shutdown:
 * 1. Stop accepting new jobs
 * 2. Wait for active jobs to complete (with timeout)
 * 3. Close worker connections
 * 4. Close database connection
 * 5. Exit process
 *
 * @param signal - Signal received (SIGTERM, SIGINT)
 */
async function shutdown(signal: string): Promise<void> {
    console.log('[agentWorker] =========================================');
    console.log(`[agentWorker] Received ${signal}, shutting down gracefully...`);
    console.log('[agentWorker] =========================================');

    const SHUTDOWN_TIMEOUT = 30000; // 30 seconds
    let shutdownTimer: NodeJS.Timeout | null = null;

    try {
        // Set force shutdown timer
        shutdownTimer = setTimeout(() => {
            console.error('[agentWorker] ✗ Shutdown timeout exceeded, forcing exit...');
            process.exit(1);
        }, SHUTDOWN_TIMEOUT);

        // Check active jobs
        const jobCounts = await worker.getJobCounts('waiting', 'active', 'delayed');
        console.log('[agentWorker] Job counts before shutdown:');
        console.log(`[agentWorker]   - Waiting: ${jobCounts.waiting}`);
        console.log(`[agentWorker]   - Active: ${jobCounts.active}`);
        console.log(`[agentWorker]   - Delayed: ${jobCounts.delayed}`);

        if (jobCounts.active > 0) {
            console.log(
                `[agentWorker] Waiting for ${jobCounts.active} active job(s) to complete (timeout: ${SHUTDOWN_TIMEOUT}ms)...`
            );
        }

        // Close worker (waits for active jobs to complete)
        console.log('[agentWorker] Closing worker...');
        await worker.close();
        console.log('[agentWorker] ✓ Worker closed');

        // Clear timeout
        if (shutdownTimer) {
            clearTimeout(shutdownTimer);
            shutdownTimer = null;
        }
    } catch (error: any) {
        console.error('[agentWorker] ✗ Error closing worker:', error.message);
    }

    try {
        // Close database connection
        if (db) {
            console.log('[agentWorker] Closing database connection...');
            await db.end();
            console.log('[agentWorker] ✓ Database closed');
        }
    } catch (error: any) {
        console.error('[agentWorker] ✗ Error closing database:', error.message);
    }

    console.log('[agentWorker] =========================================');
    console.log('[agentWorker] Shutdown complete');
    console.log('[agentWorker] =========================================');
    process.exit(0);
}

// Register shutdown handlers
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize worker
 */
async function initialize(): Promise<void> {
    try {
        // Connect to database
        db = await connectToDatabase();

        console.log('[agentWorker] Initialization complete, waiting for jobs...');
    } catch (error: any) {
        console.error('[agentWorker] Initialization failed:', error.message);
        process.exit(1);
    }
}

// Start initialization
initialize();

// ============================================================================
// Export
// ============================================================================

export default worker;

/**
 * MCP Proxy Tools
 * DFO-196 | Epic 20 Sprint 2.2: Agent Integration
 *
 * @author ECO-Omega | DFO 4.0
 * @date 2026-01-01 (updated)
 * @task DFO-196
 *
 * Proxy tools for executing commands on external MCP servers.
 * Enables DFO to act as MCP client and forward tool calls to Context7, Playwright, CodeRabbit, etc.
 */
import { z } from 'zod';
import { getMCPClientManager } from '../client/mcp-client-manager.js';
import { ResponseBuilder, CommonErrors } from '../utils/response-builder.js';
const VERSION = '4.0.0';
// ============================================================================
// Zod Validation Schemas
// ============================================================================
/**
 * Schema for proxy_external_tool
 * Executes a tool on an external MCP server
 */
const ProxyExternalToolInputSchema = z.object({
    server_name: z
        .string()
        .min(1, 'Server name is required')
        .describe('Name of the external MCP server (e.g., "context7", "playwright", "coderabbit")'),
    tool_name: z
        .string()
        .min(1, 'Tool name is required')
        .describe('Name of the tool to execute on the external server'),
    params: z
        .record(z.unknown())
        .default({})
        .describe('Parameters to pass to the external tool'),
    format: z.enum(['json', 'human']).default('json').describe('Output format'),
});
/**
 * Schema for list_external_tools
 * Discovers available tools on external MCP servers
 */
const ListExternalToolsInputSchema = z.object({
    server_name: z
        .string()
        .optional()
        .describe('Optional server name to filter tools. If omitted, lists tools from all connected servers.'),
    format: z.enum(['json', 'human']).default('json').describe('Output format'),
});
// ============================================================================
// Tool: proxy_external_tool
// ============================================================================
export const proxyExternalTool = {
    name: 'proxy_external_tool',
    description: `Execute a tool on an external MCP server.

This tool allows DFO to forward tool calls to external MCP servers like Context7 (documentation),
Playwright (browser automation), or CodeRabbit (code reviews).

Example use cases:
- Query Context7 for library documentation during development
- Execute browser automation via Playwright for testing
- Request code reviews from CodeRabbit for quality assurance

The external server must be configured and connected in the agent's MCP configuration.`,
    inputSchema: ProxyExternalToolInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        const startTime = Date.now();
        try {
            const manager = getMCPClientManager();
            // Validate server connection
            if (!manager.isConnected(params.server_name)) {
                return builder.error(CommonErrors.notFound('MCP server', params.server_name, {
                    suggestion: 'Ensure the MCP server is configured in the agent MCP config and connected. Use list_external_tools to see available servers.',
                }));
            }
            // Execute tool on external server
            const result = await manager.executeTool(params.server_name, params.tool_name, params.params);
            if (!result.success) {
                return builder.error({
                    code: 'EXTERNAL_TOOL_EXECUTION_FAILED',
                    message: `Failed to execute tool "${params.tool_name}" on server "${params.server_name}"`,
                    details: {
                        server: params.server_name,
                        tool: params.tool_name,
                        error: result.error,
                    },
                    suggestion: 'Check tool name and parameters. Use list_external_tools to verify available tools.',
                });
            }
            const executionTime = Date.now() - startTime;
            const data = {
                server_name: params.server_name,
                tool_name: params.tool_name,
                executed: true,
                result: result.content,
                execution_time_ms: executionTime,
            };
            // Human-readable formatting
            const formatted = `✅ External Tool Executed Successfully

Server: ${params.server_name}
Tool: ${params.tool_name}
Execution Time: ${executionTime}ms

Result:
${JSON.stringify(result.content, null, 2)}`;
            return builder.success(data, {
                format: params.format,
                formatted,
            });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
export const listExternalTools = {
    name: 'list_external_tools',
    description: `List available tools from external MCP servers.

Discovers all tools available on connected external MCP servers. This is useful for:
- Understanding what capabilities are available
- Verifying server connections
- Finding the correct tool name for proxy_external_tool

If server_name is provided, only lists tools from that server. Otherwise, lists all tools from all connected servers.`,
    inputSchema: ListExternalToolsInputSchema,
    async execute(params) {
        const builder = new ResponseBuilder({ version: VERSION });
        try {
            const manager = getMCPClientManager();
            // Get all connected servers
            const allServers = manager.listServers();
            if (allServers.length === 0) {
                return builder.error(CommonErrors.validation({
                    field: 'external_servers',
                    message: 'No external MCP servers are connected',
                    suggestion: 'Configure and connect external MCP servers in the agent MCP configuration before using proxy tools.',
                }));
            }
            // Filter by server_name if provided
            const targetServers = params.server_name
                ? allServers.filter((s) => s.name === params.server_name)
                : allServers;
            if (params.server_name && targetServers.length === 0) {
                return builder.error(CommonErrors.notFound('MCP server', params.server_name, {
                    suggestion: `Available servers: ${allServers.map((s) => s.name).join(', ')}`,
                }));
            }
            // Fetch tools from each server
            const serversData = await Promise.all(targetServers.map(async (server) => {
                try {
                    const tools = await manager.listTools(server.name);
                    return {
                        name: server.name,
                        connected: true,
                        tools_count: tools.length,
                        tools: tools.map((t) => ({
                            name: t.name,
                            description: t.description,
                        })),
                    };
                }
                catch (error) {
                    return {
                        name: server.name,
                        connected: false,
                        tools_count: 0,
                        tools: [],
                    };
                }
            }));
            const totalTools = serversData.reduce((sum, s) => sum + s.tools_count, 0);
            const data = {
                total_servers: serversData.length,
                total_tools: totalTools,
                servers: serversData,
            };
            // Human-readable formatting
            const formatted = `🔌 External MCP Servers and Tools
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Servers: ${data.total_servers}
Total Tools: ${data.total_tools}

${serversData
                .map((server) => `
📡 Server: ${server.name}
   Status: ${server.connected ? '✓ Connected' : '✗ Disconnected'}
   Tools: ${server.tools_count}

${server.tools.map((tool) => `   • ${tool.name}${tool.description ? `\n     ${tool.description}` : ''}`).join('\n')}
`)
                .join('\n')}`;
            return builder.success(data, {
                format: params.format,
                formatted,
            });
        }
        catch (error) {
            return builder.errorFromException(error);
        }
    },
};
// ============================================================================
// Export all tools
// ============================================================================
export const mcpProxyTools = [proxyExternalTool, listExternalTools];
//# sourceMappingURL=mcp-proxy.js.map
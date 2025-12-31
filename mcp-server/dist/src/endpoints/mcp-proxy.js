/**
 * MCP Proxy Tools
 *
 * @author ECO-Lambda | DFO 4.0 Epic 2 Sprint 2.2
 * @date 2025-12-31
 * @task DFO-2007
 *
 * Proxy tools to execute tools on external MCP servers
 * Allows agents to call tools from Context7, Playwright, CodeRabbit, etc.
 */
import { z } from 'zod';
import { getMCPClientManager } from '../client/mcp-client-manager.js';
import { ResponseBuilder } from '../utils/response-builder.js';
// ============================================================================
// Validation Schemas
// ============================================================================
const ProxyExternalToolSchema = z.object({
    server_name: z.string().min(1).describe('MCP server name (e.g., context7, playwright)'),
    tool_name: z.string().min(1).describe('Tool to execute on the external server'),
    parameters: z.record(z.unknown()).optional().describe('Parameters to pass to the tool'),
});
const ListExternalToolsSchema = z.object({
    server_name: z.string().min(1).describe('MCP server name to list tools from'),
});
// ============================================================================
// Tool Implementations
// ============================================================================
/**
 * Proxy a tool call to an external MCP server
 *
 * This allows agents to execute tools on external MCP servers like Context7,
 * Playwright, CodeRabbit, etc. without needing direct access.
 */
export async function proxyExternalTool(params) {
    const builder = new ResponseBuilder({ version: '1.0.0' });
    try {
        const { server_name, tool_name, parameters = {} } = params;
        // Get MCP client manager
        const manager = getMCPClientManager();
        // Check if server is connected
        if (!manager.isConnected(server_name)) {
            return JSON.stringify(builder.error({
                code: 'MCP_SERVER_NOT_CONNECTED',
                message: `MCP server '${server_name}' is not connected`,
                details: { server_name },
                suggestion: 'Ensure the agent has this MCP server configured and enabled',
            }));
        }
        // Execute tool on external server
        const result = await manager.executeTool(server_name, tool_name, parameters);
        if (!result.success) {
            return JSON.stringify(builder.error({
                code: 'TOOL_EXECUTION_FAILED',
                message: `Tool '${tool_name}' on server '${server_name}' failed: ${result.error}`,
                details: {
                    server_name,
                    tool_name,
                    error: result.error,
                },
            }));
        }
        // Format successful result
        const data = {
            server_name,
            tool_name,
            result: result.content,
        };
        const formatted = `✓ Successfully executed '${tool_name}' on ${server_name}

Result:
${typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2)}`;
        return JSON.stringify(builder.success(data, { format: 'human', formatted }));
    }
    catch (error) {
        return JSON.stringify(builder.errorFromException(error));
    }
}
/**
 * List available tools on an external MCP server
 *
 * Useful for discovering what tools are available on a connected MCP server.
 */
export async function listExternalTools(params) {
    const builder = new ResponseBuilder({ version: '1.0.0' });
    try {
        const { server_name } = params;
        // Get MCP client manager
        const manager = getMCPClientManager();
        // Check if server is connected
        if (!manager.isConnected(server_name)) {
            return JSON.stringify(builder.error({
                code: 'MCP_SERVER_NOT_CONNECTED',
                message: `MCP server '${server_name}' is not connected`,
                details: { server_name },
                suggestion: 'Ensure the agent has this MCP server configured and enabled',
            }));
        }
        // List tools
        const tools = manager.listTools(server_name);
        // Format tools list
        const toolsList = tools.map((tool) => ({
            name: tool.name,
            description: tool.description || 'No description',
            input_schema: tool.inputSchema,
        }));
        const data = {
            server_name,
            tools_count: toolsList.length,
            tools: toolsList,
        };
        const formatted = `📋 Found ${toolsList.length} tools on ${server_name}

${toolsList.map((t, i) => `${i + 1}. ${t.name}
   ${t.description}`).join('\n\n')}`;
        return JSON.stringify(builder.success(data, { format: 'human', formatted }));
    }
    catch (error) {
        return JSON.stringify(builder.errorFromException(error));
    }
}
// ============================================================================
// Tool Exports
// ============================================================================
export const mcpProxyTools = [
    {
        name: 'proxy_external_tool',
        description: 'Execute a tool on an external MCP server (Context7, Playwright, CodeRabbit, etc.). Allows agents to call tools from connected MCP servers.',
        inputSchema: ProxyExternalToolSchema,
        handler: proxyExternalTool,
    },
    {
        name: 'list_external_tools',
        description: 'List available tools on a connected external MCP server. Useful for discovering what tools are available.',
        inputSchema: ListExternalToolsSchema,
        handler: listExternalTools,
    },
];
//# sourceMappingURL=mcp-proxy.js.map
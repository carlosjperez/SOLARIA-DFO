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
declare const ProxyExternalToolSchema: z.ZodObject<{
    server_name: z.ZodString;
    tool_name: z.ZodString;
    parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    server_name: string;
    tool_name: string;
    parameters?: Record<string, unknown> | undefined;
}, {
    server_name: string;
    tool_name: string;
    parameters?: Record<string, unknown> | undefined;
}>;
declare const ListExternalToolsSchema: z.ZodObject<{
    server_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    server_name: string;
}, {
    server_name: string;
}>;
/**
 * Proxy a tool call to an external MCP server
 *
 * This allows agents to execute tools on external MCP servers like Context7,
 * Playwright, CodeRabbit, etc. without needing direct access.
 */
export declare function proxyExternalTool(params: z.infer<typeof ProxyExternalToolSchema>): Promise<string>;
/**
 * List available tools on an external MCP server
 *
 * Useful for discovering what tools are available on a connected MCP server.
 */
export declare function listExternalTools(params: z.infer<typeof ListExternalToolsSchema>): Promise<string>;
export declare const mcpProxyTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        server_name: z.ZodString;
        tool_name: z.ZodString;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "strip", z.ZodTypeAny, {
        server_name: string;
        tool_name: string;
        parameters?: Record<string, unknown> | undefined;
    }, {
        server_name: string;
        tool_name: string;
        parameters?: Record<string, unknown> | undefined;
    }>;
    handler: typeof proxyExternalTool;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        server_name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        server_name: string;
    }, {
        server_name: string;
    }>;
    handler: typeof listExternalTools;
})[];
export {};

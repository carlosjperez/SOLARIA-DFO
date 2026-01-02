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
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare const proxyExternalTool: Tool;
export declare const listExternalTools: Tool;
export declare const mcpProxyTools: {
    inputSchema: {
        [x: string]: unknown;
        type: "object";
        properties?: {
            [x: string]: object;
        } | undefined;
        required?: string[] | undefined;
    };
    name: string;
    description?: string | undefined;
    outputSchema?: {
        [x: string]: unknown;
        type: "object";
        properties?: {
            [x: string]: object;
        } | undefined;
        required?: string[] | undefined;
    } | undefined;
    annotations?: {
        title?: string | undefined;
        readOnlyHint?: boolean | undefined;
        destructiveHint?: boolean | undefined;
        idempotentHint?: boolean | undefined;
        openWorldHint?: boolean | undefined;
    } | undefined;
    execution?: {
        taskSupport?: "optional" | "required" | "forbidden" | undefined;
    } | undefined;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
    icons?: {
        src: string;
        mimeType?: string | undefined;
        sizes?: string[] | undefined;
        theme?: "light" | "dark" | undefined;
    }[] | undefined;
    title?: string | undefined;
}[];

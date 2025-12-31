/**
 * MCP Client Manager
 *
 * @author ECO-Lambda | DFO 4.0 Epic 2
 * @date 2025-12-30
 * @task DFO-2001
 *
 * Manages connections to external MCP servers (Context7, Playwright, CodeRabbit, etc.)
 * Supports HTTP, STDIO, and SSE transports with connection pooling and health checks.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { Tool } from '../types/mcp.js';
export type TransportType = 'http' | 'stdio' | 'sse';
export interface MCPServerConfig {
    name: string;
    transport: {
        type: TransportType;
        url?: string;
        command?: string;
        args?: string[];
        env?: Record<string, string>;
    };
    auth?: {
        type: 'bearer' | 'api-key' | 'none';
        token?: string;
        apiKey?: string;
        headers?: Record<string, string>;
    };
    healthCheck?: {
        enabled: boolean;
        interval: number;
        timeout: number;
    };
    retry?: {
        maxAttempts: number;
        backoffMs: number;
    };
}
export interface MCPClientConnection {
    name: string;
    client: Client;
    transport: Transport;
    config: MCPServerConfig;
    status: 'connected' | 'disconnected' | 'error';
    lastHealthCheck: Date | null;
    lastError: Error | null;
    tools: Tool[];
}
export interface ToolCallParams {
    name: string;
    arguments: Record<string, unknown>;
}
export interface ToolCallResult {
    success: boolean;
    content?: unknown;
    error?: string;
}
export interface HealthCheckResult {
    serverName: string;
    healthy: boolean;
    latency: number;
    timestamp: Date;
    error?: string;
}
export declare class MCPClientManager {
    private connections;
    private healthCheckIntervals;
    constructor();
    /**
     * Connect to an external MCP server
     */
    connect(config: MCPServerConfig): Promise<void>;
    /**
     * Disconnect from an MCP server
     */
    disconnect(serverName: string): Promise<void>;
    /**
     * Disconnect all servers
     */
    disconnectAll(): Promise<void>;
    /**
     * Check if connected to a server
     */
    isConnected(serverName: string): boolean;
    /**
     * Get all connected servers
     */
    getConnectedServers(): string[];
    /**
     * Get connection info
     */
    getConnection(serverName: string): MCPClientConnection | undefined;
    /**
     * List all tools from a specific server
     */
    listTools(serverName: string): Tool[];
    /**
     * List all tools from all connected servers
     */
    listAllTools(): Record<string, Tool[]>;
    /**
     * Execute a tool on a specific server
     */
    executeTool(serverName: string, toolName: string, params: Record<string, unknown>): Promise<ToolCallResult>;
    /**
     * Perform health check on a server
     */
    healthCheck(serverName: string): Promise<HealthCheckResult>;
    /**
     * Start periodic health checks for a server
     */
    private startHealthChecks;
    /**
     * Stop health checks for a server
     */
    private stopHealthChecks;
    /**
     * Create transport based on configuration
     */
    private createTransport;
    /**
     * Create HTTP transport
     */
    private createHttpTransport;
    /**
     * Create STDIO transport
     */
    private createStdioTransport;
    /**
     * Create SSE transport
     */
    private createSSETransport;
    /**
     * Attempt to reconnect to a server
     */
    reconnect(serverName: string): Promise<boolean>;
}
/**
 * Get singleton MCPClientManager instance
 */
export declare function getMCPClientManager(): MCPClientManager;
/**
 * Reset singleton (useful for testing)
 */
export declare function resetMCPClientManager(): void;

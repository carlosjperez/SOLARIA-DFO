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
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { Tool } from '../types/mcp.js';

// ============================================================================
// Types
// ============================================================================

export type TransportType = 'http' | 'stdio' | 'sse';

export interface MCPServerConfig {
  name: string;
  transport: {
    type: TransportType;
    url?: string; // For HTTP/SSE
    command?: string; // For STDIO
    args?: string[]; // For STDIO
    env?: Record<string, string>; // For STDIO
  };
  auth?: {
    type: 'bearer' | 'api-key' | 'none';
    token?: string;
    apiKey?: string;
    headers?: Record<string, string>;
  };
  healthCheck?: {
    enabled: boolean;
    interval: number; // milliseconds
    timeout: number; // milliseconds
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
  latency: number; // milliseconds
  timestamp: Date;
  error?: string;
}

// ============================================================================
// MCP Client Manager Class
// ============================================================================

export class MCPClientManager {
  private connections: Map<string, MCPClientConnection> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialization
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  /**
   * Connect to an external MCP server
   */
  async connect(config: MCPServerConfig): Promise<void> {
    // Check if already connected
    if (this.connections.has(config.name)) {
      throw new Error(`Already connected to server: ${config.name}`);
    }

    try {
      // Create transport based on type
      const transport = await this.createTransport(config);

      // Create MCP client
      const client = new Client(
        {
          name: 'dfo-client',
          version: '4.0.0',
        },
        {
          capabilities: {
            roots: {
              listChanged: true,
            },
            sampling: {},
          },
        }
      );

      // Connect client to transport
      await client.connect(transport);

      // Fetch available tools
      const toolsResponse = await client.listTools();
      const tools = toolsResponse.tools as unknown as Tool[];

      // Store connection
      const connection: MCPClientConnection = {
        name: config.name,
        client,
        transport,
        config,
        status: 'connected',
        lastHealthCheck: new Date(),
        lastError: null,
        tools,
      };

      this.connections.set(config.name, connection);

      // Start health checks if enabled
      if (config.healthCheck?.enabled) {
        this.startHealthChecks(config.name);
      }

      console.log(
        `[MCPClientManager] Connected to ${config.name}: ${tools.length} tools available`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `[MCPClientManager] Failed to connect to ${config.name}:`,
        errorMessage
      );
      throw new Error(`Failed to connect to ${config.name}: ${errorMessage}`);
    }
  }

  /**
   * Disconnect from an MCP server
   */
  async disconnect(serverName: string): Promise<void> {
    const connection = this.connections.get(serverName);

    if (!connection) {
      throw new Error(`Not connected to server: ${serverName}`);
    }

    // Stop health checks
    this.stopHealthChecks(serverName);

    // Close client connection
    await connection.client.close();

    // Remove from connections
    this.connections.delete(serverName);

    console.log(`[MCPClientManager] Disconnected from ${serverName}`);
  }

  /**
   * Disconnect all servers
   */
  async disconnectAll(): Promise<void> {
    const serverNames = Array.from(this.connections.keys());

    for (const serverName of serverNames) {
      await this.disconnect(serverName);
    }
  }

  /**
   * Check if connected to a server
   */
  isConnected(serverName: string): boolean {
    const connection = this.connections.get(serverName);
    return connection?.status === 'connected';
  }

  /**
   * Get all connected servers
   */
  getConnectedServers(): string[] {
    return Array.from(this.connections.keys()).filter((name) =>
      this.isConnected(name)
    );
  }

  /**
   * Get connection info
   */
  getConnection(serverName: string): MCPClientConnection | undefined {
    return this.connections.get(serverName);
  }

  // ============================================================================
  // Tool Management
  // ============================================================================

  /**
   * List all tools from a specific server
   */
  listTools(serverName: string): Tool[] {
    const connection = this.connections.get(serverName);

    if (!connection) {
      throw new Error(`Not connected to server: ${serverName}`);
    }

    return connection.tools;
  }

  /**
   * List all tools from all connected servers
   */
  listAllTools(): Record<string, Tool[]> {
    const allTools: Record<string, Tool[]> = {};

    for (const [serverName, connection] of this.connections.entries()) {
      allTools[serverName] = connection.tools;
    }

    return allTools;
  }

  /**
   * Execute a tool on a specific server
   */
  async executeTool(
    serverName: string,
    toolName: string,
    params: Record<string, unknown>
  ): Promise<ToolCallResult> {
    const connection = this.connections.get(serverName);

    if (!connection) {
      return {
        success: false,
        error: `Not connected to server: ${serverName}`,
      };
    }

    if (connection.status !== 'connected') {
      return {
        success: false,
        error: `Server ${serverName} is not connected (status: ${connection.status})`,
      };
    }

    try {
      const result = await connection.client.callTool({
        name: toolName,
        arguments: params,
      });

      return {
        success: true,
        content: result.content,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      connection.lastError = error instanceof Error ? error : new Error(errorMessage);
      connection.status = 'error';

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // ============================================================================
  // Health Checks
  // ============================================================================

  /**
   * Perform health check on a server
   */
  async healthCheck(serverName: string): Promise<HealthCheckResult> {
    const connection = this.connections.get(serverName);

    if (!connection) {
      return {
        serverName,
        healthy: false,
        latency: -1,
        timestamp: new Date(),
        error: `Not connected to server: ${serverName}`,
      };
    }

    const startTime = Date.now();

    try {
      await connection.client.ping();
      const latency = Date.now() - startTime;

      connection.lastHealthCheck = new Date();
      connection.status = 'connected';

      return {
        serverName,
        healthy: true,
        latency,
        timestamp: connection.lastHealthCheck,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      connection.lastError = error instanceof Error ? error : new Error(errorMessage);
      connection.status = 'error';

      return {
        serverName,
        healthy: false,
        latency: Date.now() - startTime,
        timestamp: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * Start periodic health checks for a server
   */
  private startHealthChecks(serverName: string): void {
    const connection = this.connections.get(serverName);

    if (!connection || !connection.config.healthCheck?.enabled) {
      return;
    }

    const interval = connection.config.healthCheck.interval || 30000; // Default 30s

    const intervalId = setInterval(async () => {
      await this.healthCheck(serverName);
    }, interval);

    this.healthCheckIntervals.set(serverName, intervalId);
  }

  /**
   * Stop health checks for a server
   */
  private stopHealthChecks(serverName: string): void {
    const intervalId = this.healthCheckIntervals.get(serverName);

    if (intervalId) {
      clearInterval(intervalId);
      this.healthCheckIntervals.delete(serverName);
    }
  }

  // ============================================================================
  // Transport Creation
  // ============================================================================

  /**
   * Create transport based on configuration
   */
  private async createTransport(config: MCPServerConfig): Promise<Transport> {
    switch (config.transport.type) {
      case 'http':
        return this.createHttpTransport(config);

      case 'stdio':
        return this.createStdioTransport(config);

      case 'sse':
        return this.createSSETransport(config);

      default:
        throw new Error(`Unsupported transport type: ${config.transport.type}`);
    }
  }

  /**
   * Create HTTP transport
   */
  private createHttpTransport(config: MCPServerConfig): Transport {
    if (!config.transport.url) {
      throw new Error('HTTP transport requires a URL');
    }

    const headers: Record<string, string> = {};

    // Add authentication headers
    if (config.auth) {
      if (config.auth.type === 'bearer' && config.auth.token) {
        headers['Authorization'] = `Bearer ${config.auth.token}`;
      } else if (config.auth.type === 'api-key' && config.auth.apiKey) {
        headers['X-API-Key'] = config.auth.apiKey;
      }

      // Add custom headers
      if (config.auth.headers) {
        Object.assign(headers, config.auth.headers);
      }
    }

    // TODO: Implement custom authProvider to pass headers
    // StreamableHTTPClientTransport doesn't accept headers directly
    return new StreamableHTTPClientTransport(
      new URL(config.transport.url)
    );
  }

  /**
   * Create STDIO transport
   */
  private createStdioTransport(config: MCPServerConfig): Transport {
    if (!config.transport.command) {
      throw new Error('STDIO transport requires a command');
    }

    return new StdioClientTransport({
      command: config.transport.command,
      args: config.transport.args || [],
      env: (config.transport.env || process.env) as Record<string, string> | undefined,
    });
  }

  /**
   * Create SSE transport
   */
  private createSSETransport(config: MCPServerConfig): Transport {
    if (!config.transport.url) {
      throw new Error('SSE transport requires a URL');
    }

    const headers: Record<string, string> = {};

    // Add authentication headers
    if (config.auth) {
      if (config.auth.type === 'bearer' && config.auth.token) {
        headers['Authorization'] = `Bearer ${config.auth.token}`;
      } else if (config.auth.type === 'api-key' && config.auth.apiKey) {
        headers['X-API-Key'] = config.auth.apiKey;
      }

      // Add custom headers
      if (config.auth.headers) {
        Object.assign(headers, config.auth.headers);
      }
    }

    // TODO: Implement custom authProvider to pass headers
    // SSEClientTransport doesn't accept headers directly
    return new SSEClientTransport(
      new URL(config.transport.url)
    );
  }

  // ============================================================================
  // Reconnection Logic
  // ============================================================================

  /**
   * Attempt to reconnect to a server
   */
  async reconnect(serverName: string): Promise<boolean> {
    const connection = this.connections.get(serverName);

    if (!connection) {
      console.error(`[MCPClientManager] Cannot reconnect: ${serverName} not found`);
      return false;
    }

    const config = connection.config;
    const maxAttempts = config.retry?.maxAttempts || 3;
    const backoffMs = config.retry?.backoffMs || 1000;

    // Disconnect first
    try {
      await this.disconnect(serverName);
    } catch (error) {
      console.warn(`[MCPClientManager] Error during disconnect:`, error);
    }

    // Retry connection with exponential backoff
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(
          `[MCPClientManager] Reconnection attempt ${attempt}/${maxAttempts} for ${serverName}`
        );

        await this.connect(config);
        console.log(`[MCPClientManager] Successfully reconnected to ${serverName}`);
        return true;
      } catch (error) {
        console.error(
          `[MCPClientManager] Reconnection attempt ${attempt} failed:`,
          error
        );

        if (attempt < maxAttempts) {
          const delay = backoffMs * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.error(
      `[MCPClientManager] Failed to reconnect to ${serverName} after ${maxAttempts} attempts`
    );
    return false;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let mcpClientManagerInstance: MCPClientManager | null = null;

/**
 * Get singleton MCPClientManager instance
 */
export function getMCPClientManager(): MCPClientManager {
  if (!mcpClientManagerInstance) {
    mcpClientManagerInstance = new MCPClientManager();
  }

  return mcpClientManagerInstance;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetMCPClientManager(): void {
  if (mcpClientManagerInstance) {
    mcpClientManagerInstance.disconnectAll();
    mcpClientManagerInstance = null;
  }
}

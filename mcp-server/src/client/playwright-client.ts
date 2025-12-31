/**
 * Playwright Client Adapter
 *
 * @author ECO-Lambda | DFO 4.0 Epic 2
 * @date 2025-12-30
 * @task DFO-2003
 *
 * Adapter for Playwright browser automation via MCP
 * Manages browser sessions, screenshots, and navigation
 */

import { getMCPClientManager, type MCPServerConfig } from './mcp-client-manager.js';

// ============================================================================
// Types
// ============================================================================

export interface PlaywrightConfig {
  serverUrl: string;
  apiKey?: string;
  browserType?: 'chromium' | 'firefox' | 'webkit';
  headless?: boolean;
  timeout?: number; // milliseconds
}

export interface BrowserSession {
  sessionId: string;
  browserType: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface NavigationResult {
  url: string;
  title: string;
  status: number;
  timestamp: Date;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  type?: 'png' | 'jpeg';
  quality?: number; // 0-100 for JPEG
  selector?: string; // CSS selector for element screenshot
}

export interface ScreenshotResult {
  data: string; // Base64 encoded
  mimeType: string;
  width: number;
  height: number;
}

export interface ClickOptions {
  selector: string;
  timeout?: number;
  waitForNavigation?: boolean;
}

export interface FillOptions {
  selector: string;
  value: string;
  timeout?: number;
}

// ============================================================================
// Playwright Client Class
// ============================================================================

export class PlaywrightClient {
  private serverName = 'playwright';
  private activeSessions: Map<string, BrowserSession> = new Map();

  constructor(private config: PlaywrightConfig) {}

  /**
   * Initialize connection to Playwright MCP server
   */
  async connect(): Promise<void> {
    const manager = getMCPClientManager();

    const mcpConfig: MCPServerConfig = {
      name: this.serverName,
      transport: {
        type: 'http',
        url: this.config.serverUrl,
      },
      auth: this.config.apiKey
        ? {
            type: 'api-key',
            apiKey: this.config.apiKey,
          }
        : { type: 'none' },
      healthCheck: {
        enabled: true,
        interval: 60000, // 1 min
        timeout: 10000, // 10s
      },
      retry: {
        maxAttempts: 3,
        backoffMs: 2000,
      },
    };

    await manager.connect(mcpConfig);
  }

  /**
   * Disconnect from Playwright and close all sessions
   */
  async disconnect(): Promise<void> {
    // Close all active sessions
    for (const sessionId of this.activeSessions.keys()) {
      await this.closeSession(sessionId);
    }

    const manager = getMCPClientManager();
    await manager.disconnect(this.serverName);
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Create a new browser session
   */
  async createSession(): Promise<string> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(this.serverName, 'browser_install', {
      // Playwright browser installation and initialization
    });

    if (!result.success) {
      throw new Error(`Failed to create browser session: ${result.error}`);
    }

    const sessionId = `session_${Date.now()}`;
    const session: BrowserSession = {
      sessionId,
      browserType: this.config.browserType || 'chromium',
      createdAt: new Date(),
      lastActivity: new Date(),
    };

    this.activeSessions.set(sessionId, session);

    return sessionId;
  }

  /**
   * Close a browser session
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const manager = getMCPClientManager();

    await manager.executeTool(this.serverName, 'browser_close', {
      sessionId,
    });

    this.activeSessions.delete(sessionId);
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): BrowserSession[] {
    return Array.from(this.activeSessions.values());
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  /**
   * Navigate to a URL
   */
  async navigate(url: string, sessionId?: string): Promise<NavigationResult> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(this.serverName, 'browser_navigate', {
      url,
      sessionId,
    });

    if (!result.success) {
      throw new Error(`Navigation failed: ${result.error}`);
    }

    // Update session activity
    if (sessionId) {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.lastActivity = new Date();
      }
    }

    return this.parseNavigationResult(result.content);
  }

  /**
   * Take a screenshot
   */
  async screenshot(options: ScreenshotOptions = {}): Promise<ScreenshotResult> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(
      this.serverName,
      'browser_take_screenshot',
      {
        fullPage: options.fullPage ?? false,
        type: options.type ?? 'png',
        quality: options.quality,
        filename: options.selector
          ? `element-${Date.now()}.${options.type || 'png'}`
          : `page-${Date.now()}.${options.type || 'png'}`,
        element: options.selector,
      }
    );

    if (!result.success) {
      throw new Error(`Screenshot failed: ${result.error}`);
    }

    return this.parseScreenshotResult(result.content);
  }

  // ============================================================================
  // Interactions
  // ============================================================================

  /**
   * Click an element
   */
  async click(options: ClickOptions): Promise<void> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(this.serverName, 'browser_click', {
      element: options.selector,
      ref: options.selector, // Playwright uses ref for element identification
      timeout: options.timeout || this.config.timeout || 30000,
    });

    if (!result.success) {
      throw new Error(`Click failed: ${result.error}`);
    }
  }

  /**
   * Fill a form field
   */
  async fill(options: FillOptions): Promise<void> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(this.serverName, 'browser_type', {
      element: options.selector,
      ref: options.selector,
      text: options.value,
      timeout: options.timeout || this.config.timeout || 30000,
    });

    if (!result.success) {
      throw new Error(`Fill failed: ${result.error}`);
    }
  }

  /**
   * Get page snapshot (accessibility tree)
   */
  async snapshot(filename?: string): Promise<string> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(this.serverName, 'browser_snapshot', {
      filename,
    });

    if (!result.success) {
      throw new Error(`Snapshot failed: ${result.error}`);
    }

    return this.parseSnapshotResult(result.content);
  }

  /**
   * Execute JavaScript in browser
   */
  async evaluate(script: string): Promise<unknown> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(this.serverName, 'browser_evaluate', {
      function: script,
    });

    if (!result.success) {
      throw new Error(`Evaluate failed: ${result.error}`);
    }

    return result.content;
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Parse navigation result
   */
  private parseNavigationResult(content: unknown): NavigationResult {
    if (typeof content === 'object' && content !== null) {
      const data = content as any;
      return {
        url: data.url || '',
        title: data.title || '',
        status: data.status || 200,
        timestamp: new Date(),
      };
    }

    return {
      url: '',
      title: '',
      status: 200,
      timestamp: new Date(),
    };
  }

  /**
   * Parse screenshot result
   */
  private parseScreenshotResult(content: unknown): ScreenshotResult {
    if (typeof content === 'object' && content !== null) {
      const data = content as any;
      return {
        data: data.data || data.screenshot || '',
        mimeType: data.mimeType || data.type || 'image/png',
        width: data.width || 0,
        height: data.height || 0,
      };
    }

    return {
      data: '',
      mimeType: 'image/png',
      width: 0,
      height: 0,
    };
  }

  /**
   * Parse snapshot result
   */
  private parseSnapshotResult(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }

    if (typeof content === 'object' && content !== null) {
      const data = content as any;
      return data.snapshot || data.tree || JSON.stringify(content, null, 2);
    }

    return '';
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let playwrightClientInstance: PlaywrightClient | null = null;

/**
 * Get singleton Playwright client
 */
export function getPlaywrightClient(config?: PlaywrightConfig): PlaywrightClient {
  if (!playwrightClientInstance) {
    if (!config) {
      throw new Error('PlaywrightClient requires configuration on first call');
    }
    playwrightClientInstance = new PlaywrightClient(config);
  }

  return playwrightClientInstance;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetPlaywrightClient(): void {
  if (playwrightClientInstance) {
    playwrightClientInstance.disconnect();
    playwrightClientInstance = null;
  }
}

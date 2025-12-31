/**
 * Context7 Client Adapter
 *
 * @author ECO-Lambda | DFO 4.0 Epic 2
 * @date 2025-12-30
 * @task DFO-2002
 *
 * Adapter for Context7 documentation service via MCP
 * Provides library resolution and documentation query with Redis caching
 */

import { getMCPClientManager, type MCPServerConfig } from './mcp-client-manager.js';
import type { ToolCallResult } from './mcp-client-manager.js';

// ============================================================================
// Types
// ============================================================================

export interface Context7Config {
  serverUrl: string;
  apiKey?: string;
  cacheEnabled?: boolean;
  cacheTTL?: number; // seconds
}

export interface LibraryResolution {
  libraryId: string;
  name: string;
  description?: string;
  version?: string;
  reputation?: 'High' | 'Medium' | 'Low';
  benchmarkScore?: number;
}

export interface DocumentationQuery {
  libraryId: string;
  query: string;
  results: string[];
  snippets?: string[];
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Context7 Client Class
// ============================================================================

export class Context7Client {
  private serverName = 'context7';
  private cacheEnabled: boolean;
  private cacheTTL: number;
  private cache: Map<string, { data: unknown; expiry: number }> = new Map();

  constructor(config: Context7Config) {
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.cacheTTL = config.cacheTTL ?? 300; // 5 minutes default
  }

  /**
   * Initialize connection to Context7 MCP server
   */
  async connect(config: Context7Config): Promise<void> {
    const manager = getMCPClientManager();

    const mcpConfig: MCPServerConfig = {
      name: this.serverName,
      transport: {
        type: 'http',
        url: config.serverUrl,
      },
      auth: config.apiKey
        ? {
            type: 'api-key',
            apiKey: config.apiKey,
          }
        : { type: 'none' },
      healthCheck: {
        enabled: true,
        interval: 30000, // 30s
        timeout: 5000, // 5s
      },
      retry: {
        maxAttempts: 3,
        backoffMs: 1000,
      },
    };

    await manager.connect(mcpConfig);
  }

  /**
   * Disconnect from Context7
   */
  async disconnect(): Promise<void> {
    const manager = getMCPClientManager();
    await manager.disconnect(this.serverName);
    this.cache.clear();
  }

  /**
   * Resolve library name to Context7-compatible library ID
   */
  async resolveLibraryId(
    libraryName: string,
    query?: string
  ): Promise<LibraryResolution[]> {
    const cacheKey = `resolve:${libraryName}:${query || ''}`;

    // Check cache
    if (this.cacheEnabled) {
      const cached = this.getCached<LibraryResolution[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Call MCP tool
    const manager = getMCPClientManager();
    const result = await manager.executeTool(this.serverName, 'resolve-library-id', {
      libraryName,
      query: query || `Documentation for ${libraryName}`,
    });

    if (!result.success) {
      throw new Error(`Failed to resolve library: ${result.error}`);
    }

    // Parse response
    const libraries = this.parseLibraryResolution(result.content);

    // Cache result
    if (this.cacheEnabled) {
      this.setCached(cacheKey, libraries);
    }

    return libraries;
  }

  /**
   * Query documentation for a specific library
   */
  async queryDocs(
    libraryId: string,
    query: string
  ): Promise<DocumentationQuery> {
    const cacheKey = `query:${libraryId}:${query}`;

    // Check cache
    if (this.cacheEnabled) {
      const cached = this.getCached<DocumentationQuery>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Call MCP tool
    const manager = getMCPClientManager();
    const result = await manager.executeTool(this.serverName, 'query-docs', {
      libraryId,
      query,
    });

    if (!result.success) {
      throw new Error(`Failed to query docs: ${result.error}`);
    }

    // Parse response
    const docs = this.parseDocumentationQuery(libraryId, query, result.content);

    // Cache result
    if (this.cacheEnabled) {
      this.setCached(cacheKey, docs);
    }

    return docs;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // TODO: Implement hit tracking
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Parse library resolution response
   */
  private parseLibraryResolution(content: unknown): LibraryResolution[] {
    // Context7 returns library matches in response
    if (Array.isArray(content)) {
      return content.map((lib: any) => ({
        libraryId: lib.libraryId || lib.id,
        name: lib.name,
        description: lib.description,
        version: lib.version,
        reputation: lib.reputation,
        benchmarkScore: lib.benchmarkScore,
      }));
    }

    // Single library result
    if (typeof content === 'object' && content !== null) {
      const lib = content as any;
      return [
        {
          libraryId: lib.libraryId || lib.id,
          name: lib.name,
          description: lib.description,
          version: lib.version,
          reputation: lib.reputation,
          benchmarkScore: lib.benchmarkScore,
        },
      ];
    }

    return [];
  }

  /**
   * Parse documentation query response
   */
  private parseDocumentationQuery(
    libraryId: string,
    query: string,
    content: unknown
  ): DocumentationQuery {
    if (typeof content === 'object' && content !== null) {
      const data = content as any;

      return {
        libraryId,
        query,
        results: data.results || data.content || [],
        snippets: data.snippets || data.codeSnippets,
        metadata: data.metadata || data._meta,
      };
    }

    // Fallback for simple string responses
    if (typeof content === 'string') {
      return {
        libraryId,
        query,
        results: [content],
      };
    }

    return {
      libraryId,
      query,
      results: [],
    };
  }

  /**
   * Get cached value if not expired
   */
  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check expiry
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Set cached value with TTL
   */
  private setCached<T>(key: string, data: T): void {
    const expiry = Date.now() + this.cacheTTL * 1000;
    this.cache.set(key, { data, expiry });
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let context7ClientInstance: Context7Client | null = null;

/**
 * Get singleton Context7 client
 */
export function getContext7Client(config?: Context7Config): Context7Client {
  if (!context7ClientInstance) {
    if (!config) {
      throw new Error('Context7Client requires configuration on first call');
    }
    context7ClientInstance = new Context7Client(config);
  }

  return context7ClientInstance;
}

/**
 * Reset singleton (useful for testing)
 */
export function resetContext7Client(): void {
  if (context7ClientInstance) {
    context7ClientInstance.disconnect();
    context7ClientInstance = null;
  }
}

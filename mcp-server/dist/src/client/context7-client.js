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
import { getMCPClientManager } from './mcp-client-manager.js';
// ============================================================================
// Context7 Client Class
// ============================================================================
export class Context7Client {
    serverName = 'context7';
    cacheEnabled;
    cacheTTL;
    cache = new Map();
    constructor(config) {
        this.cacheEnabled = config.cacheEnabled ?? true;
        this.cacheTTL = config.cacheTTL ?? 300; // 5 minutes default
    }
    /**
     * Initialize connection to Context7 MCP server
     */
    async connect(config) {
        const manager = getMCPClientManager();
        const mcpConfig = {
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
    async disconnect() {
        const manager = getMCPClientManager();
        await manager.disconnect(this.serverName);
        this.cache.clear();
    }
    /**
     * Resolve library name to Context7-compatible library ID
     */
    async resolveLibraryId(libraryName, query) {
        const cacheKey = `resolve:${libraryName}:${query || ''}`;
        // Check cache
        if (this.cacheEnabled) {
            const cached = this.getCached(cacheKey);
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
    async queryDocs(libraryId, query) {
        const cacheKey = `query:${libraryId}:${query}`;
        // Check cache
        if (this.cacheEnabled) {
            const cached = this.getCached(cacheKey);
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
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
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
    parseLibraryResolution(content) {
        // Context7 returns library matches in response
        if (Array.isArray(content)) {
            return content.map((lib) => ({
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
            const lib = content;
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
    parseDocumentationQuery(libraryId, query, content) {
        if (typeof content === 'object' && content !== null) {
            const data = content;
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
    getCached(key) {
        const cached = this.cache.get(key);
        if (!cached) {
            return null;
        }
        // Check expiry
        if (Date.now() > cached.expiry) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }
    /**
     * Set cached value with TTL
     */
    setCached(key, data) {
        const expiry = Date.now() + this.cacheTTL * 1000;
        this.cache.set(key, { data, expiry });
    }
}
// ============================================================================
// Factory Function
// ============================================================================
let context7ClientInstance = null;
/**
 * Get singleton Context7 client
 */
export function getContext7Client(config) {
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
export function resetContext7Client() {
    if (context7ClientInstance) {
        context7ClientInstance.disconnect();
        context7ClientInstance = null;
    }
}
//# sourceMappingURL=context7-client.js.map
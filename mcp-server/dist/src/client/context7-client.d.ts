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
export interface Context7Config {
    serverUrl: string;
    apiKey?: string;
    cacheEnabled?: boolean;
    cacheTTL?: number;
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
export declare class Context7Client {
    private serverName;
    private cacheEnabled;
    private cacheTTL;
    private cache;
    constructor(config: Context7Config);
    /**
     * Initialize connection to Context7 MCP server
     */
    connect(config: Context7Config): Promise<void>;
    /**
     * Disconnect from Context7
     */
    disconnect(): Promise<void>;
    /**
     * Resolve library name to Context7-compatible library ID
     */
    resolveLibraryId(libraryName: string, query?: string): Promise<LibraryResolution[]>;
    /**
     * Query documentation for a specific library
     */
    queryDocs(libraryId: string, query: string): Promise<DocumentationQuery>;
    /**
     * Clear cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        hitRate: number;
    };
    /**
     * Parse library resolution response
     */
    private parseLibraryResolution;
    /**
     * Parse documentation query response
     */
    private parseDocumentationQuery;
    /**
     * Get cached value if not expired
     */
    private getCached;
    /**
     * Set cached value with TTL
     */
    private setCached;
}
/**
 * Get singleton Context7 client
 */
export declare function getContext7Client(config?: Context7Config): Context7Client;
/**
 * Reset singleton (useful for testing)
 */
export declare function resetContext7Client(): void;

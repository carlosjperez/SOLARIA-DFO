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
export interface PlaywrightConfig {
    serverUrl: string;
    apiKey?: string;
    browserType?: 'chromium' | 'firefox' | 'webkit';
    headless?: boolean;
    timeout?: number;
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
    quality?: number;
    selector?: string;
}
export interface ScreenshotResult {
    data: string;
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
export declare class PlaywrightClient {
    private config;
    private serverName;
    private activeSessions;
    constructor(config: PlaywrightConfig);
    /**
     * Initialize connection to Playwright MCP server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Playwright and close all sessions
     */
    disconnect(): Promise<void>;
    /**
     * Create a new browser session
     */
    createSession(): Promise<string>;
    /**
     * Close a browser session
     */
    closeSession(sessionId: string): Promise<void>;
    /**
     * Get active sessions
     */
    getActiveSessions(): BrowserSession[];
    /**
     * Navigate to a URL
     */
    navigate(url: string, sessionId?: string): Promise<NavigationResult>;
    /**
     * Take a screenshot
     */
    screenshot(options?: ScreenshotOptions): Promise<ScreenshotResult>;
    /**
     * Click an element
     */
    click(options: ClickOptions): Promise<void>;
    /**
     * Fill a form field
     */
    fill(options: FillOptions): Promise<void>;
    /**
     * Get page snapshot (accessibility tree)
     */
    snapshot(filename?: string): Promise<string>;
    /**
     * Execute JavaScript in browser
     */
    evaluate(script: string): Promise<unknown>;
    /**
     * Parse navigation result
     */
    private parseNavigationResult;
    /**
     * Parse screenshot result
     */
    private parseScreenshotResult;
    /**
     * Parse snapshot result
     */
    private parseSnapshotResult;
}
/**
 * Get singleton Playwright client
 */
export declare function getPlaywrightClient(config?: PlaywrightConfig): PlaywrightClient;
/**
 * Reset singleton (useful for testing)
 */
export declare function resetPlaywrightClient(): void;

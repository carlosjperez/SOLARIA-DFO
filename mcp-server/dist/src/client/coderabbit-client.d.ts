/**
 * CodeRabbit Client Adapter
 *
 * @author ECO-Lambda | DFO 4.0 Epic 2
 * @date 2025-12-30
 * @task DFO-2004
 *
 * Adapter for CodeRabbit code review service via MCP
 * Provides code review automation and analysis
 */
export interface CodeRabbitConfig {
    serverUrl: string;
    apiKey: string;
    webhookSecret?: string;
}
export interface ReviewRequest {
    owner: string;
    repo: string;
    pullNumber: number;
}
export interface CodeReview {
    reviewId: number;
    pullNumber: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    summary?: string;
    issues: ReviewIssue[];
    suggestions: ReviewSuggestion[];
    createdAt: Date;
    completedAt?: Date;
}
export interface ReviewIssue {
    commentId: number;
    file: string;
    line: number;
    severity: 'error' | 'warning' | 'info';
    message: string;
    suggestion?: string;
}
export interface ReviewSuggestion {
    file: string;
    line: number;
    originalCode: string;
    suggestedCode: string;
    reason: string;
}
export interface CommentDetails {
    commentId: number;
    file: string;
    line: number;
    message: string;
    aiPrompt?: string;
    resolved: boolean;
}
export interface ResolveOptions {
    commentId: number;
    resolution: 'addressed' | 'wont_fix' | 'not_applicable';
    note?: string;
}
export declare class CodeRabbitClient {
    private config;
    private serverName;
    private webhookSecret;
    constructor(config: CodeRabbitConfig);
    /**
     * Initialize connection to CodeRabbit MCP server
     */
    connect(): Promise<void>;
    /**
     * Disconnect from CodeRabbit
     */
    disconnect(): Promise<void>;
    /**
     * Get all reviews for a pull request
     */
    getReviews(request: ReviewRequest): Promise<CodeReview[]>;
    /**
     * Get detailed information about a specific review
     */
    getReviewDetails(request: ReviewRequest & {
        reviewId: number;
    }): Promise<CodeReview>;
    /**
     * Get all review comments
     */
    getReviewComments(request: ReviewRequest & {
        reviewId?: number;
    }): Promise<ReviewIssue[]>;
    /**
     * Get detailed information about a specific comment
     */
    getCommentDetails(owner: string, repo: string, commentId: number): Promise<CommentDetails>;
    /**
     * Resolve a comment
     */
    resolveComment(owner: string, repo: string, options: ResolveOptions): Promise<void>;
    /**
     * Resolve or unresolve a conversation
     */
    resolveConversation(owner: string, repo: string, commentId: number, resolved?: boolean, note?: string): Promise<void>;
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload: string, signature: string): boolean;
    /**
     * Parse webhook payload
     */
    parseWebhookPayload(payload: unknown): {
        event: string;
        repository: {
            owner: string;
            name: string;
        };
        pullRequest: {
            number: number;
        };
        review?: {
            id: number;
            status: string;
        };
    };
    /**
     * Parse reviews array
     */
    private parseReviews;
    /**
     * Parse single review
     */
    private parseReview;
    /**
     * Parse comments array
     */
    private parseComments;
    /**
     * Parse suggestions array
     */
    private parseSuggestions;
    /**
     * Parse comment details
     */
    private parseCommentDetails;
    /**
     * Infer severity from message content
     */
    private inferSeverity;
}
/**
 * Get singleton CodeRabbit client
 */
export declare function getCodeRabbitClient(config?: CodeRabbitConfig): CodeRabbitClient;
/**
 * Reset singleton (useful for testing)
 */
export declare function resetCodeRabbitClient(): void;

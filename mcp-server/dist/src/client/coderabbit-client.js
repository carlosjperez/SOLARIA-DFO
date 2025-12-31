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
import { getMCPClientManager } from './mcp-client-manager.js';
// ============================================================================
// CodeRabbit Client Class
// ============================================================================
export class CodeRabbitClient {
    config;
    serverName = 'coderabbit';
    webhookSecret = null;
    constructor(config) {
        this.config = config;
        this.webhookSecret = config.webhookSecret || null;
    }
    /**
     * Initialize connection to CodeRabbit MCP server
     */
    async connect() {
        const manager = getMCPClientManager();
        const mcpConfig = {
            name: this.serverName,
            transport: {
                type: 'http',
                url: this.config.serverUrl,
            },
            auth: {
                type: 'api-key',
                apiKey: this.config.apiKey,
            },
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
     * Disconnect from CodeRabbit
     */
    async disconnect() {
        const manager = getMCPClientManager();
        await manager.disconnect(this.serverName);
    }
    // ============================================================================
    // Reviews Management
    // ============================================================================
    /**
     * Get all reviews for a pull request
     */
    async getReviews(request) {
        const manager = getMCPClientManager();
        const result = await manager.executeTool(this.serverName, 'get_coderabbit_reviews', {
            owner: request.owner,
            repo: request.repo,
            pullNumber: request.pullNumber,
        });
        if (!result.success) {
            throw new Error(`Failed to get reviews: ${result.error}`);
        }
        return this.parseReviews(result.content);
    }
    /**
     * Get detailed information about a specific review
     */
    async getReviewDetails(request) {
        const manager = getMCPClientManager();
        const result = await manager.executeTool(this.serverName, 'get_review_details', {
            owner: request.owner,
            repo: request.repo,
            pullNumber: request.pullNumber,
            reviewId: request.reviewId,
        });
        if (!result.success) {
            throw new Error(`Failed to get review details: ${result.error}`);
        }
        return this.parseReview(result.content);
    }
    // ============================================================================
    // Comments Management
    // ============================================================================
    /**
     * Get all review comments
     */
    async getReviewComments(request) {
        const manager = getMCPClientManager();
        const params = {
            owner: request.owner,
            repo: request.repo,
            pullNumber: request.pullNumber,
        };
        if (request.reviewId) {
            params.reviewId = request.reviewId;
        }
        const result = await manager.executeTool(this.serverName, 'get_review_comments', params);
        if (!result.success) {
            throw new Error(`Failed to get comments: ${result.error}`);
        }
        return this.parseComments(result.content);
    }
    /**
     * Get detailed information about a specific comment
     */
    async getCommentDetails(owner, repo, commentId) {
        const manager = getMCPClientManager();
        const result = await manager.executeTool(this.serverName, 'get_comment_details', {
            owner,
            repo,
            commentId,
        });
        if (!result.success) {
            throw new Error(`Failed to get comment details: ${result.error}`);
        }
        return this.parseCommentDetails(result.content);
    }
    /**
     * Resolve a comment
     */
    async resolveComment(owner, repo, options) {
        const manager = getMCPClientManager();
        const result = await manager.executeTool(this.serverName, 'resolve_comment', {
            owner,
            repo,
            commentId: options.commentId,
            resolution: options.resolution,
            note: options.note,
        });
        if (!result.success) {
            throw new Error(`Failed to resolve comment: ${result.error}`);
        }
    }
    /**
     * Resolve or unresolve a conversation
     */
    async resolveConversation(owner, repo, commentId, resolved = true, note) {
        const manager = getMCPClientManager();
        const result = await manager.executeTool(this.serverName, 'resolve_conversation', {
            owner,
            repo,
            commentId,
            resolved,
            note,
        });
        if (!result.success) {
            throw new Error(`Failed to resolve conversation: ${result.error}`);
        }
    }
    // ============================================================================
    // Webhook Integration
    // ============================================================================
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload, signature) {
        if (!this.webhookSecret) {
            console.warn('[CodeRabbitClient] No webhook secret configured');
            return false;
        }
        // HMAC SHA-256 verification
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', this.webhookSecret);
        hmac.update(payload);
        const expectedSignature = `sha256=${hmac.digest('hex')}`;
        return signature === expectedSignature;
    }
    /**
     * Parse webhook payload
     */
    parseWebhookPayload(payload) {
        if (typeof payload !== 'object' || payload === null) {
            throw new Error('Invalid webhook payload');
        }
        const data = payload;
        return {
            event: data.action || data.event,
            repository: {
                owner: data.repository?.owner?.login || '',
                name: data.repository?.name || '',
            },
            pullRequest: {
                number: data.pull_request?.number || data.pullRequest?.number || 0,
            },
            review: data.review
                ? {
                    id: data.review.id,
                    status: data.review.state || data.review.status,
                }
                : undefined,
        };
    }
    // ============================================================================
    // Helper Methods
    // ============================================================================
    /**
     * Parse reviews array
     */
    parseReviews(content) {
        if (!Array.isArray(content)) {
            return [];
        }
        return content.map((review) => this.parseReview(review));
    }
    /**
     * Parse single review
     */
    parseReview(content) {
        if (typeof content !== 'object' || content === null) {
            throw new Error('Invalid review data');
        }
        const data = content;
        return {
            reviewId: data.id || data.reviewId,
            pullNumber: data.pullNumber || data.pull_number || 0,
            status: data.status || data.state || 'pending',
            summary: data.summary || data.body,
            issues: this.parseComments(data.comments || data.issues || []),
            suggestions: this.parseSuggestions(data.suggestions || []),
            createdAt: new Date(data.created_at || data.createdAt || Date.now()),
            completedAt: data.completed_at || data.completedAt
                ? new Date(data.completed_at || data.completedAt)
                : undefined,
        };
    }
    /**
     * Parse comments array
     */
    parseComments(content) {
        if (!Array.isArray(content)) {
            return [];
        }
        return content.map((comment) => ({
            commentId: comment.id || comment.commentId,
            file: comment.path || comment.file || '',
            line: comment.line || comment.lineNumber || 0,
            severity: comment.severity || this.inferSeverity(comment.body || comment.message),
            message: comment.body || comment.message || '',
            suggestion: comment.suggestion,
        }));
    }
    /**
     * Parse suggestions array
     */
    parseSuggestions(content) {
        if (!Array.isArray(content)) {
            return [];
        }
        return content.map((suggestion) => ({
            file: suggestion.path || suggestion.file || '',
            line: suggestion.line || suggestion.lineNumber || 0,
            originalCode: suggestion.original || suggestion.before || '',
            suggestedCode: suggestion.suggested || suggestion.after || '',
            reason: suggestion.reason || suggestion.message || '',
        }));
    }
    /**
     * Parse comment details
     */
    parseCommentDetails(content) {
        if (typeof content !== 'object' || content === null) {
            throw new Error('Invalid comment details');
        }
        const data = content;
        return {
            commentId: data.id || data.commentId,
            file: data.path || data.file || '',
            line: data.line || data.lineNumber || 0,
            message: data.body || data.message || '',
            aiPrompt: data.ai_prompt || data.aiPrompt,
            resolved: data.resolved || false,
        };
    }
    /**
     * Infer severity from message content
     */
    inferSeverity(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('error') ||
            lowerMessage.includes('critical') ||
            lowerMessage.includes('security')) {
            return 'error';
        }
        if (lowerMessage.includes('warning') ||
            lowerMessage.includes('deprecated') ||
            lowerMessage.includes('should')) {
            return 'warning';
        }
        return 'info';
    }
}
// ============================================================================
// Factory Function
// ============================================================================
let codeRabbitClientInstance = null;
/**
 * Get singleton CodeRabbit client
 */
export function getCodeRabbitClient(config) {
    if (!codeRabbitClientInstance) {
        if (!config) {
            throw new Error('CodeRabbitClient requires configuration on first call');
        }
        codeRabbitClientInstance = new CodeRabbitClient(config);
    }
    return codeRabbitClientInstance;
}
/**
 * Reset singleton (useful for testing)
 */
export function resetCodeRabbitClient() {
    if (codeRabbitClientInstance) {
        codeRabbitClientInstance.disconnect();
        codeRabbitClientInstance = null;
    }
}
//# sourceMappingURL=coderabbit-client.js.map
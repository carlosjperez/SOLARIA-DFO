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

import { getMCPClientManager, type MCPServerConfig } from './mcp-client-manager.js';

// ============================================================================
// Types
// ============================================================================

export interface CodeRabbitConfig {
  serverUrl: string;
  apiKey: string; // CodeRabbit requires API key
  webhookSecret?: string;
}

export interface ReviewRequest {
  owner: string; // GitHub repo owner
  repo: string; // GitHub repo name
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

// ============================================================================
// CodeRabbit Client Class
// ============================================================================

export class CodeRabbitClient {
  private serverName = 'coderabbit';
  private webhookSecret: string | null = null;

  constructor(private config: CodeRabbitConfig) {
    this.webhookSecret = config.webhookSecret || null;
  }

  /**
   * Initialize connection to CodeRabbit MCP server
   */
  async connect(): Promise<void> {
    const manager = getMCPClientManager();

    const mcpConfig: MCPServerConfig = {
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
  async disconnect(): Promise<void> {
    const manager = getMCPClientManager();
    await manager.disconnect(this.serverName);
  }

  // ============================================================================
  // Reviews Management
  // ============================================================================

  /**
   * Get all reviews for a pull request
   */
  async getReviews(request: ReviewRequest): Promise<CodeReview[]> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(
      this.serverName,
      'get_coderabbit_reviews',
      {
        owner: request.owner,
        repo: request.repo,
        pullNumber: request.pullNumber,
      }
    );

    if (!result.success) {
      throw new Error(`Failed to get reviews: ${result.error}`);
    }

    return this.parseReviews(result.content);
  }

  /**
   * Get detailed information about a specific review
   */
  async getReviewDetails(
    request: ReviewRequest & { reviewId: number }
  ): Promise<CodeReview> {
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
  async getReviewComments(
    request: ReviewRequest & { reviewId?: number }
  ): Promise<ReviewIssue[]> {
    const manager = getMCPClientManager();

    const params: any = {
      owner: request.owner,
      repo: request.repo,
      pullNumber: request.pullNumber,
    };

    if (request.reviewId) {
      params.reviewId = request.reviewId;
    }

    const result = await manager.executeTool(
      this.serverName,
      'get_review_comments',
      params
    );

    if (!result.success) {
      throw new Error(`Failed to get comments: ${result.error}`);
    }

    return this.parseComments(result.content);
  }

  /**
   * Get detailed information about a specific comment
   */
  async getCommentDetails(
    owner: string,
    repo: string,
    commentId: number
  ): Promise<CommentDetails> {
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
  async resolveComment(
    owner: string,
    repo: string,
    options: ResolveOptions
  ): Promise<void> {
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
  async resolveConversation(
    owner: string,
    repo: string,
    commentId: number,
    resolved: boolean = true,
    note?: string
  ): Promise<void> {
    const manager = getMCPClientManager();

    const result = await manager.executeTool(
      this.serverName,
      'resolve_conversation',
      {
        owner,
        repo,
        commentId,
        resolved,
        note,
      }
    );

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
  verifyWebhookSignature(payload: string, signature: string): boolean {
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
  parseWebhookPayload(payload: unknown): {
    event: string;
    repository: { owner: string; name: string };
    pullRequest: { number: number };
    review?: { id: number; status: string };
  } {
    if (typeof payload !== 'object' || payload === null) {
      throw new Error('Invalid webhook payload');
    }

    const data = payload as any;

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
  private parseReviews(content: unknown): CodeReview[] {
    if (!Array.isArray(content)) {
      return [];
    }

    return content.map((review) => this.parseReview(review));
  }

  /**
   * Parse single review
   */
  private parseReview(content: unknown): CodeReview {
    if (typeof content !== 'object' || content === null) {
      throw new Error('Invalid review data');
    }

    const data = content as any;

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
  private parseComments(content: unknown): ReviewIssue[] {
    if (!Array.isArray(content)) {
      return [];
    }

    return content.map((comment: any) => ({
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
  private parseSuggestions(content: unknown): ReviewSuggestion[] {
    if (!Array.isArray(content)) {
      return [];
    }

    return content.map((suggestion: any) => ({
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
  private parseCommentDetails(content: unknown): CommentDetails {
    if (typeof content !== 'object' || content === null) {
      throw new Error('Invalid comment details');
    }

    const data = content as any;

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
  private inferSeverity(message: string): 'error' | 'warning' | 'info' {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('error') ||
      lowerMessage.includes('critical') ||
      lowerMessage.includes('security')
    ) {
      return 'error';
    }

    if (
      lowerMessage.includes('warning') ||
      lowerMessage.includes('deprecated') ||
      lowerMessage.includes('should')
    ) {
      return 'warning';
    }

    return 'info';
  }
}

// ============================================================================
// Factory Function
// ============================================================================

let codeRabbitClientInstance: CodeRabbitClient | null = null;

/**
 * Get singleton CodeRabbit client
 */
export function getCodeRabbitClient(config?: CodeRabbitConfig): CodeRabbitClient {
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
export function resetCodeRabbitClient(): void {
  if (codeRabbitClientInstance) {
    codeRabbitClientInstance.disconnect();
    codeRabbitClientInstance = null;
  }
}

/**
 * useCodeRabbitComments Hook
 *
 * Custom React hook for fetching CodeRabbit review comments from GitHub PRs
 * via the CodeRabbit MCP server.
 *
 * @module hooks/useCodeRabbitComments
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-203-EPIC21
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * CodeRabbit comment data structure
 */
export interface CodeRabbitComment {
  /** Unique comment ID from GitHub */
  id: number;
  /** GitHub PR review ID */
  review_id: number;
  /** File path relative to repository root */
  file_path: string;
  /** Line number in the new file (after changes) */
  line: number;
  /** Line number in the old file (before changes), null if new line */
  original_line: number | null;
  /** Comment text content */
  body: string;
  /** Comment author (usually "coderabbitai[bot]") */
  author: string;
  /** Comment severity/type inferred from content */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** Comment type classification */
  type: 'suggestion' | 'issue' | 'praise' | 'question';
  /** ISO 8601 timestamp when comment was created */
  created_at: string;
  /** ISO 8601 timestamp when comment was last updated */
  updated_at: string;
  /** Whether the conversation is resolved in GitHub */
  resolved: boolean;
  /** GitHub HTML URL for the comment */
  html_url: string;
}

/**
 * Hook options
 */
export interface UseCodeRabbitCommentsOptions {
  /** Whether to fetch comments automatically on mount (default: true) */
  autoFetch?: boolean;
  /** Polling interval in milliseconds (0 to disable, default: 0) */
  pollingInterval?: number;
}

/**
 * Hook return value
 */
export interface UseCodeRabbitCommentsReturn {
  /** Array of comments fetched from CodeRabbit */
  comments: CodeRabbitComment[];
  /** Loading state (true while fetching) */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manual refetch function */
  refetch: () => Promise<void>;
}

/**
 * Infers comment severity from content keywords
 */
function inferSeverity(body: string): CodeRabbitComment['severity'] {
  const lowerBody = body.toLowerCase();

  if (lowerBody.includes('critical') || lowerBody.includes('security') || lowerBody.includes('vulnerability')) {
    return 'critical';
  }
  if (lowerBody.includes('error') || lowerBody.includes('bug') || lowerBody.includes('issue')) {
    return 'high';
  }
  if (lowerBody.includes('warning') || lowerBody.includes('concern')) {
    return 'medium';
  }
  if (lowerBody.includes('suggestion') || lowerBody.includes('consider')) {
    return 'low';
  }

  return 'info';
}

/**
 * Infers comment type from content patterns
 */
function inferType(body: string): CodeRabbitComment['type'] {
  const lowerBody = body.toLowerCase();

  if (lowerBody.includes('suggest') || lowerBody.includes('consider') || lowerBody.includes('recommend')) {
    return 'suggestion';
  }
  if (lowerBody.includes('issue') || lowerBody.includes('problem') || lowerBody.includes('error')) {
    return 'issue';
  }
  if (lowerBody.includes('good') || lowerBody.includes('nice') || lowerBody.includes('well')) {
    return 'praise';
  }
  if (lowerBody.includes('?') || lowerBody.includes('why') || lowerBody.includes('how')) {
    return 'question';
  }

  return 'suggestion';
}

/**
 * Custom React hook for fetching and managing CodeRabbit review comments
 *
 * This hook integrates with the CodeRabbit MCP server to fetch review comments
 * from GitHub pull requests. It handles loading states, error handling, and
 * provides a refetch mechanism for updating comments.
 *
 * **Features:**
 * - ✅ Automatic fetching on mount (configurable)
 * - ✅ Manual refetch function
 * - ✅ Loading and error states
 * - ✅ Optional polling for real-time updates
 * - ✅ Comment severity and type inference
 * - ✅ TypeScript type safety
 *
 * @param {string} owner - Repository owner (username or organization)
 * @param {string} repo - Repository name
 * @param {number} pullNumber - Pull request number
 * @param {UseCodeRabbitCommentsOptions} options - Hook configuration options
 * @returns {UseCodeRabbitCommentsReturn} Comments data, loading state, error, and refetch function
 *
 * @example
 * Basic usage:
 * ```tsx
 * const MyComponent = () => {
 *   const { comments, loading, error, refetch } = useCodeRabbitComments(
 *     'solaria-agency',
 *     'dfo',
 *     42
 *   );
 *
 *   if (loading) return <div>Loading comments...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       <button onClick={refetch}>Refresh Comments</button>
 *       {comments.map(comment => (
 *         <div key={comment.id}>{comment.body}</div>
 *       ))}
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * With polling:
 * ```tsx
 * const { comments } = useCodeRabbitComments('owner', 'repo', 42, {
 *   pollingInterval: 30000 // Poll every 30 seconds
 * });
 * ```
 *
 * @example
 * Manual fetching only:
 * ```tsx
 * const { comments, loading, refetch } = useCodeRabbitComments('owner', 'repo', 42, {
 *   autoFetch: false
 * });
 *
 * // Fetch when user clicks a button
 * <button onClick={refetch}>Load Comments</button>
 * ```
 */
export function useCodeRabbitComments(
  owner: string,
  repo: string,
  pullNumber: number,
  options: UseCodeRabbitCommentsOptions = {}
): UseCodeRabbitCommentsReturn {
  const { autoFetch = true, pollingInterval = 0 } = options;

  const [comments, setComments] = useState<CodeRabbitComment[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches comments from the API proxy endpoint
   */
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call API proxy endpoint instead of MCP directly
      // This avoids CORS issues and allows backend caching
      const response = await fetch(
        `/api/code-review/${owner}/${repo}/${pullNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch comments');
      }

      // Transform API response to CodeRabbitComment format
      const transformedComments: CodeRabbitComment[] = (data.data.comments || []).map((comment: any) => ({
        id: comment.id,
        review_id: comment.review_id,
        file_path: comment.path || comment.file_path,
        line: comment.line || comment.position,
        original_line: comment.original_line,
        body: comment.body,
        author: comment.user?.login || 'coderabbitai[bot]',
        severity: inferSeverity(comment.body),
        type: inferType(comment.body),
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        resolved: comment.resolved || false,
        html_url: comment.html_url,
      }));

      setComments(transformedComments);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch CodeRabbit comments:', err);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, pullNumber]);

  /**
   * Manual refetch function exposed to component
   */
  const refetch = useCallback(async () => {
    await fetchComments();
  }, [fetchComments]);

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch) {
      fetchComments();
    }
  }, [autoFetch, fetchComments]);

  /**
   * Setup polling if interval specified
   */
  useEffect(() => {
    if (pollingInterval > 0) {
      const intervalId = setInterval(fetchComments, pollingInterval);
      return () => clearInterval(intervalId);
    }
  }, [pollingInterval, fetchComments]);

  return {
    comments,
    loading,
    error,
    refetch,
  };
}

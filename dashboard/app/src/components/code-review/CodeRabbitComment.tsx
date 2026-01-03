/**
 * CodeRabbitComment Component
 *
 * Renders an individual CodeRabbit review comment with severity indicators,
 * status badges, and action buttons for resolving or dismissing feedback.
 *
 * @module components/code-review/CodeRabbitComment
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-203-EPIC21
 */

import React, { useState } from 'react';
import { CodeRabbitComment as CodeRabbitCommentType } from '../../hooks/useCodeRabbitComments';
import { cn } from '../../lib/utils';

/**
 * Props for the CodeRabbitComment component
 */
export interface CodeRabbitCommentProps {
  /** The CodeRabbit comment to display */
  comment: CodeRabbitCommentType;
  /** Callback fired when user clicks "Resolve" button */
  onResolve?: (commentId: number) => Promise<void>;
  /** Callback fired when user clicks "Dismiss" button */
  onDismiss?: (commentId: number) => Promise<void>;
  /** Additional CSS classes to apply to the root element */
  className?: string;
}

/**
 * Get severity badge styling based on severity level
 */
function getSeverityBadgeClasses(severity: CodeRabbitCommentType['severity']): string {
  const baseClasses = 'px-2 py-0.5 text-xs font-semibold rounded-full';

  switch (severity) {
    case 'critical':
      return cn(baseClasses, 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100');
    case 'high':
      return cn(baseClasses, 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100');
    case 'medium':
      return cn(baseClasses, 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100');
    case 'low':
      return cn(baseClasses, 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100');
    case 'info':
    default:
      return cn(baseClasses, 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100');
  }
}

/**
 * Get type icon based on comment type
 */
function getTypeIcon(type: CodeRabbitCommentType['type']): string {
  switch (type) {
    case 'suggestion':
      return '💡';
    case 'issue':
      return '⚠️';
    case 'praise':
      return '👍';
    case 'question':
      return '❓';
    default:
      return '📝';
  }
}

/**
 * Get status badge styling
 */
function getStatusBadgeClasses(resolved: boolean): string {
  const baseClasses = 'px-2 py-0.5 text-xs font-medium rounded';

  if (resolved) {
    return cn(baseClasses, 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100');
  }

  return cn(baseClasses, 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100');
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

/**
 * CodeRabbitComment - Individual AI code review comment display
 *
 * A comprehensive component for displaying CodeRabbit AI-generated code review
 * comments with visual severity indicators, status badges, and action buttons
 * for resolving or dismissing feedback. Designed to integrate with GitHub PR
 * review workflows.
 *
 * **Features:**
 * - ✅ Severity badges (critical/high/medium/low/info) with color coding
 * - ✅ Type icons (suggestion/issue/praise/question)
 * - ✅ Status indicators (resolved/pending)
 * - ✅ Relative timestamps ("2 hours ago")
 * - ✅ CodeRabbit branding with robot icon
 * - ✅ Resolve/Dismiss action buttons with loading states
 * - ✅ Dark mode support
 * - ✅ TailwindCSS styling consistent with DiffViewer
 * - ✅ Responsive design
 *
 * @component
 * @example
 * Basic usage:
 * ```tsx
 * <CodeRabbitComment
 *   comment={{
 *     id: 123,
 *     review_id: 456,
 *     file_path: 'src/components/App.tsx',
 *     line: 42,
 *     original_line: null,
 *     body: 'Consider using useMemo here to optimize rendering',
 *     author: 'coderabbitai[bot]',
 *     severity: 'medium',
 *     type: 'suggestion',
 *     created_at: '2026-01-02T10:00:00Z',
 *     updated_at: '2026-01-02T10:00:00Z',
 *     resolved: false,
 *     html_url: 'https://github.com/...'
 *   }}
 * />
 * ```
 *
 * @example
 * With action handlers:
 * ```tsx
 * const handleResolve = async (commentId: number) => {
 *   await resolveComment(commentId);
 *   refetchComments();
 * };
 *
 * const handleDismiss = async (commentId: number) => {
 *   await dismissComment(commentId);
 *   refetchComments();
 * };
 *
 * <CodeRabbitComment
 *   comment={comment}
 *   onResolve={handleResolve}
 *   onDismiss={handleDismiss}
 * />
 * ```
 *
 * @example
 * With custom styling:
 * ```tsx
 * <CodeRabbitComment
 *   comment={comment}
 *   className="my-4 shadow-lg"
 *   onResolve={handleResolve}
 * />
 * ```
 *
 * @param {CodeRabbitCommentProps} props - Component props
 * @returns {React.ReactElement} Rendered CodeRabbit comment with actions
 *
 * @see {@link useCodeRabbitComments} for fetching comments
 * @see {@link DiffViewer} for the parent code review interface
 */
export const CodeRabbitComment: React.FC<CodeRabbitCommentProps> = ({
  comment,
  onResolve,
  onDismiss,
  className,
}) => {
  const [isResolving, setIsResolving] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleResolve = async () => {
    if (!onResolve || isResolving) return;

    try {
      setIsResolving(true);
      await onResolve(comment.id);
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleDismiss = async () => {
    if (!onDismiss || isDismissing) return;

    try {
      setIsDismissing(true);
      await onDismiss(comment.id);
    } catch (error) {
      console.error('Failed to dismiss comment:', error);
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <div
      className={cn(
        'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-r-lg',
        comment.resolved && 'border-green-500 bg-green-50 dark:bg-green-950/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        {/* Left side - Author info */}
        <div className="flex items-center gap-2">
          {/* CodeRabbit icon */}
          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🤖</span>
          </div>

          {/* Author and timestamp */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {comment.author}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatRelativeTime(comment.created_at)}
              </span>
            </div>

            {/* File path and line */}
            <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {comment.file_path}:{comment.line}
            </div>
          </div>
        </div>

        {/* Right side - Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type icon */}
          <span className="text-lg" title={comment.type}>
            {getTypeIcon(comment.type)}
          </span>

          {/* Severity badge */}
          <span className={getSeverityBadgeClasses(comment.severity)}>
            {comment.severity.toUpperCase()}
          </span>

          {/* Status badge */}
          <span className={getStatusBadgeClasses(comment.resolved)}>
            {comment.resolved ? 'Resolved' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Comment body */}
      <div className="prose prose-sm max-w-none dark:prose-invert mb-3">
        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
          {comment.body}
        </p>
      </div>

      {/* Action buttons */}
      {!comment.resolved && (onResolve || onDismiss) && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {onResolve && (
            <button
              onClick={handleResolve}
              disabled={isResolving || isDismissing}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                'bg-green-600 text-white hover:bg-green-700',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-1'
              )}
            >
              {isResolving ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Resolving...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Resolve</span>
                </>
              )}
            </button>
          )}

          {onDismiss && (
            <button
              onClick={handleDismiss}
              disabled={isResolving || isDismissing}
              className={cn(
                'px-3 py-1 text-sm font-medium rounded transition-colors',
                'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                'hover:bg-gray-300 dark:hover:bg-gray-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-1'
              )}
            >
              {isDismissing ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-gray-700 dark:border-gray-300 border-t-transparent rounded-full animate-spin" />
                  <span>Dismissing...</span>
                </>
              ) : (
                <>
                  <span>✕</span>
                  <span>Dismiss</span>
                </>
              )}
            </button>
          )}

          {/* GitHub link */}
          <a
            href={comment.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View on GitHub</span>
            <span>↗</span>
          </a>
        </div>
      )}

      {/* Resolved state footer */}
      {comment.resolved && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-green-700 dark:text-green-300">
            ✓ This feedback has been resolved
          </span>

          {/* GitHub link */}
          <a
            href={comment.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View on GitHub</span>
            <span>↗</span>
          </a>
        </div>
      )}
    </div>
  );
};

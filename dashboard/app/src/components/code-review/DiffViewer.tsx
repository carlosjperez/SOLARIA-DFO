/**
 * DiffViewer Component
 *
 * React component for visualizing code diffs with multiple view modes.
 * Supports unified/split views, syntax highlighting, comments, and search.
 *
 * @module components/code-review/DiffViewer
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-202-EPIC21
 */

import React, { useState } from 'react';
import { useDiffParser, DiffHunk } from '../../hooks/useDiffParser';
import { useCodeRabbitComments } from '../../hooks/useCodeRabbitComments';
import { DiffLine } from './DiffLine';
import { CodeRabbitComment } from './CodeRabbitComment';
import { cn } from '../../lib/utils';

/**
 * Represents a comment on a specific line in the diff
 */
interface Comment {
  /** Unique identifier for the comment */
  id: string;
  /** Line number where the comment is attached */
  lineNumber: number;
  /** Name of the comment author */
  author: string;
  /** Comment text content */
  content: string;
  /** ISO 8601 timestamp when comment was created */
  timestamp: string;
}

/**
 * Props for the DiffViewer component
 */
export interface DiffViewerProps {
  /** Unified diff format string (e.g., from `git diff`) */
  diffString: string;
  /** View mode for displaying diff (default: 'unified') */
  viewMode?: 'unified' | 'split';
  /** Whether to show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Whether to enable inline commenting (default: true) */
  enableComments?: boolean;
  /** Array of existing comments to display on specific lines */
  comments?: Comment[];
  /** Callback fired when user submits a new comment */
  onAddComment?: (lineNumber: number, content: string) => void;
  /** Additional CSS classes to apply to the root element */
  className?: string;
  /** Enable CodeRabbit AI review comments integration (default: false) */
  enableCodeRabbit?: boolean;
  /** GitHub repository owner (required if enableCodeRabbit is true) */
  owner?: string;
  /** GitHub repository name (required if enableCodeRabbit is true) */
  repo?: string;
  /** Pull request number (required if enableCodeRabbit is true) */
  pullNumber?: number;
}

/**
 * DiffViewer - Comprehensive code diff visualization component
 *
 * A feature-rich diff viewer that renders unified diff format with syntax highlighting,
 * inline commenting, search functionality, and collapsible hunks. Designed for code
 * review workflows and displaying Git diffs.
 *
 * **Features:**
 * - ✅ Unified and split view modes
 * - ✅ Syntax highlighting for 20+ programming languages (via Prism.js)
 * - ✅ Collapsible hunks with expand/collapse controls
 * - ✅ Real-time search with highlighting
 * - ✅ Inline commenting system
 * - ✅ **CodeRabbit AI review integration** (optional)
 * - ✅ AI-powered code suggestions with severity levels
 * - ✅ Resolve/dismiss CodeRabbit comments
 * - ✅ Line-by-line change indicators (+/-)
 * - ✅ Old/new line number display
 * - ✅ Dark mode support
 * - ✅ Responsive design with TailwindCSS
 *
 * @component
 * @example
 * Basic usage:
 * ```tsx
 * <DiffViewer
 *   diffString={`diff --git a/file.js b/file.js
 * --- a/file.js
 * +++ b/file.js
 * @@ -1,2 +1,3 @@
 *  const x = 1;
 * -const y = 2;
 * +const y = 3;
 * +const z = 4;`}
 * />
 * ```
 *
 * @example
 * With comments and custom handler:
 * ```tsx
 * const [comments, setComments] = useState([
 *   {
 *     id: '1',
 *     lineNumber: 2,
 *     author: 'John Doe',
 *     content: 'Why change this value?',
 *     timestamp: '2026-01-02T10:00:00Z'
 *   }
 * ]);
 *
 * const handleAddComment = (lineNumber, content) => {
 *   const newComment = {
 *     id: crypto.randomUUID(),
 *     lineNumber,
 *     author: 'Current User',
 *     content,
 *     timestamp: new Date().toISOString()
 *   };
 *   setComments([...comments, newComment]);
 * };
 *
 * <DiffViewer
 *   diffString={diffString}
 *   viewMode="split"
 *   comments={comments}
 *   onAddComment={handleAddComment}
 *   className="custom-diff"
 * />
 * ```
 *
 * @example
 * Read-only mode without comments:
 * ```tsx
 * <DiffViewer
 *   diffString={diffString}
 *   enableComments={false}
 *   showLineNumbers={true}
 * />
 * ```
 *
 * @example
 * With CodeRabbit AI review integration:
 * ```tsx
 * <DiffViewer
 *   diffString={diffString}
 *   enableCodeRabbit={true}
 *   owner="solaria-agency"
 *   repo="dfo"
 *   pullNumber={42}
 *   viewMode="unified"
 * />
 * ```
 *
 * @param {DiffViewerProps} props - Component props
 * @returns {React.ReactElement} Rendered diff viewer component
 *
 * @see {@link DiffLine} for individual line rendering
 * @see {@link useDiffParser} for diff parsing logic
 */
export const DiffViewer: React.FC<DiffViewerProps> = ({
  diffString,
  viewMode: initialViewMode = 'unified',
  showLineNumbers = true,
  enableComments = true,
  comments = [],
  onAddComment,
  className,
  enableCodeRabbit = false,
  owner,
  repo,
  pullNumber,
}) => {
  // Parse diff
  const parsedDiff = useDiffParser(diffString);

  // Fetch CodeRabbit comments if enabled
  const {
    comments: codeRabbitComments,
    loading: codeRabbitLoading,
    error: codeRabbitError,
    refetch: refetchCodeRabbitComments,
  } = useCodeRabbitComments(
    owner || '',
    repo || '',
    pullNumber || 0,
    {
      autoFetch: enableCodeRabbit && !!owner && !!repo && !!pullNumber,
    }
  );

  // Component state
  const [viewMode, setViewMode] = useState<'unified' | 'split'>(initialViewMode);
  const [expandedHunks, setExpandedHunks] = useState<Set<string>>(
    new Set(parsedDiff.hunks.map((h) => h.id))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [commentLineNumber, setCommentLineNumber] = useState<number | null>(null);
  const [commentContent, setCommentContent] = useState('');

  // Toggle hunk expansion
  const toggleHunk = (hunkId: string) => {
    setExpandedHunks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hunkId)) {
        newSet.delete(hunkId);
      } else {
        newSet.add(hunkId);
      }
      return newSet;
    });
  };

  // Expand/collapse all hunks
  const expandAll = () => setExpandedHunks(new Set(parsedDiff.hunks.map((h) => h.id)));
  const collapseAll = () => setExpandedHunks(new Set());

  // Handle add comment
  const handleAddCommentClick = (lineNumber: number) => {
    setCommentLineNumber(lineNumber);
    setCommentContent('');
  };

  const handleSubmitComment = () => {
    if (commentLineNumber && commentContent.trim() && onAddComment) {
      onAddComment(commentLineNumber, commentContent.trim());
      setCommentLineNumber(null);
      setCommentContent('');
    }
  };

  const handleCancelComment = () => {
    setCommentLineNumber(null);
    setCommentContent('');
  };

  // Get comments for a specific line
  const getCommentsForLine = (lineNumber: number) => {
    return comments.filter((c) => c.lineNumber === lineNumber);
  };

  // Get CodeRabbit comments for a specific line in the current file
  const getCodeRabbitCommentsForLine = (lineNumber: number | null) => {
    if (!enableCodeRabbit || !lineNumber || !parsedDiff.newFileName) {
      return [];
    }

    return codeRabbitComments.filter(
      (comment) =>
        comment.file_path === parsedDiff.newFileName &&
        comment.line === lineNumber
    );
  };

  // Handle resolving a CodeRabbit comment
  const handleResolveCodeRabbitComment = async (commentId: number) => {
    try {
      // Call API proxy endpoint to resolve via MCP
      const response = await fetch(
        `/api/code-review/${owner}/${repo}/comments/${commentId}/resolve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resolution: 'addressed',
            note: 'Addressed in code review',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to resolve comment');
      }

      // Refetch comments to update UI
      await refetchCodeRabbitComments();
    } catch (error) {
      console.error('Failed to resolve CodeRabbit comment:', error);
      throw error;
    }
  };

  // Handle dismissing a CodeRabbit comment
  const handleDismissCodeRabbitComment = async (commentId: number) => {
    try {
      // Call API proxy endpoint to dismiss via MCP
      const response = await fetch(
        `/api/code-review/${owner}/${repo}/comments/${commentId}/resolve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resolution: 'wont_fix',
            note: 'Comment dismissed',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to dismiss comment');
      }

      // Refetch comments to update UI
      await refetchCodeRabbitComments();
    } catch (error) {
      console.error('Failed to dismiss CodeRabbit comment:', error);
      throw error;
    }
  };

  if (!diffString || parsedDiff.hunks.length === 0) {
    return (
      <div className={cn('p-8 text-center text-gray-500 dark:text-gray-400', className)}>
        No changes to display
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* File info */}
          <div className="flex items-center gap-4">
            <h3 className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
              {(() => {
                // Filter out git prefixes without actual filenames (a/, b/)
                const newFile = parsedDiff.newFileName && parsedDiff.newFileName !== 'b/' ? parsedDiff.newFileName : null;
                const oldFile = parsedDiff.oldFileName && parsedDiff.oldFileName !== 'a/' ? parsedDiff.oldFileName : null;
                return newFile || oldFile || 'Untitled';
              })()}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-green-600 dark:text-green-400">
                +{parsedDiff.totalAdditions}
              </span>
              <span className="text-red-600 dark:text-red-400">
                -{parsedDiff.totalDeletions}
              </span>
            </div>

            {/* CodeRabbit status */}
            {enableCodeRabbit && (
              <div className="flex items-center gap-2 text-xs">
                {codeRabbitLoading ? (
                  <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Loading AI reviews...
                  </span>
                ) : codeRabbitError ? (
                  <span className="text-red-600 dark:text-red-400">
                    ⚠️ CodeRabbit error
                  </span>
                ) : codeRabbitComments.length > 0 ? (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full font-medium">
                    🤖 {codeRabbitComments.length} AI review{codeRabbitComments.length !== 1 ? 's' : ''}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <input
              type="text"
              placeholder="Search in diff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />

            {/* View mode toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('unified')}
                className={cn(
                  'px-3 py-1 text-sm font-medium transition-colors',
                  viewMode === 'unified'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                Unified
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={cn(
                  'px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 dark:border-gray-600',
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                Split
              </button>
            </div>

            {/* Expand/collapse controls */}
            <button
              onClick={expandAll}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Hunks */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {parsedDiff.hunks.map((hunk: DiffHunk) => {
          const isExpanded = expandedHunks.has(hunk.id);

          return (
            <div key={hunk.id} className="bg-white dark:bg-gray-900">
              {/* Hunk header */}
              <button
                onClick={() => toggleHunk(hunk.id)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-left font-mono text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors"
              >
                <span>{hunk.header}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </button>

              {/* Hunk lines */}
              {isExpanded && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {hunk.lines.map((line, lineIndex) => {
                    const lineComments = getCommentsForLine(line.lineNumber);
                    const isCommentingOnThisLine = commentLineNumber === line.lineNumber;

                    return (
                      <React.Fragment key={`${hunk.id}-line-${lineIndex}`}>
                        <DiffLine
                          line={line}
                          viewMode={viewMode}
                          showLineNumbers={showLineNumbers}
                          onAddComment={enableComments ? handleAddCommentClick : undefined}
                          highlightedSearchTerm={searchTerm || null}
                          language={parsedDiff.language}
                        />

                        {/* CodeRabbit AI comments */}
                        {enableCodeRabbit && line.newLineNumber && (() => {
                          const crComments = getCodeRabbitCommentsForLine(line.newLineNumber);
                          return crComments.length > 0 ? (
                            <div className="ml-24 my-2 space-y-2">
                              {crComments.map((crComment) => (
                                <CodeRabbitComment
                                  key={crComment.id}
                                  comment={crComment}
                                  onResolve={handleResolveCodeRabbitComment}
                                  onDismiss={handleDismissCodeRabbitComment}
                                />
                              ))}
                            </div>
                          ) : null;
                        })()}

                        {/* Existing comments */}
                        {lineComments.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-3 ml-24">
                            {lineComments.map((comment) => (
                              <div key={comment.id} className="mb-2 last:mb-0">
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  <span className="font-semibold">{comment.author}</span>
                                  <span>{new Date(comment.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                  {comment.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add comment form */}
                        {isCommentingOnThisLine && (
                          <div className="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-3 ml-24">
                            <textarea
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              placeholder="Add your comment..."
                              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={handleSubmitComment}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Add Comment
                              </button>
                              <button
                                onClick={handleCancelComment}
                                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

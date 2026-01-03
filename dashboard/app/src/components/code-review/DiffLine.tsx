/**
 * DiffLine Component
 *
 * Renders a single line of code diff with line numbers, change indicator, and content.
 * Supports added, deleted, unchanged, and context lines.
 *
 * @module components/code-review/DiffLine
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-202-EPIC21
 */

import React, { useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import { DiffLine as DiffLineType } from '../../hooks/useDiffParser';
import { cn } from '../../lib/utils';

/**
 * Props for the DiffLine component
 */
interface DiffLineProps {
  /** The diff line data to render */
  line: DiffLineType;
  /** Display mode: 'unified' shows both line numbers inline, 'split' shows them separately */
  viewMode: 'unified' | 'split';
  /** Whether to show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Callback fired when user clicks the "Add comment" button on this line */
  onAddComment?: (lineNumber: number) => void;
  /** Search term to highlight in the line content (case-insensitive) */
  highlightedSearchTerm?: string | null;
  /** Programming language for syntax highlighting (e.g., 'javascript', 'python') */
  language?: string | null;
}

/**
 * Get CSS classes for line type
 */
function getLineClasses(type: DiffLineType['type']): string {
  const baseClasses = 'font-mono text-sm leading-relaxed';

  switch (type) {
    case 'added':
      return cn(baseClasses, 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100');
    case 'deleted':
      return cn(baseClasses, 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100');
    case 'unchanged':
      return cn(baseClasses, 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100');
    case 'context':
      return cn(baseClasses, 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 italic');
    default:
      return baseClasses;
  }
}

/**
 * Get change indicator symbol
 */
function getChangeIndicator(type: DiffLineType['type']): string {
  switch (type) {
    case 'added':
      return '+';
    case 'deleted':
      return '-';
    case 'unchanged':
      return ' ';
    default:
      return '';
  }
}

/**
 * Apply syntax highlighting with Prism.js
 */
function applySyntaxHighlighting(content: string, language: string | null): string {
  if (!language || !Prism.languages[language]) {
    return content;
  }

  try {
    return Prism.highlight(content, Prism.languages[language], language);
  } catch (error) {
    console.warn(`Failed to highlight ${language}:`, error);
    return content;
  }
}

/**
 * Highlight search term in content (works with HTML from Prism)
 */
function highlightSearchTerm(html: string, searchTerm: string | null): string {
  if (!searchTerm || searchTerm.trim() === '') {
    return html;
  }

  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');

  return html.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-500/50">$1</mark>');
}

/**
 * DiffLine - Individual line renderer for code diffs
 *
 * Renders a single line from a unified diff with syntax highlighting, line numbers,
 * change indicators, and optional commenting functionality. Supports both unified
 * and split view modes for displaying old/new line numbers.
 *
 * **Features:**
 * - ✅ Line type styling (added/deleted/unchanged/context)
 * - ✅ Syntax highlighting via Prism.js (20+ languages)
 * - ✅ Line number display (unified or split modes)
 * - ✅ Search term highlighting with visual markers
 * - ✅ Inline comment button (appears on hover)
 * - ✅ Dark mode support
 * - ✅ Horizontal overflow handling for long lines
 *
 * @component
 * @example
 * Basic usage with an added line:
 * ```tsx
 * <DiffLine
 *   line={{
 *     type: 'added',
 *     content: 'console.log("new code");',
 *     oldLineNumber: null,
 *     newLineNumber: 42,
 *     lineNumber: 1
 *   }}
 *   viewMode="unified"
 * />
 * ```
 *
 * @example
 * With syntax highlighting and search:
 * ```tsx
 * <DiffLine
 *   line={{
 *     type: 'unchanged',
 *     content: 'function searchExample() {',
 *     oldLineNumber: 10,
 *     newLineNumber: 10,
 *     lineNumber: 5
 *   }}
 *   viewMode="unified"
 *   language="javascript"
 *   highlightedSearchTerm="search"
 * />
 * ```
 *
 * @example
 * With comment functionality:
 * ```tsx
 * <DiffLine
 *   line={lineData}
 *   viewMode="split"
 *   showLineNumbers={true}
 *   onAddComment={(lineNumber) => console.log(`Add comment on line ${lineNumber}`)}
 * />
 * ```
 *
 * @param {DiffLineProps} props - Component props
 * @returns {React.ReactElement} Rendered diff line with styling and interactive elements
 *
 * @see {@link DiffViewer} for the parent component that renders multiple lines
 * @see {@link useDiffParser} for parsing diff strings into line data
 */
export const DiffLine: React.FC<DiffLineProps> = ({
  line,
  viewMode,
  showLineNumbers = true,
  onAddComment,
  highlightedSearchTerm = null,
  language = null,
}) => {
  const lineClasses = getLineClasses(line.type);
  const indicator = getChangeIndicator(line.type);

  // Apply syntax highlighting and search term highlighting
  const displayContentHtml = useMemo(() => {
    let html = applySyntaxHighlighting(line.content, language);
    html = highlightSearchTerm(html, highlightedSearchTerm);
    return html;
  }, [line.content, language, highlightedSearchTerm]);

  return (
    <div
      className={cn(
        'group flex items-start hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors',
        lineClasses
      )}
    >
      {/* Line Numbers */}
      {showLineNumbers && (
        <>
          {viewMode === 'split' ? (
            <>
              {/* Old line number */}
              <div className="w-12 text-right px-2 py-1 text-gray-500 dark:text-gray-400 select-none border-r border-gray-200 dark:border-gray-700">
                {line.oldLineNumber}
              </div>
              {/* New line number */}
              <div className="w-12 text-right px-2 py-1 text-gray-500 dark:text-gray-400 select-none border-r border-gray-200 dark:border-gray-700">
                {line.newLineNumber}
              </div>
            </>
          ) : (
            /* Unified view - show both numbers */
            <div className="flex-shrink-0">
              <div className="w-12 text-right px-2 py-1 text-gray-500 dark:text-gray-400 select-none inline-block">
                {line.oldLineNumber || ''}
              </div>
              <div className="w-12 text-right px-2 py-1 text-gray-500 dark:text-gray-400 select-none inline-block border-r border-gray-200 dark:border-gray-700">
                {line.newLineNumber || ''}
              </div>
            </div>
          )}
        </>
      )}

      {/* Change indicator */}
      <div className="w-6 text-center py-1 font-bold select-none border-r border-gray-200 dark:border-gray-700">
        {indicator}
      </div>

      {/* Line content */}
      <div
        className="flex-1 px-2 py-1 whitespace-pre overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: displayContentHtml }}
      />

      {/* Add comment button (visible on hover) */}
      {onAddComment && line.type !== 'context' && (
        <button
          onClick={() => onAddComment(line.lineNumber)}
          className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-opacity"
          title="Add comment"
        >
          💬
        </button>
      )}
    </div>
  );
};

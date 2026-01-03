/**
 * DiffLine Component Tests
 *
 * @module components/code-review/__tests__/DiffLine.test
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-202-EPIC21
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiffLine } from '../DiffLine';
import type { DiffLine as DiffLineType } from '../../../hooks/useDiffParser';

describe('DiffLine', () => {
  const createMockLine = (overrides?: Partial<DiffLineType>): DiffLineType => ({
    type: 'unchanged',
    content: 'test content',
    oldLineNumber: 1,
    newLineNumber: 1,
    lineNumber: 1,
    ...overrides,
  });

  describe('Line type rendering', () => {
    it('should render added line with green background', () => {
      const line = createMockLine({
        type: 'added',
        content: 'added content',
        oldLineNumber: null,
        newLineNumber: 5,
      });

      const { container } = render(<DiffLine line={line} viewMode="unified" />);
      const lineDiv = container.firstChild as HTMLElement;

      expect(lineDiv).toHaveClass('bg-green-50', 'dark:bg-green-950/30');
      expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('should render deleted line with red background', () => {
      const line = createMockLine({
        type: 'deleted',
        content: 'deleted content',
        oldLineNumber: 5,
        newLineNumber: null,
      });

      const { container } = render(<DiffLine line={line} viewMode="unified" />);
      const lineDiv = container.firstChild as HTMLElement;

      expect(lineDiv).toHaveClass('bg-red-50', 'dark:bg-red-950/30');
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render unchanged line with white background', () => {
      const line = createMockLine({
        type: 'unchanged',
        content: 'unchanged content',
      });

      const { container } = render(<DiffLine line={line} viewMode="unified" />);
      const lineDiv = container.firstChild as HTMLElement;

      expect(lineDiv).toHaveClass('bg-white', 'dark:bg-gray-900');
      expect(screen.getByText(' ')).toBeInTheDocument();
    });

    it('should render context line with gray background and italic', () => {
      const line = createMockLine({
        type: 'context',
        content: '...',
        oldLineNumber: null,
        newLineNumber: null,
      });

      const { container } = render(<DiffLine line={line} viewMode="unified" />);
      const lineDiv = container.firstChild as HTMLElement;

      expect(lineDiv).toHaveClass('bg-gray-50', 'dark:bg-gray-800', 'italic');
    });
  });

  describe('Line numbers display', () => {
    it('should show line numbers in unified mode', () => {
      const line = createMockLine({
        oldLineNumber: 10,
        newLineNumber: 15,
      });

      render(<DiffLine line={line} viewMode="unified" showLineNumbers={true} />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should show line numbers in split mode', () => {
      const line = createMockLine({
        oldLineNumber: 10,
        newLineNumber: 15,
      });

      render(<DiffLine line={line} viewMode="split" showLineNumbers={true} />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should not show line numbers when showLineNumbers is false', () => {
      const line = createMockLine({
        oldLineNumber: 10,
        newLineNumber: 15,
      });

      render(<DiffLine line={line} viewMode="unified" showLineNumbers={false} />);

      expect(screen.queryByText('10')).not.toBeInTheDocument();
      expect(screen.queryByText('15')).not.toBeInTheDocument();
    });

    it('should show null for oldLineNumber in added lines', () => {
      const line = createMockLine({
        type: 'added',
        oldLineNumber: null,
        newLineNumber: 15,
      });

      const { container } = render(
        <DiffLine line={line} viewMode="unified" showLineNumbers={true} />
      );

      // Check that there are two line number divs (old and new)
      const lineNumberDivs = container.querySelectorAll('.w-12.text-right');
      expect(lineNumberDivs).toHaveLength(2);

      // First should be empty (old line number)
      expect(lineNumberDivs[0].textContent).toBe('');

      // Second should show new line number
      expect(lineNumberDivs[1].textContent).toBe('15');
    });

    it('should show null for newLineNumber in deleted lines', () => {
      const line = createMockLine({
        type: 'deleted',
        oldLineNumber: 10,
        newLineNumber: null,
      });

      const { container } = render(
        <DiffLine line={line} viewMode="unified" showLineNumbers={true} />
      );

      const lineNumberDivs = container.querySelectorAll('.w-12.text-right');
      expect(lineNumberDivs).toHaveLength(2);

      expect(lineNumberDivs[0].textContent).toBe('10');
      expect(lineNumberDivs[1].textContent).toBe('');
    });
  });

  describe('Syntax highlighting', () => {
    it('should apply syntax highlighting for JavaScript', () => {
      const line = createMockLine({
        content: 'const foo = "bar";',
      });

      const { container } = render(
        <DiffLine line={line} viewMode="unified" language="javascript" />
      );

      // Check that content is rendered with dangerouslySetInnerHTML
      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should apply syntax highlighting for TypeScript', () => {
      const line = createMockLine({
        content: 'interface User { name: string; }',
      });

      const { container } = render(
        <DiffLine line={line} viewMode="unified" language="typescript" />
      );

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should render plain text when language is null', () => {
      const line = createMockLine({
        content: 'plain text content',
      });

      const { container } = render(
        <DiffLine line={line} viewMode="unified" language={null} />
      );

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should render plain text for unsupported language', () => {
      const line = createMockLine({
        content: 'unsupported language',
      });

      const { container } = render(
        <DiffLine line={line} viewMode="unified" language="unknownlang" />
      );

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('Search term highlighting', () => {
    it('should highlight search term in content', () => {
      const line = createMockLine({
        content: 'const searchTerm = "find this";',
      });

      const { container } = render(
        <DiffLine
          line={line}
          viewMode="unified"
          highlightedSearchTerm="searchTerm"
        />
      );

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv?.innerHTML).toContain('mark');
    });

    it('should handle case-insensitive search', () => {
      const line = createMockLine({
        content: 'UPPERCASE and lowercase',
      });

      const { container } = render(
        <DiffLine
          line={line}
          viewMode="unified"
          highlightedSearchTerm="uppercase"
        />
      );

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv?.innerHTML).toContain('mark');
    });

    it('should not highlight when search term is null', () => {
      const line = createMockLine({
        content: 'no highlighting',
      });

      const { container } = render(
        <DiffLine line={line} viewMode="unified" highlightedSearchTerm={null} />
      );

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv?.innerHTML).not.toContain('mark');
    });

    it('should escape regex special characters in search term', () => {
      const line = createMockLine({
        content: 'const regex = /[a-z]+/;',
      });

      const { container } = render(
        <DiffLine
          line={line}
          viewMode="unified"
          highlightedSearchTerm="[a-z]+"
        />
      );

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv?.innerHTML).toContain('mark');
    });
  });

  describe('Add comment button', () => {
    it('should show comment button on hover when onAddComment provided', async () => {
      const onAddComment = vi.fn();
      const line = createMockLine({ lineNumber: 10 });

      render(
        <DiffLine
          line={line}
          viewMode="unified"
          onAddComment={onAddComment}
        />
      );

      const button = screen.getByTitle('Add comment');
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('opacity-0', 'group-hover:opacity-100');
    });

    it('should not show comment button when onAddComment not provided', () => {
      const line = createMockLine({ lineNumber: 10 });

      render(<DiffLine line={line} viewMode="unified" />);

      expect(screen.queryByTitle('Add comment')).not.toBeInTheDocument();
    });

    it('should not show comment button for context lines', () => {
      const onAddComment = vi.fn();
      const line = createMockLine({
        type: 'context',
        lineNumber: 10,
      });

      render(
        <DiffLine
          line={line}
          viewMode="unified"
          onAddComment={onAddComment}
        />
      );

      expect(screen.queryByTitle('Add comment')).not.toBeInTheDocument();
    });

    it('should call onAddComment with line number when clicked', async () => {
      const user = userEvent.setup();
      const onAddComment = vi.fn();
      const line = createMockLine({ lineNumber: 42 });

      render(
        <DiffLine
          line={line}
          viewMode="unified"
          onAddComment={onAddComment}
        />
      );

      const button = screen.getByTitle('Add comment');
      await user.click(button);

      expect(onAddComment).toHaveBeenCalledWith(42);
      expect(onAddComment).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling and classes', () => {
    it('should apply hover state classes', () => {
      const line = createMockLine();

      const { container } = render(<DiffLine line={line} viewMode="unified" />);
      const lineDiv = container.firstChild as HTMLElement;

      expect(lineDiv).toHaveClass(
        'hover:bg-gray-100',
        'dark:hover:bg-gray-800/50',
        'transition-colors'
      );
    });

    it('should apply font-mono class', () => {
      const line = createMockLine();

      const { container } = render(<DiffLine line={line} viewMode="unified" />);
      const lineDiv = container.firstChild as HTMLElement;

      expect(lineDiv).toHaveClass('font-mono', 'text-sm', 'leading-relaxed');
    });

    it('should apply group class for hover behavior', () => {
      const line = createMockLine();

      const { container } = render(<DiffLine line={line} viewMode="unified" />);
      const lineDiv = container.firstChild as HTMLElement;

      expect(lineDiv).toHaveClass('group');
    });
  });

  describe('Content rendering', () => {
    it('should render line content correctly', () => {
      const line = createMockLine({
        content: 'test line content',
      });

      const { container } = render(<DiffLine line={line} viewMode="unified" />);

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should preserve whitespace in content', () => {
      const line = createMockLine({
        content: '  indented   content  ',
      });

      const { container } = render(<DiffLine line={line} viewMode="unified" />);

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv).toHaveClass('whitespace-pre');
    });

    it('should allow horizontal overflow for long lines', () => {
      const line = createMockLine({
        content: 'a'.repeat(200),
      });

      const { container } = render(<DiffLine line={line} viewMode="unified" />);

      const contentDiv = container.querySelector('.flex-1.px-2.py-1');
      expect(contentDiv).toHaveClass('overflow-x-auto');
    });
  });
});

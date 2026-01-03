/**
 * CodeRabbitComment Component Tests
 *
 * @module components/code-review/__tests__/CodeRabbitComment.test
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-203-EPIC21
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeRabbitComment } from '../CodeRabbitComment';
import type { CodeRabbitComment as CodeRabbitCommentType } from '../../../hooks/useCodeRabbitComments';

describe('CodeRabbitComment', () => {
  const createMockComment = (
    overrides?: Partial<CodeRabbitCommentType>
  ): CodeRabbitCommentType => ({
    id: 123,
    review_id: 456,
    file_path: 'src/components/App.tsx',
    line: 42,
    original_line: null,
    body: 'Consider using useMemo here to optimize rendering',
    author: 'coderabbitai[bot]',
    severity: 'medium',
    type: 'suggestion',
    created_at: '2026-01-02T10:00:00Z',
    updated_at: '2026-01-02T10:00:00Z',
    resolved: false,
    html_url: 'https://github.com/owner/repo/pull/42#discussion_r123',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render comment with all basic elements', () => {
      const comment = createMockComment();
      render(<CodeRabbitComment comment={comment} onResolve={() => {}} />);

      expect(screen.getByText('coderabbitai[bot]')).toBeInTheDocument();
      expect(screen.getByText('Consider using useMemo here to optimize rendering')).toBeInTheDocument();
      expect(screen.getByText('src/components/App.tsx:42')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /View on GitHub/i })).toHaveAttribute(
        'href',
        'https://github.com/owner/repo/pull/42#discussion_r123'
      );
    });

    it('should render CodeRabbit robot icon', () => {
      const comment = createMockComment();
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const robotIcon = container.querySelector('.text-white.text-xs');
      expect(robotIcon).toBeInTheDocument();
      expect(robotIcon?.textContent).toBe('🤖');
    });

    it('should render comment body as whitespace-pre-wrap', () => {
      const comment = createMockComment({
        body: 'Line 1\nLine 2\n  Indented',
      });

      const { container } = render(<CodeRabbitComment comment={comment} />);
      const bodyElement = container.querySelector('.whitespace-pre-wrap');

      expect(bodyElement).toBeInTheDocument();
      expect(bodyElement?.textContent).toBe('Line 1\nLine 2\n  Indented');
    });
  });

  describe('Severity badge styling', () => {
    it('should render critical severity with red badge', () => {
      const comment = createMockComment({ severity: 'critical' });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const badge = screen.getByText('CRITICAL');
      expect(badge).toHaveClass('bg-red-100', 'text-red-800');
      expect(badge).toHaveClass('dark:bg-red-900', 'dark:text-red-100');
    });

    it('should render high severity with orange badge', () => {
      const comment = createMockComment({ severity: 'high' });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const badge = screen.getByText('HIGH');
      expect(badge).toHaveClass('bg-orange-100', 'text-orange-800');
      expect(badge).toHaveClass('dark:bg-orange-900', 'dark:text-orange-100');
    });

    it('should render medium severity with yellow badge', () => {
      const comment = createMockComment({ severity: 'medium' });
      render(<CodeRabbitComment comment={comment} />);

      const badge = screen.getByText('MEDIUM');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
      expect(badge).toHaveClass('dark:bg-yellow-900', 'dark:text-yellow-100');
    });

    it('should render low severity with blue badge', () => {
      const comment = createMockComment({ severity: 'low' });
      render(<CodeRabbitComment comment={comment} />);

      const badge = screen.getByText('LOW');
      expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
      expect(badge).toHaveClass('dark:bg-blue-900', 'dark:text-blue-100');
    });

    it('should render info severity with gray badge', () => {
      const comment = createMockComment({ severity: 'info' });
      render(<CodeRabbitComment comment={comment} />);

      const badge = screen.getByText('INFO');
      expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
      expect(badge).toHaveClass('dark:bg-gray-700', 'dark:text-gray-100');
    });
  });

  describe('Type icon display', () => {
    it('should show lightbulb icon for suggestions', () => {
      const comment = createMockComment({ type: 'suggestion' });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const icon = container.querySelector('[title="suggestion"]');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('💡');
    });

    it('should show warning icon for issues', () => {
      const comment = createMockComment({ type: 'issue' });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const icon = container.querySelector('[title="issue"]');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('⚠️');
    });

    it('should show thumbs up icon for praise', () => {
      const comment = createMockComment({ type: 'praise' });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const icon = container.querySelector('[title="praise"]');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('👍');
    });

    it('should show question icon for questions', () => {
      const comment = createMockComment({ type: 'question' });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const icon = container.querySelector('[title="question"]');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('❓');
    });
  });

  describe('Status badge', () => {
    it('should show "Pending" with amber background for unresolved comments', () => {
      const comment = createMockComment({ resolved: false });
      render(<CodeRabbitComment comment={comment} />);

      const statusBadge = screen.getByText('Pending');
      expect(statusBadge).toHaveClass('bg-amber-100', 'text-amber-800');
      expect(statusBadge).toHaveClass('dark:bg-amber-900', 'dark:text-amber-100');
    });

    it('should show "Resolved" with green background for resolved comments', () => {
      const comment = createMockComment({ resolved: true });
      render(<CodeRabbitComment comment={comment} />);

      const statusBadge = screen.getByText('Resolved');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(statusBadge).toHaveClass('dark:bg-green-900', 'dark:text-green-100');
    });
  });

  describe('Timestamp display', () => {
    it('should display "just now" for very recent comments', () => {
      const now = new Date();
      const comment = createMockComment({
        created_at: now.toISOString(),
      });

      render(<CodeRabbitComment comment={comment} />);
      expect(screen.getByText('just now')).toBeInTheDocument();
    });

    it('should display minutes ago for recent comments', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const comment = createMockComment({
        created_at: thirtyMinutesAgo.toISOString(),
      });

      render(<CodeRabbitComment comment={comment} />);
      expect(screen.getByText(/30 min ago/)).toBeInTheDocument();
    });

    it('should display hours ago for comments within 24 hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const comment = createMockComment({
        created_at: twoHoursAgo.toISOString(),
      });

      render(<CodeRabbitComment comment={comment} />);
      expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    });

    it('should display days ago for comments within a week', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const comment = createMockComment({
        created_at: threeDaysAgo.toISOString(),
      });

      render(<CodeRabbitComment comment={comment} />);
      expect(screen.getByText(/3 days ago/)).toBeInTheDocument();
    });

    it('should display formatted date for older comments', () => {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const comment = createMockComment({
        created_at: twoWeeksAgo.toISOString(),
      });

      render(<CodeRabbitComment comment={comment} />);

      const formattedDate = twoWeeksAgo.toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  describe('Resolve button', () => {
    it('should show resolve button for unresolved comments when onResolve provided', () => {
      const onResolve = vi.fn();
      const comment = createMockComment({ resolved: false });

      render(<CodeRabbitComment comment={comment} onResolve={onResolve} />);

      const resolveButton = screen.getByRole('button', { name: /Resolve/i });
      expect(resolveButton).toBeInTheDocument();
      expect(resolveButton).not.toBeDisabled();
    });

    it('should not show resolve button for resolved comments', () => {
      const onResolve = vi.fn();
      const comment = createMockComment({ resolved: true });

      render(<CodeRabbitComment comment={comment} onResolve={onResolve} />);

      expect(screen.queryByRole('button', { name: /Resolve/i })).not.toBeInTheDocument();
    });

    it('should not show resolve button when onResolve not provided', () => {
      const comment = createMockComment({ resolved: false });

      render(<CodeRabbitComment comment={comment} />);

      expect(screen.queryByRole('button', { name: /Resolve/i })).not.toBeInTheDocument();
    });

    it('should call onResolve with comment ID when clicked', async () => {
      const user = userEvent.setup();
      const onResolve = vi.fn().mockResolvedValue(undefined);
      const comment = createMockComment({ id: 999 });

      render(<CodeRabbitComment comment={comment} onResolve={onResolve} />);

      const resolveButton = screen.getByRole('button', { name: /Resolve/i });
      await user.click(resolveButton);

      expect(onResolve).toHaveBeenCalledWith(999);
      expect(onResolve).toHaveBeenCalledTimes(1);
    });

    it('should show loading state while resolving', async () => {
      const user = userEvent.setup();
      const onResolve = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const comment = createMockComment();

      render(<CodeRabbitComment comment={comment} onResolve={onResolve} />);

      const resolveButton = screen.getByRole('button', { name: /Resolve/i });
      await user.click(resolveButton);

      // Button should show loading state
      expect(screen.getByText('Resolving...')).toBeInTheDocument();
      expect(resolveButton).toBeDisabled();

      // Wait for resolution
      await waitFor(() => {
        expect(onResolve).toHaveBeenCalled();
      });
    });

    it('should disable button while resolving', async () => {
      const user = userEvent.setup();
      const onResolve = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const comment = createMockComment();

      render(<CodeRabbitComment comment={comment} onResolve={onResolve} />);

      const resolveButton = screen.getByRole('button', { name: /Resolve/i });
      await user.click(resolveButton);

      expect(resolveButton).toBeDisabled();
    });

    it('should handle resolve errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Network error');
      const onResolve = vi.fn().mockRejectedValue(error);
      const comment = createMockComment();

      render(<CodeRabbitComment comment={comment} onResolve={onResolve} />);

      const resolveButton = screen.getByRole('button', { name: /Resolve/i });
      await user.click(resolveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to resolve comment:',
          error
        );
      });

      // Button should be re-enabled after error
      expect(resolveButton).not.toBeDisabled();

      consoleErrorSpy.mockRestore();
    });

    it('should prevent multiple simultaneous resolve clicks', async () => {
      const user = userEvent.setup();
      const onResolve = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const comment = createMockComment();

      render(<CodeRabbitComment comment={comment} onResolve={onResolve} />);

      const resolveButton = screen.getByRole('button', { name: /Resolve/i });

      // Click multiple times rapidly
      await user.click(resolveButton);
      await user.click(resolveButton);
      await user.click(resolveButton);

      // Should only be called once
      expect(onResolve).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dismiss button', () => {
    it('should show dismiss button for unresolved comments when onDismiss provided', () => {
      const onDismiss = vi.fn();
      const comment = createMockComment({ resolved: false });

      render(<CodeRabbitComment comment={comment} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss/i });
      expect(dismissButton).toBeInTheDocument();
      expect(dismissButton).not.toBeDisabled();
    });

    it('should not show dismiss button for resolved comments', () => {
      const onDismiss = vi.fn();
      const comment = createMockComment({ resolved: true });

      render(<CodeRabbitComment comment={comment} onDismiss={onDismiss} />);

      expect(screen.queryByRole('button', { name: /Dismiss/i })).not.toBeInTheDocument();
    });

    it('should call onDismiss with comment ID when clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn().mockResolvedValue(undefined);
      const comment = createMockComment({ id: 888 });

      render(<CodeRabbitComment comment={comment} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss/i });
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledWith(888);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should show loading state while dismissing', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const comment = createMockComment();

      render(<CodeRabbitComment comment={comment} onDismiss={onDismiss} />);

      const dismissButton = screen.getByRole('button', { name: /Dismiss/i });
      await user.click(dismissButton);

      expect(screen.getByText('Dismissing...')).toBeInTheDocument();
      expect(dismissButton).toBeDisabled();

      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalled();
      });
    });

    it('should disable both buttons while dismissing', async () => {
      const user = userEvent.setup();
      const onResolve = vi.fn();
      const onDismiss = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const comment = createMockComment();

      render(
        <CodeRabbitComment
          comment={comment}
          onResolve={onResolve}
          onDismiss={onDismiss}
        />
      );

      const resolveButton = screen.getByRole('button', { name: /Resolve/i });
      const dismissButton = screen.getByRole('button', { name: /Dismiss/i });

      await user.click(dismissButton);

      expect(resolveButton).toBeDisabled();
      expect(dismissButton).toBeDisabled();
    });
  });

  describe('Border color', () => {
    it('should have blue border for unresolved comments', () => {
      const comment = createMockComment({ resolved: false });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('border-blue-500', 'bg-blue-50');
      expect(rootDiv).toHaveClass('dark:bg-blue-950/20');
    });

    it('should have green border for resolved comments', () => {
      const comment = createMockComment({ resolved: true });
      const { container } = render(<CodeRabbitComment comment={comment} />);

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('border-green-500', 'bg-green-50');
      expect(rootDiv).toHaveClass('dark:bg-green-950/20');
    });
  });

  describe('Resolved state footer', () => {
    it('should show resolved footer for resolved comments', () => {
      const comment = createMockComment({ resolved: true });
      render(<CodeRabbitComment comment={comment} />);

      expect(screen.getByText('✓ This feedback has been resolved')).toBeInTheDocument();
    });

    it('should not show resolved footer for unresolved comments', () => {
      const comment = createMockComment({ resolved: false });
      render(<CodeRabbitComment comment={comment} />);

      expect(
        screen.queryByText('✓ This feedback has been resolved')
      ).not.toBeInTheDocument();
    });

    it('should show GitHub link in resolved footer', () => {
      const comment = createMockComment({ resolved: true });
      render(<CodeRabbitComment comment={comment} />);

      const links = screen.getAllByRole('link', { name: /View on GitHub/i });
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', comment.html_url);
    });
  });

  describe('GitHub link', () => {
    it('should have correct href attribute', () => {
      const comment = createMockComment({
        html_url: 'https://github.com/test/repo/pull/123#discussion_r456',
      });

      render(<CodeRabbitComment comment={comment} onResolve={() => {}} />);

      const link = screen.getByRole('link', { name: /View on GitHub/i });
      expect(link).toHaveAttribute(
        'href',
        'https://github.com/test/repo/pull/123#discussion_r456'
      );
    });

    it('should open in new tab', () => {
      const comment = createMockComment();
      render(<CodeRabbitComment comment={comment} onResolve={() => {}} />);

      const link = screen.getByRole('link', { name: /View on GitHub/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className to root element', () => {
      const comment = createMockComment();
      const { container } = render(
        <CodeRabbitComment comment={comment} className="custom-class" />
      );

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('custom-class');
    });

    it('should preserve default classes when custom className applied', () => {
      const comment = createMockComment();
      const { container } = render(
        <CodeRabbitComment comment={comment} className="custom-class" />
      );

      const rootDiv = container.firstChild as HTMLElement;
      expect(rootDiv).toHaveClass('border-l-4', 'p-4', 'rounded-r-lg', 'custom-class');
    });
  });
});

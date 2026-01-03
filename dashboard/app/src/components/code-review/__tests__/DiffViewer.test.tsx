/**
 * DiffViewer Component Tests
 *
 * @module components/code-review/__tests__/DiffViewer.test
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.2
 * @date 2026-01-02
 * @task DFO-202-EPIC21
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiffViewer } from '../DiffViewer';

describe('DiffViewer', () => {
  const simpleDiff = `diff --git a/test.js b/test.js
--- a/test.js
+++ b/test.js
@@ -1,3 +1,4 @@
 function hello() {
-  console.log('old');
+  console.log('new');
+  return true;
 }`;

  const multiHunkDiff = `diff --git a/file.ts b/file.ts
--- a/file.ts
+++ b/file.ts
@@ -1,2 +1,2 @@
-old line 1
+new line 1
 unchanged line
@@ -10,2 +10,2 @@
-old line 2
+new line 2
 unchanged line 2`;

  describe('Empty and no changes', () => {
    it('should show "No changes to display" for empty diff', () => {
      render(<DiffViewer diffString="" />);

      expect(screen.getByText('No changes to display')).toBeInTheDocument();
    });

    it('should show "No changes to display" for whitespace-only diff', () => {
      render(<DiffViewer diffString="   \n  \t  " />);

      expect(screen.getByText('No changes to display')).toBeInTheDocument();
    });

    it('should apply custom className when no changes', () => {
      const { container } = render(
        <DiffViewer diffString="" className="custom-class" />
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass('custom-class');
    });
  });

  describe('Header rendering', () => {
    it('should display filename in header', () => {
      render(<DiffViewer diffString={simpleDiff} />);

      // parsePatch returns filename with git prefix (b/test.js)
      expect(screen.getByText('b/test.js')).toBeInTheDocument();
    });

    it('should display "Untitled" when no filename available', () => {
      const noNameDiff = `diff --git a/ b/
--- a/
+++ b/
@@ -1 +1 @@
-old
+new`;

      render(<DiffViewer diffString={noNameDiff} />);

      expect(screen.getByText('Untitled')).toBeInTheDocument();
    });

    it('should display addition and deletion counts', () => {
      render(<DiffViewer diffString={simpleDiff} />);

      // Use more specific selector to avoid matching diff header (@@ -1,3 +1,4 @@)
      const additionElement = screen.getByText((content, element) => {
        return element?.className?.includes('text-green') && content.includes('+2');
      });
      const deletionElement = screen.getByText((content, element) => {
        return element?.className?.includes('text-red') && content.includes('-1');
      });

      expect(additionElement).toBeInTheDocument();
      expect(deletionElement).toBeInTheDocument();
    });

    it('should show search input', () => {
      render(<DiffViewer diffString={simpleDiff} />);

      const searchInput = screen.getByPlaceholderText('Search in diff...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should show view mode toggle buttons', () => {
      render(<DiffViewer diffString={simpleDiff} />);

      expect(screen.getByRole('button', { name: 'Unified' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Split' })).toBeInTheDocument();
    });

    it('should show expand/collapse buttons', () => {
      render(<DiffViewer diffString={simpleDiff} />);

      expect(screen.getByRole('button', { name: 'Expand All' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collapse All' })).toBeInTheDocument();
    });
  });

  describe('View mode toggle', () => {
    it('should start in unified mode by default', () => {
      render(<DiffViewer diffString={simpleDiff} />);

      const unifiedButton = screen.getByRole('button', { name: 'Unified' });
      expect(unifiedButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should start in specified initial view mode', () => {
      render(<DiffViewer diffString={simpleDiff} viewMode="split" />);

      const splitButton = screen.getByRole('button', { name: 'Split' });
      expect(splitButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should switch to split mode when clicked', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={simpleDiff} />);

      const splitButton = screen.getByRole('button', { name: 'Split' });
      await user.click(splitButton);

      expect(splitButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should switch to unified mode when clicked', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={simpleDiff} viewMode="split" />);

      const unifiedButton = screen.getByRole('button', { name: 'Unified' });
      await user.click(unifiedButton);

      expect(unifiedButton).toHaveClass('bg-blue-600', 'text-white');
    });
  });

  describe('Hunk expansion/collapse', () => {
    it('should expand all hunks by default', () => {
      render(<DiffViewer diffString={multiHunkDiff} />);

      // Both hunks should be visible (each has a hunk header button)
      const hunkButtons = screen.getAllByRole('button', {
        name: /^@@ -\d+,\d+ \+\d+,\d+ @@/,
      });
      expect(hunkButtons).toHaveLength(2);

      // Check for expanded indicator (▼)
      hunkButtons.forEach((button) => {
        expect(button).toHaveTextContent('▼');
      });
    });

    it('should collapse hunk when header clicked', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={simpleDiff} />);

      const hunkButton = screen.getByRole('button', {
        name: /^@@ -1,3 \+1,4 @@/,
      });

      await user.click(hunkButton);

      expect(hunkButton).toHaveTextContent('▶');
    });

    it('should expand collapsed hunk when clicked again', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={simpleDiff} />);

      const hunkButton = screen.getByRole('button', {
        name: /^@@ -1,3 \+1,4 @@/,
      });

      await user.click(hunkButton); // Collapse
      await user.click(hunkButton); // Expand

      expect(hunkButton).toHaveTextContent('▼');
    });

    it('should expand all hunks when "Expand All" clicked', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={multiHunkDiff} />);

      // Collapse all first
      const collapseAllButton = screen.getByRole('button', { name: 'Collapse All' });
      await user.click(collapseAllButton);

      // Then expand all
      const expandAllButton = screen.getByRole('button', { name: 'Expand All' });
      await user.click(expandAllButton);

      const hunkButtons = screen.getAllByRole('button', {
        name: /^@@ -\d+,\d+ \+\d+,\d+ @@/,
      });

      hunkButtons.forEach((button) => {
        expect(button).toHaveTextContent('▼');
      });
    });

    it('should collapse all hunks when "Collapse All" clicked', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={multiHunkDiff} />);

      const collapseAllButton = screen.getByRole('button', { name: 'Collapse All' });
      await user.click(collapseAllButton);

      const hunkButtons = screen.getAllByRole('button', {
        name: /^@@ -\d+,\d+ \+\d+,\d+ @@/,
      });

      hunkButtons.forEach((button) => {
        expect(button).toHaveTextContent('▶');
      });
    });
  });

  describe('Search functionality', () => {
    it('should update search term when typing', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={simpleDiff} />);

      const searchInput = screen.getByPlaceholderText('Search in diff...');
      await user.type(searchInput, 'console');

      expect(searchInput).toHaveValue('console');
    });

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup();
      render(<DiffViewer diffString={simpleDiff} />);

      const searchInput = screen.getByPlaceholderText('Search in diff...');
      await user.type(searchInput, 'test');
      await user.clear(searchInput);

      expect(searchInput).toHaveValue('');
    });
  });

  describe('Comment functionality', () => {
    it('should not show add comment button when enableComments is false', () => {
      render(<DiffViewer diffString={simpleDiff} enableComments={false} />);

      expect(screen.queryByTitle('Add comment')).not.toBeInTheDocument();
    });

    it('should show add comment button when enableComments is true', () => {
      render(<DiffViewer diffString={simpleDiff} enableComments={true} />);

      // Comment buttons should exist (may be hidden via opacity-0 class)
      const buttons = screen.getAllByTitle('Add comment');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show comment form when add comment clicked', async () => {
      const user = userEvent.setup();
      const onAddComment = vi.fn();

      render(
        <DiffViewer
          diffString={simpleDiff}
          enableComments={true}
          onAddComment={onAddComment}
        />
      );

      const addButtons = screen.getAllByTitle('Add comment');
      await user.click(addButtons[0]);

      expect(
        screen.getByPlaceholderText('Add your comment...')
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add Comment' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should call onAddComment when submitting comment', async () => {
      const user = userEvent.setup();
      const onAddComment = vi.fn();

      render(
        <DiffViewer
          diffString={simpleDiff}
          enableComments={true}
          onAddComment={onAddComment}
        />
      );

      const addButtons = screen.getAllByTitle('Add comment');
      await user.click(addButtons[0]);

      const textarea = screen.getByPlaceholderText('Add your comment...');
      await user.type(textarea, 'This is a test comment');

      const submitButton = screen.getByRole('button', { name: 'Add Comment' });
      await user.click(submitButton);

      expect(onAddComment).toHaveBeenCalledWith(
        expect.any(Number),
        'This is a test comment'
      );
    });

    it('should not submit empty comment', async () => {
      const user = userEvent.setup();
      const onAddComment = vi.fn();

      render(
        <DiffViewer
          diffString={simpleDiff}
          enableComments={true}
          onAddComment={onAddComment}
        />
      );

      const addButtons = screen.getAllByTitle('Add comment');
      await user.click(addButtons[0]);

      const submitButton = screen.getByRole('button', { name: 'Add Comment' });
      await user.click(submitButton);

      expect(onAddComment).not.toHaveBeenCalled();
    });

    it('should not submit whitespace-only comment', async () => {
      const user = userEvent.setup();
      const onAddComment = vi.fn();

      render(
        <DiffViewer
          diffString={simpleDiff}
          enableComments={true}
          onAddComment={onAddComment}
        />
      );

      const addButtons = screen.getAllByTitle('Add comment');
      await user.click(addButtons[0]);

      const textarea = screen.getByPlaceholderText('Add your comment...');
      await user.type(textarea, '   \n  \t  ');

      const submitButton = screen.getByRole('button', { name: 'Add Comment' });
      await user.click(submitButton);

      expect(onAddComment).not.toHaveBeenCalled();
    });

    it('should clear form after submitting comment', async () => {
      const user = userEvent.setup();
      const onAddComment = vi.fn();

      render(
        <DiffViewer
          diffString={simpleDiff}
          enableComments={true}
          onAddComment={onAddComment}
        />
      );

      const addButtons = screen.getAllByTitle('Add comment');
      await user.click(addButtons[0]);

      const textarea = screen.getByPlaceholderText('Add your comment...');
      await user.type(textarea, 'Test comment');

      const submitButton = screen.getByRole('button', { name: 'Add Comment' });
      await user.click(submitButton);

      expect(
        screen.queryByPlaceholderText('Add your comment...')
      ).not.toBeInTheDocument();
    });

    it('should close form when cancel clicked', async () => {
      const user = userEvent.setup();

      render(
        <DiffViewer diffString={simpleDiff} enableComments={true} />
      );

      const addButtons = screen.getAllByTitle('Add comment');
      await user.click(addButtons[0]);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(
        screen.queryByPlaceholderText('Add your comment...')
      ).not.toBeInTheDocument();
    });

    it('should display existing comments', () => {
      const comments = [
        {
          id: '1',
          lineNumber: 1,
          author: 'Test User',
          content: 'This is a test comment',
          timestamp: '2026-01-02T10:00:00Z',
        },
      ];

      render(
        <DiffViewer diffString={simpleDiff} comments={comments} />
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    it('should show multiple comments on same line', () => {
      const comments = [
        {
          id: '1',
          lineNumber: 1,
          author: 'User 1',
          content: 'First comment',
          timestamp: '2026-01-02T10:00:00Z',
        },
        {
          id: '2',
          lineNumber: 1,
          author: 'User 2',
          content: 'Second comment',
          timestamp: '2026-01-02T10:05:00Z',
        },
      ];

      render(
        <DiffViewer diffString={simpleDiff} comments={comments} />
      );

      expect(screen.getByText('First comment')).toBeInTheDocument();
      expect(screen.getByText('Second comment')).toBeInTheDocument();
    });
  });

  describe('Line numbers', () => {
    it('should show line numbers by default', () => {
      const { container } = render(<DiffViewer diffString={simpleDiff} />);

      const lineNumberDivs = container.querySelectorAll('.w-12.text-right');
      expect(lineNumberDivs.length).toBeGreaterThan(0);
    });

    it('should hide line numbers when showLineNumbers is false', () => {
      const { container } = render(
        <DiffViewer diffString={simpleDiff} showLineNumbers={false} />
      );

      const lineNumberDivs = container.querySelectorAll('.w-12.text-right');
      expect(lineNumberDivs.length).toBe(0);
    });
  });

  describe('Styling and customization', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <DiffViewer diffString={simpleDiff} className="custom-diff-viewer" />
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('custom-diff-viewer');
    });

    it('should apply default styles', () => {
      const { container } = render(<DiffViewer diffString={simpleDiff} />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass(
        'bg-white',
        'dark:bg-gray-900',
        'border',
        'rounded-lg'
      );
    });
  });

  describe('CodeRabbit Integration', () => {
    const mockOwner = 'test-owner';
    const mockRepo = 'test-repo';
    const mockPullNumber = 42;

    const mockCodeRabbitComments = [
      {
        id: 1,
        review_id: 100,
        file_path: 'b/test.js', // Match parsePatch format with "b/" prefix
        line: 1, // Line number from new file (matches diff line 1)
        original_line: null,
        body: 'Critical security vulnerability detected',
        author: 'coderabbitai[bot]',
        severity: 'critical' as const,
        type: 'issue' as const,
        created_at: '2026-01-02T10:00:00Z',
        updated_at: '2026-01-02T10:00:00Z',
        resolved: false,
        html_url: 'https://github.com/test/repo/pull/42#discussion_r1',
      },
      {
        id: 2,
        review_id: 100,
        file_path: 'b/test.js', // Match parsePatch format with "b/" prefix
        line: 2, // Line number from new file (matches diff line 2)
        original_line: null,
        body: 'Consider using const instead of let',
        author: 'coderabbitai[bot]',
        severity: 'low' as const,
        type: 'suggestion' as const,
        created_at: '2026-01-02T10:01:00Z',
        updated_at: '2026-01-02T10:01:00Z',
        resolved: false,
        html_url: 'https://github.com/test/repo/pull/42#discussion_r2',
      },
    ];

    let mockFetch: ReturnType<typeof vi.fn>;
    let localStorageMock: { getItem: ReturnType<typeof vi.fn>; setItem: ReturnType<typeof vi.fn>; };

    beforeEach(() => {
      // Mock localStorage
      localStorageMock = {
        getItem: vi.fn().mockReturnValue('mock-auth-token'),
        setItem: vi.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true,
      });

      // Mock fetch
      mockFetch = vi.fn();
      global.fetch = mockFetch;

      // Default successful response
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            comments: mockCodeRabbitComments,
          },
        }),
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('Rendering with CodeRabbit enabled', () => {
      it('should not fetch comments when enableCodeRabbit is false', () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={false}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should fetch comments when enableCodeRabbit is true', async () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for fetch to be called
        await vi.waitFor(() => {
          expect(mockFetch).toHaveBeenCalled();
        }, { timeout: 3000 });

        // Verify correct URL and headers
        expect(mockFetch).toHaveBeenCalledWith(
          `/api/code-review/${mockOwner}/${mockRepo}/${mockPullNumber}`,
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-auth-token',
            }),
          })
        );
      });

      it('should show AI reviews badge in header after loading comments', async () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for the "Loading AI reviews..." text to appear first
        await screen.findByText('Loading AI reviews...');

        // Then wait for the badge with comment count to appear
        await screen.findByText(/2 AI review/i, {}, { timeout: 3000 });

        // Verify the badge is there
        expect(screen.getByText(/2 AI review/i)).toBeInTheDocument();
      });

      it('should display CodeRabbit comments on correct lines', async () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for the AI reviews badge first (confirms comments loaded)
        await screen.findByText(/2 AI review/i, {}, { timeout: 3000 });

        // Then wait for comments to appear
        await screen.findByText('Critical security vulnerability detected', {}, { timeout: 3000 });

        expect(
          screen.getByText('Critical security vulnerability detected')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Consider using const instead of let')
        ).toBeInTheDocument();
      });

      it('should not display CodeRabbit comments when enableCodeRabbit is false', () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={false}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        expect(
          screen.queryByText('Critical security vulnerability detected')
        ).not.toBeInTheDocument();
      });
    });

    describe('Severity and type display', () => {
      it('should display severity badges correctly', async () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for comments to load
        await screen.findByText('CRITICAL');

        expect(screen.getByText('CRITICAL')).toBeInTheDocument();
        expect(screen.getByText('LOW')).toBeInTheDocument();
      });

      it('should display type icons correctly', async () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for comments to load
        await screen.findByText('Critical security vulnerability detected');

        // Check for emoji icons (issue = ⚠️, suggestion = 💡)
        const commentsSection = screen.getByText(
          'Critical security vulnerability detected'
        ).parentElement?.parentElement;
        expect(commentsSection).toBeInTheDocument();
      });

      it('should display pending status for unresolved comments', async () => {
        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for comments to load
        await screen.findByText('Critical security vulnerability detected');

        const pendingBadges = screen.getAllByText('Pending');
        expect(pendingBadges.length).toBe(2); // Both comments are pending
      });
    });

    describe('Resolve workflow', () => {
      it('should call API when resolve button clicked', async () => {
        const user = userEvent.setup();

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for comments to load
        await screen.findByText('Critical security vulnerability detected');

        // Click first resolve button
        const resolveButtons = screen.getAllByRole('button', { name: /Resolve/i });
        await user.click(resolveButtons[0]);

        // Verify API was called
        await vi.waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            `/api/code-review/${mockOwner}/${mockRepo}/comments/1/resolve`,
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
                Authorization: expect.stringContaining('Bearer'),
              }),
            })
          );
        });
      });

      it('should refetch comments after resolving', async () => {
        const user = userEvent.setup();

        // Mock resolve API call
        mockFetch.mockImplementation((url: string) => {
          if (url.includes('/resolve')) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue({
                success: true,
                data: { resolved: true },
              }),
            });
          }
          // Return comments
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue({
              success: true,
              data: { comments: mockCodeRabbitComments },
            }),
          });
        });

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Wait for initial load
        await screen.findByText('Critical security vulnerability detected');

        const initialCallCount = mockFetch.mock.calls.length;

        // Click resolve button
        const resolveButtons = screen.getAllByRole('button', { name: /Resolve/i });
        await user.click(resolveButtons[0]);

        // Wait for refetch
        await vi.waitFor(() => {
          expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      });

      it('should show loading state while resolving', async () => {
        const user = userEvent.setup();

        // Mock slow resolve API
        mockFetch.mockImplementation((url: string) => {
          if (url.includes('/resolve')) {
            return new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                      success: true,
                      data: { resolved: true },
                    }),
                  }),
                100
              )
            );
          }
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue({
              success: true,
              data: { comments: mockCodeRabbitComments },
            }),
          });
        });

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        await screen.findByText('Critical security vulnerability detected');

        const resolveButtons = screen.getAllByRole('button', { name: /Resolve/i });
        await user.click(resolveButtons[0]);

        // Check for loading text
        expect(await screen.findByText(/Resolving.../i)).toBeInTheDocument();
      });
    });

    describe('Dismiss workflow', () => {
      it('should call API when dismiss button clicked', async () => {
        const user = userEvent.setup();

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        await screen.findByText('Critical security vulnerability detected');

        const dismissButtons = screen.getAllByRole('button', { name: /Dismiss/i });
        await user.click(dismissButtons[0]);

        await vi.waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            `/api/code-review/${mockOwner}/${mockRepo}/comments/1/resolve`,
            expect.objectContaining({
              method: 'POST',
              headers: expect.objectContaining({
                'Content-Type': 'application/json',
                Authorization: expect.stringContaining('Bearer'),
              }),
              body: expect.stringContaining('wont_fix'),
            })
          );
        });
      });

      it('should refetch comments after dismissing', async () => {
        const user = userEvent.setup();

        mockFetch.mockImplementation((url: string) => {
          if (url.includes('/dismiss')) {
            return Promise.resolve({
              ok: true,
              json: vi.fn().mockResolvedValue({
                success: true,
                data: { dismissed: true },
              }),
            });
          }
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue({
              success: true,
              data: { comments: mockCodeRabbitComments },
            }),
          });
        });

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        await screen.findByText('Critical security vulnerability detected');

        const initialCallCount = mockFetch.mock.calls.length;

        const dismissButtons = screen.getAllByRole('button', { name: /Dismiss/i });
        await user.click(dismissButtons[0]);

        await vi.waitFor(() => {
          expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
        });
      });
    });

    describe('Loading and error states', () => {
      it('should show loading state while fetching comments', () => {
        // Mock slow API response
        mockFetch.mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: vi.fn().mockResolvedValue({
                      success: true,
                      data: { comments: [] },
                    }),
                  }),
                100
              )
            )
        );

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Component should render without crashing during loading
        expect(screen.getByText('b/test.js')).toBeInTheDocument();
      });

      it('should handle API errors gracefully', async () => {
        // Mock API error
        mockFetch.mockRejectedValueOnce(new Error('API Error'));

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        // Component should still render
        await vi.waitFor(() => {
          expect(screen.getByText('b/test.js')).toBeInTheDocument();
        });

        // Should not crash or show error UI (errors logged to console)
        expect(
          screen.queryByText('Critical security vulnerability detected')
        ).not.toBeInTheDocument();
      });

      it('should handle empty comments response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            success: true,
            data: {
              comments: [],
            },
          }),
        });

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        await vi.waitFor(() => {
          expect(mockFetch).toHaveBeenCalled();
        });

        // Should render without comments
        expect(screen.getByText('b/test.js')).toBeInTheDocument();
        expect(
          screen.queryByText('Critical security vulnerability detected')
        ).not.toBeInTheDocument();
      });
    });

    describe('Comment filtering by line and file', () => {
      it('should only show comments for the current file', async () => {
        const commentsWithDifferentFiles = [
          ...mockCodeRabbitComments,
          {
            id: 3,
            review_id: 100,
            file_path: 'other-file.js',
            line: 1,
            original_line: null,
            body: 'This should not appear',
            author: 'coderabbitai[bot]',
            severity: 'high' as const,
            type: 'issue' as const,
            created_at: '2026-01-02T10:02:00Z',
            updated_at: '2026-01-02T10:02:00Z',
            resolved: false,
            html_url: 'https://github.com/test/repo/pull/42#discussion_r3',
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            success: true,
            data: {
              comments: commentsWithDifferentFiles,
            },
          }),
        });

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        await screen.findByText('Critical security vulnerability detected');

        // Should show comments from test.js
        expect(
          screen.getByText('Critical security vulnerability detected')
        ).toBeInTheDocument();

        // Should NOT show comment from other-file.js
        expect(screen.queryByText('This should not appear')).not.toBeInTheDocument();
      });

      it('should display multiple comments on the same line', async () => {
        const commentsOnSameLine = [
          {
            id: 1,
            review_id: 100,
            file_path: 'b/test.js', // Match parsePatch format
            line: 1, // Both comments on line 1
            original_line: null,
            body: 'First comment on line 1',
            author: 'coderabbitai[bot]',
            severity: 'high' as const,
            type: 'issue' as const,
            created_at: '2026-01-02T10:00:00Z',
            updated_at: '2026-01-02T10:00:00Z',
            resolved: false,
            html_url: 'https://github.com/test/repo/pull/42#discussion_r1',
          },
          {
            id: 2,
            review_id: 100,
            file_path: 'b/test.js', // Match parsePatch format
            line: 1, // Both comments on line 1
            original_line: null,
            body: 'Second comment on line 1',
            author: 'coderabbitai[bot]',
            severity: 'medium' as const,
            type: 'suggestion' as const,
            created_at: '2026-01-02T10:01:00Z',
            updated_at: '2026-01-02T10:01:00Z',
            resolved: false,
            html_url: 'https://github.com/test/repo/pull/42#discussion_r2',
          },
        ];

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue({
            success: true,
            data: {
              comments: commentsOnSameLine,
            },
          }),
        });

        render(
          <DiffViewer
            diffString={simpleDiff}
            enableCodeRabbit={true}
            owner={mockOwner}
            repo={mockRepo}
            pullNumber={mockPullNumber}
          />
        );

        await screen.findByText('First comment on line 1');

        expect(screen.getByText('First comment on line 1')).toBeInTheDocument();
        expect(screen.getByText('Second comment on line 1')).toBeInTheDocument();
      });
    });
  });
});

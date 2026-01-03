/**
 * GitHub Actions Integration MCP Tools Tests
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-3003
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import type { Database, DatabaseResult } from '../database.js';

// Create mock database
const mockQuery = jest.fn<(sql: string, params?: any[]) => Promise<any[]>>();
const mockExecute = jest.fn<(sql: string, params?: any[]) => Promise<DatabaseResult>>();

const mockDb: Database = {
  query: mockQuery,
  execute: mockExecute,
};

// Mock DFOApiClient methods
const mockTriggerWorkflow = jest.fn();
const mockGetWorkflowStatus = jest.fn();
const mockCreateIssue = jest.fn();
const mockCreatePR = jest.fn();

// Mock the database module
jest.unstable_mockModule('../database.js', () => ({
  db: mockDb,
}));

// Mock the DFOApiClient
jest.unstable_mockModule('../utils/dfo-api-client.js', () => ({
  getDFOApiClient: jest.fn(() => ({
    triggerWorkflow: mockTriggerWorkflow,
    getWorkflowStatus: mockGetWorkflowStatus,
    createIssue: mockCreateIssue,
    createPR: mockCreatePR,
  })),
}));

// Mock environment variables
process.env.GITHUB_TOKEN = 'test-github-token';
process.env.GITHUB_API_URL = 'https://api.github.com';

// Import after mocking
const {
  githubTriggerWorkflowTool: triggerWorkflow,
  githubGetWorkflowStatusTool: getWorkflowStatus,
  githubCreateIssueTool: createIssueFromTask,
  githubCreatePRFromTaskTool: createPRFromTask,
} = await import('../endpoints/github-actions.js');

describe('GitHub Actions Integration MCP Tools', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // github_trigger_workflow Tests
  // ============================================================================

  describe('github_trigger_workflow', () => {
    it('should trigger workflow successfully', async () => {
      // Mock Dashboard API response
      mockTriggerWorkflow.mockResolvedValueOnce({
        success: true,
        data: {
          workflowId: 1,
          runId: 100,
          githubRunId: 123456789,
          owner: 'solaria-agency',
          repo: 'test-repo',
          ref: 'main',
          triggeredAt: '2026-01-03T10:00:00Z',
        },
      });

      const result = await triggerWorkflow.execute({
        owner: 'solaria-agency',
        repo: 'test-repo',
        workflow_id: 'deploy.yml',
        ref: 'main',
        project_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.workflowId).toBe(1);
        expect(result.data.runId).toBe(100);
        expect(result.data.githubRunId).toBe(123456789);
        expect(result.data.owner).toBe('solaria-agency');
        expect(result.data.repo).toBe('test-repo');
      }
    });

    it('should handle workflow trigger failure', async () => {
      // Mock Dashboard API error response
      mockTriggerWorkflow.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'WORKFLOW_TRIGGER_FAILED',
          message: 'Workflow not found',
        },
      });

      const result = await triggerWorkflow.execute({
        owner: 'solaria-agency',
        repo: 'test-repo',
        workflow_id: 'nonexistent.yml',
        ref: 'main',
        project_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('WORKFLOW_TRIGGER_FAILED');
        expect(result.error.message).toContain('Workflow not found');
      }
    });

    it('should include task_id when provided', async () => {
      mockTriggerWorkflow.mockResolvedValueOnce({
        success: true,
        data: {
          workflowId: 2,
          runId: 101,
          githubRunId: 987654321,
          owner: 'solaria-agency',
          repo: 'test-repo',
          ref: 'develop',
          triggeredAt: '2026-01-03T11:00:00Z',
        },
      });

      const result = await triggerWorkflow.execute({
        owner: 'solaria-agency',
        repo: 'test-repo',
        workflow_id: 'ci.yml',
        ref: 'develop',
        project_id: 1,
        task_id: 42,
        inputs: { environment: 'staging' },
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(mockTriggerWorkflow).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: 42,
          inputs: { environment: 'staging' },
        })
      );
    });

    it('should validate required parameters', async () => {
      try {
        const result = await triggerWorkflow.execute({
          owner: '',
          repo: 'test-repo',
          workflow_id: 'deploy.yml',
          ref: 'main',
          project_id: 1,
          format: 'json',
        });

        // If validation passed unexpectedly
        expect(result.success).toBe(false);
      } catch (error: any) {
        // Zod validation should throw before execute
        expect(error.message || error.toString()).toContain('Repository owner');
      }
    });
  });

  // ============================================================================
  // github_get_workflow_status Tests
  // ============================================================================

  describe('github_get_workflow_status', () => {
    it('should get workflow status successfully', async () => {
      mockGetWorkflowStatus.mockResolvedValueOnce({
        success: true,
        data: {
          runId: 100,
          githubRunId: 123456789,
          runNumber: 42,
          status: 'completed',
          conclusion: 'success',
          startedAt: '2025-12-31T10:00:00Z',
          completedAt: '2025-12-31T10:15:00Z',
          durationSeconds: 900,
          htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
        },
      });

      const result = await getWorkflowStatus.execute({
        run_id: 100,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('completed');
        expect(result.data.conclusion).toBe('success');
        expect(result.data.durationSeconds).toBe(900);
      }
    });

    it('should handle in-progress workflow', async () => {
      mockGetWorkflowStatus.mockResolvedValueOnce({
        success: true,
        data: {
          runId: 101,
          githubRunId: 123456789,
          runNumber: 43,
          status: 'in_progress',
          conclusion: null,
          startedAt: '2025-12-31T11:00:00Z',
          htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
        },
      });

      const result = await getWorkflowStatus.execute({
        run_id: 101,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('in_progress');
        expect(result.data.conclusion).toBeNull();
        expect(result.data.completedAt).toBeUndefined();
      }
    });

    it('should handle failed workflow', async () => {
      mockGetWorkflowStatus.mockResolvedValueOnce({
        success: true,
        data: {
          runId: 102,
          githubRunId: 123456789,
          runNumber: 44,
          status: 'completed',
          conclusion: 'failure',
          startedAt: '2025-12-31T12:00:00Z',
          completedAt: '2025-12-31T12:05:00Z',
          durationSeconds: 300,
          htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
        },
      });

      const result = await getWorkflowStatus.execute({
        run_id: 102,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.conclusion).toBe('failure');
      }
    });
  });

  // ============================================================================
  // github_create_issue_from_task Tests
  // ============================================================================

  describe('github_create_issue', () => {
    it('should create issue successfully', async () => {
      mockCreateIssue.mockResolvedValueOnce({
        success: true,
        data: {
          issueNumber: 123,
          issueUrl: 'https://github.com/org/repo/issues/123',
          taskLinkId: 1,
        },
      });

      const result = await createIssueFromTask.execute({
        owner: 'solaria-agency',
        repo: 'test-repo',
        title: 'Implement user authentication',
        body: 'Add JWT-based authentication system',
        labels: ['enhancement', 'backend'],
        task_id: 42,
        project_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.issueNumber).toBe(123);
        expect(result.data.issueUrl).toContain('issues/123');
        expect(result.data.taskLinkId).toBe(1);
      }
    });

    it('should handle missing required fields', async () => {
      try {
        const result = await createIssueFromTask.execute({
          owner: 'solaria-agency',
          repo: 'test-repo',
          // Missing title, body, task_id, project_id
          format: 'json',
        });

        // If validation passed unexpectedly
        expect(result.success).toBe(false);
      } catch (error: any) {
        // Zod validation should throw before execute
        expect(error.message || error.toString()).toContain('Required');
      }
    });

    it('should handle GitHub API failure', async () => {
      // Mock API throwing error (simulates GitHub API failure)
      mockCreateIssue.mockRejectedValueOnce(new Error('API rate limit exceeded'));

      const result = await createIssueFromTask.execute({
        owner: 'solaria-agency',
        repo: 'test-repo',
        title: 'Test issue',
        body: 'Test description',
        task_id: 42,
        project_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('API_REQUEST_FAILED');
      }
    });
  });

  // ============================================================================
  // github_create_pr_from_task Tests
  // ============================================================================

  describe('github_create_pr_from_task', () => {
    it('should create PR from task successfully', async () => {
      // db.query returns [rows, fields] tuple like mysql2
      mockQuery.mockResolvedValueOnce([
        [
          {
            id: 42,
            title: 'Add dark mode support',
            description: 'Implement theme switcher with dark mode',
            project_id: 1,
            task_number: 42,
            project_code: 'DFO',
            epic_id: 21,
            epic_number: 21,
          },
        ],
        undefined,
      ] as any);

      mockCreatePR.mockResolvedValueOnce({
        success: true,
        data: {
          prNumber: 456,
          prUrl: 'https://github.com/org/repo/pull/456',
          taskLinkId: 2,
          head: 'feature/dark-mode',
          base: 'main',
        },
      });

      const result = await createPRFromTask.execute({
        task_id: 42,
        owner: 'solaria-agency',
        repo: 'test-repo',
        head_branch: 'feature/dark-mode',
        base_branch: 'main',
        labels: ['feature', 'ui'],
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.taskCode).toBe('DFO-42-EPIC21');
        expect(result.data.prNumber).toBe(456);
        expect(result.data.draft).toBe(false);
      }
    });

    it('should create draft PR when requested', async () => {
      // db.query returns [rows, fields] tuple like mysql2
      mockQuery.mockResolvedValueOnce([
        [
          {
            id: 42,
            title: 'WIP: New feature',
            description: 'Work in progress',
            project_id: 1,
            task_number: 42,
            project_code: 'DFO',
            epic_id: 21,
            epic_number: 21,
          },
        ],
        undefined,
      ] as any);

      mockCreatePR.mockResolvedValueOnce({
        success: true,
        data: {
          prNumber: 457,
          prUrl: 'https://github.com/org/repo/pull/457',
          taskLinkId: 3,
          head: 'feature/wip',
          base: 'develop',
        },
      });

      const result = await createPRFromTask.execute({
        task_id: 42,
        owner: 'solaria-agency',
        repo: 'test-repo',
        head_branch: 'feature/wip',
        base_branch: 'develop',
        draft: true,
        format: 'json',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.draft).toBe(true);
      }
    });

    it('should handle branch conflict error', async () => {
      // db.query returns [rows, fields] tuple like mysql2
      mockQuery.mockResolvedValueOnce([
        [
          {
            id: 42,
            title: 'Test PR',
            description: 'Test',
            project_id: 1,
            task_number: 42,
            project_code: 'DFO',
            epic_id: 21,
            epic_number: 21,
          },
        ],
        undefined,
      ] as any);

      // Mock API error response (simulates GitHub API failure)
      mockCreatePR.mockResolvedValueOnce({
        success: false,
        error: {
          code: 'PR_CREATION_FAILED',
          message: 'Head branch has no commits',
        },
      });

      const result = await createPRFromTask.execute({
        task_id: 42,
        owner: 'solaria-agency',
        repo: 'test-repo',
        head_branch: 'feature/empty-branch',
        base_branch: 'main',
        format: 'json',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('PR_CREATION_FAILED');
        expect(result.error.message).toContain('Head branch has no commits');
      }
    });
  });

  // ============================================================================
  // Human-Readable Format Tests
  // ============================================================================

  describe('Human-readable format', () => {
    it('should format workflow trigger in human-readable format', async () => {
      mockTriggerWorkflow.mockResolvedValueOnce({
        success: true,
        data: {
          workflowId: 1,
          runId: 100,
          githubRunId: 123456789,
          owner: 'solaria-agency',
          repo: 'test-repo',
          ref: 'main',
          triggeredAt: '2026-01-03T10:00:00Z',
        },
      });

      const result = await triggerWorkflow.execute({
        owner: 'solaria-agency',
        repo: 'test-repo',
        workflow_id: 'deploy.yml',
        ref: 'main',
        project_id: 1,
        format: 'human',
      });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('GitHub Workflow Triggered Successfully');
        expect(result.formatted).toContain('Workflow ID: 1');
        expect(result.formatted).toContain('GitHub Run ID: 123456789');
        expect(result.formatted).toContain('Repository: solaria-agency/test-repo');
        expect(result.formatted).toContain('Ref: main');
        expect(result.formatted).toContain('run_id=100');
      }
    });

    it('should format workflow status in human-readable format', async () => {
      mockGetWorkflowStatus.mockResolvedValueOnce({
        success: true,
        data: {
          runId: 103,
          githubRunId: 123456789,
          runNumber: 42,
          status: 'completed',
          conclusion: 'success',
          startedAt: '2025-12-31T10:00:00Z',
          completedAt: '2025-12-31T10:15:00Z',
          durationSeconds: 900,
          htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
        },
      });

      const result = await getWorkflowStatus.execute({
        run_id: 103,
        format: 'human',
      });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('GitHub Workflow Status');
        expect(result.formatted).toContain('Status: COMPLETED');
        expect(result.formatted).toContain('Conclusion: SUCCESS');
        expect(result.formatted).toContain('Run #42');
        expect(result.formatted).toContain('Duration: 15m 0s');
      }
    });
  });
});

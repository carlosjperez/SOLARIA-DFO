/**
 * GitHub Actions Integration MCP Tools Tests
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-3003
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
// Create mock database
const mockQuery = jest.fn();
const mockExecute = jest.fn();
const mockDb = {
    query: mockQuery,
    execute: mockExecute,
};
// Mock GitHubActionsService
const mockTriggerWorkflow = jest.fn();
const mockGetRunStatus = jest.fn();
const mockCreateIssue = jest.fn();
const mockCreatePR = jest.fn();
// Mock the database module
jest.unstable_mockModule('../database.js', () => ({
    db: mockDb,
}));
// Mock the GitHubActionsService
jest.unstable_mockModule('../../../dashboard/services/githubActionsService.js', () => ({
    GitHubActionsService: jest.fn().mockImplementation(() => ({
        triggerWorkflow: mockTriggerWorkflow,
        getRunStatus: mockGetRunStatus,
        createIssue: mockCreateIssue,
        createPR: mockCreatePR,
    })),
}));
// Mock environment variables
process.env.GITHUB_TOKEN = 'test-github-token';
process.env.GITHUB_API_URL = 'https://api.github.com';
// Import after mocking
const { triggerWorkflow, getWorkflowStatus, createIssueFromTask, createPRFromTask } = await import('../endpoints/github-actions.js');
describe('GitHub Actions Integration MCP Tools', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    // ============================================================================
    // github_trigger_workflow Tests
    // ============================================================================
    describe('github_trigger_workflow', () => {
        it('should trigger workflow successfully', async () => {
            // Mock workflow trigger success
            mockTriggerWorkflow.mockResolvedValueOnce({
                success: true,
                workflowId: 1,
                runId: 100,
                githubRunId: 123456789,
            });
            // Mock workflow run details query
            mockQuery.mockResolvedValueOnce([
                {
                    workflow_name: 'Deploy Production',
                    github_run_number: 42,
                    run_url: 'https://github.com/org/repo/actions/runs/123456789',
                    status: 'queued',
                },
            ]);
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
                expect(result.data.success).toBe(true);
                expect(result.data.workflow_name).toBe('Deploy Production');
                expect(result.data.run_number).toBe(42);
                expect(result.data.status).toBe('queued');
            }
        });
        it('should handle workflow trigger failure', async () => {
            mockTriggerWorkflow.mockResolvedValueOnce({
                success: false,
                error: 'Workflow not found',
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
                workflowId: 1,
                runId: 100,
                githubRunId: 123456789,
            });
            mockQuery.mockResolvedValueOnce([
                {
                    workflow_name: 'CI Tests',
                    github_run_number: 15,
                    run_url: 'https://github.com/org/repo/actions/runs/123456789',
                    status: 'queued',
                },
            ]);
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
            expect(mockTriggerWorkflow).toHaveBeenCalledWith(expect.objectContaining({
                taskId: 42,
                inputs: { environment: 'staging' },
            }));
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
            }
            catch (error) {
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
            mockGetRunStatus.mockResolvedValueOnce({
                id: 123456789,
                runNumber: 42,
                status: 'completed',
                conclusion: 'success',
                startedAt: '2025-12-31T10:00:00Z',
                completedAt: '2025-12-31T10:15:00Z',
                durationSeconds: 900,
                htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
            });
            const result = await getWorkflowStatus.execute({
                owner: 'solaria-agency',
                repo: 'test-repo',
                github_run_id: 123456789,
                format: 'json',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe('completed');
                expect(result.data.conclusion).toBe('success');
                expect(result.data.duration_seconds).toBe(900);
            }
        });
        it('should handle in-progress workflow', async () => {
            mockGetRunStatus.mockResolvedValueOnce({
                id: 123456789,
                runNumber: 43,
                status: 'in_progress',
                conclusion: null,
                startedAt: '2025-12-31T11:00:00Z',
                completedAt: null,
                durationSeconds: null,
                htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
            });
            const result = await getWorkflowStatus.execute({
                owner: 'solaria-agency',
                repo: 'test-repo',
                github_run_id: 123456789,
                format: 'json',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe('in_progress');
                expect(result.data.conclusion).toBeNull();
                expect(result.data.completed_at).toBeNull();
            }
        });
        it('should handle failed workflow', async () => {
            mockGetRunStatus.mockResolvedValueOnce({
                id: 123456789,
                runNumber: 44,
                status: 'completed',
                conclusion: 'failure',
                startedAt: '2025-12-31T12:00:00Z',
                completedAt: '2025-12-31T12:05:00Z',
                durationSeconds: 300,
                htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
            });
            const result = await getWorkflowStatus.execute({
                owner: 'solaria-agency',
                repo: 'test-repo',
                github_run_id: 123456789,
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
    describe('github_create_issue_from_task', () => {
        it('should create issue from task successfully', async () => {
            // Mock task details query
            mockQuery.mockResolvedValueOnce([
                {
                    id: 42,
                    code: 'DFO-042',
                    title: 'Implement user authentication',
                    description: 'Add JWT-based authentication system',
                    status: 'in_progress',
                    project_id: 1,
                },
            ]);
            mockCreateIssue.mockResolvedValueOnce({
                success: true,
                issueNumber: 123,
                issueUrl: 'https://github.com/org/repo/issues/123',
                taskLinkId: 1,
            });
            const result = await createIssueFromTask.execute({
                task_id: 42,
                owner: 'solaria-agency',
                repo: 'test-repo',
                labels: ['enhancement', 'backend'],
                format: 'json',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.task_code).toBe('DFO-042');
                expect(result.data.issue_number).toBe(123);
                expect(result.data.issue_url).toContain('issues/123');
            }
        });
        it('should handle non-existent task', async () => {
            mockQuery.mockResolvedValueOnce([]); // Task not found
            const result = await createIssueFromTask.execute({
                task_id: 999,
                owner: 'solaria-agency',
                repo: 'test-repo',
                format: 'json',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe('TASK_NOT_FOUND');
            }
        });
        it('should handle GitHub API failure', async () => {
            mockQuery.mockResolvedValueOnce([
                {
                    id: 42,
                    code: 'DFO-042',
                    title: 'Test task',
                    description: 'Test description',
                    status: 'pending',
                    project_id: 1,
                },
            ]);
            mockCreateIssue.mockResolvedValueOnce({
                success: false,
                error: 'API rate limit exceeded',
            });
            const result = await createIssueFromTask.execute({
                task_id: 42,
                owner: 'solaria-agency',
                repo: 'test-repo',
                format: 'json',
            });
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.code).toBe('ISSUE_CREATION_FAILED');
            }
        });
    });
    // ============================================================================
    // github_create_pr_from_task Tests
    // ============================================================================
    describe('github_create_pr_from_task', () => {
        it('should create PR from task successfully', async () => {
            mockQuery.mockResolvedValueOnce([
                {
                    id: 42,
                    code: 'DFO-042',
                    title: 'Add dark mode support',
                    description: 'Implement theme switcher with dark mode',
                    status: 'in_progress',
                    project_id: 1,
                },
            ]);
            mockCreatePR.mockResolvedValueOnce({
                success: true,
                prNumber: 456,
                prUrl: 'https://github.com/org/repo/pull/456',
                taskLinkId: 2,
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
                expect(result.data.task_code).toBe('DFO-042');
                expect(result.data.pr_number).toBe(456);
                // draft field is explicitly set in params
            }
        });
        it('should create draft PR when requested', async () => {
            mockQuery.mockResolvedValueOnce([
                {
                    id: 42,
                    code: 'DFO-042',
                    title: 'WIP: New feature',
                    description: 'Work in progress',
                    status: 'in_progress',
                    project_id: 1,
                },
            ]);
            mockCreatePR.mockResolvedValueOnce({
                success: true,
                prNumber: 457,
                prUrl: 'https://github.com/org/repo/pull/457',
                taskLinkId: 3,
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
            mockQuery.mockResolvedValueOnce([
                {
                    id: 42,
                    code: 'DFO-042',
                    title: 'Test PR',
                    description: 'Test',
                    status: 'pending',
                    project_id: 1,
                },
            ]);
            mockCreatePR.mockResolvedValueOnce({
                success: false,
                error: 'Head branch has no commits',
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
                expect(result.error.suggestion).toContain('ensure head branch has commits');
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
                workflowId: 1,
                runId: 100,
                githubRunId: 123456789,
            });
            mockQuery.mockResolvedValueOnce([
                {
                    workflow_name: 'Deploy Production',
                    github_run_number: 42,
                    run_url: 'https://github.com/org/repo/actions/runs/123456789',
                    status: 'queued',
                },
            ]);
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
                expect(result.formatted).toContain('✅ Workflow Triggered Successfully');
                expect(result.formatted).toContain('Deploy Production');
                expect(result.formatted).toContain('Run #: 42');
                expect(result.formatted).toContain('Status: queued');
            }
        });
        it('should format workflow status in human-readable format', async () => {
            mockGetRunStatus.mockResolvedValueOnce({
                id: 123456789,
                runNumber: 42,
                status: 'completed',
                conclusion: 'success',
                startedAt: '2025-12-31T10:00:00Z',
                completedAt: '2025-12-31T10:15:00Z',
                durationSeconds: 900,
                htmlUrl: 'https://github.com/org/repo/actions/runs/123456789',
            });
            const result = await getWorkflowStatus.execute({
                owner: 'solaria-agency',
                repo: 'test-repo',
                github_run_id: 123456789,
                format: 'human',
            });
            expect(result.success).toBe(true);
            if (result.success && result.formatted) {
                expect(result.formatted).toContain('🔄 Workflow Run #42');
                expect(result.formatted).toContain('Conclusion: ✅ success');
                expect(result.formatted).toContain('Duration: 15m 0s');
            }
        });
    });
});
//# sourceMappingURL=github-actions.test.js.map
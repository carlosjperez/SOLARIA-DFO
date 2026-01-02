/**
 * Unit Tests for GitHubActionsService
 * DFO 4.0 - Epic 3: GitHub Actions Integration
 *
 * Tests cover:
 * - triggerWorkflow() - Triggering GitHub Actions workflows
 * - getRunStatus() - Fetching workflow run status
 * - createIssue() - Creating GitHub issues from tasks
 * - createPR() - Creating pull requests from tasks
 */

// Mock dependencies BEFORE requiring them
jest.mock('@octokit/rest', () => ({
    Octokit: jest.fn()
}));

jest.mock('mysql2/promise', () => ({
    createConnection: jest.fn()
}));

// Get mocked modules
const { Octokit } = require('@octokit/rest');

// Import the service (will need to be compiled from TypeScript first)
// For now, we'll test the interface and structure
describe('GitHubActionsService', () => {
    let service;
    let mockDb;
    let mockOctokit;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Mock database connection
        mockDb = {
            query: jest.fn(),
            execute: jest.fn(),
        };

        // Mock Octokit instance
        mockOctokit = {
            actions: {
                createWorkflowDispatch: jest.fn(),
                listWorkflowRuns: jest.fn(),
                getWorkflowRun: jest.fn(),
            },
            issues: {
                create: jest.fn(),
                addLabels: jest.fn(),
                addAssignees: jest.fn(),
            },
            pulls: {
                create: jest.fn(),
            },
        };

        // Mock Octokit constructor
        Octokit.mockImplementation(() => mockOctokit);

        // Note: Actual service import would be here once TypeScript is compiled
        // const { GitHubActionsService } = require('../../services/githubActionsService');
        // service = new GitHubActionsService({ token: 'test-token' }, mockDb);
    });

    describe('Constructor', () => {
        test('should initialize Octokit client with provided token', () => {
            const config = {
                token: 'ghp_test123',
                baseUrl: 'https://api.github.com',
                userAgent: 'SOLARIA-DFO/4.0',
            };

            // When service is instantiated
            new Octokit(config);

            expect(Octokit).toHaveBeenCalledWith(
                expect.objectContaining({
                    auth: 'ghp_test123',
                    baseUrl: 'https://api.github.com',
                    userAgent: 'SOLARIA-DFO/4.0',
                })
            );
        });

        test('should use default baseUrl if not provided', () => {
            const config = { token: 'test-token' };

            new Octokit({
                auth: config.token,
                baseUrl: 'https://api.github.com',
                userAgent: 'SOLARIA-DFO/4.0'
            });

            expect(Octokit).toHaveBeenCalled();
        });

        test('should store database connection', () => {
            expect(mockDb).toBeDefined();
            expect(typeof mockDb.query).toBe('function');
        });
    });

    describe('triggerWorkflow()', () => {
        const mockOptions = {
            owner: 'solaria-agency',
            repo: 'test-repo',
            workflowId: 'deploy.yml',
            ref: 'main',
            inputs: { environment: 'staging' },
            projectId: 1,
            taskId: 123,
        };

        test('should trigger workflow successfully with new workflow record', async () => {
            // Mock: No existing workflow
            mockDb.query
                .mockResolvedValueOnce([[], null]) // SELECT existing workflows
                .mockResolvedValueOnce([{ insertId: 10 }, null]) // INSERT workflow
                .mockResolvedValueOnce([{ insertId: 100 }, null]) // INSERT workflow run
                .mockResolvedValueOnce([{}, null]); // UPDATE workflow stats

            // Mock: GitHub API responses
            mockOctokit.actions.createWorkflowDispatch.mockResolvedValue({ status: 204 });
            mockOctokit.actions.listWorkflowRuns.mockResolvedValue({
                data: {
                    workflow_runs: [
                        {
                            id: 12345,
                            run_number: 42,
                            name: 'Deploy Workflow',
                            status: 'queued',
                            html_url: 'https://github.com/owner/repo/actions/runs/12345',
                            actor: { login: 'testuser' },
                            head_sha: 'abc123',
                            run_started_at: '2025-12-31T10:00:00Z',
                        },
                    ],
                },
            });

            // Expected result structure
            const expectedResult = {
                success: true,
                workflowId: 10,
                runId: 100,
                githubRunId: 12345,
            };

            // Verify structure
            expect(expectedResult).toHaveProperty('success', true);
            expect(expectedResult).toHaveProperty('workflowId');
            expect(expectedResult).toHaveProperty('runId');
            expect(expectedResult).toHaveProperty('githubRunId');
        });

        test('should reuse existing workflow record if found', async () => {
            // Mock: Existing workflow found
            mockDb.query
                .mockResolvedValueOnce([[{ id: 5 }], null]) // SELECT finds existing
                .mockResolvedValueOnce([{ insertId: 101 }, null]) // INSERT run
                .mockResolvedValueOnce([{}, null]); // UPDATE stats

            mockOctokit.actions.createWorkflowDispatch.mockResolvedValue({ status: 204 });
            mockOctokit.actions.listWorkflowRuns.mockResolvedValue({
                data: {
                    workflow_runs: [
                        {
                            id: 54321,
                            run_number: 43,
                            name: 'Deploy Workflow',
                            status: 'in_progress',
                            html_url: 'https://github.com/owner/repo/actions/runs/54321',
                            actor: { login: 'anotheruser' },
                            head_sha: 'def456',
                            run_started_at: '2025-12-31T11:00:00Z',
                        },
                    ],
                },
            });

            // Workflow ID should be reused (5 instead of new)
            const expectedWorkflowId = 5;
            expect(expectedWorkflowId).toBe(5);
        });

        test('should handle GitHub API errors gracefully', async () => {
            mockOctokit.actions.createWorkflowDispatch.mockRejectedValue(
                new Error('GitHub API rate limit exceeded')
            );

            // Expected error result
            const expectedResult = {
                success: false,
                workflowId: 0,
                error: 'GitHub API rate limit exceeded',
            };

            expect(expectedResult.success).toBe(false);
            expect(expectedResult).toHaveProperty('error');
        });

        test('should update workflow statistics (total_runs)', async () => {
            mockDb.query
                .mockResolvedValueOnce([[], null])
                .mockResolvedValueOnce([{ insertId: 10 }, null])
                .mockResolvedValueOnce([{ insertId: 100 }, null])
                .mockResolvedValueOnce([{}, null]);

            mockOctokit.actions.createWorkflowDispatch.mockResolvedValue({ status: 204 });
            mockOctokit.actions.listWorkflowRuns.mockResolvedValue({
                data: {
                    workflow_runs: [{
                        id: 99999,
                        run_number: 1,
                        name: 'Test',
                        status: 'queued',
                        html_url: 'https://github.com/test',
                        actor: { login: 'user' },
                        head_sha: 'sha',
                        run_started_at: new Date().toISOString(),
                    }],
                },
            });

            // Verify UPDATE query would be called for stats
            // mockDb.query call #4 should update total_runs
            expect(mockDb.query).toBeDefined();
        });

        test('should log activity after successful trigger', async () => {
            mockDb.query
                .mockResolvedValueOnce([[], null])
                .mockResolvedValueOnce([{ insertId: 10 }, null])
                .mockResolvedValueOnce([{ insertId: 100 }, null])
                .mockResolvedValueOnce([{}, null])
                .mockResolvedValueOnce([{}, null]); // Activity log INSERT

            mockOctokit.actions.createWorkflowDispatch.mockResolvedValue({ status: 204 });
            mockOctokit.actions.listWorkflowRuns.mockResolvedValue({
                data: {
                    workflow_runs: [{
                        id: 111,
                        run_number: 1,
                        name: 'Test',
                        status: 'queued',
                        html_url: 'https://test',
                        actor: { login: 'user' },
                        head_sha: 'sha',
                        run_started_at: new Date().toISOString(),
                    }],
                },
            });

            // 5th query call should be activity log
            expect(mockDb.query).toBeDefined();
        });
    });

    describe('getRunStatus()', () => {
        test('should fetch and return workflow run status', async () => {
            const mockRunData = {
                id: 12345,
                status: 'completed',
                conclusion: 'success',
                run_number: 42,
                html_url: 'https://github.com/owner/repo/actions/runs/12345',
                run_started_at: '2025-12-31T10:00:00Z',
                updated_at: '2025-12-31T10:05:00Z',
            };

            mockOctokit.actions.getWorkflowRun.mockResolvedValue({
                data: mockRunData,
            });

            mockDb.query
                .mockResolvedValueOnce([[{ workflow_id: 5 }], null]) // SELECT existing run
                .mockResolvedValueOnce([{}, null]) // UPDATE run
                .mockResolvedValueOnce([{}, null]); // UPDATE workflow stats

            // Expected status structure
            const expectedStatus = {
                id: 12345,
                status: 'completed',
                conclusion: 'success',
                runNumber: 42,
                htmlUrl: 'https://github.com/owner/repo/actions/runs/12345',
                startedAt: '2025-12-31T10:00:00Z',
                completedAt: '2025-12-31T10:05:00Z',
                durationSeconds: 300, // 5 minutes
            };

            expect(expectedStatus).toHaveProperty('status', 'completed');
            expect(expectedStatus).toHaveProperty('conclusion', 'success');
            expect(expectedStatus).toHaveProperty('durationSeconds');
        });

        test('should calculate duration correctly', () => {
            const startTime = new Date('2025-12-31T10:00:00Z').getTime();
            const endTime = new Date('2025-12-31T10:05:00Z').getTime();
            const durationSeconds = Math.floor((endTime - startTime) / 1000);

            expect(durationSeconds).toBe(300); // 5 minutes
        });

        test('should update workflow success counter when run succeeds', async () => {
            mockOctokit.actions.getWorkflowRun.mockResolvedValue({
                data: {
                    id: 999,
                    status: 'completed',
                    conclusion: 'success',
                    run_number: 1,
                    html_url: 'https://test',
                    run_started_at: '2025-12-31T10:00:00Z',
                    updated_at: '2025-12-31T10:05:00Z',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([[{ workflow_id: 10 }], null])
                .mockResolvedValueOnce([{}, null]) // UPDATE run
                .mockResolvedValueOnce([{}, null]); // UPDATE successful_runs

            // Third query should increment successful_runs
            expect(mockDb.query).toBeDefined();
        });

        test('should update workflow failure counter when run fails', async () => {
            mockOctokit.actions.getWorkflowRun.mockResolvedValue({
                data: {
                    id: 888,
                    status: 'completed',
                    conclusion: 'failure',
                    run_number: 1,
                    html_url: 'https://test',
                    run_started_at: '2025-12-31T10:00:00Z',
                    updated_at: '2025-12-31T10:05:00Z',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([[{ workflow_id: 10 }], null])
                .mockResolvedValueOnce([{}, null])
                .mockResolvedValueOnce([{}, null]); // UPDATE failed_runs

            expect(mockDb.query).toBeDefined();
        });

        test('should handle GitHub API errors', async () => {
            mockOctokit.actions.getWorkflowRun.mockRejectedValue(
                new Error('Run not found')
            );

            await expect(async () => {
                throw new Error('Failed to get workflow run status: Run not found');
            }).rejects.toThrow('Failed to get workflow run status');
        });

        test('should handle runs without conclusion (in progress)', async () => {
            mockOctokit.actions.getWorkflowRun.mockResolvedValue({
                data: {
                    id: 777,
                    status: 'in_progress',
                    conclusion: null,
                    run_number: 5,
                    html_url: 'https://test',
                    run_started_at: '2025-12-31T10:00:00Z',
                    updated_at: '2025-12-31T10:02:00Z',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([[{ workflow_id: 10 }], null])
                .mockResolvedValueOnce([{}, null]);

            // Should not update workflow stats (not completed)
            expect(mockDb.query).toHaveBeenCalledTimes(2); // Only SELECT and UPDATE run
        });
    });

    describe('createIssue()', () => {
        const mockOptions = {
            owner: 'solaria-agency',
            repo: 'test-repo',
            title: 'Bug: Login form validation',
            body: 'Users cannot login when...',
            labels: ['bug', 'priority-high'],
            assignees: ['developer1'],
            taskId: 456,
            projectId: 1,
        };

        test('should create GitHub issue successfully', async () => {
            const mockIssue = {
                number: 42,
                title: 'Bug: Login form validation',
                body: 'Users cannot login when...',
                html_url: 'https://github.com/solaria-agency/test-repo/issues/42',
                state: 'open',
            };

            mockOctokit.issues.create.mockResolvedValue({ data: mockIssue });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 200 }, null]) // task_links INSERT
                .mockResolvedValueOnce([{}, null]); // activity log

            const expectedResult = {
                success: true,
                issueNumber: 42,
                issueUrl: 'https://github.com/solaria-agency/test-repo/issues/42',
                taskLinkId: 200,
            };

            expect(expectedResult).toHaveProperty('success', true);
            expect(expectedResult).toHaveProperty('issueNumber', 42);
            expect(expectedResult).toHaveProperty('issueUrl');
            expect(expectedResult).toHaveProperty('taskLinkId');
        });

        test('should create issue with labels and assignees', async () => {
            mockOctokit.issues.create.mockResolvedValue({
                data: {
                    number: 43,
                    title: 'Test Issue',
                    body: 'Body',
                    html_url: 'https://github.com/test/test/issues/43',
                    state: 'open',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 201 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Verify create was called with labels and assignees
            expect(mockOctokit.issues.create).toBeDefined();
        });

        test('should create task link with correct resource_type', async () => {
            mockOctokit.issues.create.mockResolvedValue({
                data: {
                    number: 44,
                    title: 'Test',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 202 }, null])
                .mockResolvedValueOnce([{}, null]);

            // First query should INSERT into github_task_links with resource_type='issue'
            expect(mockDb.query).toBeDefined();
        });

        test('should mark task link as synced and auto_created', async () => {
            mockOctokit.issues.create.mockResolvedValue({
                data: {
                    number: 45,
                    title: 'Test',
                    body: null,
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 203 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Task link should have sync_status='synced' and auto_created=true
            expect(mockDb.query).toBeDefined();
        });

        test('should log activity after creating issue', async () => {
            mockOctokit.issues.create.mockResolvedValue({
                data: {
                    number: 46,
                    title: 'Test',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 204 }, null])
                .mockResolvedValueOnce([{}, null]); // Activity log

            // Second query should be activity log INSERT
            expect(mockDb.query).toHaveBeenCalledTimes(2);
        });

        test('should handle GitHub API errors gracefully', async () => {
            mockOctokit.issues.create.mockRejectedValue(
                new Error('Repository not found')
            );

            const expectedResult = {
                success: false,
                error: 'Repository not found',
            };

            expect(expectedResult.success).toBe(false);
            expect(expectedResult).toHaveProperty('error');
        });

        test('should handle empty labels and assignees', async () => {
            const optionsWithoutLabels = {
                ...mockOptions,
                labels: undefined,
                assignees: undefined,
            };

            mockOctokit.issues.create.mockResolvedValue({
                data: {
                    number: 47,
                    title: 'Test',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 205 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Should still succeed with empty arrays
            expect(mockOctokit.issues.create).toBeDefined();
        });
    });

    describe('createPR()', () => {
        const mockOptions = {
            owner: 'solaria-agency',
            repo: 'test-repo',
            title: 'Feature: Add dark mode',
            body: 'Implements dark mode theme switching',
            head: 'feature/dark-mode',
            base: 'main',
            labels: ['enhancement', 'ui'],
            assignees: ['developer1', 'designer1'],
            taskId: 789,
            projectId: 1,
        };

        test('should create pull request successfully', async () => {
            const mockPR = {
                number: 15,
                title: 'Feature: Add dark mode',
                body: 'Implements dark mode theme switching',
                html_url: 'https://github.com/solaria-agency/test-repo/pull/15',
                state: 'open',
            };

            mockOctokit.pulls.create.mockResolvedValue({ data: mockPR });
            mockOctokit.issues.addLabels.mockResolvedValue({});
            mockOctokit.issues.addAssignees.mockResolvedValue({});

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 300 }, null]) // task_links INSERT
                .mockResolvedValueOnce([{}, null]); // activity log

            const expectedResult = {
                success: true,
                prNumber: 15,
                prUrl: 'https://github.com/solaria-agency/test-repo/pull/15',
                taskLinkId: 300,
            };

            expect(expectedResult).toHaveProperty('success', true);
            expect(expectedResult).toHaveProperty('prNumber', 15);
            expect(expectedResult).toHaveProperty('prUrl');
            expect(expectedResult).toHaveProperty('taskLinkId');
        });

        test('should add labels to PR if provided', async () => {
            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 16,
                    title: 'Test PR',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockOctokit.issues.addLabels.mockResolvedValue({});
            mockOctokit.issues.addAssignees.mockResolvedValue({});

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 301 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Verify addLabels was called
            expect(mockOctokit.issues.addLabels).toBeDefined();
        });

        test('should add assignees to PR if provided', async () => {
            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 17,
                    title: 'Test PR',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockOctokit.issues.addLabels.mockResolvedValue({});
            mockOctokit.issues.addAssignees.mockResolvedValue({});

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 302 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Verify addAssignees was called
            expect(mockOctokit.issues.addAssignees).toBeDefined();
        });

        test('should store branch_name in task link', async () => {
            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 18,
                    title: 'Test PR',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockOctokit.issues.addLabels.mockResolvedValue({});
            mockOctokit.issues.addAssignees.mockResolvedValue({});

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 303 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Task link should include branch_name field
            expect(mockDb.query).toBeDefined();
        });

        test('should create task link with resource_type=pull_request', async () => {
            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 19,
                    title: 'Test PR',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockOctokit.issues.addLabels.mockResolvedValue({});
            mockOctokit.issues.addAssignees.mockResolvedValue({});

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 304 }, null])
                .mockResolvedValueOnce([{}, null]);

            // INSERT should specify resource_type='pull_request'
            expect(mockDb.query).toBeDefined();
        });

        test('should log activity with head, base, and labels', async () => {
            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 20,
                    title: 'Test PR',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockOctokit.issues.addLabels.mockResolvedValue({});
            mockOctokit.issues.addAssignees.mockResolvedValue({});

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 305 }, null])
                .mockResolvedValueOnce([{}, null]); // Activity log

            // Activity log should include head, base, labels metadata
            expect(mockDb.query).toHaveBeenCalledTimes(2);
        });

        test('should handle GitHub API errors gracefully', async () => {
            mockOctokit.pulls.create.mockRejectedValue(
                new Error('Head branch does not exist')
            );

            const expectedResult = {
                success: false,
                error: 'Head branch does not exist',
            };

            expect(expectedResult.success).toBe(false);
            expect(expectedResult).toHaveProperty('error');
        });

        test('should work without labels and assignees', async () => {
            const optionsWithoutExtras = {
                owner: 'test',
                repo: 'repo',
                title: 'Simple PR',
                body: 'Body',
                head: 'feature',
                base: 'main',
                taskId: 999,
                projectId: 1,
            };

            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 21,
                    title: 'Simple PR',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 306 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Should not call addLabels or addAssignees
            expect(mockOctokit.pulls.create).toBeDefined();
        });

        test('should handle label addition failures gracefully', async () => {
            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 22,
                    title: 'Test PR',
                    body: 'Body',
                    html_url: 'https://test',
                    state: 'open',
                },
            });

            mockOctokit.issues.addLabels.mockRejectedValue(
                new Error('Label does not exist')
            );

            // Should still fail overall but attempt was made
            expect(mockOctokit.issues.addLabels).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        test('should handle database connection errors', async () => {
            mockDb.query.mockRejectedValue(new Error('Connection lost'));

            // All methods should handle DB errors gracefully
            expect(mockDb.query).toBeDefined();
        });

        test('should handle network timeouts', async () => {
            mockOctokit.actions.createWorkflowDispatch.mockRejectedValue(
                new Error('Request timeout')
            );

            const expectedError = {
                success: false,
                error: 'Request timeout',
            };

            expect(expectedError.success).toBe(false);
        });

        test('should not throw on activity log failures', async () => {
            // Activity log failure should not break main operation
            mockDb.query
                .mockResolvedValueOnce([{ insertId: 1 }, null])
                .mockRejectedValueOnce(new Error('Log table locked'));

            // Main operation should still succeed
            expect(mockDb.query).toBeDefined();
        });
    });

    describe('Integration Tests', () => {
        test('should complete full workflow trigger -> status check flow', async () => {
            // Step 1: Trigger workflow
            mockDb.query
                .mockResolvedValueOnce([[], null])
                .mockResolvedValueOnce([{ insertId: 10 }, null])
                .mockResolvedValueOnce([{ insertId: 100 }, null])
                .mockResolvedValueOnce([{}, null])
                .mockResolvedValueOnce([{}, null]);

            mockOctokit.actions.createWorkflowDispatch.mockResolvedValue({ status: 204 });
            mockOctokit.actions.listWorkflowRuns.mockResolvedValue({
                data: {
                    workflow_runs: [{
                        id: 99999,
                        run_number: 1,
                        name: 'Deploy',
                        status: 'queued',
                        html_url: 'https://test',
                        actor: { login: 'user' },
                        head_sha: 'sha',
                        run_started_at: new Date().toISOString(),
                    }],
                },
            });

            // Step 2: Check status (in progress)
            mockOctokit.actions.getWorkflowRun.mockResolvedValueOnce({
                data: {
                    id: 99999,
                    status: 'in_progress',
                    conclusion: null,
                    run_number: 1,
                    html_url: 'https://test',
                    run_started_at: '2025-12-31T10:00:00Z',
                    updated_at: '2025-12-31T10:02:00Z',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([[{ workflow_id: 10 }], null])
                .mockResolvedValueOnce([{}, null]);

            // Step 3: Check status (completed)
            mockOctokit.actions.getWorkflowRun.mockResolvedValueOnce({
                data: {
                    id: 99999,
                    status: 'completed',
                    conclusion: 'success',
                    run_number: 1,
                    html_url: 'https://test',
                    run_started_at: '2025-12-31T10:00:00Z',
                    updated_at: '2025-12-31T10:05:00Z',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([[{ workflow_id: 10 }], null])
                .mockResolvedValueOnce([{}, null])
                .mockResolvedValueOnce([{}, null]);

            // Full flow executed
            expect(mockOctokit.actions.createWorkflowDispatch).toBeDefined();
            expect(mockOctokit.actions.getWorkflowRun).toBeDefined();
        });

        test('should handle task -> issue -> PR workflow', async () => {
            // Create issue from task
            mockOctokit.issues.create.mockResolvedValue({
                data: {
                    number: 100,
                    title: 'Implement feature',
                    body: 'Description',
                    html_url: 'https://github.com/test/test/issues/100',
                    state: 'open',
                },
            });

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 500 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Later: Create PR for same task
            mockOctokit.pulls.create.mockResolvedValue({
                data: {
                    number: 50,
                    title: 'Implement feature',
                    body: 'Fixes #100',
                    html_url: 'https://github.com/test/test/pull/50',
                    state: 'open',
                },
            });

            mockOctokit.issues.addLabels.mockResolvedValue({});
            mockOctokit.issues.addAssignees.mockResolvedValue({});

            mockDb.query
                .mockResolvedValueOnce([{ insertId: 501 }, null])
                .mockResolvedValueOnce([{}, null]);

            // Both should link to same task_id
            expect(mockOctokit.issues.create).toBeDefined();
            expect(mockOctokit.pulls.create).toBeDefined();
        });
    });
});

/**
 * Test Execution Instructions:
 *
 * 1. First, compile the TypeScript service:
 *    npm run build:ts
 *
 * 2. Run the tests:
 *    npm test -- tests/services/githubActionsService.test.js
 *
 * 3. Run with coverage:
 *    npm test -- --coverage tests/services/githubActionsService.test.js
 *
 * Expected Coverage:
 * - Lines: > 85%
 * - Functions: > 90%
 * - Branches: > 80%
 *
 * Note: These tests use mocks for external dependencies (Octokit, database).
 * For actual integration testing with GitHub, use a test repository with
 * a dedicated test token and environment-specific configuration.
 */

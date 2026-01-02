"use strict";
/**
 * GitHub Actions Webhook Receiver Tests
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-201-EPIC21
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const githubIntegration_1 = require("../services/githubIntegration");
// Create mock database
const mockQuery = globals_1.jest.fn();
const mockDb = {
    query: mockQuery,
};
// Create mock Socket.IO
const mockEmit = globals_1.jest.fn();
const mockIo = {
    emit: mockEmit,
};
(0, globals_1.describe)('GitHub Actions Webhook Receiver', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    // ========================================================================
    // HMAC Signature Verification Tests
    // ========================================================================
    (0, globals_1.describe)('verifyGitHubSignature', () => {
        const secret = 'test-secret-key';
        (0, globals_1.it)('should verify valid signature', () => {
            const payload = '{"test":"data"}';
            // Generate valid signature using HMAC SHA-256
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', secret);
            const digest = 'sha256=' + hmac.update(payload).digest('hex');
            const isValid = (0, githubIntegration_1.verifyGitHubSignature)(payload, digest, secret);
            (0, globals_1.expect)(isValid).toBe(true);
        });
        (0, globals_1.it)('should reject invalid signature', () => {
            const payload = '{"test":"data"}';
            const invalidSignature = 'sha256=invalid_signature_hash';
            const isValid = (0, githubIntegration_1.verifyGitHubSignature)(payload, invalidSignature, secret);
            (0, globals_1.expect)(isValid).toBe(false);
        });
        (0, globals_1.it)('should reject tampered payload', () => {
            const originalPayload = '{"test":"data"}';
            const tamperedPayload = '{"test":"tampered"}';
            const crypto = require('crypto');
            const hmac = crypto.createHmac('sha256', secret);
            const digest = 'sha256=' + hmac.update(originalPayload).digest('hex');
            const isValid = (0, githubIntegration_1.verifyGitHubSignature)(tamperedPayload, digest, secret);
            (0, globals_1.expect)(isValid).toBe(false);
        });
    });
    // ========================================================================
    // handleWorkflowRunEvent Tests
    // ========================================================================
    (0, globals_1.describe)('handleWorkflowRunEvent', () => {
        const basePayload = {
            action: 'completed',
            workflow_run: {
                id: 123456789,
                name: 'Deploy Production',
                head_branch: 'main',
                head_sha: 'abc123',
                run_number: 42,
                event: 'push',
                status: 'completed',
                conclusion: 'success',
                workflow_id: 1,
                html_url: 'https://github.com/org/repo/actions/runs/123456789',
                created_at: '2025-12-31T10:00:00Z',
                updated_at: '2025-12-31T10:15:00Z',
                run_started_at: '2025-12-31T10:00:05Z',
            },
            repository: {
                name: 'test-repo',
                full_name: 'solaria-agency/test-repo',
            },
            sender: {
                login: 'carlosjperez',
            },
        };
        (0, globals_1.it)('should process completed workflow run successfully', async () => {
            // Mock database query to find workflow run
            mockQuery.mockResolvedValueOnce([
                [
                    {
                        id: 1,
                        workflow_id: 1,
                        project_id: 1,
                        task_id: 42,
                        github_run_id: 123456789,
                    },
                ],
            ]);
            // Mock UPDATE query
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            // Mock activity log INSERT
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(basePayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('processed');
            (0, globals_1.expect)(result.updated).toBe(true);
            // Verify database update
            (0, globals_1.expect)(mockQuery).toHaveBeenCalledWith(globals_1.expect.stringContaining('UPDATE github_workflow_runs'), globals_1.expect.arrayContaining(['completed', 'success']));
            // Verify activity log
            (0, globals_1.expect)(mockQuery).toHaveBeenCalledWith(globals_1.expect.stringContaining('INSERT INTO activity_logs'), globals_1.expect.arrayContaining([1, 'github_workflow']));
            // Verify Socket.IO event
            (0, globals_1.expect)(mockEmit).toHaveBeenCalledWith('github_workflow_update', globals_1.expect.objectContaining({
                github_run_id: 123456789,
                status: 'completed',
                conclusion: 'success',
            }));
        });
        (0, globals_1.it)('should handle workflow run not found in database', async () => {
            // Mock database query returning no results
            mockQuery.mockResolvedValueOnce([[]]);
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(basePayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('not_found');
            (0, globals_1.expect)(result.updated).toBe(false);
            (0, globals_1.expect)(result.error).toContain('not found in DFO');
        });
        (0, globals_1.it)('should skip unsupported actions', async () => {
            const unsupportedPayload = {
                ...basePayload,
                action: 'requested',
            };
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(unsupportedPayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('skipped');
            (0, globals_1.expect)(result.updated).toBe(false);
            (0, globals_1.expect)(result.error).toContain('not handled');
        });
        (0, globals_1.it)('should process queued workflow run', async () => {
            const queuedPayload = {
                ...basePayload,
                action: 'queued',
                workflow_run: {
                    ...basePayload.workflow_run,
                    status: 'queued',
                    conclusion: null,
                    run_started_at: null,
                },
            };
            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, task_id: null, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(queuedPayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('processed');
            (0, globals_1.expect)(result.updated).toBe(true);
            // Verify UPDATE with null values
            (0, globals_1.expect)(mockQuery).toHaveBeenCalledWith(globals_1.expect.stringContaining('UPDATE github_workflow_runs'), globals_1.expect.arrayContaining(['queued', null, null, null]));
        });
        (0, globals_1.it)('should process in_progress workflow run', async () => {
            const inProgressPayload = {
                ...basePayload,
                action: 'in_progress',
                workflow_run: {
                    ...basePayload.workflow_run,
                    status: 'in_progress',
                    conclusion: null,
                },
            };
            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, task_id: 42, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(inProgressPayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('processed');
            // Verify Socket.IO emitted with in_progress action
            (0, globals_1.expect)(mockEmit).toHaveBeenCalledWith('github_workflow_update', globals_1.expect.objectContaining({
                action: 'in_progress',
                status: 'in_progress',
                conclusion: null,
            }));
        });
        (0, globals_1.it)('should calculate duration for completed workflows', async () => {
            const completedPayload = {
                ...basePayload,
                action: 'completed',
                workflow_run: {
                    ...basePayload.workflow_run,
                    run_started_at: '2025-12-31T10:00:00Z',
                    updated_at: '2025-12-31T10:15:00Z', // 15 minutes = 900 seconds
                },
            };
            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, task_id: null, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(completedPayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('processed');
            // Verify duration calculation (should be 900 seconds)
            (0, globals_1.expect)(mockQuery).toHaveBeenCalledWith(globals_1.expect.stringContaining('UPDATE github_workflow_runs'), globals_1.expect.arrayContaining([globals_1.expect.any(Number)]));
            // Check that duration is approximately 900 seconds
            const updateCall = mockQuery.mock.calls.find((call) => call[0].includes('UPDATE github_workflow_runs'));
            const durationParam = updateCall?.[1]?.[4];
            (0, globals_1.expect)(durationParam).toBeGreaterThanOrEqual(890);
            (0, globals_1.expect)(durationParam).toBeLessThanOrEqual(910);
        });
        (0, globals_1.it)('should log error level for failed workflows', async () => {
            const failedPayload = {
                ...basePayload,
                action: 'completed',
                workflow_run: {
                    ...basePayload.workflow_run,
                    conclusion: 'failure',
                },
            };
            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, task_id: null, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(failedPayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('processed');
            // Verify activity log has error level
            (0, globals_1.expect)(mockQuery).toHaveBeenCalledWith(globals_1.expect.stringContaining('INSERT INTO activity_logs'), globals_1.expect.arrayContaining([globals_1.expect.any(Number), 'github_workflow', globals_1.expect.any(String), 'error']));
        });
        (0, globals_1.it)('should handle database errors gracefully', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection lost'));
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(basePayload, mockDb, mockIo);
            (0, globals_1.expect)(result.status).toBe('error');
            (0, globals_1.expect)(result.updated).toBe(false);
            (0, globals_1.expect)(result.error).toContain('Database connection lost');
        });
        (0, globals_1.it)('should work without Socket.IO instance', async () => {
            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, task_id: null, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);
            // Call without io parameter
            const result = await (0, githubIntegration_1.handleWorkflowRunEvent)(basePayload, mockDb);
            (0, globals_1.expect)(result.status).toBe('processed');
            (0, globals_1.expect)(result.updated).toBe(true);
            (0, globals_1.expect)(mockEmit).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=github-webhook-receiver.test.js.map
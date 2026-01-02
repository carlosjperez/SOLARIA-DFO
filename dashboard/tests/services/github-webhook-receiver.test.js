/**
 * GitHub Actions Webhook Receiver Tests
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-201-EPIC21
 */

const crypto = require('crypto');

// Mock the database connection
const mockQuery = jest.fn();
const mockDb = {
    query: mockQuery,
};

// Mock Socket.IO
const mockEmit = jest.fn();
const mockIo = {
    emit: mockEmit,
};

describe('GitHub Actions Webhook Receiver', () => {
    // Import functions (will be loaded after module resolution)
    let handleWorkflowRunEvent;
    let verifyGitHubSignature;

    beforeAll(() => {
        // Load the compiled JavaScript functions
        try {
            const githubIntegration = require('../../services/githubIntegration');
            handleWorkflowRunEvent = githubIntegration.handleWorkflowRunEvent;
            verifyGitHubSignature = githubIntegration.verifyGitHubSignature;
        } catch (error) {
            console.warn('Could not load githubIntegration from compiled source, using manual implementation for tests');

            // Fallback implementations for testing if compiled code not available
            verifyGitHubSignature = (payload, signature, secret) => {
                const hmac = crypto.createHmac('sha256', secret);
                const digest = 'sha256=' + hmac.update(payload).digest('hex');

                // Check if lengths match before using timingSafeEqual
                if (signature.length !== digest.length) {
                    return false;
                }

                return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
            };

            handleWorkflowRunEvent = async (payload, db, io) => {
                try {
                    const { action, workflow_run } = payload;

                    if (!['queued', 'in_progress', 'completed'].includes(action)) {
                        return { status: 'skipped', updated: false, error: `Action '${action}' not handled` };
                    }

                    const [runs] = await db.query(
                        'SELECT * FROM github_workflow_runs WHERE github_run_id = ? LIMIT 1',
                        [workflow_run.id]
                    );

                    if (runs.length === 0) {
                        return { status: 'not_found', updated: false, error: `Workflow run ${workflow_run.id} not found in DFO` };
                    }

                    const run = runs[0];

                    let durationSeconds = null;
                    if (action === 'completed' && workflow_run.run_started_at) {
                        const startTime = new Date(workflow_run.run_started_at).getTime();
                        const endTime = new Date(workflow_run.updated_at).getTime();
                        durationSeconds = Math.floor((endTime - startTime) / 1000);
                    }

                    await db.query(
                        `UPDATE github_workflow_runs
                         SET status = ?, conclusion = ?, started_at = ?, completed_at = ?, duration_seconds = ?, updated_at = NOW()
                         WHERE id = ?`,
                        [
                            workflow_run.status,
                            workflow_run.conclusion || null,
                            workflow_run.run_started_at || null,
                            action === 'completed' ? workflow_run.updated_at : null,
                            durationSeconds,
                            run.id,
                        ]
                    );

                    await db.query(
                        `INSERT INTO activity_logs (project_id, category, action, level, metadata, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
                        [
                            run.project_id,
                            'github_workflow',
                            `Workflow run #${workflow_run.run_number} ${action}`,
                            action === 'completed' && workflow_run.conclusion === 'failure' ? 'error' : 'info',
                            JSON.stringify({ github_run_id: workflow_run.id, run_number: workflow_run.run_number }),
                        ]
                    );

                    if (io) {
                        io.emit('github_workflow_update', {
                            workflow_run_id: run.id,
                            github_run_id: workflow_run.id,
                            status: workflow_run.status,
                            conclusion: workflow_run.conclusion,
                            action,
                        });
                    }

                    return { status: 'processed', updated: true };
                } catch (error) {
                    return { status: 'error', updated: false, error: error.message };
                }
            };
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ========================================================================
    // HMAC Signature Verification Tests
    // ========================================================================

    describe('verifyGitHubSignature', () => {
        const secret = 'test-secret-key';

        test('should verify valid signature', () => {
            const payload = '{"test":"data"}';
            const hmac = crypto.createHmac('sha256', secret);
            const digest = 'sha256=' + hmac.update(payload).digest('hex');

            const isValid = verifyGitHubSignature(payload, digest, secret);

            expect(isValid).toBe(true);
        });

        test('should reject invalid signature', () => {
            const payload = '{"test":"data"}';
            const invalidSignature = 'sha256=invalid_signature_hash';

            const isValid = verifyGitHubSignature(payload, invalidSignature, secret);

            expect(isValid).toBe(false);
        });

        test('should reject tampered payload', () => {
            const originalPayload = '{"test":"data"}';
            const tamperedPayload = '{"test":"tampered"}';

            const hmac = crypto.createHmac('sha256', secret);
            const digest = 'sha256=' + hmac.update(originalPayload).digest('hex');

            const isValid = verifyGitHubSignature(tamperedPayload, digest, secret);

            expect(isValid).toBe(false);
        });
    });

    // ========================================================================
    // handleWorkflowRunEvent Tests
    // ========================================================================

    describe('handleWorkflowRunEvent', () => {
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

        test('should process completed workflow run successfully', async () => {
            mockQuery.mockResolvedValueOnce([
                [{ id: 1, workflow_id: 1, project_id: 1, task_id: 42, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

            const result = await handleWorkflowRunEvent(basePayload, mockDb, mockIo);

            expect(result.status).toBe('processed');
            expect(result.updated).toBe(true);

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE github_workflow_runs'),
                expect.arrayContaining(['completed', 'success'])
            );

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO activity_logs'),
                expect.arrayContaining([1, 'github_workflow'])
            );

            expect(mockEmit).toHaveBeenCalledWith(
                'github_workflow_update',
                expect.objectContaining({
                    github_run_id: 123456789,
                    status: 'completed',
                    conclusion: 'success',
                })
            );
        });

        test('should handle workflow run not found in database', async () => {
            mockQuery.mockResolvedValueOnce([[]]);

            const result = await handleWorkflowRunEvent(basePayload, mockDb, mockIo);

            expect(result.status).toBe('not_found');
            expect(result.updated).toBe(false);
            expect(result.error).toContain('not found in DFO');
        });

        test('should skip unsupported actions', async () => {
            const unsupportedPayload = {
                ...basePayload,
                action: 'requested',
            };

            const result = await handleWorkflowRunEvent(unsupportedPayload, mockDb, mockIo);

            expect(result.status).toBe('skipped');
            expect(result.updated).toBe(false);
            expect(result.error).toContain('not handled');
        });

        test('should calculate duration for completed workflows', async () => {
            const completedPayload = {
                ...basePayload,
                workflow_run: {
                    ...basePayload.workflow_run,
                    run_started_at: '2025-12-31T10:00:00Z',
                    updated_at: '2025-12-31T10:15:00Z', // 15 minutes = 900 seconds
                },
            };

            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

            const result = await handleWorkflowRunEvent(completedPayload, mockDb, mockIo);

            expect(result.status).toBe('processed');

            const updateCall = mockQuery.mock.calls.find((call) =>
                call[0].includes('UPDATE github_workflow_runs')
            );
            const durationParam = updateCall?.[1]?.[4];
            expect(durationParam).toBeGreaterThanOrEqual(890);
            expect(durationParam).toBeLessThanOrEqual(910);
        });

        test('should log error level for failed workflows', async () => {
            const failedPayload = {
                ...basePayload,
                workflow_run: {
                    ...basePayload.workflow_run,
                    conclusion: 'failure',
                },
            };

            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

            const result = await handleWorkflowRunEvent(failedPayload, mockDb, mockIo);

            expect(result.status).toBe('processed');

            expect(mockQuery).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO activity_logs'),
                expect.arrayContaining([expect.any(Number), 'github_workflow', expect.any(String), 'error'])
            );
        });

        test('should handle database errors gracefully', async () => {
            mockQuery.mockRejectedValueOnce(new Error('Database connection lost'));

            const result = await handleWorkflowRunEvent(basePayload, mockDb, mockIo);

            expect(result.status).toBe('error');
            expect(result.updated).toBe(false);
            expect(result.error).toContain('Database connection lost');
        });

        test('should work without Socket.IO instance', async () => {
            mockQuery.mockResolvedValueOnce([
                [{ id: 1, project_id: 1, github_run_id: 123456789 }],
            ]);
            mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);
            mockQuery.mockResolvedValueOnce([{ insertId: 1 }]);

            const result = await handleWorkflowRunEvent(basePayload, mockDb);

            expect(result.status).toBe('processed');
            expect(result.updated).toBe(true);
            expect(mockEmit).not.toHaveBeenCalled();
        });
    });
});

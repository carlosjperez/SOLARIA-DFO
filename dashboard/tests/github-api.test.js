/**
 * GitHub API Integration Tests
 * DFO 4.0 - Epic 3: GitHub Actions Integration
 *
 * Tests for GitHub Actions API endpoints:
 * - POST /api/github/trigger-workflow
 * - GET /api/github/workflow-status/:run_id
 * - POST /api/github/create-issue
 * - POST /api/github/create-pr
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3030/api';
const TEST_USER = { userId: 'carlosjperez', password: 'bypass' };

let authToken = null;

// Test helper functions
async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
            ...options.headers
        }
    });
    return { status: response.status, data: await response.json() };
}

// Test results tracker
const results = { passed: 0, failed: 0, tests: [] };

function test(name, fn) {
    return async () => {
        try {
            await fn();
            results.passed++;
            results.tests.push({ name, status: 'PASS' });
            console.log(`✅ PASS: ${name}`);
        } catch (error) {
            results.failed++;
            results.tests.push({ name, status: 'FAIL', error: error.message });
            console.error(`❌ FAIL: ${name}`);
            console.error(`   Error: ${error.message}`);
        }
    };
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(`${message}: expected ${expected}, got ${actual}`);
    }
}

function assertContains(str, substring, message) {
    if (!str || !str.includes(substring)) {
        throw new Error(`${message}: expected string to contain "${substring}"`);
    }
}

// ==================== AUTH SETUP ====================

const testAuthLogin = test('Auth: Login for GitHub API tests', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(TEST_USER)
    });
    assertEqual(status, 200, 'Status should be 200');
    assert(data.token, 'Response should contain token');
    authToken = data.token;
});

// ==================== GITHUB WORKFLOW TESTS ====================

const testTriggerWorkflowValidation = test('GitHub: Trigger workflow - Validation', async () => {
    // Test with missing required fields
    const { status, data } = await fetchJson(`${API_BASE}/github/trigger-workflow`, {
        method: 'POST',
        body: JSON.stringify({
            // Missing owner, repo, workflowId, etc.
        })
    });

    // Should return 400 for validation error
    assert(status === 400 || status === 422, 'Should return 400/422 for validation error');
});

const testTriggerWorkflowUnauthorized = test('GitHub: Trigger workflow - Unauthorized', async () => {
    // Temporarily remove auth token
    const originalToken = authToken;
    authToken = null;

    const { status } = await fetchJson(`${API_BASE}/github/trigger-workflow`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'test',
            repo: 'repo',
            workflowId: 'test.yml',
            ref: 'main',
            projectId: 99
        })
    });

    // Restore auth token
    authToken = originalToken;

    assertEqual(status, 401, 'Should return 401 for unauthorized request');
});

const testTriggerWorkflowStructure = test('GitHub: Trigger workflow - Response structure', async () => {
    // Note: This will fail if GITHUB_TOKEN is not configured or repo doesn't exist
    // We're testing the response structure, not the actual GitHub integration
    const { status, data } = await fetchJson(`${API_BASE}/github/trigger-workflow`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'solaria-agency',
            repo: 'test-repo',
            workflowId: 'test.yml',
            ref: 'main',
            projectId: 99,
            taskId: 545
        })
    });

    // May be 200 (success) or 500 (GitHub error) depending on config
    // We're checking the response structure
    assert(data, 'Should return data object');
    assert(typeof data === 'object', 'Data should be an object');

    // If success, should have these fields
    if (status === 200 && data.success) {
        assert(data.data, 'Success response should have data field');
        assert(typeof data.data.workflowId === 'number', 'Should have workflowId');
    }

    // If error, should have error structure
    if (!data.success) {
        assert(data.error, 'Error response should have error field');
    }
});

// ==================== GITHUB WORKFLOW STATUS TESTS ====================

const testWorkflowStatusValidation = test('GitHub: Workflow status - Validation', async () => {
    // Test with invalid run ID (should be a number)
    const { status } = await fetchJson(`${API_BASE}/github/workflow-status/invalid-id`);

    assert(status === 400 || status === 404 || status === 422,
        'Should return error for invalid run ID');
});

const testWorkflowStatusUnauthorized = test('GitHub: Workflow status - Unauthorized', async () => {
    const originalToken = authToken;
    authToken = null;

    const { status } = await fetchJson(`${API_BASE}/github/workflow-status/12345`);

    authToken = originalToken;

    assertEqual(status, 401, 'Should return 401 for unauthorized request');
});

const testWorkflowStatusStructure = test('GitHub: Workflow status - Response structure', async () => {
    // Use a fake run ID (will likely fail, but we check structure)
    const { status, data } = await fetchJson(`${API_BASE}/github/workflow-status/99999999`);

    assert(data, 'Should return data object');
    assert(typeof data === 'object', 'Data should be an object');

    // If success, should have these fields
    if (status === 200 && data.success) {
        assert(data.data, 'Success response should have data field');
        assert(typeof data.data.status === 'string', 'Should have status string');
    }

    // If error (expected), should have error structure
    if (!data.success) {
        assert(data.error, 'Error response should have error field');
    }
});

// ==================== GITHUB ISSUE TESTS ====================

const testCreateIssueValidation = test('GitHub: Create issue - Validation', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-issue`, {
        method: 'POST',
        body: JSON.stringify({
            // Missing required fields
        })
    });

    assert(status === 400 || status === 422, 'Should return 400/422 for validation error');
});

const testCreateIssueUnauthorized = test('GitHub: Create issue - Unauthorized', async () => {
    const originalToken = authToken;
    authToken = null;

    const { status } = await fetchJson(`${API_BASE}/github/create-issue`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'test',
            repo: 'repo',
            title: 'Test Issue',
            body: 'Description',
            taskId: 545,
            projectId: 99
        })
    });

    authToken = originalToken;

    assertEqual(status, 401, 'Should return 401 for unauthorized request');
});

const testCreateIssueStructure = test('GitHub: Create issue - Response structure', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-issue`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'solaria-agency',
            repo: 'test-repo',
            title: 'Test Issue from DFO',
            body: 'This is a test issue created from integration tests',
            labels: ['test', 'automation'],
            taskId: 545,
            projectId: 99
        })
    });

    assert(data, 'Should return data object');
    assert(typeof data === 'object', 'Data should be an object');

    // If success, should have these fields
    if (status === 200 && data.success) {
        assert(data.data, 'Success response should have data field');
        assert(typeof data.data.issueNumber === 'number', 'Should have issueNumber');
        assert(typeof data.data.issueUrl === 'string', 'Should have issueUrl');
    }

    // If error (expected if repo doesn't exist), should have error structure
    if (!data.success) {
        assert(data.error, 'Error response should have error field');
    }
});

// ==================== GITHUB PR TESTS ====================

const testCreatePRValidation = test('GitHub: Create PR - Validation', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-pr`, {
        method: 'POST',
        body: JSON.stringify({
            // Missing required fields
        })
    });

    assert(status === 400 || status === 422, 'Should return 400/422 for validation error');
});

const testCreatePRUnauthorized = test('GitHub: Create PR - Unauthorized', async () => {
    const originalToken = authToken;
    authToken = null;

    const { status } = await fetchJson(`${API_BASE}/github/create-pr`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'test',
            repo: 'repo',
            title: 'Test PR',
            body: 'Description',
            head: 'feature',
            base: 'main',
            taskId: 545,
            projectId: 99
        })
    });

    authToken = originalToken;

    assertEqual(status, 401, 'Should return 401 for unauthorized request');
});

const testCreatePRStructure = test('GitHub: Create PR - Response structure', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-pr`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'solaria-agency',
            repo: 'test-repo',
            title: 'Test PR from DFO',
            body: 'This is a test pull request created from integration tests',
            head: 'feature/test',
            base: 'main',
            labels: ['test', 'automation'],
            taskId: 545,
            projectId: 99
        })
    });

    assert(data, 'Should return data object');
    assert(typeof data === 'object', 'Data should be an object');

    // If success, should have these fields
    if (status === 200 && data.success) {
        assert(data.data, 'Success response should have data field');
        assert(typeof data.data.prNumber === 'number', 'Should have prNumber');
        assert(typeof data.data.prUrl === 'string', 'Should have prUrl');
    }

    // If error (expected if repo/branch doesn't exist), should have error structure
    if (!data.success) {
        assert(data.error, 'Error response should have error field');
    }
});

// ==================== GITHUB API ERROR HANDLING ====================

const testGitHubAPIConfigured = test('GitHub: Check if GITHUB_TOKEN is configured', async () => {
    // Try to trigger a workflow to see if token is configured
    const { status, data } = await fetchJson(`${API_BASE}/github/trigger-workflow`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'solaria-agency',
            repo: 'nonexistent-repo-12345',
            workflowId: 'test.yml',
            ref: 'main',
            projectId: 99
        })
    });

    // If 401 or error mentions authentication, token is not configured
    if (status === 401 || (data.error && data.error.includes('auth'))) {
        console.log('⚠️  WARNING: GITHUB_TOKEN not configured - some tests may fail');
    } else {
        console.log('✓ GITHUB_TOKEN appears to be configured');
    }
});

// ==================== RUN ALL TESTS ====================

async function runAllTests() {
    console.log('========================================');
    console.log('  GitHub API Integration Tests');
    console.log('========================================\n');

    // Auth setup
    await testAuthLogin();

    // GitHub workflow tests
    console.log('\n--- Workflow Tests ---');
    await testTriggerWorkflowValidation();
    await testTriggerWorkflowUnauthorized();
    await testTriggerWorkflowStructure();

    // Workflow status tests
    console.log('\n--- Workflow Status Tests ---');
    await testWorkflowStatusValidation();
    await testWorkflowStatusUnauthorized();
    await testWorkflowStatusStructure();

    // Issue tests
    console.log('\n--- Issue Tests ---');
    await testCreateIssueValidation();
    await testCreateIssueUnauthorized();
    await testCreateIssueStructure();

    // PR tests
    console.log('\n--- Pull Request Tests ---');
    await testCreatePRValidation();
    await testCreatePRUnauthorized();
    await testCreatePRStructure();

    // Configuration check
    console.log('\n--- Configuration Tests ---');
    await testGitHubAPIConfigured();

    // Summary
    console.log('\n========================================');
    console.log(`  Results: ${results.passed} passed, ${results.failed} failed`);
    console.log('========================================');

    // Exit with error code if any test failed
    process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});

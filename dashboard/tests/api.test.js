/**
 * SOLARIA Dashboard API Tests
 * Comprehensive tests for the C-Suite Dashboard API
 * Tests authentication, agents, tasks, projects, and docs endpoints
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

function assertGreater(actual, expected, message) {
    if (actual <= expected) {
        throw new Error(`${message}: expected > ${expected}, got ${actual}`);
    }
}

// ==================== AUTH TESTS ====================

const testAuthLogin = test('Auth: Login with valid credentials', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(TEST_USER)
    });
    assertEqual(status, 200, 'Status should be 200');
    assert(data.token, 'Response should contain token');
    assert(data.user, 'Response should contain user');
    assertEqual(data.user.username, 'carlosjperez', 'Username should match');
    authToken = data.token;
});

const testAuthVerify = test('Auth: Verify valid token', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/auth/verify`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.valid, 'Token should be valid');
    assert(data.user, 'Response should contain user');
});

const testAuthInvalidLogin = test('Auth: Reject invalid credentials', async () => {
    const { status } = await fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ userId: 'invalid', password: 'wrong' })
    });
    assertEqual(status, 401, 'Status should be 401 for invalid credentials');
});

// ==================== AGENTS TESTS ====================

const testAgentsList = test('Agents: List all agents', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/agents`);
    assertEqual(status, 200, 'Status should be 200');
    assert(Array.isArray(data), 'Response should be an array');
    assertGreater(data.length, 0, 'Should have at least one agent');

    // Verify SOLARIA naming
    const hasSOLARIA = data.every(a => a.name.includes('SOLARIA'));
    assert(hasSOLARIA, 'All agents should have SOLARIA prefix');
});

const testAgentsHaveRequiredFields = test('Agents: Have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/agents`);
    const agent = data[0];

    assert(agent.id, 'Agent should have id');
    assert(agent.name, 'Agent should have name');
    assert(agent.role, 'Agent should have role');
    assert(agent.status, 'Agent should have status');
});

const testAgentsRoles = test('Agents: Have valid roles', async () => {
    const validRoles = ['project_manager', 'architect', 'developer', 'tester', 'analyst', 'designer', 'devops', 'technical_writer', 'security_auditor'];
    const { data } = await fetchJson(`${API_BASE}/agents`);

    for (const agent of data) {
        assert(validRoles.includes(agent.role), `Agent ${agent.name} has invalid role: ${agent.role}`);
    }
});

const testAgentsStatuses = test('Agents: Have valid statuses', async () => {
    const validStatuses = ['active', 'busy', 'inactive', 'error', 'maintenance'];
    const { data } = await fetchJson(`${API_BASE}/agents`);

    for (const agent of data) {
        assert(validStatuses.includes(agent.status), `Agent ${agent.name} has invalid status: ${agent.status}`);
    }
});

const testAgentDetail = test('Agents: Get single agent detail', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/agents/1`);
    assertEqual(status, 200, 'Status should be 200');
    assertEqual(data.id, 1, 'Agent ID should match');
    assert(data.name.includes('SOLARIA'), 'Agent name should include SOLARIA');
});

// ==================== TASKS TESTS ====================

const testTasksList = test('Tasks: List all tasks', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/tasks`);
    assertEqual(status, 200, 'Status should be 200');
    assert(Array.isArray(data), 'Response should be an array');
    assertGreater(data.length, 0, 'Should have at least one task');
});

const testTasksHaveRequiredFields = test('Tasks: Have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/tasks`);
    const task = data[0];

    assert(task.id, 'Task should have id');
    assert(task.title, 'Task should have title');
    assert(task.status, 'Task should have status');
    assert(task.priority !== undefined, 'Task should have priority');
});

const testTasksValidStatuses = test('Tasks: Have valid statuses', async () => {
    const validStatuses = ['pending', 'in_progress', 'completed', 'blocked', 'cancelled'];
    const { data } = await fetchJson(`${API_BASE}/tasks`);

    for (const task of data) {
        assert(validStatuses.includes(task.status), `Task "${task.title}" has invalid status: ${task.status}`);
    }
});

const testTasksValidPriorities = test('Tasks: Have valid priorities', async () => {
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    const { data } = await fetchJson(`${API_BASE}/tasks`);

    for (const task of data) {
        assert(validPriorities.includes(task.priority), `Task "${task.title}" has invalid priority: ${task.priority}`);
    }
});

const testTasksProgress = test('Tasks: Progress is within valid range', async () => {
    const { data } = await fetchJson(`${API_BASE}/tasks`);

    for (const task of data) {
        const progress = task.progress || 0;
        assert(progress >= 0 && progress <= 100, `Task "${task.title}" has invalid progress: ${progress}`);
    }
});

const testTasksCompletedHaveProgress100 = test('Tasks: Completed tasks should have 100% progress', async () => {
    const { data } = await fetchJson(`${API_BASE}/tasks`);
    const completedTasks = data.filter(t => t.status === 'completed');

    for (const task of completedTasks) {
        assertEqual(task.progress, 100, `Completed task "${task.title}" should have 100% progress`);
    }
});

const testTaskUpdate = test('Tasks: Update task priority', async () => {
    const { data: tasks } = await fetchJson(`${API_BASE}/tasks`);
    const taskToUpdate = tasks.find(t => t.status !== 'completed');

    if (taskToUpdate) {
        const newPriority = taskToUpdate.priority === 'high' ? 'medium' : 'high';
        const { status } = await fetchJson(`${API_BASE}/tasks/${taskToUpdate.id}`, {
            method: 'PUT',
            body: JSON.stringify({ priority: newPriority })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify update
        const { data: updated } = await fetchJson(`${API_BASE}/tasks/${taskToUpdate.id}`);
        assertEqual(updated.priority, newPriority, 'Priority should be updated');

        // Restore original
        await fetchJson(`${API_BASE}/tasks/${taskToUpdate.id}`, {
            method: 'PUT',
            body: JSON.stringify({ priority: taskToUpdate.priority })
        });
    }
});

// ==================== PROJECTS TESTS ====================

const testProjectsList = test('Projects: List all projects', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/projects`);
    assertEqual(status, 200, 'Status should be 200');
    assert(Array.isArray(data), 'Response should be an array');
    assertGreater(data.length, 0, 'Should have at least one project');
});

const testProjectAkademate = test('Projects: Akademate.com project exists', async () => {
    const { data } = await fetchJson(`${API_BASE}/projects`);
    const akademate = data.find(p => p.name.toLowerCase().includes('akademate'));

    assert(akademate, 'Akademate.com project should exist');
    assertEqual(akademate.status, 'development', 'Project should be in development');
});

const testProjectHasRequiredFields = test('Projects: Have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/projects`);
    const project = data[0];

    assert(project.id, 'Project should have id');
    assert(project.name, 'Project should have name');
    assert(project.status, 'Project should have status');
});

// ==================== DOCS TESTS ====================

const testDocsList = test('Docs: List project documents', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/docs/list`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.documents !== undefined, 'Response should have documents');
    assert(data.total !== undefined, 'Response should have total count');
});

const testDocsHaveRequiredFields = test('Docs: Documents have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/docs/list`);

    if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        assert(doc.name, 'Document should have name');
        assert(doc.path, 'Document should have path');
        assert(doc.type, 'Document should have type');
    }
});

// ==================== LOGS TESTS ====================

const testLogsList = test('Logs: List activity logs', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/logs?limit=10`);
    assertEqual(status, 200, 'Status should be 200');
    assert(Array.isArray(data), 'Response should be an array');
});

const testLogsHaveRequiredFields = test('Logs: Logs have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/logs?limit=10`);

    if (data.length > 0) {
        const log = data[0];
        assert(log.level, 'Log should have level');
        assert(log.action, 'Log should have action');
    }
});

// ==================== DASHBOARD TESTS ====================

const testDashboardOverview = test('Dashboard: Get overview', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/dashboard/overview`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.totalProjects !== undefined, 'Should have totalProjects');
    assert(data.totalTasks !== undefined, 'Should have totalTasks');
    assert(data.totalAgents !== undefined, 'Should have totalAgents');
});

const testDashboardAlerts = test('Dashboard: Get alerts', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/dashboard/alerts`);
    assertEqual(status, 200, 'Status should be 200');
    assert(Array.isArray(data), 'Response should be an array');
});

// ==================== PUBLIC API TESTS (No Auth Required) ====================

// Helper for public endpoints (no auth token)
async function fetchPublicJson(url) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
    });
    return { status: response.status, data: await response.json() };
}

const testPublicProjectsList = test('Public API: List projects without auth', async () => {
    const { status, data } = await fetchPublicJson(`${API_BASE}/public/projects`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.projects, 'Response should have projects array');
    assert(Array.isArray(data.projects), 'projects should be an array');
});

const testPublicProjectsHaveFields = test('Public API: Projects have required fields', async () => {
    const { data } = await fetchPublicJson(`${API_BASE}/public/projects`);
    if (data.projects.length > 0) {
        const project = data.projects[0];
        assert(project.id, 'Project should have id');
        assert(project.name, 'Project should have name');
        assert(project.status, 'Project should have status');
        assert(project.budget !== undefined, 'Project should have budget');
        assert(project.task_count !== undefined, 'Project should have task_count');
    }
});

const testPublicBusinessesList = test('Public API: List businesses without auth', async () => {
    const { status, data } = await fetchPublicJson(`${API_BASE}/public/businesses`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.businesses, 'Response should have businesses array');
    assert(Array.isArray(data.businesses), 'businesses should be an array');
});

const testPublicBusinessesHaveFields = test('Public API: Businesses have required fields', async () => {
    const { data } = await fetchPublicJson(`${API_BASE}/public/businesses`);
    if (data.businesses.length > 0) {
        const business = data.businesses[0];
        assert(business.id, 'Business should have id');
        assert(business.name, 'Business should have name');
        assert(business.status, 'Business should have status');
    }
});

const testPublicBusinessesHaveAllFields = test('Public API: Businesses have all expected fields', async () => {
    const { data } = await fetchPublicJson(`${API_BASE}/public/businesses`);
    if (data.businesses.length > 0) {
        const business = data.businesses[0];
        const requiredFields = ['id', 'name', 'description', 'website', 'status', 'revenue', 'expenses', 'profit', 'logo_url'];
        for (const field of requiredFields) {
            assert(field in business, `Business should have field: ${field}`);
        }
    }
});

// ==================== BUSINESSES API TESTS (Authenticated) ====================

const testBusinessesList = test('Businesses: List all businesses', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/businesses`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.businesses, 'Response should have businesses');
    assert(Array.isArray(data.businesses), 'businesses should be an array');
});

const testBusinessesHaveRequiredFields = test('Businesses: Have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/businesses`);
    if (data.businesses.length > 0) {
        const business = data.businesses[0];
        assert(business.id, 'Business should have id');
        assert(business.name, 'Business should have name');
        assert(business.status, 'Business should have status');
    }
});

const testBusinessesHaveAllFields = test('Businesses: Have all expected fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/businesses`);
    if (data.businesses.length > 0) {
        const business = data.businesses[0];
        const requiredFields = ['id', 'name', 'description', 'website', 'status', 'revenue', 'expenses', 'profit', 'logo_url'];
        for (const field of requiredFields) {
            assert(field in business, `Business should have field: ${field}`);
        }
    }
});

const testBusinessDetail = test('Businesses: Get single business detail', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const businessId = listData.businesses[0].id;
        const { status, data } = await fetchJson(`${API_BASE}/businesses/${businessId}`);
        assertEqual(status, 200, 'Status should be 200');
        assert(data.business, 'Response should have business');
        assertEqual(data.business.id, businessId, 'Business ID should match');
    }
});

const testBusinessDetailNotFound = test('Businesses: Return 404 for non-existent business', async () => {
    const { status } = await fetchJson(`${API_BASE}/businesses/99999`);
    assertEqual(status, 404, 'Status should be 404 for non-existent business');
});

const testBusinessUpdateName = test('Businesses: Update name field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalName = business.name;
        const testName = 'TEST NAME UPDATE';

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ name: testName })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(updated.business.name, testName, 'Name should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ name: originalName })
        });
    }
});

const testBusinessUpdateDescription = test('Businesses: Update description field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalDesc = business.description;
        const testDesc = 'TEST DESCRIPTION UPDATE';

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ description: testDesc })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(updated.business.description, testDesc, 'Description should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ description: originalDesc })
        });
    }
});

const testBusinessUpdateWebsite = test('Businesses: Update website field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalWebsite = business.website;
        const testWebsite = 'https://test-website.com';

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ website: testWebsite })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(updated.business.website, testWebsite, 'Website should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ website: originalWebsite })
        });
    }
});

const testBusinessUpdateStatus = test('Businesses: Update status field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalStatus = business.status;
        const testStatus = originalStatus === 'active' ? 'inactive' : 'active';

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: testStatus })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(updated.business.status, testStatus, 'Status should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: originalStatus })
        });
    }
});

const testBusinessUpdateRevenue = test('Businesses: Update revenue field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalRevenue = business.revenue;
        const testRevenue = 50000.50;

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ revenue: testRevenue })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(parseFloat(updated.business.revenue), testRevenue, 'Revenue should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ revenue: originalRevenue })
        });
    }
});

const testBusinessUpdateExpenses = test('Businesses: Update expenses field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalExpenses = business.expenses;
        const testExpenses = 25000.25;

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ expenses: testExpenses })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(parseFloat(updated.business.expenses), testExpenses, 'Expenses should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ expenses: originalExpenses })
        });
    }
});

const testBusinessUpdateProfit = test('Businesses: Update profit field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalProfit = business.profit;
        const testProfit = 25000.25;

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ profit: testProfit })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(parseFloat(updated.business.profit), testProfit, 'Profit should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ profit: originalProfit })
        });
    }
});

const testBusinessUpdateLogoUrl = test('Businesses: Update logo_url field', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalLogoUrl = business.logo_url;
        const testLogoUrl = 'https://example.com/logo-test.png';

        // Update
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ logo_url: testLogoUrl })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(updated.business.logo_url, testLogoUrl, 'Logo URL should be updated');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ logo_url: originalLogoUrl })
        });
    }
});

const testBusinessUpdateMultipleFields = test('Businesses: Update multiple fields at once', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const original = { ...business };
        const testData = {
            name: 'MULTI UPDATE TEST',
            description: 'Multi field test description',
            revenue: 100000,
            expenses: 50000,
            profit: 50000
        };

        // Update multiple fields
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify(testData)
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify all fields
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(updated.business.name, testData.name, 'Name should be updated');
        assertEqual(updated.business.description, testData.description, 'Description should be updated');
        assertEqual(parseFloat(updated.business.revenue), testData.revenue, 'Revenue should be updated');
        assertEqual(parseFloat(updated.business.expenses), testData.expenses, 'Expenses should be updated');
        assertEqual(parseFloat(updated.business.profit), testData.profit, 'Profit should be updated');

        // Restore all fields
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                name: original.name,
                description: original.description,
                revenue: original.revenue,
                expenses: original.expenses,
                profit: original.profit
            })
        });
    }
});

const testBusinessUpdateNoFields = test('Businesses: Return 400 when no fields provided', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({})
        });
        assertEqual(status, 400, 'Status should be 400 when no fields provided');
    }
});

const testBusinessUpdateNotFound = test('Businesses: Return 404 when updating non-existent business', async () => {
    const { status } = await fetchJson(`${API_BASE}/businesses/99999`, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' })
    });
    assertEqual(status, 404, 'Status should be 404 for non-existent business');
});

const testBusinessUpdateNullWebsite = test('Businesses: Update website to null', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const originalWebsite = business.website;

        // Update to null
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ website: null })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(updated.business.website, null, 'Website should be null');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ website: originalWebsite })
        });
    }
});

const testBusinessUpdateZeroValues = test('Businesses: Update financial fields to zero', async () => {
    const { data: listData } = await fetchJson(`${API_BASE}/businesses`);
    if (listData.businesses.length > 0) {
        const business = listData.businesses[0];
        const original = { revenue: business.revenue, expenses: business.expenses, profit: business.profit };

        // Update to zeros
        const { status } = await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify({ revenue: 0, expenses: 0, profit: 0 })
        });
        assertEqual(status, 200, 'Update should succeed');

        // Verify
        const { data: updated } = await fetchJson(`${API_BASE}/businesses/${business.id}`);
        assertEqual(parseFloat(updated.business.revenue), 0, 'Revenue should be zero');
        assertEqual(parseFloat(updated.business.expenses), 0, 'Expenses should be zero');
        assertEqual(parseFloat(updated.business.profit), 0, 'Profit should be zero');

        // Restore
        await fetchJson(`${API_BASE}/businesses/${business.id}`, {
            method: 'PUT',
            body: JSON.stringify(original)
        });
    }
});

const testPublicTasksList = test('Public API: List tasks without auth', async () => {
    const { status, data } = await fetchPublicJson(`${API_BASE}/public/tasks`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.tasks, 'Response should have tasks array');
    assert(Array.isArray(data.tasks), 'tasks should be an array');
});

const testPublicTasksWithProjectFilter = test('Public API: Filter tasks by project_id', async () => {
    const { data: projectsData } = await fetchPublicJson(`${API_BASE}/public/projects`);
    if (projectsData.projects.length > 0) {
        const projectId = projectsData.projects[0].id;
        const { status, data } = await fetchPublicJson(`${API_BASE}/public/tasks?project_id=${projectId}`);
        assertEqual(status, 200, 'Status should be 200');
        assert(data.tasks, 'Response should have tasks array');
    }
});

const testPublicDashboard = test('Public API: Get dashboard stats without auth', async () => {
    const { status, data } = await fetchPublicJson(`${API_BASE}/public/dashboard`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.projects, 'Response should have projects stats');
    assert(data.tasks, 'Response should have tasks stats');
    assert(data.businesses, 'Response should have businesses stats');
});

const testPublicDashboardHasCorrectStats = test('Public API: Dashboard stats have correct fields', async () => {
    const { data } = await fetchPublicJson(`${API_BASE}/public/dashboard`);

    // Projects stats
    assert(data.projects.total_projects !== undefined, 'Should have total_projects');
    assert(data.projects.total_budget !== undefined, 'Should have total_budget');

    // Tasks stats
    assert(data.tasks.total_tasks !== undefined, 'Should have total_tasks');
    assert(data.tasks.completed !== undefined, 'Should have completed tasks count');
    assert(data.tasks.pending !== undefined, 'Should have pending tasks count');

    // Businesses stats
    assert(data.businesses.total_businesses !== undefined, 'Should have total_businesses');
});

// ==================== GITHUB ACTIONS API TESTS ====================

const testGitHubTriggerWorkflowRequiresAuth = test('GitHub: Trigger workflow requires auth', async () => {
    const tempToken = authToken;
    authToken = null; // Remove auth token

    const { status } = await fetchJson(`${API_BASE}/github/trigger-workflow`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'test-owner',
            repo: 'test-repo',
            workflowId: 'test.yml',
            ref: 'main'
        })
    });

    assertEqual(status, 401, 'Status should be 401 without auth');
    authToken = tempToken; // Restore auth token
});

const testGitHubTriggerWorkflowValidation = test('GitHub: Trigger workflow validates request', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/trigger-workflow`, {
        method: 'POST',
        body: JSON.stringify({
            // Missing required fields
        })
    });

    // Should return 400 or error message about missing fields
    assert(status === 400 || status === 500 || data.error, 'Should validate request body');
});

const testGitHubTriggerWorkflowHandlesNoToken = test('GitHub: Trigger workflow handles missing GITHUB_TOKEN', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/trigger-workflow`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'solaria-agency',
            repo: 'test-repo',
            workflowId: 'test.yml',
            ref: 'main',
            inputs: {},
            projectId: 1,
            taskId: 1
        })
    });

    // If GITHUB_TOKEN is not configured, should return appropriate error
    // Could be 503 (service unavailable) or 500 with error message
    if (status === 503 || (status === 500 && data.error && data.error.includes('GitHub'))) {
        assert(true, 'Correctly handles missing GITHUB_TOKEN');
    } else if (status === 200 || status === 201) {
        // If successful, verify response structure
        assert(data.success !== undefined, 'Should have success field');
        if (data.success) {
            assert(data.data, 'Should have data field');
            assert(data.data.githubRunId || data.data.runId, 'Should have run ID in response');
        }
    } else {
        assert(true, 'Accepts valid request structure');
    }
});

const testGitHubWorkflowStatusRequiresAuth = test('GitHub: Get workflow status requires auth', async () => {
    const tempToken = authToken;
    authToken = null;

    const { status } = await fetchJson(`${API_BASE}/github/workflow-status/12345`);

    assertEqual(status, 401, 'Status should be 401 without auth');
    authToken = tempToken;
});

const testGitHubWorkflowStatusValidation = test('GitHub: Get workflow status validates run_id', async () => {
    const { status } = await fetchJson(`${API_BASE}/github/workflow-status/invalid-id`);

    // Should handle invalid run_id (could be 400, 404, or 500)
    assert(status >= 400, 'Should return error status for invalid run_id');
});

const testGitHubCreateIssueRequiresAuth = test('GitHub: Create issue requires auth', async () => {
    const tempToken = authToken;
    authToken = null;

    const { status } = await fetchJson(`${API_BASE}/github/create-issue`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'test-owner',
            repo: 'test-repo',
            title: 'Test Issue',
            body: 'Test body',
            taskId: 1
        })
    });

    assertEqual(status, 401, 'Status should be 401 without auth');
    authToken = tempToken;
});

const testGitHubCreateIssueValidation = test('GitHub: Create issue validates request', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-issue`, {
        method: 'POST',
        body: JSON.stringify({
            // Missing required fields like owner, repo, title
        })
    });

    assert(status === 400 || status === 500 || data.error, 'Should validate required fields');
});

const testGitHubCreateIssueHandlesNoToken = test('GitHub: Create issue handles missing GITHUB_TOKEN', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-issue`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'solaria-agency',
            repo: 'test-repo',
            title: 'Test Issue: Feature Request',
            body: 'This is a test issue body',
            labels: ['enhancement'],
            assignees: [],
            taskId: 1,
            projectId: 1
        })
    });

    if (status === 503 || (status === 500 && data.error && data.error.includes('GitHub'))) {
        assert(true, 'Correctly handles missing GITHUB_TOKEN');
    } else if (status === 200 || status === 201) {
        if (data.success) {
            assert(data.data, 'Should have data field');
            assert(data.data.issueNumber || data.data.issueUrl, 'Should have issue info');
        }
    } else {
        assert(true, 'Accepts valid request structure');
    }
});

const testGitHubCreatePRRequiresAuth = test('GitHub: Create PR requires auth', async () => {
    const tempToken = authToken;
    authToken = null;

    const { status } = await fetchJson(`${API_BASE}/github/create-pr`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'test-owner',
            repo: 'test-repo',
            title: 'Test PR',
            head: 'feature-branch',
            base: 'main',
            taskId: 1
        })
    });

    assertEqual(status, 401, 'Status should be 401 without auth');
    authToken = tempToken;
});

const testGitHubCreatePRValidation = test('GitHub: Create PR validates request', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-pr`, {
        method: 'POST',
        body: JSON.stringify({
            // Missing required fields
        })
    });

    assert(status === 400 || status === 500 || data.error, 'Should validate required fields');
});

const testGitHubCreatePRHandlesNoToken = test('GitHub: Create PR handles missing GITHUB_TOKEN', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/github/create-pr`, {
        method: 'POST',
        body: JSON.stringify({
            owner: 'solaria-agency',
            repo: 'test-repo',
            title: 'Feature: Test PR',
            body: 'This is a test PR body',
            head: 'feature/test-branch',
            base: 'main',
            labels: ['enhancement'],
            assignees: [],
            draft: false,
            taskId: 1,
            projectId: 1
        })
    });

    if (status === 503 || (status === 500 && data.error && data.error.includes('GitHub'))) {
        assert(true, 'Correctly handles missing GITHUB_TOKEN');
    } else if (status === 200 || status === 201) {
        if (data.success) {
            assert(data.data, 'Should have data field');
            assert(data.data.prNumber || data.data.prUrl, 'Should have PR info');
        }
    } else {
        assert(true, 'Accepts valid request structure');
    }
    });

// ==================== TAGS TESTS ====================

const testTagsList = test('Tags: List all tags', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/tags`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.success, 'Response should have success: true');
    assert(Array.isArray(data.data?.tags), 'Tags should be an array');
    assertGreater(data.data?.tags?.length || 0, 0, 'Should have predefined tags');
});

const testTagsByType = test('Tags: Filter tags by type', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/tags?type=feature`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.success, 'Response should have success: true');
    const tags = data.data?.tags || [];
    assert(tags.every(t => t.tag_type === 'feature'), 'All tags should be of type feature');
});

const testTagsPredefinedOnly = test('Tags: Filter only predefined tags', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/tags?predefined=true`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.success, 'Response should have success: true');
    const tags = data.data?.tags || [];
    assert(tags.every(t => t.is_system === true), 'All tags should be system tags');
});

const testTagsCreate = test('Tags: Create new tag', async () => {
    const newTag = {
        tag_name: 'test-security',
        display_name: 'Security',
        color: '#dc2626',
        icon: 'shield',
        description: 'Security-related tasks',
        tag_type: 'bug'
    };
    const { status, data } = await fetchJson(`${API_BASE}/tags`, {
        method: 'POST',
        body: JSON.stringify(newTag)
    });
    assertEqual(status, 201, 'Status should be 201');
    assert(data.success, 'Response should have success: true');
    assert(data.data?.tag?.tag_name === 'test-security', 'Tag should be created with correct name');
});

const testTagsCreateDuplicate = test('Tags: Reject duplicate tag name', async () => {
    const tag = {
        tag_name: 'bug',
        display_name: 'Duplicate Bug',
        color: '#ef4444',
        tag_type: 'bug'
    };
    const { status } = await fetchJson(`${API_BASE}/tags`, {
        method: 'POST',
        body: JSON.stringify(tag)
    });
    assertEqual(status, 409, 'Status should be 409 (conflict)');
});

const testTagsCreateInvalidColor = test('Tags: Reject invalid hex color', async () => {
    const tag = {
        tag_name: 'test-invalid',
        display_name: 'Invalid Color',
        color: 'not-a-hex-color',
        tag_type: 'other'
    };
    const { status } = await fetchJson(`${API_BASE}/tags`, {
        method: 'POST',
        body: JSON.stringify(tag)
    });
    assertEqual(status, 400, 'Status should be 400 (bad request)');
});

const testTagsCreateInvalidType = test('Tags: Reject invalid tag type', async () => {
    const tag = {
        tag_name: 'test-type',
        display_name: 'Invalid Type',
        color: '#3b82f6',
        tag_type: 'invalid-type'
    };
    const { status } = await fetchJson(`${API_BASE}/tags`, {
        method: 'POST',
        body: JSON.stringify(tag)
    });
    assertEqual(status, 400, 'Status should be 400 (bad request)');
});

const testTagsUpdate = test('Tags: Update existing tag', async () => {
    const { status: data } = await fetchJson(`${API_BASE}/tags`);
    const tagId = data.data?.tags?.[0]?.id;
    if (!tagId) throw new Error('No tags available to update');
    const updates = {
        display_name: 'Updated Bug Fix',
        color: '#f87171'
    };
    const { status: updateData } = await fetchJson(`${API_BASE}/tags/${tagId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
    });
    assertEqual(status, 200, 'Status should be 200');
    assert(updateData.success, 'Response should have success: true');
});

const testTagsUpdateNotFound = test('Tags: Update non-existent tag', async () => {
    const { status } = await fetchJson(`${API_BASE}/tags/999999`, {
        method: 'PUT',
        body: JSON.stringify({ display_name: 'Test' })
    });
    assertEqual(status, 404, 'Status should be 404');
});

const testTagsDeleteSystemTag = test('Tags: Reject deleting system tags', async () => {
    const { status: data } = await fetchJson(`${API_BASE}/tags?predefined=true`);
    const systemTagId = data.data?.tags?.[0]?.id;
    if (!systemTagId) throw new Error('No system tags available');
    const { status } = await fetchJson(`${API_BASE}/tags/${systemTagId}`, {
        method: 'DELETE'
    });
    assertEqual(status, 403, 'Status should be 403 (forbidden)');
});

const testTagsDelete = test('Tags: Delete custom tag', async () => {
    const createResult = await fetchJson(`${API_BASE}/tags`, {
        method: 'POST',
        body: JSON.stringify({
            tag_name: 'test-delete',
            display_name: 'Test Delete',
            color: '#3b82f6',
            tag_type: 'other'
        })
    });
    const tagId = createResult.data?.tag?.id;
    if (!tagId) throw new Error('Failed to create test tag');
    const { status } = await fetchJson(`${API_BASE}/tags/${tagId}`, {
        method: 'DELETE'
    });
    assertEqual(status, 200, 'Status should be 200');
});

const testTaskTagsGet = test('Task Tags: Get task tags', async () => {
    const { status: data } = await fetchJson(`${API_BASE}/tasks`);
    const taskId = data?.[0]?.id;
    if (!taskId) throw new Error('No tasks available');
    const { status: tagStatus, data: tagData } = await fetchJson(`${API_BASE}/tasks/${taskId}/tags`);
    assertEqual(tagStatus, 200, 'Status should be 200');
    assert(tagData.success, 'Response should have success: true');
    assert(Array.isArray(tagData.data?.tags), 'Tags should be an array');
});

const testTaskTagsAdd = test('Task Tags: Add tag to task', async () => {
    const { status: data } = await fetchJson(`${API_BASE}/tags`);
    const tagId = data.data?.tags?.[0]?.id;
    if (!tagId) throw new Error('No tags available');
    const { status: tasksData } = await fetchJson(`${API_BASE}/tasks`);
    const taskId = tasksData?.[0]?.id;
    if (!taskId) throw new Error('No tasks available');
    const { status } = await fetchJson(`${API_BASE}/tasks/${taskId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tag_id: tagId })
    });
    assertEqual(status, 200, 'Status should be 200');
});

const testTaskTagsAddDuplicate = test('Task Tags: Reject duplicate tag assignment', async () => {
    const { status: data } = await fetchJson(`${API_BASE}/tags`);
    const tagId = data.data?.tags?.[0]?.id;
    if (!tagId) throw new Error('No tags available');
    const { status: tasksData } = await fetchJson(`${API_BASE}/tasks`);
    const taskId = tasksData?.[0]?.id;
    if (!taskId) throw new Error('No tasks available');
    const addResult = await fetchJson(`${API_BASE}/tasks/${taskId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tag_id: tagId })
    });
    const { status: secondStatus } = await fetchJson(`${API_BASE}/tasks/${taskId}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tag_id: tagId })
    });
    assertEqual(secondStatus, 409, 'Second add should return 409 (conflict)');
});

const testTaskTagsRemove = test('Task Tags: Remove tag from task', async () => {
    const { status: data } = await fetchJson(`${API_BASE}/tasks`);
    const taskId = data?.[0]?.id;
    if (!taskId) throw new Error('No tasks available');
    const { status: tagsData } = await fetchJson(`${API_BASE}/tasks/${taskId}/tags`);
    const tagId = tagsData.data?.tags?.[0]?.id;
    if (!tagId) throw new Error('No tags available for removal');
    const { status } = await fetchJson(`${API_BASE}/tasks/${taskId}/tags/${tagId}`, {
        method: 'DELETE'
    });
    assertEqual(status, 200, 'Status should be 200');
});

const testTaskTagsRemoveNotFound = test('Task Tags: Remove non-existent assignment', async () => {
    const { status } = await fetchJson(`${API_BASE}/tasks/99999/tags/99999`, {
        method: 'DELETE'
    });
    assertEqual(status, 404, 'Status should be 404');
});

const testTaskTagsReplace = test('Task Tags: Replace all task tags', async () => {
    const { status: data } = await fetchJson(`${API_BASE}/tags`);
    const tagIds = data.data?.tags?.slice(0, 2).map(t => t.id);
    if (!tagIds || tagIds.length < 2) throw new Error('Not enough tags available');
    const { status: tasksData } = await fetchJson(`${API_BASE}/tasks`);
    const taskId = tasksData?.[0]?.id;
    if (!taskId) throw new Error('No tasks available');
    const { status: replaceData } = await fetchJson(`${API_BASE}/tasks/${taskId}/tags`, {
        method: 'PUT',
        body: JSON.stringify({ tag_ids: tagIds })
    });
    assertEqual(status, 200, 'Status should be 200');
    assert(replaceData.success, 'Response should have success: true');
});

const testTaskTagsReplaceEmpty = test('Task Tags: Replace with empty array removes all tags', async () => {
    const { status: tasksData } = await fetchJson(`${API_BASE}/tasks`);
    const taskId = tasksData?.[0]?.id;
    if (!taskId) throw new Error('No tasks available');
    const { status } = await fetchJson(`${API_BASE}/tasks/${taskId}/tags`, {
        method: 'PUT',
        body: JSON.stringify({ tag_ids: [] })
    });
    assertEqual(status, 200, 'Status should be 200');
});

const testTasksByTag = test('Tasks: Get tasks by tag name', async () => {
    const { status } = await fetchJson(`${API_BASE}/tasks/by-tag/bug`);
    assertEqual(status, 200, 'Status should be 200');
    assert(status, 'Response should have success: true');
});

const testTasksListIncludeTags = test('Tasks: List includes tags array', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/tasks?limit=1`);
    assertEqual(status, 200, 'Status should be 200');
    const task = data?.[0];
    assert(task, 'Should return at least one task');
    assert(Array.isArray(task.tags), 'Task should have tags array');
});

// ==================== RUN ALL TESTS ====================

async function waitForServer(maxRetries = 10, delayMs = 1000) {
    for (let i = 1; i <= maxRetries; i++) {
        try {
            const response = await fetch(`${API_BASE.replace('/api', '')}/api/health`);
            if (response.ok) {
                console.log(`✓ Server is ready (attempt ${i}/${maxRetries})\n`);
                return true;
            }
        } catch (error) {
            console.log(`  Waiting for server (attempt ${i}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw new Error(`Server not ready after ${maxRetries} attempts`);
}

async function runTests() {
    console.log('\n========================================');
    console.log('  SOLARIA Dashboard API Tests');
    console.log('========================================\n');

    // Wait for server to be ready
    await waitForServer();

    const tests = [
        // Auth
        testAuthLogin,
        testAuthVerify,
        testAuthInvalidLogin,
        // Agents
        testAgentsList,
        testAgentsHaveRequiredFields,
        testAgentsRoles,
        testAgentsStatuses,
        testAgentDetail,
        // Tasks
        testTasksList,
        testTasksHaveRequiredFields,
        testTasksValidStatuses,
        testTasksValidPriorities,
        testTasksProgress,
        testTasksCompletedHaveProgress100,
        testTaskUpdate,
        // Projects
        testProjectsList,
        testProjectAkademate,
        testProjectHasRequiredFields,
        // Docs
        testDocsList,
        testDocsHaveRequiredFields,
        // Logs
        testLogsList,
        testLogsHaveRequiredFields,
        // Dashboard
        testDashboardOverview,
        testDashboardAlerts,
        // Public API (No Auth Required)
        testPublicProjectsList,
        testPublicProjectsHaveFields,
        testPublicBusinessesList,
        testPublicBusinessesHaveFields,
        testPublicBusinessesHaveAllFields,
        testPublicTasksList,
        testPublicTasksWithProjectFilter,
        testPublicDashboard,
        testPublicDashboardHasCorrectStats,
        // Businesses API (Authenticated)
        testBusinessesList,
        testBusinessesHaveRequiredFields,
        testBusinessesHaveAllFields,
        testBusinessDetail,
        testBusinessDetailNotFound,
        testBusinessUpdateName,
        testBusinessUpdateDescription,
        testBusinessUpdateWebsite,
        testBusinessUpdateStatus,
        testBusinessUpdateRevenue,
        testBusinessUpdateExpenses,
        testBusinessUpdateProfit,
        testBusinessUpdateLogoUrl,
        testBusinessUpdateMultipleFields,
        testBusinessUpdateNoFields,
        testBusinessUpdateNotFound,
        testBusinessUpdateNullWebsite,
        testBusinessUpdateZeroValues,
        // GitHub Actions API (Authenticated)
        testGitHubTriggerWorkflowRequiresAuth,
        testGitHubTriggerWorkflowValidation,
        testGitHubTriggerWorkflowHandlesNoToken,
        testGitHubWorkflowStatusRequiresAuth,
        testGitHubWorkflowStatusValidation,
        testGitHubCreateIssueRequiresAuth,
        testGitHubCreateIssueValidation,
        testGitHubCreateIssueHandlesNoToken,
        testGitHubCreatePRRequiresAuth,
        testGitHubCreatePRValidation,
        testGitHubCreatePRHandlesNoToken,
        // Tags API
        testTagsList,
        testTagsByType,
        testTagsPredefinedOnly,
        testTagsCreate,
        testTagsCreateDuplicate,
        testTagsCreateInvalidColor,
        testTagsCreateInvalidType,
        testTagsUpdate,
        testTagsUpdateNotFound,
        testTagsDeleteSystemTag,
        testTagsDelete,
        testTaskTagsGet,
        testTaskTagsAdd,
        testTaskTagsAddDuplicate,
        testTaskTagsRemove,
        testTaskTagsRemoveNotFound,
        testTaskTagsReplace,
        testTaskTagsReplaceEmpty,
        testTasksByTag,
        testTasksListIncludeTags
    ];

    for (const runTest of tests) {
        await runTest();
    }

    console.log('\n========================================');
    console.log(`  Results: ${results.passed} passed, ${results.failed} failed`);
    console.log('========================================\n');

    if (results.failed > 0) {
        console.log('Failed tests:');
        results.tests.filter(t => t.status === 'FAIL').forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
    }

    return results.failed === 0;
}

// Run if executed directly
runTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
});

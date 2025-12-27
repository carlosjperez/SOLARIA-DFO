/**
 * SOLARIA Dashboard Public API Tests
 * Tests for public endpoints and authenticated dashboard endpoints
 *
 * Run with: node tests/public-api.test.js
 *
 * Endpoints tested:
 * - GET /api/public/projects
 * - GET /api/public/businesses
 * - GET /api/public/tasks
 * - GET /api/public/dashboard
 * - GET /api/dashboard/overview (auth)
 * - GET /api/dashboard/metrics (auth)
 * - GET /api/dashboard/alerts (auth)
 * - GET /api/docs (auth)
 */

const API_BASE = process.env.API_BASE || 'https://dfo.solaria.agency/api';
const TEST_USER = { userId: 'carlosjperez', password: 'bypass' };

let authToken = null;

// Test helper functions
async function fetchJson(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    return { status: response.status, data };
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

function assertGreaterOrEqual(actual, expected, message) {
    if (actual < expected) {
        throw new Error(`${message}: expected >= ${expected}, got ${actual}`);
    }
}

function assertType(value, type, message) {
    if (typeof value !== type) {
        throw new Error(`${message}: expected type ${type}, got ${typeof value}`);
    }
}

function assertHasKeys(obj, keys, context) {
    for (const key of keys) {
        if (!(key in obj)) {
            throw new Error(`${context}: missing key '${key}'`);
        }
    }
}

// ==================== PUBLIC PROJECTS TESTS ====================

const testPublicProjects = test('Public: GET /api/public/projects returns projects', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/projects`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.projects, 'Response should have projects array');
    assert(Array.isArray(data.projects), 'projects should be an array');
    assertType(data.count, 'number', 'count should be a number');
});

const testPublicProjectsFields = test('Public: Projects have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/projects`);
    if (data.projects.length > 0) {
        const project = data.projects[0];
        assertHasKeys(project, ['id', 'name', 'status', 'priority'], 'Project');
    }
});

const testPublicProjectsFilter = test('Public: Projects can be filtered by status', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/projects?status=active`);
    assertEqual(status, 200, 'Status should be 200');
    // All returned projects should have status 'active' or empty if none match
    for (const p of data.projects) {
        assertEqual(p.status, 'active', 'Filtered project status');
    }
});

const testPublicProjectsLimit = test('Public: Projects respect limit parameter', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/projects?limit=2`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.projects.length <= 2, 'Should return at most 2 projects');
});

// ==================== PUBLIC BUSINESSES TESTS ====================

const testPublicBusinesses = test('Public: GET /api/public/businesses returns businesses', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/businesses`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.businesses, 'Response should have businesses array');
    assert(Array.isArray(data.businesses), 'businesses should be an array');
    assertType(data.count, 'number', 'count should be a number');
});

const testPublicBusinessesFields = test('Public: Businesses have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/businesses`);
    if (data.businesses.length > 0) {
        const business = data.businesses[0];
        assertHasKeys(business, ['id', 'name', 'status'], 'Business');
    }
});

// ==================== PUBLIC TASKS TESTS ====================

const testPublicTasks = test('Public: GET /api/public/tasks returns tasks', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/tasks`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.tasks, 'Response should have tasks array');
    assert(Array.isArray(data.tasks), 'tasks should be an array');
    assertType(data.count, 'number', 'count should be a number');
});

const testPublicTasksFields = test('Public: Tasks have required fields', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/tasks?limit=5`);
    if (data.tasks.length > 0) {
        const task = data.tasks[0];
        assertHasKeys(task, ['id', 'title', 'status', 'priority'], 'Task');
    }
});

const testPublicTasksHaveTaskCode = test('Public: Tasks have computed task_code', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/tasks?limit=5`);
    if (data.tasks.length > 0) {
        const task = data.tasks[0];
        assert(task.task_code, 'Task should have task_code');
        assert(task.task_code.includes('-'), 'task_code should contain separator');
    }
});

const testPublicTasksFilterByStatus = test('Public: Tasks can be filtered by status', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/tasks?status=completed&limit=10`);
    assertEqual(status, 200, 'Status should be 200');
    for (const t of data.tasks) {
        assertEqual(t.status, 'completed', 'Filtered task status');
    }
});

const testPublicTasksFilterByPriority = test('Public: Tasks can be filtered by priority', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/tasks?priority=critical&limit=10`);
    assertEqual(status, 200, 'Status should be 200');
    for (const t of data.tasks) {
        assertEqual(t.priority, 'critical', 'Filtered task priority');
    }
});

// ==================== PUBLIC DASHBOARD TESTS ====================

const testPublicDashboard = test('Public: GET /api/public/dashboard returns stats', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/public/dashboard`);
    assertEqual(status, 200, 'Status should be 200');
    assertHasKeys(data, ['projects', 'tasks', 'agents', 'memories', 'activity', 'generated_at'], 'Dashboard');
});

const testPublicDashboardProjectStats = test('Public: Dashboard has project stats', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/dashboard`);
    assertHasKeys(data.projects, ['total', 'active', 'completed'], 'Project stats');
    assertGreaterOrEqual(parseInt(data.projects.total), 0, 'Total projects');
});

const testPublicDashboardTaskStats = test('Public: Dashboard has task stats', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/dashboard`);
    assertHasKeys(data.tasks, ['total', 'pending', 'in_progress', 'completed'], 'Task stats');
    assertGreaterOrEqual(parseInt(data.tasks.total), 0, 'Total tasks');
});

const testPublicDashboardAgentStats = test('Public: Dashboard has agent stats', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/dashboard`);
    assertHasKeys(data.agents, ['total', 'active'], 'Agent stats');
    assertGreaterOrEqual(parseInt(data.agents.total), 0, 'Total agents');
});

const testPublicDashboardMemoryStats = test('Public: Dashboard has memory stats', async () => {
    const { data } = await fetchJson(`${API_BASE}/public/dashboard`);
    assertHasKeys(data.memories, ['total', 'avg_importance'], 'Memory stats');
});

// ==================== AUTH SETUP ====================

const testAuthLogin = test('Auth: Login for dashboard tests', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(TEST_USER)
    });
    assertEqual(status, 200, 'Login should succeed');
    assert(data.token, 'Should receive token');
    authToken = data.token;
});

// ==================== DASHBOARD OVERVIEW TESTS ====================

const testDashboardOverview = test('Dashboard: GET /api/dashboard/overview returns overview', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/dashboard/overview`);
    assertEqual(status, 200, 'Status should be 200');
    assertHasKeys(data, ['activeProjects', 'todayTasks', 'agents', 'stats', 'generated_at'], 'Overview');
});

const testDashboardOverviewStats = test('Dashboard: Overview has quick stats', async () => {
    const { data } = await fetchJson(`${API_BASE}/dashboard/overview`);
    assertHasKeys(data.stats, ['active_projects', 'tasks_in_progress', 'critical_tasks'], 'Quick stats');
});

const testDashboardOverviewAgents = test('Dashboard: Overview has agent list', async () => {
    const { data } = await fetchJson(`${API_BASE}/dashboard/overview`);
    assert(Array.isArray(data.agents), 'agents should be an array');
});

// ==================== DASHBOARD METRICS TESTS ====================

const testDashboardMetrics = test('Dashboard: GET /api/dashboard/metrics returns metrics', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/dashboard/metrics`);
    assertEqual(status, 200, 'Status should be 200');
    assertHasKeys(data, ['velocity', 'projectRates', 'priorityDistribution', 'epicProgress', 'generated_at'], 'Metrics');
});

const testDashboardMetricsVelocity = test('Dashboard: Metrics has velocity data', async () => {
    const { data } = await fetchJson(`${API_BASE}/dashboard/metrics`);
    assert(Array.isArray(data.velocity), 'velocity should be an array');
});

const testDashboardMetricsPriorityDist = test('Dashboard: Metrics has priority distribution', async () => {
    const { data } = await fetchJson(`${API_BASE}/dashboard/metrics`);
    assert(Array.isArray(data.priorityDistribution), 'priorityDistribution should be an array');
});

// ==================== DASHBOARD ALERTS TESTS ====================

const testDashboardAlerts = test('Dashboard: GET /api/dashboard/alerts returns alerts', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/dashboard/alerts`);
    assertEqual(status, 200, 'Status should be 200');
    assertHasKeys(data, ['overdueTasks', 'blockedTasks', 'staleTasks', 'upcomingDeadlines', 'criticalTasks', 'summary', 'generated_at'], 'Alerts');
});

const testDashboardAlertsSummary = test('Dashboard: Alerts has summary counts', async () => {
    const { data } = await fetchJson(`${API_BASE}/dashboard/alerts`);
    assertHasKeys(data.summary, ['overdue_count', 'blocked_count', 'stale_count', 'critical_count'], 'Alert summary');
});

const testDashboardAlertsArrays = test('Dashboard: Alert categories are arrays', async () => {
    const { data } = await fetchJson(`${API_BASE}/dashboard/alerts`);
    assert(Array.isArray(data.overdueTasks), 'overdueTasks should be an array');
    assert(Array.isArray(data.blockedTasks), 'blockedTasks should be an array');
    assert(Array.isArray(data.staleTasks), 'staleTasks should be an array');
    assert(Array.isArray(data.criticalTasks), 'criticalTasks should be an array');
});

// ==================== DOCS TESTS ====================

const testDocs = test('Dashboard: GET /api/docs returns documents', async () => {
    const { status, data } = await fetchJson(`${API_BASE}/docs`);
    assertEqual(status, 200, 'Status should be 200');
    assert(data.docs !== undefined, 'Response should have docs');
    assertType(data.count, 'number', 'count should be a number');
});

// ==================== UNAUTHORIZED ACCESS TESTS ====================

const testDashboardOverviewNoAuth = test('Security: Dashboard overview requires auth', async () => {
    const savedToken = authToken;
    authToken = null;
    const { status } = await fetchJson(`${API_BASE}/dashboard/overview`);
    authToken = savedToken;
    assertEqual(status, 401, 'Should return 401 without auth');
});

const testDashboardMetricsNoAuth = test('Security: Dashboard metrics requires auth', async () => {
    const savedToken = authToken;
    authToken = null;
    const { status } = await fetchJson(`${API_BASE}/dashboard/metrics`);
    authToken = savedToken;
    assertEqual(status, 401, 'Should return 401 without auth');
});

const testDashboardAlertsNoAuth = test('Security: Dashboard alerts requires auth', async () => {
    const savedToken = authToken;
    authToken = null;
    const { status } = await fetchJson(`${API_BASE}/dashboard/alerts`);
    authToken = savedToken;
    assertEqual(status, 401, 'Should return 401 without auth');
});

// ==================== RUN TESTS ====================

async function runTests() {
    console.log('\n🧪 SOLARIA DFO Public API Tests\n');
    console.log(`📍 Testing against: ${API_BASE}\n`);
    console.log('─'.repeat(60) + '\n');

    // Public endpoint tests (no auth required)
    console.log('📂 Public Endpoints\n');
    await testPublicProjects();
    await testPublicProjectsFields();
    await testPublicProjectsFilter();
    await testPublicProjectsLimit();
    await testPublicBusinesses();
    await testPublicBusinessesFields();
    await testPublicTasks();
    await testPublicTasksFields();
    await testPublicTasksHaveTaskCode();
    await testPublicTasksFilterByStatus();
    await testPublicTasksFilterByPriority();
    await testPublicDashboard();
    await testPublicDashboardProjectStats();
    await testPublicDashboardTaskStats();
    await testPublicDashboardAgentStats();
    await testPublicDashboardMemoryStats();

    console.log('\n' + '─'.repeat(60) + '\n');

    // Authenticate for protected endpoints
    console.log('🔐 Authentication\n');
    await testAuthLogin();

    console.log('\n' + '─'.repeat(60) + '\n');

    // Protected dashboard endpoints
    console.log('📊 Dashboard Endpoints (Authenticated)\n');
    await testDashboardOverview();
    await testDashboardOverviewStats();
    await testDashboardOverviewAgents();
    await testDashboardMetrics();
    await testDashboardMetricsVelocity();
    await testDashboardMetricsPriorityDist();
    await testDashboardAlerts();
    await testDashboardAlertsSummary();
    await testDashboardAlertsArrays();
    await testDocs();

    console.log('\n' + '─'.repeat(60) + '\n');

    // Security tests
    console.log('🔒 Security Tests\n');
    await testDashboardOverviewNoAuth();
    await testDashboardMetricsNoAuth();
    await testDashboardAlertsNoAuth();

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n📊 TEST SUMMARY\n');
    console.log(`   Total:  ${results.passed + results.failed}`);
    console.log(`   Passed: ${results.passed} ✅`);
    console.log(`   Failed: ${results.failed} ❌`);
    console.log(`   Rate:   ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    console.log('\n' + '═'.repeat(60) + '\n');

    if (results.failed > 0) {
        console.log('❌ Failed Tests:\n');
        results.tests.filter(t => t.status === 'FAIL').forEach(t => {
            console.log(`   • ${t.name}`);
            console.log(`     ${t.error}\n`);
        });
    }

    process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(err => {
    console.error('Test runner error:', err);
    process.exit(1);
});

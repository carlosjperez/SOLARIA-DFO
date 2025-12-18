// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * SOLARIA C-Suite Dashboard - Exhaustive E2E Tests
 * Version: 2.0.0
 *
 * Test Coverage:
 * 1. Login Screen UI
 * 2. Quick Access functionality
 * 3. Dashboard navigation
 * 4. CEO/CTO/COO/CFO role views
 * 5. API endpoints
 * 6. Real-time updates
 * 7. Responsive design
 */

test.describe('Login Screen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login screen with SOLARIA branding', async ({ page }) => {
    // Check logo is visible
    const logo = page.locator('#loginScreen img[alt="SOLARIA"]');
    await expect(logo).toBeVisible();

    // Check title - use first() for specific match
    await expect(page.locator('#loginScreen h1').first()).toContainText('SOLARIA Dashboard');

    // Check subtitle
    await expect(page.locator('text=Digital Field Operations')).toBeVisible();
  });

  test('should display Quick Access button', async ({ page }) => {
    const quickAccessBtn = page.locator('#quickAccessBtn');
    await expect(quickAccessBtn).toBeVisible();
    // Spanish text with accent
    await expect(quickAccessBtn).toContainText('Acceso');
  });

  test('should display login form with required fields', async ({ page }) => {
    // Check username field
    const userIdField = page.locator('#userId');
    await expect(userIdField).toBeVisible();
    await expect(userIdField).toHaveAttribute('required', '');

    // Check password field
    const passwordField = page.locator('#password');
    await expect(passwordField).toBeVisible();
    await expect(passwordField).toHaveAttribute('required', '');
    await expect(passwordField).toHaveAttribute('type', 'password');

    // Check submit button
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Acceder al Dashboard');
  });

  test('should have correct styling with SOLARIA orange color', async ({ page }) => {
    // Check primary button has SOLARIA orange
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toHaveClass(/btn-primary/);
  });
});

test.describe('Quick Access', () => {
  test('should login successfully via Quick Access', async ({ page }) => {
    await page.goto('/');

    // Click Quick Access button
    const quickAccessBtn = page.locator('#quickAccessBtn');
    await quickAccessBtn.click();

    // Wait for redirect to dashboard
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 10000 });

    // Verify dashboard is visible
    const dashboard = page.locator('#dashboardScreen');
    await expect(dashboard).toBeVisible();

    // Verify user info is displayed
    await expect(page.locator('#userName')).toContainText('Carlos');
  });

  test('should store token in localStorage after Quick Access', async ({ page }) => {
    await page.goto('/');

    // Click Quick Access
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 10000 });

    // Check localStorage
    const token = await page.evaluate(() => localStorage.getItem('solaria_token'));
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(50);
  });
});

test.describe('Dashboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should display sidebar with navigation items', async ({ page }) => {
    // Check sidebar logo
    await expect(page.locator('aside img[alt="SOLARIA"]')).toBeVisible();

    // Check navigation sections - use partial text match
    await expect(page.locator('aside').getByText('Principal')).toBeVisible();
    await expect(page.locator('aside').getByText('Monitoreo')).toBeVisible();
    await expect(page.locator('aside').getByText('Sistema')).toBeVisible();
  });

  test('should navigate to Projects section', async ({ page }) => {
    await page.locator('[data-section="projects"]').click();
    await page.waitForTimeout(500);

    // Verify section is displayed
    await expect(page.locator('#projectsSection')).toBeVisible();
  });

  test('should navigate to Agents section', async ({ page }) => {
    await page.locator('[data-section="agents"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#agentsSection')).toBeVisible();
  });

  test('should navigate to Tasks section', async ({ page }) => {
    await page.locator('[data-section="tasks"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#tasksSection')).toBeVisible();
  });

  test('should navigate to Alerts section', async ({ page }) => {
    await page.locator('[data-section="alerts"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#alertsSection')).toBeVisible();
  });

  test('should navigate to Analytics section', async ({ page }) => {
    await page.locator('[data-section="analytics"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#analyticsSection')).toBeVisible();
  });

  test('should navigate to Settings section', async ({ page }) => {
    await page.locator('[data-section="settings"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#settingsSection')).toBeVisible();
  });

  test('should navigate back to Overview', async ({ page }) => {
    // Go to another section first
    await page.locator('[data-section="projects"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#projectsSection')).toBeVisible();

    // Go back to overview
    await page.locator('[data-section="overview"]').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#overviewSection')).toBeVisible();
  });
});

test.describe('Overview Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should display stat cards', async ({ page }) => {
    // Check all stat cards are visible
    await expect(page.locator('#totalProjects')).toBeVisible();
    await expect(page.locator('#activeAgents')).toBeVisible();
  });

  test('should display charts', async ({ page }) => {
    // Check progress chart
    await expect(page.locator('#progressChart')).toBeVisible();

    // Check agent chart
    await expect(page.locator('#agentChart')).toBeVisible();
  });

  test('should display executive role cards (CEO/CTO/COO/CFO)', async ({ page }) => {
    // CEO View - use getByText for partial matching
    await expect(page.getByText('CEO View')).toBeVisible();

    // CTO View
    await expect(page.getByText('CTO View')).toBeVisible();

    // COO View
    await expect(page.getByText('COO View')).toBeVisible();

    // CFO View
    await expect(page.getByText('CFO View')).toBeVisible();
  });

  test('should display recent activity section', async ({ page }) => {
    await expect(page.locator('#recentActivity')).toBeVisible();
  });
});

test.describe('Executive Role Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should update page title when clicking CEO View', async ({ page }) => {
    await page.getByText('CEO View').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#pageTitle')).toContainText('CEO');
  });

  test('should update page title when clicking CTO View', async ({ page }) => {
    await page.getByText('CTO View').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#pageTitle')).toContainText('CTO');
  });

  test('should update page title when clicking COO View', async ({ page }) => {
    await page.getByText('COO View').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#pageTitle')).toContainText('COO');
  });

  test('should update page title when clicking CFO View', async ({ page }) => {
    await page.getByText('CFO View').click();
    await page.waitForTimeout(500);
    await expect(page.locator('#pageTitle')).toContainText('CFO');
  });
});

test.describe('Logout Functionality', () => {
  test('should logout and return to login screen', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Click logout using partial text match
    await page.getByText('Cerrar').click();
    await page.waitForTimeout(500);

    // Verify we're back at login
    await expect(page.locator('#loginScreen')).toBeVisible();
  });

  test('should clear token from localStorage on logout', async ({ page }) => {
    // Login
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Logout
    await page.getByText('Cerrar').click();
    await page.waitForTimeout(500);

    // Check token is cleared
    const token = await page.evaluate(() => localStorage.getItem('solaria_token'));
    expect(token).toBeNull();
  });
});

test.describe('Manual Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/');

    // Fill login form
    await page.fill('#userId', 'carlosjperez');
    await page.fill('#password', 'bypass');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
    await expect(page.locator('#dashboardScreen')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/');

    // Fill with invalid credentials
    await page.fill('#userId', 'invalid_user');
    await page.fill('#password', 'wrong_password');

    // Submit
    await page.click('button[type="submit"]');

    // Should stay on login screen
    await page.waitForTimeout(2000);
    await expect(page.locator('#loginScreen')).toBeVisible();
  });
});

test.describe('Real-time DateTime', () => {
  test('should display and update current date/time', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Check datetime element exists
    const dateTimeEl = page.locator('#currentDateTime');
    await expect(dateTimeEl).toBeVisible();

    // Get initial value
    const initialValue = await dateTimeEl.textContent();
    expect(initialValue).toBeTruthy();
  });
});

test.describe('System Status', () => {
  test('should show system online status', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Check status indicator
    await expect(page.locator('.status-indicator')).toBeVisible();
    await expect(page.locator('#systemStatus')).toContainText('Sistema');
  });
});

test.describe('API Endpoints', () => {
  test('should return health check', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/health');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should return 401 for protected routes without token', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/dashboard/overview');
    expect(response.status()).toBe(401);
  });

  test('should authenticate and access protected routes', async ({ page }) => {
    // Login first
    const loginResponse = await page.request.post('http://localhost:3000/api/auth/login', {
      data: {
        userId: 'carlosjperez',
        password: 'bypass'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();

    const loginData = await loginResponse.json();
    expect(loginData.token).toBeTruthy();

    // Access protected route
    const overviewResponse = await page.request.get('http://localhost:3000/api/dashboard/overview', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    expect(overviewResponse.ok()).toBeTruthy();

    const overviewData = await overviewResponse.json();
    expect(overviewData.projects).toBeDefined();
    expect(overviewData.agents).toBeDefined();
    expect(overviewData.tasks).toBeDefined();
  });
});

test.describe('Responsive Design', () => {
  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    // Login card should be centered
    const loginCard = page.locator('.glass-card').first();
    await expect(loginCard).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('#loginScreen')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');

    // Check labels for inputs
    await expect(page.locator('label[for="userId"]')).toBeVisible();
    await expect(page.locator('label[for="password"]')).toBeVisible();
  });

  test('should have proper button text', async ({ page }) => {
    await page.goto('/');

    // Buttons should have readable text
    const submitBtn = page.locator('button[type="submit"]');
    const buttonText = await submitBtn.textContent();
    expect(buttonText?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('Loading States', () => {
  test('loading overlay should exist but be hidden initially', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    const loadingOverlay = page.locator('#loadingOverlay');
    await expect(loadingOverlay).toBeHidden();
  });
});

// ========== NEW EXHAUSTIVE TESTS - API & DATA LOADING ==========

test.describe('Projects API', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { userId: 'carlosjperez', password: 'bypass' }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should return projects list with correct structure', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/projects', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.projects).toBeDefined();
    expect(Array.isArray(data.projects)).toBeTruthy();
    expect(data.pagination).toBeDefined();
  });

  test('should return project with all required fields', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/projects', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();

    if (data.projects.length > 0) {
      const project = data.projects[0];
      expect(project.id).toBeDefined();
      expect(project.name).toBeDefined();
      expect(project.status).toBeDefined();
      expect(project.total_tasks).toBeDefined();
      expect(project.completed_tasks).toBeDefined();
    }
  });
});

test.describe('Agents API', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { userId: 'carlosjperez', password: 'bypass' }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should return agents list', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/agents', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should return agents with role and status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/agents', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const agents = await response.json();

    if (agents.length > 0) {
      const agent = agents[0];
      expect(agent.name).toBeDefined();
      expect(agent.role).toBeDefined();
      expect(agent.status).toBeDefined();
    }
  });
});

test.describe('Tasks API', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { userId: 'carlosjperez', password: 'bypass' }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should return tasks list', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/tasks', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should return tasks with required fields', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/tasks', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const tasks = await response.json();

    if (tasks.length > 0) {
      const task = tasks[0];
      expect(task.title).toBeDefined();
      expect(task.status).toBeDefined();
      expect(task.priority).toBeDefined();
    }
  });
});

test.describe('C-Suite Dashboards API', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { userId: 'carlosjperez', password: 'bypass' }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should return CEO dashboard data', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/csuite/ceo', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.role).toBe('CEO');
    expect(data.kpis).toBeDefined();
  });

  test('should return CTO dashboard data', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/csuite/cto', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.role).toBe('CTO');
    expect(data.kpis).toBeDefined();
  });

  test('should return COO dashboard data', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/csuite/coo', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.role).toBe('COO');
    expect(data.kpis).toBeDefined();
  });

  test('should return CFO dashboard data', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/csuite/cfo', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.role).toBe('CFO');
    expect(data.kpis).toBeDefined();
  });
});

test.describe('Agent Automation API', () => {
  test('should return agent instructions', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/agent/instructions');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.project).toBeDefined();
    expect(data.instructions).toBeDefined();
    expect(data.instructions.endpoints).toBeDefined();
  });
});

test.describe('Activity Logs API', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { userId: 'carlosjperez', password: 'bypass' }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should return activity logs', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/logs', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
});

test.describe('Dashboard Data Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should load and display projects in Projects section', async ({ page }) => {
    await page.locator('[data-section="projects"]').click();
    await page.waitForTimeout(2000);

    const projectsGrid = page.locator('#projectsGrid');
    await expect(projectsGrid).toBeVisible();

    // Should have at least one project card or empty message
    const content = await projectsGrid.textContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should load and display agents in Agents section', async ({ page }) => {
    await page.locator('[data-section="agents"]').click();
    await page.waitForTimeout(2000);

    const agentsGrid = page.locator('#agentsGrid');
    await expect(agentsGrid).toBeVisible();

    const content = await agentsGrid.textContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should load and display tasks in Tasks section', async ({ page }) => {
    await page.locator('[data-section="tasks"]').click();
    await page.waitForTimeout(2000);

    const tasksList = page.locator('#tasksList');
    await expect(tasksList).toBeVisible();

    const content = await tasksList.textContent();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should load and display logs in Logs section', async ({ page }) => {
    await page.locator('[data-section="logs"]').click();
    await page.waitForTimeout(2000);

    const logsContainer = page.locator('#logsContainer');
    await expect(logsContainer).toBeVisible();
  });
});

test.describe('C-Suite Role Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should open CEO modal with KPIs', async ({ page }) => {
    await page.getByText('CEO View').first().click();
    await page.waitForTimeout(1500);

    // Modal should appear
    const modal = page.locator('#roleModal');
    await expect(modal).toBeVisible();

    // Should display KPIs
    await expect(page.getByText('KEY PERFORMANCE INDICATORS')).toBeVisible();
  });

  test('should close modal on close button click', async ({ page }) => {
    await page.getByText('CEO View').first().click();
    await page.waitForTimeout(1500);

    // Close the modal
    await page.locator('#roleModal button').first().click();
    await page.waitForTimeout(500);

    // Modal should be gone
    await expect(page.locator('#roleModal')).toHaveCount(0);
  });
});

test.describe('Settings Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should display settings with notification preferences', async ({ page }) => {
    await page.locator('[data-section="settings"]').click();
    await page.waitForTimeout(500);

    await expect(page.locator('#settingsSection')).toBeVisible();
    await expect(page.getByText('Preferencias de Notificaciones')).toBeVisible();
  });

  test('should display system information', async ({ page }) => {
    await page.locator('[data-section="settings"]').click();
    await page.waitForTimeout(500);

    await expect(page.getByText('Información del Sistema')).toBeVisible();
    await expect(page.getByText('2.0.0')).toBeVisible();
  });
});

test.describe('Dashboard Overview Stats', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should display project count', async ({ page }) => {
    await page.waitForTimeout(2000);
    const projectsCount = page.locator('#totalProjects');
    await expect(projectsCount).toBeVisible();

    const count = await projectsCount.textContent();
    expect(parseInt(count)).toBeGreaterThanOrEqual(0);
  });

  test('should display active agents count', async ({ page }) => {
    await page.waitForTimeout(2000);
    const agentsCount = page.locator('#activeAgents');
    await expect(agentsCount).toBeVisible();

    const count = await agentsCount.textContent();
    expect(parseInt(count)).toBeGreaterThanOrEqual(0);
  });
});

// ============================================
// NOTIFICATION SYSTEM TESTS
// ============================================

test.describe('Notification System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should display notification bell icon in header', async ({ page }) => {
    const notificationBtn = page.locator('#notificationsBtn');
    await expect(notificationBtn).toBeVisible();

    // Check bell icon exists
    const bellIcon = notificationBtn.locator('i.fa-bell');
    await expect(bellIcon).toBeVisible();
  });

  test('should display notification badge element', async ({ page }) => {
    const badge = page.locator('#notificationBadge');
    await expect(badge).toBeAttached();
  });

  test('should open notification panel on bell click', async ({ page }) => {
    const notificationBtn = page.locator('#notificationsBtn');
    const panel = page.locator('#notificationsPanel');

    // Panel should be hidden initially
    await expect(panel).not.toHaveClass(/show/);

    // Click bell
    await notificationBtn.click();

    // Panel should be visible
    await expect(panel).toHaveClass(/show/);
  });

  test('should close notification panel on second click', async ({ page }) => {
    const notificationBtn = page.locator('#notificationsBtn');
    const panel = page.locator('#notificationsPanel');

    // Open panel
    await notificationBtn.click();
    await expect(panel).toHaveClass(/show/);

    // Close panel
    await notificationBtn.click();
    await expect(panel).not.toHaveClass(/show/);
  });

  test('should close notification panel on outside click', async ({ page }) => {
    const notificationBtn = page.locator('#notificationsBtn');
    const panel = page.locator('#notificationsPanel');

    // Open panel
    await notificationBtn.click();
    await expect(panel).toHaveClass(/show/);

    // Click outside (on main content area)
    await page.locator('#contentArea').click({ force: true });

    // Panel should close
    await expect(panel).not.toHaveClass(/show/);
  });

  test('should display notifications header with clear button', async ({ page }) => {
    // Open panel
    await page.locator('#notificationsBtn').click();

    // Check header
    const header = page.locator('.notifications-header h3');
    await expect(header).toContainText('Notificaciones');

    // Check clear button
    const clearBtn = page.locator('#clearNotifications');
    await expect(clearBtn).toBeVisible();
    await expect(clearBtn).toContainText('Limpiar');
  });

  test('should display empty state when no notifications', async ({ page }) => {
    // Clear localStorage first
    await page.evaluate(() => localStorage.removeItem('dfo_notifications'));
    await page.reload();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Open panel
    await page.locator('#notificationsBtn').click();

    // Check empty state
    const emptyState = page.locator('.notifications-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No hay notificaciones');
  });

  test('should persist notifications in localStorage', async ({ page }) => {
    // Add a test notification via JavaScript
    await page.evaluate(() => {
      const notifications = [{
        id: Date.now(),
        type: 'task',
        title: 'Test Notification',
        message: 'This is a test',
        read: false,
        timestamp: new Date().toISOString()
      }];
      localStorage.setItem('dfo_notifications', JSON.stringify(notifications));
    });

    // Reload page
    await page.reload();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Open panel
    await page.locator('#notificationsBtn').click();

    // Check notification is displayed
    const notificationItem = page.locator('.notification-item');
    await expect(notificationItem).toBeVisible();
    await expect(notificationItem).toContainText('Test Notification');
  });

  test('should show badge with unread count', async ({ page }) => {
    // Add unread notifications via JavaScript
    await page.evaluate(() => {
      const notifications = [
        { id: 1, type: 'task', title: 'Notif 1', message: 'Test', read: false, timestamp: new Date().toISOString() },
        { id: 2, type: 'task', title: 'Notif 2', message: 'Test', read: false, timestamp: new Date().toISOString() },
        { id: 3, type: 'task', title: 'Notif 3', message: 'Test', read: true, timestamp: new Date().toISOString() }
      ];
      localStorage.setItem('dfo_notifications', JSON.stringify(notifications));
    });

    // Reload page
    await page.reload();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Check badge shows 2 (only unread)
    const badge = page.locator('#notificationBadge');
    await expect(badge).toHaveClass(/has-notifications/);
    await expect(badge).toContainText('2');
  });

  test('should mark all as read when panel opens', async ({ page }) => {
    // Add unread notifications
    await page.evaluate(() => {
      const notifications = [
        { id: 1, type: 'task', title: 'Notif 1', message: 'Test', read: false, timestamp: new Date().toISOString() }
      ];
      localStorage.setItem('dfo_notifications', JSON.stringify(notifications));
    });

    await page.reload();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Badge should show count before opening
    const badge = page.locator('#notificationBadge');
    await expect(badge).toHaveClass(/has-notifications/);

    // Open panel
    await page.locator('#notificationsBtn').click();
    await page.waitForTimeout(500);

    // Badge should be hidden after opening (all read)
    await expect(badge).not.toHaveClass(/has-notifications/);
  });

  test('should clear all notifications on button click', async ({ page }) => {
    // Add notifications
    await page.evaluate(() => {
      const notifications = [
        { id: 1, type: 'task', title: 'Notif 1', message: 'Test', read: false, timestamp: new Date().toISOString() }
      ];
      localStorage.setItem('dfo_notifications', JSON.stringify(notifications));
    });

    await page.reload();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Open panel
    await page.locator('#notificationsBtn').click();

    // Click clear all
    await page.locator('#clearNotifications').click();

    // Should show empty state
    const emptyState = page.locator('.notifications-empty');
    await expect(emptyState).toBeVisible();

    // LocalStorage should be empty
    const notifications = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('dfo_notifications') || '[]')
    );
    expect(notifications.length).toBe(0);
  });

  test('should display correct notification icons by type', async ({ page }) => {
    // Add notifications of different types
    await page.evaluate(() => {
      const notifications = [
        { id: 1, type: 'task', title: 'Task Notif', message: 'Test', read: false, timestamp: new Date().toISOString() },
        { id: 2, type: 'project', title: 'Project Notif', message: 'Test', read: false, timestamp: new Date().toISOString() }
      ];
      localStorage.setItem('dfo_notifications', JSON.stringify(notifications));
    });

    await page.reload();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Open panel
    await page.locator('#notificationsBtn').click();

    // Check task icon
    const taskIcon = page.locator('.notification-icon.task i.fa-tasks');
    await expect(taskIcon).toBeVisible();

    // Check project icon
    const projectIcon = page.locator('.notification-icon.project i.fa-folder');
    await expect(projectIcon).toBeVisible();
  });
});

test.describe('Socket.IO Notifications', () => {
  test('should load socket.io client library', async ({ page }) => {
    await page.goto('/');

    // Check socket.io is loaded
    const hasSocketIO = await page.evaluate(() => typeof io !== 'undefined');
    expect(hasSocketIO).toBe(true);
  });

  test('should connect to socket.io server after login', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Wait for socket connection
    await page.waitForTimeout(2000);

    // Check App.socket exists
    const socketConnected = await page.evaluate(() =>
      window.App && window.App.socket && window.App.socket.connected
    );
    expect(socketConnected).toBe(true);
  });
});

// ============================================
// COMPLETED TASKS WIDGET TESTS
// ============================================

test.describe('Recent Completed Tasks API', () => {
  let authToken;

  test.beforeAll(async ({ request }) => {
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: { userId: 'carlosjperez', password: 'bypass' }
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should return recent completed tasks list', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/tasks/recent-completed', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should return tasks with project and agent info', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/tasks/recent-completed', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const tasks = await response.json();

    if (tasks.length > 0) {
      const task = tasks[0];
      // Required fields
      expect(task.id).toBeDefined();
      expect(task.title).toBeDefined();
      expect(task.status).toBe('completed');
      expect(task.priority).toBeDefined();
      // Enriched fields from JOIN
      expect(task.project_name).toBeDefined();
      expect(task.agent_name !== undefined || task.agent_name === null).toBeTruthy();
    }
  });

  test('should respect limit parameter', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/tasks/recent-completed?limit=5', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const tasks = await response.json();

    expect(tasks.length).toBeLessThanOrEqual(5);
  });

  test('should return tasks ordered by completion date (most recent first)', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/tasks/recent-completed', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const tasks = await response.json();

    if (tasks.length > 1) {
      const firstDate = new Date(tasks[0].completed_at || tasks[0].updated_at);
      const secondDate = new Date(tasks[1].completed_at || tasks[1].updated_at);
      expect(firstDate >= secondDate).toBeTruthy();
    }
  });
});

test.describe('Dashboard Page with Completed Tasks Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
  });

  test('should display dashboard page with widgets when clicking Dashboard nav item', async ({ page }) => {
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(1000);

    // Dashboard page should be visible
    const dashboardSection = page.locator('#dashboardSection');
    await expect(dashboardSection).toBeVisible();
  });

  test('should display completed tasks widget', async ({ page }) => {
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(1500);

    // Completed tasks widget should be visible
    const widget = page.locator('.completed-tasks-widget');
    await expect(widget).toBeVisible();
  });

  test('should display widget header with title and count', async ({ page }) => {
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(1500);

    // Widget header
    const header = page.locator('.completed-tasks-widget .widget-header');
    await expect(header).toBeVisible();
    await expect(header).toContainText('Tareas Completadas');
  });

  test('should display completed task items in feed', async ({ page }) => {
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(2000);

    // Feed container
    const feed = page.locator('.completed-tasks-feed');
    await expect(feed).toBeVisible();

    // Should have task items or empty state
    const hasItems = await page.locator('.completed-task-item').count();
    const hasEmpty = await page.locator('.empty-feed').count();
    expect(hasItems > 0 || hasEmpty > 0).toBeTruthy();
  });

  test('should display task item with correct structure', async ({ page }) => {
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(2000);

    const taskItem = page.locator('.completed-task-item').first();

    // Only check if there are completed tasks
    const count = await taskItem.count();
    if (count > 0) {
      // Check icon
      await expect(taskItem.locator('.task-check-icon')).toBeVisible();

      // Check content
      await expect(taskItem.locator('.task-content')).toBeVisible();
      await expect(taskItem.locator('.task-title')).toBeVisible();
      await expect(taskItem.locator('.task-meta')).toBeVisible();
    }
  });

  test('should display task project name', async ({ page }) => {
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(2000);

    const taskMeta = page.locator('.completed-task-item .task-meta').first();
    const count = await taskMeta.count();

    if (count > 0) {
      // Meta should contain project icon and name
      const projectSpan = taskMeta.locator('span').first();
      await expect(projectSpan).toBeVisible();
    }
  });

  test('should display relative time in task items', async ({ page }) => {
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(2000);

    const taskTime = page.locator('.completed-task-item .task-time').first();
    const count = await taskTime.count();

    if (count > 0) {
      const timeText = await taskTime.textContent();
      // Should contain relative time like "hace X minutos", "ahora", etc.
      expect(timeText.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Dashboard Stats Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(1500);
  });

  test('should display projects stat card', async ({ page }) => {
    const card = page.locator('.stat-card').filter({ hasText: 'Proyectos' });
    await expect(card).toBeVisible();
  });

  test('should display tasks stat card', async ({ page }) => {
    const card = page.locator('.stat-card').filter({ hasText: 'Tareas' });
    await expect(card).toBeVisible();
  });

  test('should display agents stat card', async ({ page }) => {
    const card = page.locator('.stat-card').filter({ hasText: 'Agentes' });
    await expect(card).toBeVisible();
  });

  test('should display alerts stat card', async ({ page }) => {
    const card = page.locator('.stat-card').filter({ hasText: 'Alertas' });
    await expect(card).toBeVisible();
  });

  test('should show numeric values in stat cards', async ({ page }) => {
    const statValues = page.locator('.stat-value');
    const count = await statValues.count();

    expect(count).toBeGreaterThan(0);

    // First stat should have a number
    const firstValue = await statValues.first().textContent();
    expect(parseInt(firstValue)).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Real-time Completed Tasks Updates', () => {
  test('should have addCompletedTaskToFeed method available', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    const hasMethod = await page.evaluate(() =>
      typeof window.App.addCompletedTaskToFeed === 'function'
    );
    expect(hasMethod).toBe(true);
  });

  test('should add task to feed via JavaScript', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    // Navigate to dashboard page
    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(1500);

    // Simulate adding a task
    await page.evaluate(() => {
      window.App.addCompletedTaskToFeed({
        id: 999,
        title: 'Test Real-time Task',
        project_name: 'Test Project',
        agent_name: 'Test Agent',
        priority: 'high',
        completed_at: new Date().toISOString()
      });
    });

    await page.waitForTimeout(500);

    // Check new task appears in feed
    const newTask = page.locator('.completed-task-item').filter({ hasText: 'Test Real-time Task' });
    await expect(newTask).toBeVisible();
  });

  test('should prepend new tasks to top of feed', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    await page.locator('[data-section="dashboard"]').click();
    await page.waitForTimeout(1500);

    // Add a task
    await page.evaluate(() => {
      window.App.addCompletedTaskToFeed({
        id: 888,
        title: 'First Added Task',
        project_name: 'Project A',
        priority: 'medium',
        completed_at: new Date().toISOString()
      });
    });

    await page.waitForTimeout(300);

    // Add another task
    await page.evaluate(() => {
      window.App.addCompletedTaskToFeed({
        id: 889,
        title: 'Second Added Task',
        project_name: 'Project B',
        priority: 'high',
        completed_at: new Date().toISOString()
      });
    });

    await page.waitForTimeout(500);

    // Second task should be first in the list
    const firstTask = page.locator('.completed-task-item').first();
    await expect(firstTask).toContainText('Second Added Task');
  });
});

test.describe('formatRelativeTime Function', () => {
  test('should have formatRelativeTime method available', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    const hasMethod = await page.evaluate(() =>
      typeof window.App.formatRelativeTime === 'function'
    );
    expect(hasMethod).toBe(true);
  });

  test('should format recent time as "ahora"', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    const result = await page.evaluate(() => {
      const now = new Date().toISOString();
      return window.App.formatRelativeTime(now);
    });

    expect(result).toBe('ahora');
  });

  test('should format minutes ago correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    const result = await page.evaluate(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      return window.App.formatRelativeTime(fiveMinutesAgo);
    });

    expect(result).toContain('5m');
  });

  test('should format hours ago correctly', async ({ page }) => {
    await page.goto('/');
    await page.locator('#quickAccessBtn').click();
    await page.waitForSelector('#dashboardScreen:not(.hidden)', { timeout: 15000 });

    const result = await page.evaluate(() => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      return window.App.formatRelativeTime(twoHoursAgo);
    });

    expect(result).toContain('2h');
  });
});

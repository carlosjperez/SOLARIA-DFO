"use strict";
/**
 * SOLARIA C-Suite Dashboard - Type Tests
 * Validates TypeScript type definitions compile correctly
 *
 * Run with: npx tsc tests/types.test.ts --noEmit
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMiddleware = exports.testHandler = exports.successResponse = exports.paginatedResponse = exports.apiError = exports.serverConfig = exports.connectedClient = exports.socketData = exports.dashboardOverview = exports.alert = exports.memory = exports.agent = exports.taskItem = exports.task = exports.project = exports.userPublic = exports.user = exports.jwtPayload = exports.validRelationships = exports.validLogLevels = exports.validAlertSeverities = exports.validAgentStatuses = exports.validTaskStatuses = exports.validPriorities = exports.validProjectStatuses = exports.validRoles = void 0;
exports.isValidProjectStatus = isValidProjectStatus;
exports.isValidPriority = isValidPriority;
exports.isValidTaskStatus = isValidTaskStatus;
// ============================================================================
// Type Assertion Tests - These verify types compile correctly
// ============================================================================
// Test UserRole enum-like type
const validRoles = ['admin', 'ceo', 'cto', 'coo', 'cfo', 'manager', 'agent', 'viewer'];
exports.validRoles = validRoles;
// Test ProjectStatus
const validProjectStatuses = [
    'planning', 'development', 'testing', 'deployment', 'completed', 'on_hold', 'cancelled'
];
exports.validProjectStatuses = validProjectStatuses;
// Test Priority
const validPriorities = ['critical', 'high', 'medium', 'low'];
exports.validPriorities = validPriorities;
// Test TaskStatus
const validTaskStatuses = ['pending', 'in_progress', 'review', 'completed', 'blocked'];
exports.validTaskStatuses = validTaskStatuses;
// Test AgentStatus
const validAgentStatuses = ['active', 'busy', 'inactive', 'error', 'maintenance'];
exports.validAgentStatuses = validAgentStatuses;
// Test AlertSeverity
const validAlertSeverities = ['critical', 'warning', 'info'];
exports.validAlertSeverities = validAlertSeverities;
// Test LogLevel
const validLogLevels = ['info', 'warning', 'error', 'critical', 'debug'];
exports.validLogLevels = validLogLevels;
// Test RelationshipType
const validRelationships = ['related', 'depends_on', 'contradicts', 'supersedes', 'child_of'];
exports.validRelationships = validRelationships;
// ============================================================================
// Object Shape Tests
// ============================================================================
// Test JWTPayload
const jwtPayload = {
    userId: 1,
    username: 'carlosjperez',
    role: 'cto',
    iat: Date.now(),
    exp: Date.now() + 3600000
};
exports.jwtPayload = jwtPayload;
// Test User
const user = {
    id: 1,
    username: 'carlosjperez',
    name: 'Carlos J. Perez',
    email: 'carlos@solaria.agency',
    role: 'cto',
    password_hash: 'hashed_password',
    is_active: true,
    last_login: new Date(),
    created_at: new Date(),
    updated_at: new Date()
};
exports.user = user;
// Test UserPublic (no sensitive data)
const userPublic = {
    id: 1,
    username: 'carlosjperez',
    name: 'Carlos J. Perez',
    email: 'carlos@solaria.agency',
    role: 'cto'
};
exports.userPublic = userPublic;
// Test Project
const project = {
    id: 1,
    name: 'SOLARIA DFO',
    code: 'DFO',
    description: 'Digital Field Operations',
    client: 'SOLARIA AGENCY',
    status: 'development',
    priority: 'high',
    budget: 100000,
    actual_cost: 25000,
    start_date: new Date(),
    deadline: new Date(),
    completion_percentage: 75,
    repository_url: 'https://github.com/SOLARIA-AGENCY/solaria-dfo',
    website_url: 'https://dfo.solaria.agency',
    tech_stack: 'Node.js, Express, MySQL, TypeScript',
    created_at: new Date(),
    updated_at: new Date()
};
exports.project = project;
// Test Task
const task = {
    id: 1,
    project_id: 1,
    title: 'Migrate server.js to TypeScript',
    description: 'Complete TypeScript migration',
    status: 'in_progress',
    priority: 'high',
    progress: 87,
    task_number: 56,
    assigned_agent_id: 11,
    estimated_hours: 16,
    actual_hours: 8,
    completed_at: null,
    completion_notes: null,
    created_at: new Date(),
    updated_at: new Date()
};
exports.task = task;
// Test TaskItem
const taskItem = {
    id: 1,
    task_id: 1,
    title: 'Create type definitions',
    description: 'Define all TypeScript interfaces',
    sort_order: 0,
    is_completed: true,
    completed_at: new Date(),
    completed_by_agent_id: 11,
    estimated_minutes: 30,
    actual_minutes: 25,
    notes: 'Completed successfully',
    created_at: new Date(),
    updated_at: new Date()
};
exports.taskItem = taskItem;
// Test Agent
const agent = {
    id: 11,
    name: 'Claude Code',
    code: 'CLAUDE-CODE',
    role: 'Developer',
    description: 'AI coding assistant',
    status: 'active',
    capabilities: 'TypeScript, Node.js, React',
    current_task_id: 294,
    tasks_completed: 150,
    average_task_time: 45,
    error_rate: 0.02,
    last_active_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
};
exports.agent = agent;
// Test Memory
const memory = {
    id: 1,
    content: 'Important decision: Use TypeScript for all new code',
    summary: 'TypeScript adoption decision',
    tags: '["decision", "architecture"]',
    metadata: '{"importance": 0.9}',
    importance: 0.9,
    access_count: 5,
    last_accessed_at: new Date(),
    project_id: 1,
    agent_id: 11,
    created_at: new Date(),
    updated_at: new Date()
};
exports.memory = memory;
// Test Alert
const alert = {
    id: 1,
    project_id: 1,
    agent_id: null,
    task_id: 294,
    title: 'Task nearing deadline',
    message: 'DFO-056 is approaching its deadline',
    severity: 'warning',
    status: 'active',
    created_at: new Date(),
    resolved_at: null
};
exports.alert = alert;
// Test DashboardOverview
const dashboardOverview = {
    projects: {
        total_projects: 5,
        completed_projects: 2,
        active_projects: 3,
        planning_projects: 0,
        total_budget: 500000,
        total_actual_cost: 125000
    },
    agents: {
        total_agents: 10,
        active_agents: 8,
        busy_agents: 6,
        error_agents: 0
    },
    tasks: {
        total_tasks: 100,
        completed_tasks: 75,
        in_progress_tasks: 15,
        blocked_tasks: 2
    },
    alerts: {
        total_alerts: 5,
        critical_alerts: 0,
        active_alerts: 3
    },
    timestamp: new Date().toISOString()
};
exports.dashboardOverview = dashboardOverview;
// Test SocketData
const socketData = {
    userId: 1,
    userRole: 'cto'
};
exports.socketData = socketData;
// Test ConnectedClient
const connectedClient = {
    socket_id: 'abc123',
    user: userPublic,
    connected_at: new Date()
};
exports.connectedClient = connectedClient;
// Test ServerConfig
const serverConfig = {
    port: 3030,
    jwtSecret: 'secret',
    repoPath: '/repo',
    db: {
        host: 'localhost',
        user: 'solaria_user',
        password: 'solaria2024',
        database: 'solaria_construction',
        charset: 'utf8mb4',
        timezone: 'Z',
        connectTimeout: 10000,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
};
exports.serverConfig = serverConfig;
// Test API Response types
const apiError = {
    error: 'Not found',
    code: 'NOT_FOUND',
    details: { id: 999 }
};
exports.apiError = apiError;
const paginatedResponse = {
    data: [task],
    pagination: {
        page: 1,
        limit: 20,
        total: 100,
        total_pages: 5
    }
};
exports.paginatedResponse = paginatedResponse;
const successResponse = {
    success: true,
    message: 'Operation completed',
    data: { id: 1 }
};
exports.successResponse = successResponse;
// ============================================================================
// Function Type Tests
// ============================================================================
// Test that handler types accept correct signatures
const testHandler = async (req, res) => {
    const userId = req.user?.userId;
    res.json({ userId });
};
exports.testHandler = testHandler;
const testMiddleware = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
};
exports.testMiddleware = testMiddleware;
// ============================================================================
// Type Guard Tests
// ============================================================================
function isValidProjectStatus(status) {
    return validProjectStatuses.includes(status);
}
function isValidPriority(priority) {
    return validPriorities.includes(priority);
}
function isValidTaskStatus(status) {
    return validTaskStatuses.includes(status);
}
console.log('All type tests passed!');
//# sourceMappingURL=types.test.js.map
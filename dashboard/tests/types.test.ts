/**
 * SOLARIA C-Suite Dashboard - Type Tests
 * Validates TypeScript type definitions compile correctly
 *
 * Run with: npx tsc tests/types.test.ts --noEmit
 */

import type {
    // Express Types
    JWTPayload,
    AuthenticatedRequest,
    ExpressHandler,
    ExpressMiddleware,

    // Database Types
    DatabaseConfig,
    QueryResult,
    ExecuteResult,

    // User Types
    UserRole,
    User,
    UserPublic,
    LoginRequest,
    LoginResponse,
    AuthVerifyResponse,

    // Project Types
    ProjectStatus,
    Priority,
    Project,
    ProjectWithStats,
    CreateProjectRequest,
    UpdateProjectRequest,
    ProjectClient,
    DocumentType,
    ProjectDocument,
    RequestStatus,
    ProjectRequest,

    // Task Types
    TaskStatus,
    Task,
    TaskWithDetails,
    CreateTaskRequest,
    UpdateTaskRequest,
    TaskItem,
    CreateTaskItemRequest,
    UpdateTaskItemRequest,
    TaskTag,
    TaskTagAssignment,

    // Agent Types
    AgentStatus,
    Agent,
    AgentWithStats,
    AgentState,

    // Business Types
    BusinessStatus,
    Business,

    // Memory Types
    RelationshipType,
    Memory,
    MemoryParsed,
    CreateMemoryRequest,
    UpdateMemoryRequest,
    MemoryCrossref,
    MemoryStats,

    // Alert Types
    AlertSeverity,
    AlertStatus,
    Alert,
    AlertWithDetails,

    // Activity Log Types
    LogLevel,
    ActivityLog,
    ActivityLogWithDetails,

    // Dashboard Types
    DashboardOverview,
    ProjectMetrics,
    AgentMetrics,
    CEODashboard,
    CTODashboard,
    COODashboard,
    CFODashboard,

    // Socket.IO Types
    ServerToClientEvents,
    ClientToServerEvents,
    SocketData,
    TypedSocket,
    TypedIOServer,

    // Server Types
    ConnectedClient,
    ServerConfig,

    // Report Types
    ProjectReport,
    AgentReport,
    FinancialReport,

    // API Response Types
    ApiError,
    PaginatedResponse,
    SuccessResponse
} from '../types.js';

// ============================================================================
// Type Assertion Tests - These verify types compile correctly
// ============================================================================

// Test UserRole enum-like type
const validRoles: UserRole[] = ['admin', 'ceo', 'cto', 'coo', 'cfo', 'manager', 'agent', 'viewer'];

// Test ProjectStatus
const validProjectStatuses: ProjectStatus[] = [
    'planning', 'development', 'testing', 'deployment', 'completed', 'on_hold', 'cancelled'
];

// Test Priority
const validPriorities: Priority[] = ['critical', 'high', 'medium', 'low'];

// Test TaskStatus
const validTaskStatuses: TaskStatus[] = ['pending', 'in_progress', 'review', 'completed', 'blocked'];

// Test AgentStatus
const validAgentStatuses: AgentStatus[] = ['active', 'busy', 'inactive', 'error', 'maintenance'];

// Test AlertSeverity
const validAlertSeverities: AlertSeverity[] = ['critical', 'warning', 'info'];

// Test LogLevel
const validLogLevels: LogLevel[] = ['info', 'warning', 'error', 'critical', 'debug'];

// Test RelationshipType
const validRelationships: RelationshipType[] = ['related', 'depends_on', 'contradicts', 'supersedes', 'child_of'];

// ============================================================================
// Object Shape Tests
// ============================================================================

// Test JWTPayload
const jwtPayload: JWTPayload = {
    userId: 1,
    username: 'carlosjperez',
    role: 'cto',
    iat: Date.now(),
    exp: Date.now() + 3600000
};

// Test User
const user: User = {
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

// Test UserPublic (no sensitive data)
const userPublic: UserPublic = {
    id: 1,
    username: 'carlosjperez',
    name: 'Carlos J. Perez',
    email: 'carlos@solaria.agency',
    role: 'cto'
};

// Test Project
const project: Project = {
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

// Test Task
const task: Task = {
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

// Test TaskItem
const taskItem: TaskItem = {
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

// Test Agent
const agent: Agent = {
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

// Test Memory
const memory: Memory = {
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

// Test Alert
const alert: Alert = {
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

// Test DashboardOverview
const dashboardOverview: DashboardOverview = {
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

// Test SocketData
const socketData: SocketData = {
    userId: 1,
    userRole: 'cto'
};

// Test ConnectedClient
const connectedClient: ConnectedClient = {
    socket_id: 'abc123',
    user: userPublic,
    connected_at: new Date()
};

// Test ServerConfig
const serverConfig: ServerConfig = {
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

// Test API Response types
const apiError: ApiError = {
    error: 'Not found',
    code: 'NOT_FOUND',
    details: { id: 999 }
};

const paginatedResponse: PaginatedResponse<Task> = {
    data: [task],
    pagination: {
        page: 1,
        limit: 20,
        total: 100,
        total_pages: 5
    }
};

const successResponse: SuccessResponse = {
    success: true,
    message: 'Operation completed',
    data: { id: 1 }
};

// ============================================================================
// Function Type Tests
// ============================================================================

// Test that handler types accept correct signatures
const testHandler: ExpressHandler = async (req, res) => {
    const userId = req.user?.userId;
    res.json({ userId });
};

const testMiddleware: ExpressMiddleware = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
};

// ============================================================================
// Type Guard Tests
// ============================================================================

function isValidProjectStatus(status: string): status is ProjectStatus {
    return validProjectStatuses.includes(status as ProjectStatus);
}

function isValidPriority(priority: string): priority is Priority {
    return validPriorities.includes(priority as Priority);
}

function isValidTaskStatus(status: string): status is TaskStatus {
    return validTaskStatuses.includes(status as TaskStatus);
}

// ============================================================================
// Export for verification
// ============================================================================

export {
    validRoles,
    validProjectStatuses,
    validPriorities,
    validTaskStatuses,
    validAgentStatuses,
    validAlertSeverities,
    validLogLevels,
    validRelationships,
    jwtPayload,
    user,
    userPublic,
    project,
    task,
    taskItem,
    agent,
    memory,
    alert,
    dashboardOverview,
    socketData,
    connectedClient,
    serverConfig,
    apiError,
    paginatedResponse,
    successResponse,
    testHandler,
    testMiddleware,
    isValidProjectStatus,
    isValidPriority,
    isValidTaskStatus
};

console.log('All type tests passed!');

export interface User {
    id: number;
    username: string;
    email: string;
    name: string;
    role: 'ceo' | 'cto' | 'coo' | 'cfo' | 'admin' | 'viewer' | 'manager' | 'agent';
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Project {
    id: number;
    name: string;
    code: string;
    description?: string;
    status: 'planning' | 'active' | 'development' | 'testing' | 'deployment' | 'paused' | 'on_hold' | 'completed' | 'cancelled';
    priority: 'critical' | 'high' | 'medium' | 'low';
    businessId?: number;
    progress: number;
    estimatedHours?: number;
    actualHours?: number;
    budgetAllocated?: number;
    budgetSpent?: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    tasksTotal?: number;
    tasksCompleted?: number;
    activeAgents?: number;
    productionUrl?: string;
    stagingUrl?: string;
    localUrl?: string;
    repoUrl?: string;
    client?: {
        name: string;
        logo?: string;
    };
}
export interface Task {
    id: number;
    projectId: number;
    epicId?: number;
    sprintId?: number;
    taskNumber: number;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
    priority: 'critical' | 'high' | 'medium' | 'low';
    type: 'feature' | 'bug' | 'enhancement' | 'documentation' | 'research' | 'maintenance';
    assignedAgentId?: number;
    assignedBy?: number;
    estimatedHours?: number;
    actualHours?: number;
    progress: number;
    notes?: string;
    dependencies?: string;
    dueDate?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    projectName?: string;
    projectCode?: string;
    taskCode?: string;
    agentName?: string;
    itemsTotal?: number;
    itemsCompleted?: number;
    epicName?: string;
    epicNumber?: number;
    sprintName?: string;
    sprintNumber?: number;
    tags?: TaskTag[];
}
export interface TaskItem {
    id: number;
    taskId: number;
    title: string;
    description?: string;
    isCompleted: boolean;
    sortOrder: number;
    estimatedMinutes?: number;
    actualMinutes?: number;
    completedByAgentId?: number;
    completedAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface TaskTag {
    id: number;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    usageCount: number;
    createdAt?: string;
}
export interface Epic {
    id: number;
    projectId: number;
    epicNumber: number;
    name: string;
    description?: string;
    color: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    startDate?: string;
    targetDate?: string;
    createdBy?: number;
    createdAt: string;
    updatedAt: string;
    tasksTotal?: number;
    tasksCompleted?: number;
}
export interface Sprint {
    id: number;
    projectId: number;
    sprintNumber: number;
    name: string;
    goal?: string;
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    startDate?: string;
    endDate?: string;
    velocity: number;
    capacity: number;
    createdBy?: number;
    createdAt: string;
    updatedAt: string;
    tasksTotal?: number;
    tasksCompleted?: number;
}
export interface Agent {
    id: number;
    name: string;
    role: string;
    status: 'active' | 'busy' | 'inactive' | 'error' | 'maintenance';
    description?: string;
    capabilities?: string;
    avatar?: string;
    lastActivity?: string;
    createdAt: string;
    updatedAt: string;
    currentStatus?: string;
    currentTask?: string;
    lastHeartbeat?: string;
    performanceMetrics?: Record<string, unknown>;
    tasksCompleted?: number;
    tasksInProgress?: number;
    avgTaskTime?: number;
}
export interface Memory {
    id: number;
    content: string;
    summary?: string;
    projectId?: number;
    agentId?: number;
    importance: number;
    accessCount: number;
    lastAccessed?: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
}
export interface Alert {
    id: number;
    projectId?: number;
    title: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    status: 'active' | 'acknowledged' | 'resolved';
    acknowledgedBy?: number;
    acknowledgedAt?: string;
    resolvedAt?: string;
    createdAt: string;
}
export interface ActivityLog {
    id: number;
    projectId?: number;
    agentId?: number;
    userId?: number;
    action: string;
    message: string;
    category: string;
    level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    metadata?: Record<string, unknown>;
    createdAt: string;
}
export interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    totalAgents: number;
    activeAgents: number;
    totalMemories: number;
    criticalAlerts: number;
}
export interface KanbanColumn {
    status: string;
    count: number;
    tasks: Task[];
}
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    total: number;
    page: number;
    limit: number;
}

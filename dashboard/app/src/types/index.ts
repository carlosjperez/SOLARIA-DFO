// Core entities
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
    status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
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
    // Extended fields from joins
    tasksTotal?: number;
    tasksCompleted?: number;
    activeAgents?: number;
}

export interface Task {
    id: number;
    projectId: number;
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
    // Extended fields from joins
    projectName?: string;
    projectCode?: string;
    taskCode?: string;
    agentName?: string;
    itemsTotal?: number;
    itemsCompleted?: number;
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
    // Extended fields
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
    // Extended fields
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

// Dashboard types
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

// API Response types
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

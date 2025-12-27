// Project types
export interface Project {
    id: number;
    name: string;
    code: string;
    description?: string;
    client?: string;
    status: ProjectStatus;
    priority: Priority;
    budget?: number;
    deadline?: string;
    progress: number;
    created_at: string;
    updated_at: string;
    tasks_count?: number;
    tasks_completed?: number;
}

export type ProjectStatus =
    | 'planning'
    | 'development'
    | 'testing'
    | 'deployment'
    | 'completed'
    | 'on_hold'
    | 'blocked'
    | 'cancelled';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

// Task types
export interface Task {
    id: number;
    title: string;
    description?: string;
    project_id: number;
    project_name?: string;
    status: TaskStatus;
    priority: Priority;
    assigned_agent_id?: number;
    agent_name?: string;
    estimated_hours?: number;
    actual_hours?: number;
    progress: number;
    deadline?: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

// Agent types
export interface Agent {
    id: number;
    name: string;
    role: AgentRole;
    description?: string;
    status: AgentStatus;
    avatar_url?: string;
    tasks_assigned: number;
    tasks_completed: number;
    created_at: string;
    updated_at: string;
}

export type AgentRole =
    | 'project_manager'
    | 'architect'
    | 'developer'
    | 'tester'
    | 'analyst'
    | 'designer'
    | 'devops'
    | 'technical_writer'
    | 'security_auditor'
    | 'deployment_specialist';

export type AgentStatus = 'active' | 'busy' | 'inactive' | 'error' | 'maintenance';

// Dashboard types
export interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    blockedTasks: number;
    totalBudget: number;
    totalAgents: number;
    activeAgents: number;
}

// Client types
export interface Client {
    name: string;
    projects: number;
    totalBudget: number;
    activeProjects: number;
}

// Budget breakdown (SOLARIA formula)
export interface BudgetBreakdown {
    humans: number;    // 45%
    ai: number;        // 20%
    taxes: number;     // 16%
    margin: number;    // 15%
    other: number;     // 4%
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

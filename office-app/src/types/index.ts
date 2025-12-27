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

// Client types (legacy simple)
export interface Client {
    name: string;
    projects: number;
    totalBudget: number;
    activeProjects: number;
}

// Office Client types (full CRM)
export interface OfficeClient {
    id: number;
    name: string;
    commercial_name?: string;
    industry?: string;
    company_size?: 'startup' | 'small' | 'medium' | 'enterprise';
    status: ClientStatus;
    primary_email?: string;
    primary_phone?: string;
    website?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    tax_id?: string;
    fiscal_name?: string;
    lifetime_value?: number;
    total_projects?: number;
    logo_url?: string;
    notes?: string;
    created_at: string;
    updated_at?: string;
    assigned_to?: {
        id: number;
        name: string;
    };
}

export type ClientStatus = 'lead' | 'prospect' | 'active' | 'inactive' | 'churned';

export interface ClientContact {
    id: number;
    client_id: number;
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    is_primary: boolean;
    notes?: string;
    created_at: string;
}

export interface ClientPayment {
    id: number;
    client_id: number;
    project_id?: number;
    project_name?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    payment_date?: string;
    due_date?: string;
    reference?: string;
    notes?: string;
    created_at: string;
}

export type PaymentStatus = 'pending' | 'received' | 'cancelled';

// Extended Project types for detail view
export interface ProjectDetail extends Omit<Project, 'client'> {
    client_name?: string; // Original simple client name
    client_info?: {
        id: number;
        name: string;
        logo_url?: string;
    };
    manager?: {
        id: number;
        name: string;
        role: string;
    };
    spent?: number;
    currency?: string;
    start_date?: string;
}

export interface ProjectDocument {
    id: number;
    project_id: number;
    name: string;
    type: 'spec' | 'contract' | 'manual' | 'design' | 'report' | 'other';
    url: string;
    description?: string;
    uploaded_by?: string;
    created_at: string;
}

export interface ProjectSprint {
    id: number;
    project_id: number;
    name: string;
    phase_type: 'planning' | 'development' | 'testing' | 'deployment' | 'maintenance' | 'custom';
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    start_date?: string;
    end_date?: string;
    goal?: string;
    phase_order: number;
    epics_count?: number;
    tasks_count?: number;
    progress?: number;
}

export interface ProjectEpic {
    id: number;
    project_id: number;
    sprint_id?: number;
    name: string;
    description?: string;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    color?: string;
    start_date?: string;
    target_date?: string;
    tasks_count?: number;
    tasks_completed?: number;
}

// Extended Agent types for detail view
export interface AgentDetail extends Agent {
    type: 'human' | 'ai';
    email?: string;
    phone?: string;
    bio?: string;
    skills?: string[];
    model?: string;
    capabilities?: string[];
    config?: Record<string, unknown>;
    metrics?: AgentMetrics;
    projects?: { id: number; name: string; role: string }[];
}

export interface AgentMetrics {
    tasks_completed: number;
    tasks_in_progress: number;
    tasks_total: number;
    avg_completion_time: number;
    // Human-specific
    on_time_rate?: number;
    quality_score?: number;
    projects_count?: number;
    // AI-specific
    success_rate?: number;
    uptime?: number;
    tokens_used?: number;
    cost_mtd?: number;
}

export interface AgentPerformanceHistory {
    date: string;
    tasks_completed: number;
    hours_worked?: number;
    tokens_used?: number;
}

export interface ActivityLogEntry {
    id: number;
    action: string;
    description?: string;
    type: 'task' | 'project' | 'status' | 'note' | 'payment' | 'contact' | 'document';
    entity_type?: string;
    entity_id?: number;
    user_id?: number;
    user_name?: string;
    created_at: string;
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

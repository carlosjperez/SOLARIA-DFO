/**
 * SOLARIA C-Suite Dashboard - Type Definitions
 * TypeScript types for Express, MySQL, Socket.IO, and domain entities
 */

import type { Request, Response, NextFunction, Application } from 'express';
import type { Server as HttpServer } from 'http';
import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { Connection, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';

// ============================================================================
// Express Extended Types
// ============================================================================

export interface JWTPayload {
  userId: number;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export type ExpressHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

export type ExpressMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// ============================================================================
// Database Types
// ============================================================================

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  charset: string;
  timezone: string;
  connectTimeout: number;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

export type QueryResult<T = RowDataPacket[]> = [T, FieldPacket[]];
export type ExecuteResult = [ResultSetHeader, FieldPacket[]];

// ============================================================================
// User & Authentication Types
// ============================================================================

export type UserRole = 'admin' | 'ceo' | 'cto' | 'coo' | 'cfo' | 'manager' | 'agent' | 'viewer';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password_hash: string;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  userId?: string;
  username?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserPublic;
}

export interface AuthVerifyResponse {
  valid: boolean;
  user?: UserPublic;
}

// ============================================================================
// Project Types
// ============================================================================

export type ProjectStatus =
  | 'planning'
  | 'development'
  | 'testing'
  | 'deployment'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Project {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  client: string | null;
  status: ProjectStatus;
  priority: Priority;
  budget: number;
  actual_cost: number;
  start_date: Date | null;
  deadline: Date | null;
  completion_percentage: number;
  repository_url: string | null;
  website_url: string | null;
  tech_stack: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ProjectWithStats extends Project {
  total_tasks: number;
  completed_tasks: number;
  agents_assigned: number;
  active_alerts: number;
  pending_tasks?: number;
  in_progress_tasks?: number;
  review_tasks?: number;
  blocked_tasks?: number;
  task_count?: number;
}

export interface CreateProjectRequest {
  name: string;
  code?: string;
  description?: string;
  client?: string;
  status?: ProjectStatus;
  priority?: Priority;
  budget?: number;
  start_date?: string;
  deadline?: string;
  repository_url?: string;
  website_url?: string;
  tech_stack?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  actual_cost?: number;
  completion_percentage?: number;
}

// ============================================================================
// Project Extended Types (Client, Documents, Requests)
// ============================================================================

export interface ProjectClient {
  id: number;
  project_id: number;
  name: string;
  fiscal_name: string | null;
  rfc: string | null;
  website: string | null;
  address: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: Date;
  updated_at: Date;
}

export type DocumentType = 'spec' | 'contract' | 'manual' | 'design' | 'report' | 'other';

export interface ProjectDocument {
  id: number;
  project_id: number;
  name: string;
  type: DocumentType;
  url: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'in_review'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export interface ProjectRequest {
  id: number;
  project_id: number;
  text: string;
  status: RequestStatus;
  priority: Priority;
  requested_by: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Task Types
// ============================================================================

export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  progress: number;
  task_number: number | null;
  assigned_agent_id: number | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  completed_at: Date | null;
  completion_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TaskWithDetails extends Task {
  project_name?: string;
  project_code?: string;
  task_code?: string;
  agent_name?: string;
  tags?: TaskTag[];
}

export interface CreateTaskRequest {
  project_id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimated_hours?: number;
  assigned_agent_id?: number;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  progress?: number;
  actual_hours?: number;
  completion_notes?: string;
}

// ============================================================================
// Task Item (Subtask/Checklist) Types
// ============================================================================

export interface TaskItem {
  id: number;
  task_id: number;
  title: string;
  description: string | null;
  sort_order: number;
  is_completed: boolean;
  completed_at: Date | null;
  completed_by_agent_id: number | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskItemRequest {
  title: string;
  description?: string;
  estimated_minutes?: number;
}

export interface UpdateTaskItemRequest {
  title?: string;
  description?: string;
  is_completed?: boolean;
  notes?: string;
  actual_minutes?: number;
}

// ============================================================================
// Task Tag Types
// ============================================================================

export interface TaskTag {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  description: string | null;
  created_at: Date;
}

export interface TaskTagAssignment {
  task_id: number;
  tag_id: number;
  assigned_at: Date;
}

// ============================================================================
// Agent Types
// ============================================================================

export type AgentStatus = 'active' | 'busy' | 'inactive' | 'error' | 'maintenance';

export interface Agent {
  id: number;
  name: string;
  code: string;
  role: string;
  description: string | null;
  status: AgentStatus;
  capabilities: string | null;
  current_task_id: number | null;
  tasks_completed: number;
  average_task_time: number;
  error_rate: number;
  last_active_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface AgentWithStats extends Agent {
  active_tasks?: number;
  completed_tasks?: number;
  total_logs?: number;
  error_count?: number;
}

export interface AgentState {
  id: number;
  name: string;
  status: AgentStatus;
  current_task_id: number | null;
  last_active_at: Date | null;
}

// ============================================================================
// Business Types
// ============================================================================

export type BusinessStatus = 'active' | 'inactive' | 'pending';

export interface Business {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  status: BusinessStatus;
  revenue: number;
  expenses: number;
  profit: number;
  logo_url: string | null;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// Memory Types (Memora Integration)
// ============================================================================

export type RelationshipType = 'related' | 'depends_on' | 'contradicts' | 'supersedes' | 'child_of';

export interface Memory {
  id: number;
  content: string;
  summary: string | null;
  tags: string | null; // JSON array stored as string
  metadata: string | null; // JSON object stored as string
  importance: number;
  access_count: number;
  last_accessed_at: Date | null;
  project_id: number | null;
  agent_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface MemoryParsed extends Omit<Memory, 'tags' | 'metadata'> {
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface CreateMemoryRequest {
  content: string;
  summary?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  importance?: number;
  project_id?: number;
}

export interface UpdateMemoryRequest extends Partial<CreateMemoryRequest> {}

export interface MemoryCrossref {
  id: number;
  source_id: number;
  target_id: number;
  relationship_type: RelationshipType;
  strength: number;
  created_at: Date;
}

export interface MemoryStats {
  total_memories: number;
  avg_importance: number;
  total_access_count: number;
  top_tags: Array<{ tag: string; count: number }>;
}

// ============================================================================
// Alert Types
// ============================================================================

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface Alert {
  id: number;
  project_id: number | null;
  agent_id: number | null;
  task_id: number | null;
  title: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  created_at: Date;
  resolved_at: Date | null;
}

export interface AlertWithDetails extends Alert {
  project_name?: string;
  agent_name?: string;
  task_title?: string;
}

// ============================================================================
// Activity Log Types
// ============================================================================

export type LogLevel = 'info' | 'warning' | 'error' | 'critical' | 'debug';

export interface ActivityLog {
  id: number;
  agent_id: number | null;
  project_id: number | null;
  task_id: number | null;
  action: string;
  level: LogLevel;
  category: string | null;
  details: string | null;
  timestamp: Date;
}

export interface ActivityLogWithDetails extends ActivityLog {
  agent_name?: string;
  project_name?: string;
  task_title?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardOverview {
  projects: {
    total_projects: number;
    completed_projects: number;
    active_projects: number;
    planning_projects: number;
    total_budget: number;
    total_actual_cost: number;
  };
  agents: {
    total_agents: number;
    active_agents: number;
    busy_agents: number;
    error_agents: number;
  };
  tasks: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    blocked_tasks: number;
  };
  alerts: {
    total_alerts: number;
    critical_alerts: number;
    active_alerts: number;
  };
  timestamp: string;
}

export interface ProjectMetrics {
  date: Date;
  avg_completion: number;
  avg_efficiency: number;
  avg_quality: number;
  total_hours: number;
}

export interface AgentMetrics {
  role: string;
  tasks_assigned: number;
  tasks_completed: number;
  avg_task_time: number;
  error_count: number;
}

// ============================================================================
// C-Suite Dashboard Types
// ============================================================================

export interface CEODashboard {
  summary: {
    total_projects: number;
    total_budget: number;
    total_agents: number;
    projects_on_track: number;
  };
  projects: ProjectWithStats[];
  alerts: AlertWithDetails[];
  metrics: {
    revenue_impact: number;
    efficiency_score: number;
  };
}

export interface CTODashboard {
  technical_debt: number;
  code_quality_avg: number;
  deployment_frequency: number;
  agents: AgentWithStats[];
  active_tasks: TaskWithDetails[];
  architecture_alerts: AlertWithDetails[];
}

export interface COODashboard {
  operational_efficiency: number;
  resource_utilization: number;
  projects: ProjectWithStats[];
  agent_workload: AgentWithStats[];
  bottlenecks: TaskWithDetails[];
}

export interface CFODashboard {
  total_budget: number;
  total_spent: number;
  budget_variance: number;
  projects: Array<ProjectWithStats & { budget_status: string }>;
  monthly_expenses: Array<{ month: string; amount: number }>;
  forecasts: Array<{ project_id: number; projected_cost: number }>;
}

// ============================================================================
// Socket.IO Types
// ============================================================================

export interface ActivityLoggedEvent {
  id: number;
  action: string;
  message: string;
  category: string;
  level: string;
  projectId: number | null;
  agentId: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface ServerToClientEvents {
  authenticated: (data: { user: UserPublic }) => void;
  authentication_error: (data: { error: string }) => void;
  agent_states_update: (states: AgentState[]) => void;
  project_metrics_update: (metrics: ProjectMetrics[]) => void;
  critical_alerts: (alerts: Alert[]) => void;
  task_updated: (task: Task | Record<string, unknown>) => void;
  task_created: (task: Record<string, unknown>) => void;
  task_completed: (task: Record<string, unknown>) => void;
  task_deleted: (data: { id: number; title: string; project_id: number | null }) => void;
  task_tag_added: (data: { task_id: number; tag: Record<string, unknown> }) => void;
  task_tag_removed: (data: { task_id: number; tag_id: number }) => void;
  project_updated: (project: Project) => void;
  notification: (notification: { type: string; message: string }) => void;
  activity_logged: (activity: ActivityLoggedEvent) => void;
  epic_created: (data: { id: number; epicNumber: number; name: string; projectId: number }) => void;
  sprint_created: (data: { id: number; sprintNumber: number; name: string; projectId: number }) => void;
  // Real-time notification events (colon-style)
  'project:created': (data: { projectId: number; name: string; code: string; priority: string }) => void;
  'project:updated': (data: { projectId: number; name?: string; status?: string; progress?: number }) => void;
  'project:deleted': (data: { projectId: number; name: string; code: string }) => void;
  'project:archived': (data: { projectId: number; name: string; archived: boolean }) => void;
}

export interface ClientToServerEvents {
  authenticate: (token: string) => void;
  subscribe_projects: () => void;
  subscribe_agents: () => void;
  subscribe_alerts: () => void;
  subscribe_notifications: () => void;
}

export interface SocketData {
  userId?: number;
  userRole?: UserRole;
}

export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
export type TypedIOServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

// ============================================================================
// Server Class Types
// ============================================================================

export interface ConnectedClient {
  socket_id: string;
  user: UserPublic;
  connected_at: Date;
}

export interface ServerConfig {
  port: number;
  jwtSecret: string;
  repoPath: string;
  db: DatabaseConfig;
}

// ============================================================================
// Report Types
// ============================================================================

export interface ProjectReport {
  project_id: number;
  project_name: string;
  status: ProjectStatus;
  completion_percentage: number;
  budget: number;
  actual_cost: number;
  task_completion_rate: number;
  agent_count: number;
}

export interface AgentReport {
  agent_id: number;
  agent_name: string;
  role: string;
  tasks_completed: number;
  avg_task_time: number;
  error_rate: number;
  efficiency_score: number;
}

export interface FinancialReport {
  period: string;
  total_budget: number;
  total_spent: number;
  variance: number;
  projects_over_budget: number;
  projects_under_budget: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

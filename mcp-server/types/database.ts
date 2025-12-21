/**
 * SOLARIA DFO - Database Entity Types
 * TypeScript interfaces matching MariaDB schema
 */

// ============================================================================
// Core Entities
// ============================================================================

export interface Project {
  id: number;
  name: string;
  code: string;
  client: string | null;
  description: string | null;
  status: ProjectStatus;
  priority: Priority;
  budget: number | null;
  actual_cost: number;
  completion_percentage: number;
  start_date: Date | string | null;
  deadline: Date | string | null;
  created_by: number | null;
  created_at: Date | string;
  updated_at: Date | string;
  office_origin: string;
  office_visible: number;
}

export interface Task {
  id: number;
  project_id: number;
  task_number: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  estimated_hours: number | null;
  actual_hours: number;
  progress: number;
  assigned_agent_id: number | null;
  created_by: number | null;
  created_at: Date | string;
  updated_at: Date | string;
  completed_at: Date | string | null;
  // Joined fields (from queries)
  project_name?: string;
  project_code?: string;
  task_code?: string;
  agent_name?: string;
  assigned_by_name?: string;
  items_total?: number;
  items_completed?: number;
}

export interface TaskItem {
  id: number;
  task_id: number;
  title: string;
  description: string | null;
  sort_order: number;
  is_completed: boolean | number;
  completed_at: Date | string | null;
  completed_by_agent_id: number | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Agent {
  id: number;
  name: string;
  role: string;
  description: string | null;
  status: AgentStatus;
  capabilities: string | string[];
  avatar: string | null;
  last_active: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface AgentState {
  id: number;
  agent_id: number;
  state_key: string;
  state_value: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  avatar: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Memory {
  id: number;
  project_id: number | null;
  content: string;
  summary: string | null;
  tags: string | string[];
  metadata: string | Record<string, unknown> | null;
  importance: number;
  access_count: number;
  last_accessed: Date | string | null;
  expires_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface MemoryCrossref {
  id: number;
  source_memory_id: number;
  target_memory_id: number;
  relationship_type: RelationshipType;
  created_at: Date | string;
}

export interface ActivityLog {
  id: number;
  project_id: number | null;
  agent_id: number | null;
  user_id: number | null;
  action: string;
  category: string | null;
  level: LogLevel;
  details: string | Record<string, unknown> | null;
  created_at: Date | string;
}

export interface Business {
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
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ProjectDocument {
  id: number;
  project_id: number;
  name: string;
  type: DocumentType;
  url: string;
  description: string | null;
  uploaded_by: number | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ProjectRequest {
  id: number;
  project_id: number;
  text: string;
  priority: Priority;
  status: RequestStatus;
  requested_by: string | null;
  notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Alert {
  id: number;
  project_id: number | null;
  title: string;
  message: string;
  severity: AlertSeverity;
  is_read: boolean | number;
  created_at: Date | string;
  expires_at: Date | string | null;
}

// ============================================================================
// Enum Types
// ============================================================================

export type ProjectStatus =
  | 'planning'
  | 'development'
  | 'testing'
  | 'deployment'
  | 'review'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'blocked';

export type Priority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export type AgentStatus =
  | 'active'
  | 'busy'
  | 'idle'
  | 'inactive'
  | 'offline'
  | 'error'
  | 'maintenance';

export type UserRole =
  | 'ceo'
  | 'cto'
  | 'coo'
  | 'cfo'
  | 'admin'
  | 'manager'
  | 'developer';

export type LogLevel =
  | 'info'
  | 'warning'
  | 'error'
  | 'critical'
  | 'success';

export type DocumentType =
  | 'spec'
  | 'contract'
  | 'manual'
  | 'design'
  | 'report'
  | 'other';

export type RequestStatus =
  | 'pending'
  | 'approved'
  | 'in_review'
  | 'in_progress'
  | 'completed'
  | 'rejected';

export type RelationshipType =
  | 'related'
  | 'depends_on'
  | 'contradicts'
  | 'supersedes'
  | 'child_of';

export type AlertSeverity =
  | 'critical'
  | 'warning'
  | 'info';

// ============================================================================
// API Response Types
// ============================================================================

export interface ProjectWithMetrics extends Project {
  tasks_count?: number;
  tasks_completed?: number;
  agents_assigned?: number;
}

export interface TaskWithItems extends Task {
  items?: TaskItem[];
}

export interface AgentWithTasks extends Agent {
  tasks?: Task[];
  tasks_count?: number;
}

export interface DashboardOverview {
  projects: {
    total: number;
    active: number;
    completed: number;
    on_hold: number;
  };
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    blocked: number;
  };
  agents: {
    total: number;
    active: number;
    busy: number;
    inactive: number;
  };
  recent_activity: ActivityLog[];
  alerts: Alert[];
}

export interface MemorySearchResult extends Memory {
  relevance_score?: number;
}

export interface MemoryStats {
  total_memories: number;
  by_tag: Record<string, number>;
  avg_importance: number;
  total_access_count: number;
  recent_memories: number;
}

// ============================================================================
// Input/Create Types (for inserts)
// ============================================================================

export interface CreateProjectInput {
  name: string;
  client?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: Priority;
  budget?: number;
  deadline?: string;
}

export interface CreateTaskInput {
  project_id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  estimated_hours?: number;
  assigned_agent_id?: number;
}

export interface CreateTaskItemInput {
  task_id: number;
  title: string;
  description?: string;
  estimated_minutes?: number;
}

export interface CreateMemoryInput {
  content: string;
  summary?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  importance?: number;
  project_id?: number;
}

export interface CreateActivityLogInput {
  action: string;
  category?: string;
  level?: LogLevel;
  project_id?: number;
  agent_id?: number;
  user_id?: number;
  details?: Record<string, unknown>;
}

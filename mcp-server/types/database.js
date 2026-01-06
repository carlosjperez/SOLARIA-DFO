/**
 * SOLARIA DFO - Database Entity Types
 * TypeScript interfaces matching MariaDB schema
 */

export interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  budget: number;
  deadline: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  assigned_agent_id: number;
  estimated_hours: number;
  completion_notes: string;
  created_at: string;
  updated_at: string;
  deadline: string;
}

export interface TaskItem {
  id: number;
  task_id: number;
  title: string;
  description: string;
  status: string;
  assigned_agent_id: number;
  estimated_hours: number;
  created_at: string;
  updated_at: string;
  deadline: string;
  position: number;
  dependencies: string;
}

export interface Agent {
  id: number;
  name: string;
  status: string;
  role: string;
  email: string;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface Alert {
  id: number;
  level: string;
  title: string;
  message: string;
  details: any;
  created_at: string;
  resolved_at: string;
  is_active: boolean;
  project_id: number;
  project: Project;
  agent_id: number;
  agent: Agent;
}

export interface Document {
  id: number;
  project_id: number;
  name: name;
  path: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentMetadata {
  title?: string;
  description?: string;
  author?: string;
  language?: string;
}

export interface SessionContext {
  project: Project | null;
  active_sprint: string | null;
  active_epic: string | null;
  active_task: Task | null;
  active_task_subtasks: TaskItem[];
  all_tasks_count: number;
  completed_tasks_count: number;
  blocked_tasks_count: number;
}

export interface CreateTaskCompletionMemory {
  session_id: string;
  summary: string;
  key_points: string[];
  tags: string[];
  observations_count: number;
  created_at: string;
}

export interface MemoryCreateParams {
  session_id: string;
  content: string;
  summary: string | null;
  key_points: string[] | null;
  tags: string[] | null;
  metadata: Record<string, any> | null;
}

export interface MemoryListParams {
  session_id: string;
  limit?: number;
  offset?: number;
  type?: string;
  search?: string;
}

export interface MemoryGetParams {
  session_id: string;
}

export interface MemoryUpdateParams {
  session_id: string;
  content?: string;
  summary?: string;
  key_points?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface MemoryDeleteParams {
  session_id: string;
}

export interface MemorySearchParams {
  session_id: string;
  query: string;
  limit?: number;
}

export interface MemorySemanticSearchParams {
  session_id: string;
  query: string;
  limit?: number;
}

export interface MemoryBoostParams {
  session_id: string;
  observation_id: number;
}

export interface MemoryRelatedParams {
  session_id: string;
  observation_id: number;
  related_id: number;
  relationship_type: string;
}

export interface MemoryLinkParams {
  session_id: string;
  observation_id: number;
  linked_id: number;
  link_type: string;
}

export interface SetProjectContextResult {
  project: Project | null;
  context: SessionContext;
}

export interface CheckLocalMemoryParams {
  agent_id?: string;
}

export interface ApiCallFunction {
  (endpoint: string, options?: RequestInit): Promise<unknown>;
}

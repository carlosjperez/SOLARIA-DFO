/**
 * SOLARIA DFO MCP Server - Type Definitions
 * Base types for MCP protocol, tools, and handlers
 */
export interface MCPSession {
    id: string;
    project_id: number | null;
    created_at: Date;
    last_activity: Date;
}
export interface MCPContext {
    session_id?: string;
    project_id?: number | null;
    adminMode?: boolean;
}
export interface MCPToolResult {
    content: MCPContent[];
    isError?: boolean;
    _session?: {
        id: string;
        project_id: number | null;
    };
}
export interface MCPContent {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
}
export interface MCPResource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
export interface MCPResourceContent {
    uri: string;
    mimeType: string;
    text: string;
}
export interface MCPToolInputSchema {
    type: 'object';
    properties: Record<string, MCPPropertySchema>;
    required?: string[];
}
export interface MCPPropertySchema {
    type: string;
    description?: string;
    enum?: string[];
    minimum?: number;
    maximum?: number;
    default?: unknown;
    items?: MCPPropertySchema;
    properties?: Record<string, MCPPropertySchema>;
    required?: string[];
}
export interface MCPToolDefinition {
    name: string;
    description: string;
    inputSchema: MCPToolInputSchema;
}
export type ApiCallFunction = (endpoint: string, options?: RequestInit) => Promise<unknown>;
export interface ApiClient {
    apiCall: ApiCallFunction;
    authenticate: () => Promise<AuthResponse>;
    setToken: (token: string) => void;
}
export interface AuthResponse {
    token: string;
    user?: {
        id: number;
        username: string;
        role: string;
    };
}
export interface ApiCredentials {
    user: string;
    password: string;
}
export interface SetProjectContextParams {
    project_name?: string;
    project_id?: number;
    working_directory?: string;
}
export interface GetDashboardAlertsParams {
    severity?: 'critical' | 'warning' | 'info';
}
export interface GetProjectParams {
    project_id?: number;
}
export interface CreateProjectParams {
    name: string;
    client?: string;
    description?: string;
    budget?: number;
    deadline?: string;
    priority?: Priority;
}
export interface UpdateProjectParams {
    project_id: number;
    name?: string;
    description?: string;
    status?: ProjectStatus;
    budget?: number;
    deadline?: string;
}
export interface ListTasksParams {
    project_id?: number;
    status?: TaskStatus;
    priority?: Priority;
    agent_id?: number;
}
export interface GetTaskParams {
    task_id: number;
}
export interface CreateTaskParams {
    project_id: number;
    title: string;
    description?: string;
    priority?: Priority;
    status?: 'pending' | 'in_progress';
    estimated_hours?: number;
    assigned_agent_id?: number;
}
export interface UpdateTaskParams {
    task_id: number;
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    progress?: number;
    assigned_agent_id?: number;
}
export interface CompleteTaskParams {
    task_id: number;
    completion_notes?: string;
}
export interface DeleteTaskParams {
    task_id: number;
}
export interface ListTaskItemsParams {
    task_id: number;
    include_completed?: boolean;
}
export interface CreateTaskItemsParams {
    task_id: number;
    items: TaskItemInput[];
}
export interface TaskItemInput {
    title: string;
    description?: string;
    estimated_minutes?: number;
}
export interface CompleteTaskItemParams {
    task_id: number;
    item_id: number;
    notes?: string;
    actual_minutes?: number;
}
export interface UpdateTaskItemParams {
    task_id: number;
    item_id: number;
    title?: string;
    description?: string;
    is_completed?: boolean;
    notes?: string;
}
export interface DeleteTaskItemParams {
    task_id: number;
    item_id: number;
}
export interface ListAgentsParams {
    status?: AgentStatus;
    role?: string;
}
export interface GetAgentParams {
    agent_id: number;
}
export interface GetAgentTasksParams {
    agent_id: number;
}
export interface UpdateAgentStatusParams {
    agent_id: number;
    status: AgentStatus;
}
export interface GetActivityLogsParams {
    limit?: number;
    level?: LogLevel;
    project_id?: number;
}
export interface LogActivityParams {
    action: string;
    level?: LogLevel;
    category?: string;
    agent_id?: number;
    project_id?: number;
}
export interface ListDocsParams {
    project_id?: number;
}
export interface GetProjectClientParams {
    project_id: number;
}
export interface UpdateProjectClientParams {
    project_id: number;
    name: string;
    fiscal_name?: string;
    rfc?: string;
    website?: string;
    address?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
}
export interface GetProjectDocumentsParams {
    project_id: number;
}
export interface CreateProjectDocumentParams {
    project_id: number;
    name: string;
    type?: DocumentType;
    url: string;
    description?: string;
}
export interface GetProjectRequestsParams {
    project_id: number;
    status?: RequestStatus;
    priority?: Priority;
}
export interface CreateProjectRequestParams {
    project_id: number;
    text: string;
    priority?: Priority;
    requested_by?: string;
}
export interface UpdateProjectRequestParams {
    project_id: number;
    request_id: number;
    status?: RequestStatus;
    priority?: Priority;
    notes?: string;
}
export interface MemoryCreateParams {
    content: string;
    summary?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    importance?: number;
    project_id?: number;
}
export interface MemoryListParams {
    query?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    sort_by?: 'importance' | 'created_at' | 'updated_at' | 'access_count';
}
export interface MemoryGetParams {
    memory_id: number;
}
export interface MemoryUpdateParams {
    memory_id: number;
    content?: string;
    summary?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    importance?: number;
}
export interface MemoryDeleteParams {
    memory_id: number;
}
export interface MemorySearchParams {
    query: string;
    tags?: string[];
    min_importance?: number;
    limit?: number;
}
export interface MemorySemanticSearchParams {
    query: string;
    min_similarity?: number;
    limit?: number;
    include_fulltext?: boolean;
}
export interface MemoryBoostParams {
    memory_id: number;
    boost_amount?: number;
}
export interface MemoryRelatedParams {
    memory_id: number;
    relationship_type?: RelationshipType;
}
export interface MemoryLinkParams {
    source_id: number;
    target_id: number;
    relationship_type?: RelationshipType;
}
export type ProjectStatus = 'planning' | 'development' | 'testing' | 'deployment' | 'completed' | 'on_hold' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type AgentStatus = 'active' | 'busy' | 'inactive' | 'error' | 'maintenance';
export type LogLevel = 'info' | 'warning' | 'error' | 'critical';
export type DocumentType = 'spec' | 'contract' | 'manual' | 'design' | 'report' | 'other';
export type RequestStatus = 'pending' | 'approved' | 'in_review' | 'in_progress' | 'completed' | 'rejected';
export type RelationshipType = 'related' | 'depends_on' | 'contradicts' | 'supersedes' | 'child_of';
export type ToolParams = SetProjectContextParams | GetDashboardAlertsParams | GetProjectParams | CreateProjectParams | UpdateProjectParams | ListTasksParams | GetTaskParams | CreateTaskParams | UpdateTaskParams | CompleteTaskParams | DeleteTaskParams | ListTaskItemsParams | CreateTaskItemsParams | CompleteTaskItemParams | UpdateTaskItemParams | DeleteTaskItemParams | ListAgentsParams | GetAgentParams | GetAgentTasksParams | UpdateAgentStatusParams | GetActivityLogsParams | LogActivityParams | ListDocsParams | GetProjectClientParams | UpdateProjectClientParams | GetProjectDocumentsParams | CreateProjectDocumentParams | GetProjectRequestsParams | CreateProjectRequestParams | UpdateProjectRequestParams | MemoryCreateParams | MemoryListParams | MemoryGetParams | MemoryUpdateParams | MemoryDeleteParams | MemorySearchParams | MemorySemanticSearchParams | MemoryBoostParams | MemoryRelatedParams | MemoryLinkParams | Record<string, unknown>;
export interface SetProjectContextResult {
    __action: 'SET_PROJECT_CONTEXT';
    success: boolean;
    project_id: number;
    project_name: string;
    message: string;
}
export interface TaskItemsResult {
    success: boolean;
    task_id: number;
    items_created?: number;
    items: TaskItemResponse[];
    task_progress: number;
    message: string;
}
export interface TaskItemResponse {
    id: number;
    task_id: number;
    title: string;
    sort_order: number;
    is_completed?: boolean;
    estimated_minutes?: number;
    actual_minutes?: number;
    notes?: string;
    completed_at?: string;
    created_at?: string;
}
export interface JSONRPCRequest {
    jsonrpc: '2.0';
    id: string | number;
    method: string;
    params?: Record<string, unknown>;
}
export interface JSONRPCResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: unknown;
    error?: JSONRPCError;
}
export interface JSONRPCError {
    code: number;
    message: string;
    data?: unknown;
}
export declare const JSON_RPC_ERRORS: {
    readonly PARSE_ERROR: -32700;
    readonly INVALID_REQUEST: -32600;
    readonly METHOD_NOT_FOUND: -32601;
    readonly INVALID_PARAMS: -32602;
    readonly INTERNAL_ERROR: -32603;
    readonly SERVER_ERROR: -32000;
};

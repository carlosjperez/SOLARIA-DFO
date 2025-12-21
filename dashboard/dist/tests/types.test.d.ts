/**
 * SOLARIA C-Suite Dashboard - Type Tests
 * Validates TypeScript type definitions compile correctly
 *
 * Run with: npx tsc tests/types.test.ts --noEmit
 */
import type { JWTPayload, ExpressHandler, ExpressMiddleware, UserRole, User, UserPublic, ProjectStatus, Priority, Project, TaskStatus, Task, TaskItem, AgentStatus, Agent, RelationshipType, Memory, AlertSeverity, Alert, LogLevel, DashboardOverview, SocketData, ConnectedClient, ServerConfig, ApiError, PaginatedResponse, SuccessResponse } from '../types.js';
declare const validRoles: UserRole[];
declare const validProjectStatuses: ProjectStatus[];
declare const validPriorities: Priority[];
declare const validTaskStatuses: TaskStatus[];
declare const validAgentStatuses: AgentStatus[];
declare const validAlertSeverities: AlertSeverity[];
declare const validLogLevels: LogLevel[];
declare const validRelationships: RelationshipType[];
declare const jwtPayload: JWTPayload;
declare const user: User;
declare const userPublic: UserPublic;
declare const project: Project;
declare const task: Task;
declare const taskItem: TaskItem;
declare const agent: Agent;
declare const memory: Memory;
declare const alert: Alert;
declare const dashboardOverview: DashboardOverview;
declare const socketData: SocketData;
declare const connectedClient: ConnectedClient;
declare const serverConfig: ServerConfig;
declare const apiError: ApiError;
declare const paginatedResponse: PaginatedResponse<Task>;
declare const successResponse: SuccessResponse;
declare const testHandler: ExpressHandler;
declare const testMiddleware: ExpressMiddleware;
declare function isValidProjectStatus(status: string): status is ProjectStatus;
declare function isValidPriority(priority: string): priority is Priority;
declare function isValidTaskStatus(status: string): status is TaskStatus;
export { validRoles, validProjectStatuses, validPriorities, validTaskStatuses, validAgentStatuses, validAlertSeverities, validLogLevels, validRelationships, jwtPayload, user, userPublic, project, task, taskItem, agent, memory, alert, dashboardOverview, socketData, connectedClient, serverConfig, apiError, paginatedResponse, successResponse, testHandler, testMiddleware, isValidProjectStatus, isValidPriority, isValidTaskStatus };

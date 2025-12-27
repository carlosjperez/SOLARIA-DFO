/**
 * SOLARIA DFO - Alerts & Logs Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
import { type Alert, type NewAlert, type ActivityLog, type NewActivityLog } from '../schema/index.js';
export declare function findAllAlerts(filters?: {
    projectId?: number;
    status?: string;
    severity?: string;
    limit?: number;
}): Promise<{
    id: number;
    title: string;
    message: string | null;
    severity: "critical" | "high" | "medium" | "low" | null;
    status: "active" | "acknowledged" | "resolved" | "dismissed" | null;
    projectId: number | null;
    agentId: number | null;
    taskId: number | null;
    acknowledgedBy: number | null;
    acknowledgedAt: Date | null;
    resolvedAt: Date | null;
    createdAt: Date | null;
}[]>;
export declare function findAlertById(id: number): Promise<{
    id: number;
    title: string;
    message: string | null;
    severity: "critical" | "high" | "medium" | "low" | null;
    status: "active" | "acknowledged" | "resolved" | "dismissed" | null;
    projectId: number | null;
    agentId: number | null;
    taskId: number | null;
    acknowledgedBy: number | null;
    acknowledgedAt: Date | null;
    resolvedAt: Date | null;
    createdAt: Date | null;
}>;
export declare function getCriticalAlerts(): Promise<{
    id: number;
    title: string;
    message: string | null;
    severity: "critical" | "high" | "medium" | "low" | null;
    status: "active" | "acknowledged" | "resolved" | "dismissed" | null;
    projectId: number | null;
    agentId: number | null;
    taskId: number | null;
    acknowledgedBy: number | null;
    acknowledgedAt: Date | null;
    resolvedAt: Date | null;
    createdAt: Date | null;
}[]>;
export declare function createAlert(data: NewAlert): Promise<Alert>;
export declare function acknowledgeAlert(id: number, userId: number): Promise<{
    id: number;
    title: string;
    message: string | null;
    severity: "critical" | "high" | "medium" | "low" | null;
    status: "active" | "acknowledged" | "resolved" | "dismissed" | null;
    projectId: number | null;
    agentId: number | null;
    taskId: number | null;
    acknowledgedBy: number | null;
    acknowledgedAt: Date | null;
    resolvedAt: Date | null;
    createdAt: Date | null;
}>;
export declare function resolveAlert(id: number): Promise<{
    id: number;
    title: string;
    message: string | null;
    severity: "critical" | "high" | "medium" | "low" | null;
    status: "active" | "acknowledged" | "resolved" | "dismissed" | null;
    projectId: number | null;
    agentId: number | null;
    taskId: number | null;
    acknowledgedBy: number | null;
    acknowledgedAt: Date | null;
    resolvedAt: Date | null;
    createdAt: Date | null;
}>;
export declare function findActivityLogs(filters?: {
    projectId?: number;
    agentId?: number;
    category?: string;
    level?: string;
    limit?: number;
    offset?: number;
}): Promise<{
    id: number;
    projectId: number | null;
    agentId: number | null;
    taskId: number | null;
    userId: number | null;
    action: string;
    details: string | null;
    category: "development" | "testing" | "deployment" | "system" | "management" | "security" | null;
    level: "critical" | "error" | "warning" | "info" | "debug" | null;
    timestamp: Date | null;
    createdAt: Date | null;
}[]>;
export declare function createActivityLog(data: NewActivityLog): Promise<ActivityLog>;
export declare function getRecentActivity(limit?: number): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;

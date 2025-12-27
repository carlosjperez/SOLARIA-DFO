/**
 * SOLARIA DFO - Agents Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */
export declare function findAllAgents(): Promise<{
    id: number;
    name: string;
    role: "project_manager" | "architect" | "developer" | "tester" | "analyst" | "designer" | "devops" | "technical_writer" | "security_auditor" | "deployment_specialist";
    status: "active" | "busy" | "inactive" | "error" | "maintenance" | null;
    capabilities: unknown;
    configuration: unknown;
    lastActivity: Date | null;
    createdAt: Date | null;
}[]>;
export declare function findAgentById(id: number): Promise<{
    id: number;
    name: string;
    role: "project_manager" | "architect" | "developer" | "tester" | "analyst" | "designer" | "devops" | "technical_writer" | "security_auditor" | "deployment_specialist";
    status: "active" | "busy" | "inactive" | "error" | "maintenance" | null;
    capabilities: unknown;
    configuration: unknown;
    lastActivity: Date | null;
    createdAt: Date | null;
}>;
export declare function findAgentsWithStats(): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;
export declare function updateAgentStatus(id: number, status: 'active' | 'busy' | 'inactive' | 'error' | 'maintenance', currentTask?: string): Promise<{
    id: number;
    name: string;
    role: "project_manager" | "architect" | "developer" | "tester" | "analyst" | "designer" | "devops" | "technical_writer" | "security_auditor" | "deployment_specialist";
    status: "active" | "busy" | "inactive" | "error" | "maintenance" | null;
    capabilities: unknown;
    configuration: unknown;
    lastActivity: Date | null;
    createdAt: Date | null;
}>;
export declare function getAgentStates(): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;
export declare function getActiveAgents(): Promise<{
    id: number;
    name: string;
    role: "project_manager" | "architect" | "developer" | "tester" | "analyst" | "designer" | "devops" | "technical_writer" | "security_auditor" | "deployment_specialist";
    status: "active" | "busy" | "inactive" | "error" | "maintenance" | null;
    capabilities: unknown;
    configuration: unknown;
    lastActivity: Date | null;
    createdAt: Date | null;
}[]>;
export declare function getBusyAgents(): Promise<{
    id: number;
    name: string;
    role: "project_manager" | "architect" | "developer" | "tester" | "analyst" | "designer" | "devops" | "technical_writer" | "security_auditor" | "deployment_specialist";
    status: "active" | "busy" | "inactive" | "error" | "maintenance" | null;
    capabilities: unknown;
    configuration: unknown;
    lastActivity: Date | null;
    createdAt: Date | null;
}[]>;
export declare function recordAgentMetric(agentId: number, metricType: string, metricValue: number): Promise<void>;
export declare function getAgentMetrics(agentId: number, metricType?: string, limit?: number): Promise<{
    id: number;
    agentId: number;
    metricType: string;
    metricValue: string;
    createdAt: Date | null;
}[]>;
export declare function getAgentTasks(agentId: number, status?: string): Promise<import("drizzle-orm/mysql2").MySqlRawQueryResult>;

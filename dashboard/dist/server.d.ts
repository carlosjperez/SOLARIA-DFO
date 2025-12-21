/**
 * SOLARIA C-Suite Dashboard Server
 * TypeScript migration - Servidor para supervision humana de proyectos gestionados por agentes IA
 * @version 3.0.0-ts
 */
import 'dotenv/config';
declare class SolariaDashboardServer {
    private app;
    private server;
    private io;
    private port;
    private db;
    private connectedClients;
    private repoPath;
    private _dbHealthInterval;
    constructor();
    private initializeMiddleware;
    private initializeDatabase;
    private setupDatabaseHealthCheck;
    private initializeRoutes;
    private initializeSocketIO;
    private startRealTimeUpdates;
    private authenticateToken;
    private handleLogin;
    private handleLogout;
    private verifyToken;
    private healthCheck;
    private getUserById;
    private getAgentStates;
    private getProjectMetrics;
    private getCriticalAlerts;
    private getDashboardOverview;
    private getDashboardMetrics;
    private getDashboardAlerts;
    private getDocs;
    private getProjectsPublic;
    private getBusinessesPublic;
    private getTasksPublic;
    private getDashboardPublic;
    private getRecentCompletedTasks;
    private getRecentTasksByProject;
    private getTaskTags;
    /**
     * Helper: Log activity to database
     */
    private logActivity;
    private getProjects;
    private getProject;
    private createProject;
    private updateProject;
    private deleteProject;
    private getProjectClient;
    private updateProjectClient;
    private getProjectDocuments;
    private createProjectDocument;
    private deleteProjectDocument;
    private getProjectRequests;
    private createProjectRequest;
    private updateProjectRequest;
    private deleteProjectRequest;
    private getAgents;
    private getAgent;
    private getAgentPerformance;
    private updateAgentStatus;
    /**
     * Helper: Recalculate task progress based on completed items
     * Also auto-completes task when all items are done
     */
    private recalculateTaskProgress;
    private getTasks;
    private getTask;
    private createTask;
    private updateTask;
    private deleteTask;
    private getTaskItems;
    private createTaskItems;
    private updateTaskItem;
    private toggleTaskItemComplete;
    private deleteTaskItem;
    private reorderTaskItems;
    private getTaskTagAssignments;
    private addTaskTag;
    private removeTaskTag;
    private getTasksByTag;
    private getBusinesses;
    private getBusiness;
    private updateBusiness;
    private getLogs;
    private getAuditLogs;
    private getProjectReports;
    private getAgentReports;
    private getFinancialReports;
    private getDocumentsList;
    private getProjectSpecs;
    private getProjectCredentials;
    private getProjectArchitecture;
    private getProjectRoadmap;
    private getCEODashboard;
    private getCTODashboard;
    private getCOODashboard;
    private getCFODashboard;
    private registerDocument;
    private updateProjectFromAgent;
    private addTaskFromAgent;
    private logAgentActivity;
    private updateMetricsFromAgent;
    private getAgentInstructions;
    private getMemories;
    private searchMemories;
    private getMemory;
    private createMemory;
    private updateMemory;
    private deleteMemory;
    private getMemoryTags;
    private getMemoryStats;
    private boostMemory;
    private getRelatedMemories;
    private createMemoryCrossref;
    start(): void;
}
export default SolariaDashboardServer;

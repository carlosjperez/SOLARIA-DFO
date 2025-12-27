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
    private redis;
    private connectedClients;
    private repoPath;
    private _dbHealthInterval;
    private workerUrl;
    constructor();
    private initializeMiddleware;
    private initializeDatabase;
    private setupDatabaseHealthCheck;
    private initializeRedis;
    /**
     * Queue an embedding generation job for a memory
     */
    private queueEmbeddingJob;
    /**
     * Get embedding for a query text from the worker
     */
    private getQueryEmbedding;
    /**
     * Calculate cosine similarity between two embeddings
     */
    private cosineSimilarity;
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
     * Helper: Log activity to database and emit Socket.IO event
     */
    private logActivity;
    private getProjects;
    private getProject;
    private createProject;
    private updateProject;
    private deleteProject;
    private checkProjectCode;
    private getProjectEpics;
    private createEpic;
    private updateEpic;
    private deleteEpic;
    private getProjectSprints;
    private createSprint;
    private updateSprint;
    private deleteSprint;
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
    /**
     * Semantic search memories using vector embeddings
     * Combines cosine similarity (60%) with FULLTEXT score (40%)
     */
    private semanticSearchMemories;
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

/**
 * SOLARIA C-Suite Dashboard Server
 * TypeScript migration - Servidor para supervision humana de proyectos gestionados por agentes IA
 * @version 3.0.0-ts
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import mysql, { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import { z } from 'zod';

// Import services
import { WebhookService } from './services/webhookService.js';
import AgentExecutionService from './services/agentExecutionService.js';
import { GitHubActionsService } from './services/githubActionsService.js';
import {
    handleGitHubPush,
    handleWorkflowRunEvent,
    verifyGitHubSignature,
    type GitHubWorkflowRunPayload,
} from './services/githubIntegration.js';

// Import Drizzle repositories
import * as agentsRepo from './db/repositories/agents.js';
import * as projectsRepo from './db/repositories/projects.js';
import * as tasksRepo from './db/repositories/tasks.js';
import * as memoriesRepo from './db/repositories/memories.js';
import * as alertsRepo from './db/repositories/alerts.js';
import * as sprintsRepo from './db/repositories/sprints.js';
import * as epicsRepo from './db/repositories/epics.js';
import * as businessesRepo from './db/repositories/businesses.js';
import * as inlineDocumentsRepo from './db/repositories/inlineDocuments.js';
import * as agentMcpConfigsRepo from './db/repositories/agentMcpConfigs.js';
import * as usersRepo from './db/repositories/users.js';
import * as permissionsRepo from './db/repositories/permissions.js';
import * as dashboardRepo from './db/repositories/dashboard.js';
import * as csuiteRepo from './db/repositories/csuite.js';
import * as reservedCodesRepo from './db/repositories/reserved-codes.js';

// Import Drizzle schema types
import type { NewAgentMcpConfig } from './db/schema/index.js';

// Import local types
import type {
    AuthenticatedRequest,
    JWTPayload,
    DatabaseConfig,
    User,
    UserPublic,
    ConnectedClient,
    Project,
    ProjectWithStats,
    Task,
    TaskWithDetails,
    TaskItem,
    TaskTag,
    Agent,
    AgentState,
    Memory,
    MemoryParsed,
    Alert,
    AlertWithDetails,
    ActivityLog,
    Business,
    DashboardOverview,
    ServerToClientEvents,
    ClientToServerEvents,
    SocketData,
    TypedSocket,
    TypedIOServer
} from './types.js';

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Zod schema for agent job queue request
 */
const QueueAgentJobSchema = z.object({
    taskId: z.number().int().positive('Task ID must be a positive integer'),
    agentId: z.number().int().positive('Agent ID must be a positive integer'),
    metadata: z.object({
        priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
        estimatedHours: z.number().positive().optional(),
        retryCount: z.number().int().nonnegative().optional()
    }).optional(),
    context: z.object({
        dependencies: z.array(z.number().int()).optional(),
        relatedTasks: z.array(z.number().int()).optional(),
        memoryIds: z.array(z.number().int()).optional()
    }).optional(),
    mcpConfigs: z.array(z.object({
        serverName: z.string(),
        serverUrl: z.string().url(),
        authType: z.enum(['bearer', 'basic', 'none']),
        authCredentials: z.record(z.string(), z.unknown()).optional(),
        enabled: z.boolean()
    })).optional()
});

type QueueAgentJobInput = z.infer<typeof QueueAgentJobSchema>;

/**
 * Zod Schema for Agent MCP Config Creation
 */
const CreateAgentMcpConfigSchema = z.object({
    server_name: z.string().min(1, 'Server name is required').max(255, 'Server name too long'),
    server_url: z.string().url('Invalid server URL').max(2048, 'URL too long'),
    auth_type: z.enum(['none', 'bearer', 'basic', 'api-key']).default('none'),
    auth_credentials: z.record(z.string(), z.unknown()).optional(),
    transport_type: z.enum(['http', 'stdio', 'sse']).default('http'),
    config_options: z.record(z.string(), z.unknown()).optional(),
    enabled: z.boolean().default(true)
});

type CreateAgentMcpConfigInput = z.infer<typeof CreateAgentMcpConfigSchema>;

/**
 * Zod Schema for Agent MCP Config Update
 */
const UpdateAgentMcpConfigSchema = z.object({
    server_name: z.string().min(1).max(255).optional(),
    server_url: z.string().url().max(2048).optional(),
    auth_type: z.enum(['none', 'bearer', 'basic', 'api-key']).optional(),
    auth_credentials: z.record(z.string(), z.unknown()).optional(),
    transport_type: z.enum(['http', 'stdio', 'sse']).optional(),
    config_options: z.record(z.string(), z.unknown()).optional(),
    enabled: z.boolean().optional(),
    connection_status: z.enum(['disconnected', 'connected', 'error']).optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

type UpdateAgentMcpConfigInput = z.infer<typeof UpdateAgentMcpConfigSchema>;

/**
 * Zod schema for GitHub Actions workflow trigger
 */
const TriggerWorkflowSchema = z.object({
    owner: z.string().min(1, 'Owner is required'),
    repo: z.string().min(1, 'Repository is required'),
    workflowId: z.string().min(1, 'Workflow ID is required'),
    ref: z.string().min(1, 'Ref (branch/tag) is required'),
    inputs: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
    projectId: z.number().int().positive('Project ID must be a positive integer'),
    taskId: z.number().int().positive().optional()
});

type TriggerWorkflowInput = z.infer<typeof TriggerWorkflowSchema>;

/**
 * Zod schema for GitHub issue creation
 */
const CreateIssueSchema = z.object({
    owner: z.string().min(1, 'Owner is required'),
    repo: z.string().min(1, 'Repository is required'),
    title: z.string().min(1, 'Title is required'),
    body: z.string().min(1, 'Body is required'),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
    taskId: z.number().int().positive('Task ID must be a positive integer'),
    projectId: z.number().int().positive('Project ID must be a positive integer')
});

type CreateIssueInput = z.infer<typeof CreateIssueSchema>;

/**
 * Zod schema for GitHub PR creation
 */
const CreatePRSchema = z.object({
    owner: z.string().min(1, 'Owner is required'),
    repo: z.string().min(1, 'Repository is required'),
    title: z.string().min(1, 'Title is required'),
    body: z.string().min(1, 'Body is required'),
    head: z.string().min(1, 'Head branch is required'),
    base: z.string().min(1, 'Base branch is required'),
    labels: z.array(z.string()).optional(),
    assignees: z.array(z.string()).optional(),
    taskId: z.number().int().positive('Task ID must be a positive integer'),
    projectId: z.number().int().positive('Project ID must be a positive integer')
});

type CreatePRInput = z.infer<typeof CreatePRSchema>;

// ============================================================================
// Server Class
// ============================================================================

class SolariaDashboardServer {
    private app: Application;
    private server: http.Server;
    private io: TypedIOServer;
    private port: number;
    private db: Connection | null;
    private redis: Redis | null;
    private connectedClients: Map<string, ConnectedClient>;
    private repoPath: string;
    private _dbHealthInterval: ReturnType<typeof setInterval> | null;
    private workerUrl: string;
    private webhookService: WebhookService | null;
    private agentExecutionService: AgentExecutionService | null;
    private githubActionsService: GitHubActionsService | null;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(this.server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });

        this.port = parseInt(process.env.PORT || '3000', 10);
        this.db = null;
        this.redis = null;
        this.connectedClients = new Map();
        this._dbHealthInterval = null;
        this.workerUrl = process.env.WORKER_URL || 'http://worker:3032';
        this.webhookService = null;
        this.agentExecutionService = null;
        this.githubActionsService = null;

        // Trust proxy for rate limiting behind nginx
        this.app.set('trust proxy', true);

        this.repoPath = process.env.REPO_PATH || path.resolve(__dirname, '..', '..');

        this.initializeMiddleware();
        this.initializeDatabase();
        this.initializeRedis();
        this.initializeRoutes();
        this.initializeSocketIO();
    }

    // ========================================================================
    // Middleware Initialization
    // ========================================================================

    private initializeMiddleware(): void {
        // Security - CSP disabled temporarily for development
        this.app.use(helmet({
            contentSecurityPolicy: false
        }));

        // Basic middleware
        this.app.use(compression());
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(morgan('combined'));

        // Static files
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    // ========================================================================
    // Database Connection with Retry Logic
    // ========================================================================

    private async initializeDatabase(maxRetries: number = 10, baseDelay: number = 1000): Promise<void> {
        const dbConfig: DatabaseConfig = {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'solaria_construction',
            charset: 'utf8mb4',
            timezone: '+00:00',
            connectTimeout: 60000,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        };

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Database connection attempt ${attempt}/${maxRetries}...`);
                this.db = await mysql.createConnection(dbConfig);

                // Verify connection works
                await this.db.execute('SELECT 1');
                console.log('Database connected successfully');

                // Setup connection health check with auto-reconnect
                this.setupDatabaseHealthCheck();

                // Initialize webhook service
                this.webhookService = new WebhookService(this.db);
                console.log('WebhookService initialized');

                // Initialize agent execution service (with Redis resilience)
                try {
                    this.agentExecutionService = new AgentExecutionService(this.db, this.io);
                    console.log('AgentExecutionService initialized successfully');
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error('Failed to initialize AgentExecutionService:', errorMessage);
                    console.warn('Agent execution features will be unavailable until Redis is accessible');
                    this.agentExecutionService = null;
                }

                // Initialize GitHub Actions service
                const githubToken = process.env.GITHUB_TOKEN;
                if (githubToken) {
                    this.githubActionsService = new GitHubActionsService({ token: githubToken }, this.db);
                    console.log('GitHubActionsService initialized');
                } else {
                    console.warn('GITHUB_TOKEN not found - GitHubActionsService will not be available');
                }

                return;

            } catch (error) {
                const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`Database connection attempt ${attempt} failed: ${errorMessage}`);

                if (attempt < maxRetries) {
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('All database connection attempts exhausted. Exiting.');
                    process.exit(1);
                }
            }
        }
    }

    private setupDatabaseHealthCheck(): void {
        // Clear any existing interval
        if (this._dbHealthInterval) {
            clearInterval(this._dbHealthInterval);
        }

        this._dbHealthInterval = setInterval(async () => {
            try {
                if (this.db) {
                    await this.db.execute('SELECT 1');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Database connection lost:', errorMessage);
                console.log('Attempting to reconnect...');
                await this.initializeDatabase(5, 2000);
            }
        }, 30000);
    }

    // ========================================================================
    // Redis Connection for Embedding Queue
    // ========================================================================

    private initializeRedis(): void {
        const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
        try {
            this.redis = new Redis(redisUrl);

            this.redis.on('connect', () => {
                console.log('Redis connected successfully');
            });

            this.redis.on('error', (err) => {
                console.error('Redis connection error:', err.message);
            });
        } catch (error) {
            console.error('Failed to initialize Redis:', error);
            // Non-fatal - embeddings will be generated lazily
        }
    }

    /**
     * Queue an embedding generation job for a memory
     */
    private async queueEmbeddingJob(memoryId: number): Promise<void> {
        if (!this.redis) {
            console.warn('Redis not available, embedding job not queued');
            return;
        }

        const job = {
            id: `emb_${memoryId}_${Date.now()}`,
            type: 'generate_embedding',
            payload: { memory_id: memoryId },
            created_at: new Date().toISOString()
        };

        await this.redis.rpush('solaria:embeddings', JSON.stringify(job));
        console.log(`Queued embedding job for memory #${memoryId}`);
    }

    /**
     * Get embedding for a query text from the worker
     */
    private async getQueryEmbedding(text: string): Promise<number[] | null> {
        try {
            const response = await fetch(`${this.workerUrl}/embed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                console.error('Worker embed request failed:', response.status);
                return null;
            }

            const data = await response.json() as { embedding: number[] };
            return data.embedding;
        } catch (error) {
            console.error('Failed to get query embedding:', error);
            return null;
        }
    }

    /**
     * Calculate cosine similarity between two embeddings
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (!a || !b || a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        const denominator = Math.sqrt(normA) * Math.sqrt(normB);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    /**
     * Calculate progress percentage from completed and total counts
     * @param completed Number of completed items
     * @param total Total number of items
     * @returns Progress percentage (0-100)
     */
    private calculateProgress(completed: number, total: number): number {
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }

    // ========================================================================
    // Route Initialization
    // ========================================================================

    private initializeRoutes(): void {
        // SOLARIA Office frontend (light mode)
        this.app.get(['/office', '/office/*'], (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'public', 'office', 'index.html'));
        });

        // Authentication for C-suite
        this.app.post('/api/auth/login', this.handleLogin.bind(this));
        this.app.post('/api/auth/logout', this.handleLogout.bind(this));
        this.app.get('/api/auth/verify', this.verifyToken.bind(this));

        // Health check (no auth) - before middleware
        this.app.get('/api/health', this.healthCheck.bind(this));

        // PUBLIC ROUTES (no auth) - for PWA Dashboard
        this.app.get('/api/public/projects', this.getProjectsPublic.bind(this));
        this.app.get('/api/public/businesses', this.getBusinessesPublic.bind(this));
        this.app.get('/api/public/tasks', this.getTasksPublic.bind(this));
        this.app.get('/api/public/dashboard', this.getDashboardPublic.bind(this));
        this.app.get('/api/public/dashboard/overview', this.getDashboardOverview.bind(this));
        this.app.get('/api/public/tasks/recent-completed', this.getRecentCompletedTasks.bind(this));
        this.app.get('/api/public/tasks/recent-by-project', this.getRecentTasksByProject.bind(this));
        this.app.get('/api/public/tags', this.getTaskTags.bind(this));

        // GitHub Webhooks (PUBLIC - no auth, signature verified)
        this.app.post('/webhooks/github', this.handleGitHubWebhook.bind(this));
        this.app.post('/webhooks/github/workflow', this.handleGitHubActionsWebhook.bind(this));

        // Auth middleware
        this.app.use('/api/', this.authenticateToken.bind(this));

        // Dashboard
        this.app.get('/api/dashboard/overview', this.getDashboardOverview.bind(this));
        this.app.get('/api/dashboard/metrics', this.getDashboardMetrics.bind(this));
        this.app.get('/api/dashboard/alerts', this.getDashboardAlerts.bind(this));
        this.app.get('/api/docs', this.getDocs.bind(this));

        // Projects
        this.app.get('/api/projects', this.getProjects.bind(this));
        // IMPORTANT: Specific routes MUST come before parameterized routes
        this.app.get('/api/projects/check-code/:code', this.checkProjectCode.bind(this));
        this.app.get('/api/projects/:id', this.getProject.bind(this));
        this.app.post('/api/projects', this.createProject.bind(this));
        this.app.put('/api/projects/:id', this.updateProject.bind(this));
        this.app.delete('/api/projects/:id', this.deleteProject.bind(this));
        this.app.post('/api/projects/:id/archive', this.archiveProject.bind(this));
        this.app.post('/api/projects/:id/unarchive', this.unarchiveProject.bind(this));

        // Project Extended Data
        this.app.get('/api/projects/:id/client', this.getProjectClient.bind(this));
        this.app.put('/api/projects/:id/client', this.updateProjectClient.bind(this));
        this.app.get('/api/projects/:id/documents', this.getProjectDocuments.bind(this));
        this.app.post('/api/projects/:id/documents', this.createProjectDocument.bind(this));
        this.app.delete('/api/projects/:id/documents/:docId', this.deleteProjectDocument.bind(this));

        // Inline Documents
        this.app.get('/api/projects/:id/documents/inline', this.getProjectInlineDocuments.bind(this));
        this.app.post('/api/projects/:id/documents/inline', this.createInlineDocument.bind(this));
        this.app.get('/api/documents/inline/:id', this.getInlineDocument.bind(this));
        this.app.put('/api/documents/inline/:id', this.updateInlineDocument.bind(this));
        this.app.delete('/api/documents/inline/:id', this.deleteInlineDocument.bind(this));
        this.app.get('/api/documents/inline/search', this.searchInlineDocuments.bind(this));

        this.app.get('/api/projects/:id/requests', this.getProjectRequests.bind(this));
        this.app.post('/api/projects/:id/requests', this.createProjectRequest.bind(this));
        this.app.put('/api/projects/:id/requests/:reqId', this.updateProjectRequest.bind(this));
        this.app.delete('/api/projects/:id/requests/:reqId', this.deleteProjectRequest.bind(this));

        // Epics
        this.app.get('/api/projects/:id/epics', this.getProjectEpics.bind(this));
        this.app.get('/api/epics/:id', this.getEpicById.bind(this));
        this.app.post('/api/projects/:id/epics', this.createEpic.bind(this));
        this.app.put('/api/epics/:id', this.updateEpic.bind(this));
        this.app.delete('/api/epics/:id', this.deleteEpic.bind(this));

        // Sprints
        this.app.get('/api/projects/:id/sprints', this.getProjectSprints.bind(this));
        this.app.get('/api/sprints/:id', this.getSprintById.bind(this));
        this.app.get('/api/sprints/:id/full', this.getSprintFullHierarchy.bind(this));
        this.app.post('/api/projects/:id/sprints', this.createSprint.bind(this));
        this.app.put('/api/sprints/:id', this.updateSprint.bind(this));
        this.app.delete('/api/sprints/:id', this.deleteSprint.bind(this));

        // Agents
        this.app.get('/api/agents', this.getAgents.bind(this));
        this.app.get('/api/agents/:id', this.getAgent.bind(this));
        this.app.get('/api/agents/:id/performance', this.getAgentPerformance.bind(this));
        this.app.put('/api/agents/:id/status', this.updateAgentStatus.bind(this));

        // Agent MCP Configurations
        this.app.get('/api/agents/:id/mcp-configs', this.getAgentMcpConfigs.bind(this));
        this.app.get('/api/agents/:id/mcp-configs/:configId', this.getAgentMcpConfig.bind(this));
        this.app.post('/api/agents/:id/mcp-configs', this.createAgentMcpConfig.bind(this));
        this.app.put('/api/agents/:id/mcp-configs/:configId', this.updateAgentMcpConfig.bind(this));
        this.app.delete('/api/agents/:id/mcp-configs/:configId', this.deleteAgentMcpConfig.bind(this));
        this.app.post('/api/agents/:id/mcp-configs/:configId/test', this.testAgentMcpConnection.bind(this));

        // Tasks
        this.app.get('/api/tasks', this.getTasks.bind(this));
        this.app.get('/api/tasks/recent-completed', this.getRecentCompletedTasks.bind(this));
        this.app.get('/api/tasks/recent-by-project', this.getRecentTasksByProject.bind(this));
        this.app.get('/api/tasks/:id', this.getTask.bind(this));
        this.app.post('/api/tasks', this.createTask.bind(this));
        this.app.put('/api/tasks/:id', this.updateTask.bind(this));
        this.app.delete('/api/tasks/:id', this.deleteTask.bind(this));

        // Task Items
        this.app.get('/api/tasks/:id/items', this.getTaskItems.bind(this));
        this.app.post('/api/tasks/:id/items', this.createTaskItems.bind(this));
        this.app.put('/api/tasks/:id/items/reorder', this.reorderTaskItems.bind(this));
        this.app.put('/api/tasks/:id/items/:itemId', this.updateTaskItem.bind(this));
        this.app.delete('/api/tasks/:id/items/:itemId', this.deleteTaskItem.bind(this));
        this.app.put('/api/tasks/:id/items/:itemId/complete', this.toggleTaskItemComplete.bind(this));

        // Task Tags
        this.app.get('/api/tags', this.getTaskTags.bind(this));
        this.app.get('/api/tasks/:id/tags', this.getTaskTagAssignments.bind(this));
        this.app.post('/api/tasks/:id/tags', this.addTaskTag.bind(this));
        this.app.delete('/api/tasks/:id/tags/:tagId', this.removeTaskTag.bind(this));
        this.app.get('/api/tasks/by-tag/:tagName', this.getTasksByTag.bind(this));

        // Businesses
        this.app.get('/api/businesses', this.getBusinesses.bind(this));
        this.app.get('/api/businesses/:id', this.getBusiness.bind(this));
        this.app.post('/api/businesses', this.createBusiness.bind(this));
        this.app.put('/api/businesses/:id', this.updateBusiness.bind(this));
        this.app.delete('/api/businesses/:id', this.deleteBusiness.bind(this));

        // Logs
        this.app.get('/api/logs', this.getLogs.bind(this));
        this.app.get('/api/logs/audit', this.getAuditLogs.bind(this));

        // Reports
        this.app.get('/api/reports/projects', this.getProjectReports.bind(this));
        this.app.get('/api/reports/agents', this.getAgentReports.bind(this));
        this.app.get('/api/reports/financial', this.getFinancialReports.bind(this));

        // Docs
        this.app.get('/api/docs/openapi', this.getOpenAPISpec.bind(this));
        this.app.get('/api/docs/list', this.getDocumentsList.bind(this));
        this.app.get('/api/docs/specs', this.getProjectSpecs.bind(this));
        this.app.get('/api/docs/credentials', this.getProjectCredentials.bind(this));
        this.app.get('/api/docs/architecture', this.getProjectArchitecture.bind(this));
        this.app.get('/api/docs/roadmap', this.getProjectRoadmap.bind(this));

        // C-Suite Views
        this.app.get('/api/csuite/ceo', this.getCEODashboard.bind(this));
        this.app.get('/api/csuite/cto', this.getCTODashboard.bind(this));
        this.app.get('/api/csuite/coo', this.getCOODashboard.bind(this));
        this.app.get('/api/csuite/cfo', this.getCFODashboard.bind(this));

        // Agent API
        this.app.post('/api/agent/register-doc', this.registerDocument.bind(this));
        this.app.post('/api/agent/update-project', this.updateProjectFromAgent.bind(this));
        this.app.post('/api/agent/add-task', this.addTaskFromAgent.bind(this));
        this.app.post('/api/agent/log-activity', this.logAgentActivity.bind(this));
        this.app.post('/api/agent/update-metrics', this.updateMetricsFromAgent.bind(this));
        this.app.get('/api/agent/instructions', this.getAgentInstructions.bind(this));

        // Memory API
        this.app.get('/api/memories', this.getMemories.bind(this));
        this.app.get('/api/memories/search', this.searchMemories.bind(this));
        this.app.get('/api/memories/semantic-search', this.semanticSearchMemories.bind(this));
        this.app.get('/api/memories/tags', this.getMemoryTags.bind(this));
        this.app.get('/api/memories/stats', this.getMemoryStats.bind(this));
        this.app.get('/api/memories/:id', this.getMemory.bind(this));
        this.app.get('/api/memories/:id/related', this.getRelatedMemories.bind(this));
        this.app.post('/api/memories', this.createMemory.bind(this));
        this.app.post('/api/memories/:id/boost', this.boostMemory.bind(this));
        this.app.post('/api/memories/crossrefs', this.createMemoryCrossref.bind(this));
        this.app.put('/api/memories/:id', this.updateMemory.bind(this));
        this.app.delete('/api/memories/:id', this.deleteMemory.bind(this));

        // Webhooks API (n8n integration)
        this.app.get('/api/webhooks', this.getWebhooks.bind(this));
        this.app.get('/api/webhooks/:id', this.getWebhook.bind(this));
        this.app.get('/api/webhooks/:id/deliveries', this.getWebhookDeliveries.bind(this));
        this.app.post('/api/webhooks', this.createWebhook.bind(this));
        this.app.post('/api/webhooks/:id/test', this.testWebhook.bind(this));
        this.app.put('/api/webhooks/:id', this.updateWebhook.bind(this));
        this.app.delete('/api/webhooks/:id', this.deleteWebhook.bind(this));

        // ========================================================================
        // GitHub Actions API - Workflow Triggers & Issue/PR Management (JWT Protected)
        // ========================================================================

        this.app.post('/api/github/trigger-workflow', this.authenticateToken.bind(this), this.triggerWorkflow.bind(this));
        this.app.get('/api/github/workflow-status/:run_id', this.authenticateToken.bind(this), this.getWorkflowStatus.bind(this));
        this.app.post('/api/github/create-issue', this.authenticateToken.bind(this), this.createIssue.bind(this));
        this.app.post('/api/github/create-pr', this.authenticateToken.bind(this), this.createPR.bind(this));

        // ========================================================================
        // Agent Execution API - BullMQ Job Management (JWT Protected)
        // ========================================================================

        this.app.post('/api/agent-execution/queue', this.authenticateToken.bind(this), this.queueAgentJob.bind(this));
        this.app.get('/api/agent-execution/jobs', this.authenticateToken.bind(this), this.listAgentJobs.bind(this));
        this.app.get('/api/agent-execution/jobs/:id', this.authenticateToken.bind(this), this.getAgentJobStatus.bind(this));
        this.app.post('/api/agent-execution/jobs/:id/cancel', this.authenticateToken.bind(this), this.cancelAgentJob.bind(this));
        this.app.get('/api/agent-execution/workers', this.authenticateToken.bind(this), this.getWorkerStatus.bind(this));

        // ========================================================================
        // CodeRabbit Code Review API - JWT Protected
        // ========================================================================

        this.app.get('/api/code-review/:owner/:repo/:pullNumber', this.authenticateToken.bind(this), this.getCodeRabbitComments.bind(this));
        this.app.post('/api/code-review/:owner/:repo/comments/:commentId/resolve', this.authenticateToken.bind(this), this.resolveCodeRabbitComment.bind(this));

        // ========================================================================
        // Office CRM API - RBAC Protected
        // ========================================================================

        // Office Dashboard
        this.app.get('/api/office/dashboard', this.authenticateToken.bind(this), this.getOfficeDashboard.bind(this));

        // Office Clients CRUD
        this.app.get('/api/office/clients', this.authenticateToken.bind(this), this.getOfficeClients.bind(this));
        this.app.get('/api/office/clients/:id', this.authenticateToken.bind(this), this.getOfficeClient.bind(this));
        this.app.post('/api/office/clients', this.authenticateToken.bind(this), this.createOfficeClient.bind(this));
        this.app.put('/api/office/clients/:id', this.authenticateToken.bind(this), this.updateOfficeClient.bind(this));
        this.app.delete('/api/office/clients/:id', this.authenticateToken.bind(this), this.deleteOfficeClient.bind(this));

        // Office Client Contacts
        this.app.get('/api/office/clients/:id/contacts', this.authenticateToken.bind(this), this.getClientContacts.bind(this));
        this.app.post('/api/office/clients/:id/contacts', this.authenticateToken.bind(this), this.createClientContact.bind(this));
        this.app.put('/api/office/clients/:clientId/contacts/:id', this.authenticateToken.bind(this), this.updateClientContact.bind(this));
        this.app.delete('/api/office/clients/:clientId/contacts/:id', this.authenticateToken.bind(this), this.deleteClientContact.bind(this));

        // Office Client Projects
        this.app.get('/api/office/clients/:id/projects', this.authenticateToken.bind(this), this.getClientProjects.bind(this));

        // Office Payments
        this.app.get('/api/office/payments', this.authenticateToken.bind(this), this.getOfficePayments.bind(this));
        this.app.get('/api/office/payments/:id', this.authenticateToken.bind(this), this.getOfficePayment.bind(this));
        this.app.post('/api/office/payments', this.authenticateToken.bind(this), this.createOfficePayment.bind(this));
        this.app.put('/api/office/payments/:id', this.authenticateToken.bind(this), this.updateOfficePayment.bind(this));

        // Office Projects (filtered for office visibility)
        this.app.get('/api/office/projects', this.authenticateToken.bind(this), this.getOfficeProjects.bind(this));

        // Permissions API
        this.app.get('/api/office/permissions', this.authenticateToken.bind(this), this.getPermissions.bind(this));
        this.app.get('/api/office/permissions/my', this.authenticateToken.bind(this), this.getMyPermissions.bind(this));

        // Static files
        this.app.use(express.static(path.join(__dirname, 'public')));

        // Serve dashboard for non-API routes
        this.app.get('*', (_req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    // ========================================================================
    // Socket.IO Initialization
    // ========================================================================

    private initializeSocketIO(): void {
        this.io.on('connection', (socket: TypedSocket) => {
            console.log(`C-Suite member connected: ${socket.id}`);

            // Socket authentication
            socket.on('authenticate', async (token: string) => {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
                    const user = await this.getUserById(decoded.userId);

                    if (user) {
                        socket.data.userId = user.id;
                        socket.data.userRole = user.role;
                        this.connectedClients.set(socket.id, {
                            socket_id: socket.id,
                            user: {
                                id: user.id,
                                username: user.username,
                                name: user.name,
                                email: user.email,
                                role: user.role
                            },
                            connected_at: new Date()
                        });

                        socket.emit('authenticated', {
                            user: {
                                id: user.id,
                                username: user.username,
                                name: user.name,
                                email: user.email,
                                role: user.role
                            }
                        });
                        console.log(`${user.name} (${user.role}) authenticated`);

                        // Join role-specific room
                        socket.join(user.role);
                    } else {
                        socket.emit('authentication_error', { error: 'Invalid user' });
                    }
                } catch (error) {
                    socket.emit('authentication_error', { error: 'Invalid token' });
                }
            });

            // Subscribe to project updates
            socket.on('subscribe_projects', () => {
                socket.join('projects');
            });

            // Subscribe to agent updates
            socket.on('subscribe_agents', () => {
                socket.join('agents');
            });

            // Subscribe to critical alerts
            socket.on('subscribe_alerts', () => {
                socket.join('alerts');
            });

            // Subscribe to notifications
            socket.on('subscribe_notifications', () => {
                socket.join('notifications');
                console.log(`${socket.id} subscribed to notifications`);
            });

            // Subscribe to project-specific updates
            socket.on('subscribe_project', (projectId: number) => {
                const roomName = `project:${projectId}`;
                socket.join(roomName);
                console.log(`${socket.id} subscribed to project ${projectId} (room: ${roomName})`);
            });

            // Unsubscribe from project-specific updates
            socket.on('unsubscribe_project', (projectId: number) => {
                const roomName = `project:${projectId}`;
                socket.leave(roomName);
                console.log(`${socket.id} unsubscribed from project ${projectId} (room: ${roomName})`);
            });

            socket.on('disconnect', () => {
                const client = this.connectedClients.get(socket.id);
                if (client) {
                    console.log(`${client.user.name} disconnected`);
                    this.connectedClients.delete(socket.id);
                }
            });
        });

        // Start real-time updates
        this.startRealTimeUpdates();
    }

    private async startRealTimeUpdates(): Promise<void> {
        setInterval(async () => {
            try {
                // Update agent states
                const agentStates = await this.getAgentStates();
                this.io.to('agents').emit('agent_states_update', agentStates);

                // Update project metrics
                const projectMetrics = await this.getProjectMetrics();
                this.io.to('projects').emit('project_metrics_update', projectMetrics);

                // Check critical alerts
                const criticalAlerts = await this.getCriticalAlerts();
                if (criticalAlerts.length > 0) {
                    this.io.to('alerts').emit('critical_alerts', criticalAlerts);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Real-time update error:', errorMessage);
            }
        }, 5000);
    }

    // ========================================================================
    // Authentication Middleware
    // ========================================================================

    private authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
            req.user = decoded;
            next();
        } catch (error) {
            res.status(403).json({ error: 'Invalid or expired token' });
        }
    }

    // ========================================================================
    // Authentication Handlers
    // ========================================================================

    private async handleLogin(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using usersRepo.findUserByUsernameOrId() and updateLastLogin()
            const { userId, username, password } = req.body;

            // Bypass mode for development
            if (password === 'bypass') {
                const identifier = userId || username;
                const user = await usersRepo.findUserByUsernameOrId(identifier);

                if (!user) {
                    res.status(401).json({ error: 'User not found' });
                    return;
                }

                const token = jwt.sign(
                    { userId: user.id, username: user.username, role: user.role },
                    process.env.JWT_SECRET || 'default-secret',
                    { expiresIn: '24h' }
                );

                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
                return;
            }

            // Normal authentication
            const identifier = userId || username;
            const user = await usersRepo.findUserByUsernameOrId(identifier);

            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const validPassword = await bcrypt.compare(password, user.passwordHash);

            if (!validPassword) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'default-secret',
                { expiresIn: '24h' }
            );

            // Update last login
            await usersRepo.updateLastLogin(user.id);

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Login error:', errorMessage);
            res.status(500).json({ error: 'Authentication failed' });
        }
    }

    private async handleLogout(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Logged out successfully' });
    }

    private async verifyToken(req: Request, res: Response): Promise<void> {
        // ✅ MIGRATED TO DRIZZLE ORM - Uses getUserById() which uses usersRepo.findUserById()
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ valid: false, error: 'No token provided' });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
            const user = await this.getUserById(decoded.userId);

            if (user) {
                res.json({
                    valid: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } else {
                res.status(401).json({ valid: false, error: 'User not found' });
            }
        } catch (error) {
            res.status(401).json({ valid: false, error: 'Invalid token' });
        }
    }

    // ========================================================================
    // Health Check
    // ========================================================================

    private async healthCheck(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using db.execute for health check
            // Check database connectivity
            if (this.db) {
                await this.db.execute('SELECT 1');
            }

            // Check Redis (via AgentExecutionService)
            const redisStatus = this.agentExecutionService ? 'connected' : 'disconnected';

            res.json({
                status: 'healthy',
                database: this.db ? 'connected' : 'disconnected',
                redis: redisStatus,
                agentExecution: this.agentExecutionService ? 'available' : 'unavailable',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                database: 'error',
                redis: 'unknown',
                timestamp: new Date().toISOString()
            });
        }
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    private async getUserById(userId: number): Promise<User | null> {
        // ✅ MIGRATED TO DRIZZLE ORM - Using usersRepo.findUserById()
        // TODO: Fix type mapping (Drizzle camelCase vs API snake_case)
        return usersRepo.findUserById(userId) as any;
    }

    private async getAgentStates(): Promise<AgentState[]> {
        // ✅ MIGRATED TO DRIZZLE ORM - Using agentsRepo.findAllAgents()
        const agents = await agentsRepo.findAllAgents();

        // Map to AgentState format (camelCase → snake_case for compatibility)
        return agents.map((agent: any) => ({
            id: agent.id,
            name: agent.name,
            status: agent.status,
            current_task_id: null,
            last_active_at: agent.lastActivity,
        })) as AgentState[];
    }

    private async getProjectMetrics(): Promise<any[]> {
        // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.getProjectMetrics()
        const result = await projectsRepo.getProjectMetrics();
        return (result[0] as unknown as RowDataPacket[]);
    }

    private async getCriticalAlerts(): Promise<Alert[]> {
        // ✅ MIGRATED TO DRIZZLE ORM - Using alertsRepo.getCriticalAlerts()
        return alertsRepo.getCriticalAlerts() as Promise<Alert[]>;
    }

    // ========================================================================
    // Dashboard Handlers (Stubs - will be implemented from server.js)
    // ========================================================================

    private async getDashboardOverview(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using dashboardRepo functions
            const [activeProjects] = await dashboardRepo.getActiveProjectsOverview(10);
            const [todayTasks] = await dashboardRepo.getTodayTasksOverview(15);
            const [agents] = await dashboardRepo.getAgentsOverview();
            const [quickStats] = await dashboardRepo.getQuickStats();

            const stats = (quickStats as any[])[0] || {};

            res.json({
                activeProjects,
                todayTasks,
                agents,
                stats,
                // Add top-level fields for test compatibility
                totalProjects: stats.total_projects || 0,
                totalTasks: stats.total_tasks || 0,
                totalAgents: stats.total_agents || 0,
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getDashboardOverview:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard overview' });
        }
    }

    private async getDashboardMetrics(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using dashboardRepo functions
            const [velocityData] = await dashboardRepo.getVelocityMetrics(7);
            const [projectRates] = await dashboardRepo.getProjectCompletionRates(10);
            const [priorityDist] = await dashboardRepo.getPriorityDistribution();
            const [epicProgress] = await dashboardRepo.getEpicProgress(5);

            res.json({
                velocity: velocityData,
                projectRates,
                priorityDistribution: priorityDist,
                epicProgress,
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getDashboardMetrics:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
        }
    }

    private async getDashboardAlerts(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using dashboardRepo functions
            const [overdueTasks] = await dashboardRepo.getOverdueTasks(10);
            const [blockedTasks] = await dashboardRepo.getBlockedTasks(10);
            const [staleTasks] = await dashboardRepo.getStaleTasks(7, 10);
            const [upcomingDeadlines] = await dashboardRepo.getProjectUpcomingDeadlines(14, 10);
            const [criticalTasks] = await dashboardRepo.getCriticalTasks(10);

            // Return structured object with categorized alerts and summary
            res.json({
                overdueTasks,
                blockedTasks,
                staleTasks,
                upcomingDeadlines,
                criticalTasks,
                summary: {
                    overdue_count: (overdueTasks as any[]).length,
                    blocked_count: (blockedTasks as any[]).length,
                    stale_count: (staleTasks as any[]).length,
                    critical_count: (criticalTasks as any[]).length
                },
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getDashboardAlerts:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard alerts' });
        }
    }

    private async getDocs(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.getAllDocuments()
            const result = await projectsRepo.getAllDocuments(50);
            const docs = (result[0] as unknown as RowDataPacket[]);

            res.json({ docs, count: docs.length });
        } catch (error) {
            console.error('Error in getDocs:', error);
            res.status(500).json({ error: 'Failed to fetch documents' });
        }
    }

    private async getProjectsPublic(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.findAllProjectsWithStats()
            const { status, priority, limit = '50' } = req.query;

            const filters: any = {
                archived: false,
                limit: parseInt(limit as string, 10)
            };

            if (status) filters.status = status as string;
            if (priority) filters.priority = priority as string;

            const result = await projectsRepo.findAllProjectsWithStats(filters);
            const projects = (result[0] as unknown as RowDataPacket[]);

            res.json({ projects, count: projects.length });
        } catch (error) {
            console.error('Error in getProjectsPublic:', error);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }

    private async getBusinessesPublic(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findAllBusinessesWithProjectCount()
            const { status, limit = '50' } = req.query;

            const [businesses] = await businessesRepo.findAllBusinessesWithProjectCount({
                status: status as string,
                limit: parseInt(limit as string, 10)
            });

            res.json({ businesses, count: (businesses as any[]).length });
        } catch (error) {
            console.error('Error in getBusinessesPublic:', error);
            res.status(500).json({ error: 'Failed to fetch businesses' });
        }
    }

    private async getTasksPublic(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.findAllTasksPublic()
            const { status, priority, project_id, limit = '100' } = req.query;

            const [tasks] = await tasksRepo.findAllTasksPublic({
                status: status as string,
                priority: priority as string,
                projectId: project_id ? parseInt(project_id as string, 10) : undefined,
                limit: parseInt(limit as string, 10)
            });

            res.json({ tasks, count: (tasks as any[]).length });
        } catch (error) {
            console.error('Error in getTasksPublic:', error);
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    private async getDashboardPublic(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using dashboardRepo functions
            const [projectStats] = await dashboardRepo.getProjectStats();
            const [taskStats] = await dashboardRepo.getTaskStats();
            const [agentStats] = await dashboardRepo.getAgentStats();
            const [memoryStats] = await dashboardRepo.getMemoryStats();
            const [activityStats] = await dashboardRepo.getActivityStats();
            const [businessStats] = await dashboardRepo.getBusinessStats();

            res.json({
                projects: (projectStats as any[])[0] || {},
                tasks: (taskStats as any[])[0] || {},
                agents: (agentStats as any[])[0] || {},
                memories: (memoryStats as any[])[0] || {},
                activity: (activityStats as any[])[0] || {},
                businesses: (businessStats as any[])[0] || {},
                generated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error in getDashboardPublic:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }

    private async getRecentCompletedTasks(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.getRecentCompletedTasks()
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await tasksRepo.getRecentCompletedTasks(limit);
            const tasks = (result[0] as unknown as RowDataPacket[]);

            res.json(tasks);

        } catch (error) {
            console.error('Error fetching recent completed tasks:', error);
            res.status(500).json({ error: 'Failed to fetch recent completed tasks' });
        }
    }

    private async getRecentTasksByProject(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.getRecentTasksByProject()
            const limit = parseInt(req.query.limit as string) || 30;
            const days = parseInt(req.query.days as string) || 7;

            const [tasks] = await tasksRepo.getRecentTasksByProject({ days, limit });

            // Group tasks by project
            const projectsMap = new Map<number, any>();

            for (const task of tasks as any[]) {
                const projectId = task.project_id || 0;
                const projectName = task.project_name || 'Sin Proyecto';
                const projectCode = task.project_code || 'TSK';

                if (!projectsMap.has(projectId)) {
                    projectsMap.set(projectId, {
                        project_id: projectId,
                        project_name: projectName,
                        project_code: projectCode,
                        tasks: [],
                        total: 0,
                        pending: 0,
                        in_progress: 0,
                        completed: 0
                    });
                }

                const project = projectsMap.get(projectId);
                project.tasks.push({
                    id: task.id,
                    task_code: task.task_code,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    progress: task.progress,
                    created_at: task.created_at,
                    agent_name: task.agent_name,
                    agent_role: task.agent_role
                });
                project.total++;
                if (task.status === 'pending') project.pending++;
                else if (task.status === 'in_progress') project.in_progress++;
                else if (task.status === 'completed') project.completed++;
            }

            const result = Array.from(projectsMap.values())
                .sort((a, b) => b.total - a.total);

            res.json({
                period_days: days,
                total_tasks: (tasks as any[]).length,
                projects: result
            });

        } catch (error) {
            console.error('Error fetching recent tasks by project:', error);
            res.status(500).json({ error: 'Failed to fetch recent tasks by project' });
        }
    }

    private async getTaskTags(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.findAllTags()
            const tags = await tasksRepo.findAllTags();
            res.json({ tags });
        } catch (error) {
            console.error('Error fetching task tags:', error);
            res.status(500).json({ error: 'Failed to fetch task tags' });
        }
    }

    /**
     * Helper: Log activity to database and emit Socket.IO event
     */
    private async logActivity(data: {
        action: string;
        message?: string;
        category?: string;
        level?: string;
        project_id?: number | null;
        agent_id?: number | null;
        metadata?: Record<string, unknown>;
    }): Promise<void> {
        try {
            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO activity_logs (action, message, category, level, project_id, agent_id, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                data.action,
                data.message || data.action,
                data.category || 'system',
                data.level || 'info',
                data.project_id || null,
                data.agent_id || null,
                data.metadata ? JSON.stringify(data.metadata) : null
            ]);

            // Emit Socket.IO event for real-time updates
            const activityEvent = {
                id: result.insertId,
                action: data.action,
                message: data.message || data.action,
                category: data.category || 'system',
                level: data.level || 'info',
                projectId: data.project_id || null,
                agentId: data.agent_id || null,
                metadata: data.metadata || null,
                createdAt: new Date().toISOString()
            };

            this.io.to('notifications').emit('activity_logged', activityEvent);

            // Also emit to project-specific room if project_id exists
            if (data.project_id) {
                this.io.to(`project:${data.project_id}`).emit('activity_logged', activityEvent);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    // ========================================================================
    // Project Handlers
    // ========================================================================

    private async getProjects(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.findProjectsWithStats()
            // TODO: Add filters (status, priority, archived) and pagination to repository
            // const { status, priority, archived, page = '1', limit = '200' } = req.query;

            const projects = await projectsRepo.findProjectsWithStats();
            res.json(projects);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching projects:', errorMessage);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }

    private async getProject(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo, agentsRepo, alertsRepo
            const { id } = req.params;

            const project = await projectsRepo.findProjectById(parseInt(id));

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            const [tasks] = await tasksRepo.getProjectTasks(parseInt(id));
            const [agents] = await agentsRepo.getProjectAgents(parseInt(id));
            const alerts = await alertsRepo.findAllAlerts({ projectId: parseInt(id), status: 'active' });

            res.json({
                project,
                tasks,
                agents,
                alerts
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching project:', errorMessage);
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    }

    private async createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const {
                name,
                code,
                client,
                description,
                priority = 'medium',
                budget,
                start_date,
                deadline,
                office_visible,
                office_origin,
                origin
            } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Project name is required' });
                return;
            }

            const normalizedOrigin = (office_origin || origin || req.headers['x-solaria-portal'] || '').toString().toLowerCase() === 'office'
                ? 'office'
                : 'dfo';
            const normalizedVisibility = office_visible === true || office_visible === 1 || String(office_visible).toLowerCase() === 'true';
            const officeVisible = normalizedOrigin === 'office' ? 1 : normalizedVisibility ? 1 : 0;

            // Validate or generate project code (3 uppercase letters)
            let projectCode: string;
            if (code) {
                // Validate provided code
                const upperCode = code.toUpperCase().trim();
                if (!/^[A-Z]{3}$/.test(upperCode)) {
                    res.status(400).json({ error: 'Project code must be exactly 3 uppercase letters (A-Z)' });
                    return;
                }

                // Check if reserved
                const [reserved] = await this.db!.execute<RowDataPacket[]>(
                    'SELECT code FROM reserved_project_codes WHERE code = ?',
                    [upperCode]
                );
                if ((reserved as any[]).length > 0) {
                    res.status(400).json({ error: `Code '${upperCode}' is reserved and cannot be used` });
                    return;
                }

                // Check if already in use
                const [existing] = await this.db!.execute<RowDataPacket[]>(
                    'SELECT id FROM projects WHERE code = ?',
                    [upperCode]
                );
                if ((existing as any[]).length > 0) {
                    res.status(409).json({ error: `Code '${upperCode}' is already in use by another project` });
                    return;
                }

                projectCode = upperCode;
            } else {
                // Auto-generate from project name (first 3 consonants or letters)
                const consonants = name.toUpperCase().replace(/[^A-Z]/g, '').replace(/[AEIOU]/g, '');
                const letters = name.toUpperCase().replace(/[^A-Z]/g, '');
                let baseCode = consonants.length >= 3 ? consonants.slice(0, 3) : letters.slice(0, 3);

                if (baseCode.length < 3) {
                    baseCode = baseCode.padEnd(3, 'X');
                }

                // Ensure uniqueness by appending a number suffix if needed
                let candidate = baseCode;
                let suffix = 1;
                while (true) {
                    const [existing] = await this.db!.execute<RowDataPacket[]>(
                        'SELECT id FROM projects WHERE code = ?',
                        [candidate]
                    );
                    const [reserved] = await this.db!.execute<RowDataPacket[]>(
                        'SELECT code FROM reserved_project_codes WHERE code = ?',
                        [candidate]
                    );
                    if ((existing as any[]).length === 0 && (reserved as any[]).length === 0) {
                        break;
                    }
                    // Try next variant: ABC -> AB1 -> AB2 -> A12 -> etc
                    candidate = baseCode.slice(0, 2) + String(suffix).slice(-1);
                    suffix++;
                    if (suffix > 9) {
                        candidate = baseCode.slice(0, 1) + String(suffix).padStart(2, '0').slice(-2);
                    }
                    if (suffix > 99) {
                        res.status(400).json({ error: 'Unable to generate unique project code. Please provide one manually.' });
                        return;
                    }
                }
                projectCode = candidate;
            }

            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.createProject()
            const newProject = await projectsRepo.createProject({
                name,
                code: projectCode,
                client: client || null,
                description: description || null,
                priority: priority || 'medium',
                budget: budget ?? null,
                startDate: start_date || null,
                deadline: deadline || null,
                createdBy: req.user?.userId || null,
                officeOrigin: normalizedOrigin,
                officeVisible: officeVisible,
            });

            // TODO: Migrate to activity_logs repository when available
            // Log creation (still raw SQL - pending activity_logs repository)
            await this.db!.execute(`
                INSERT INTO activity_logs (
                    project_id, action, details, category, level
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                newProject.id,
                'project_created',
                `Project ${name} created by ${req.user?.userId}`,
                'management',
                'info'
            ]);

            // Emit socket event for real-time notification
            this.io.emit('project:created', {
                projectId: newProject.id,
                name: name,
                code: projectCode,
                priority: priority || 'medium'
            });

            // Dispatch webhook event for n8n integration
            this.dispatchWebhookEvent('project.created', {
                project_id: newProject.id,
                name: name,
                code: projectCode,
                client: client || null,
                description: description || null,
                priority: priority || 'medium',
                budget: budget || null,
                deadline: deadline || null,
                office_origin: normalizedOrigin
            }, newProject.id);

            res.status(201).json({
                id: newProject.id,
                project_id: newProject.id,
                code: projectCode,
                message: 'Project created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error creating project:', errorMessage);
            res.status(500).json({ error: 'Failed to create project' });
        }
    }

    private async updateProject(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.updateProject()
            const { id } = req.params;
            const updates = req.body;

            // Build Partial<NewProject> object with camelCase fields
            const data: any = {};

            if (updates.name !== undefined) data.name = updates.name;
            if (updates.client !== undefined) data.client = updates.client;
            if (updates.description !== undefined) data.description = updates.description;
            if (updates.priority !== undefined) data.priority = updates.priority;
            if (updates.budget !== undefined) data.budget = updates.budget;
            if (updates.deadline !== undefined) data.deadline = updates.deadline;
            if (updates.status !== undefined) data.status = updates.status;
            if (updates.completion_percentage !== undefined) data.completionPercentage = updates.completion_percentage;

            // Normalize office_origin
            if (updates.office_origin !== undefined || updates.origin !== undefined) {
                data.officeOrigin = (updates.office_origin || updates.origin || '').toLowerCase() === 'office' ? 'office' : 'dfo';
            }

            // Normalize office_visible
            if (updates.office_visible !== undefined) {
                const normalizedVisibility = updates.office_visible === true || updates.office_visible === 1 || String(updates.office_visible).toLowerCase() === 'true';
                data.officeVisible = normalizedVisibility ? 1 : 0;
            }

            // Project URLs (snake_case → camelCase)
            if (updates.production_url !== undefined || updates.productionUrl !== undefined) {
                data.productionUrl = updates.production_url ?? updates.productionUrl;
            }
            if (updates.staging_url !== undefined || updates.stagingUrl !== undefined) {
                data.stagingUrl = updates.staging_url ?? updates.stagingUrl;
            }
            if (updates.local_url !== undefined || updates.localUrl !== undefined) {
                data.localUrl = updates.local_url ?? updates.localUrl;
            }
            if (updates.repo_url !== undefined || updates.repoUrl !== undefined) {
                data.repoUrl = updates.repo_url ?? updates.repoUrl;
            }

            // Tags and Stack (JSON handling)
            if (updates.tags !== undefined) {
                data.tags = Array.isArray(updates.tags) ? JSON.stringify(updates.tags) : updates.tags;
            }
            if (updates.stack !== undefined) {
                data.stack = Array.isArray(updates.stack) ? JSON.stringify(updates.stack) : updates.stack;
            }

            if (Object.keys(data).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            const updatedProject = await projectsRepo.updateProject(parseInt(id), data);

            if (!updatedProject) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            // Emit socket event for real-time notification
            this.io.emit('project:updated', {
                projectId: parseInt(id),
                name: updates.name,
                status: updates.status,
                progress: updates.completion_percentage
            });

            // Dispatch webhook event for n8n integration
            this.dispatchWebhookEvent('project.updated', {
                project_id: parseInt(id),
                ...updates
            }, parseInt(id));

            // Dispatch status_changed if status was updated
            if (updates.status !== undefined) {
                this.dispatchWebhookEvent('project.status_changed', {
                    project_id: parseInt(id),
                    new_status: updates.status
                }, parseInt(id));

                // Dispatch project.completed if status is 'completed'
                if (updates.status === 'completed') {
                    this.dispatchWebhookEvent('project.completed', {
                        project_id: parseInt(id),
                        name: updates.name
                    }, parseInt(id));
                }
            }

            res.json({ message: 'Project updated successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Update project error:', errorMessage);
            res.status(500).json({ error: 'Failed to update project' });
        }
    }

    private async deleteProject(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo functions
            const { id } = req.params;

            // Get project info before deletion for notification
            const project = await projectsRepo.findProjectById(parseInt(id));

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            await projectsRepo.deleteProject(parseInt(id));

            // Emit socket event for real-time notification
            this.io.emit('project:deleted', {
                projectId: parseInt(id),
                name: project.name || 'Proyecto',
                code: project.code || ''
            });

            // Note: project.deleted is captured by 'all' webhooks
            // Dispatch as generic event for n8n workflows that need project deletion notifications
            this.dispatchWebhookEvent('project.updated', {
                project_id: parseInt(id),
                name: project.name || 'Proyecto',
                code: project.code || '',
                deleted: true,
                status: 'deleted'
            }, parseInt(id));

            res.json({ message: 'Project deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Delete project error:', errorMessage);
            res.status(500).json({ error: 'Failed to delete project' });
        }
    }

    private async archiveProject(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.findProjectById() and updateProject()
            const { id } = req.params;

            // Get project info for notification
            const project = await projectsRepo.findProjectById(parseInt(id));

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            // Archive project
            const updated = await projectsRepo.updateProject(parseInt(id), {
                archived: true,
                archivedAt: new Date()
            });

            if (!updated) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            // Emit socket event for real-time notification
            this.io.emit('project:archived', {
                projectId: parseInt(id),
                name: project.name,
                archived: true
            });

            res.json({ message: 'Project archived successfully', id: parseInt(id) });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Archive project error:', errorMessage);
            res.status(500).json({ error: 'Failed to archive project' });
        }
    }

    private async unarchiveProject(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.findProjectById() and updateProject()
            const { id } = req.params;

            // Get project info for notification
            const project = await projectsRepo.findProjectById(parseInt(id));

            if (!project) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            // Unarchive project
            const updated = await projectsRepo.updateProject(parseInt(id), {
                archived: false,
                archivedAt: null
            });

            if (!updated) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            // Emit socket event for real-time notification
            this.io.emit('project:archived', {
                projectId: parseInt(id),
                name: project.name,
                archived: false
            });

            res.json({ message: 'Project restored from archive', id: parseInt(id) });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Unarchive project error:', errorMessage);
            res.status(500).json({ error: 'Failed to restore project' });
        }
    }

    // ========================================================================
    // Project Code Validation
    // ========================================================================

    private async checkProjectCode(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using reservedCodesRepo, projectsRepo
            const { code } = req.params;
            const upperCode = code.toUpperCase().trim();

            // Validate format
            if (!/^[A-Z]{3}$/.test(upperCode)) {
                res.json({ available: false, reason: 'Code must be exactly 3 uppercase letters' });
                return;
            }

            // Check if reserved
            const [reserved] = await reservedCodesRepo.findReservedProjectCode(upperCode);
            if ((reserved as any[]).length > 0) {
                res.json({ available: false, reason: `Code '${upperCode}' is reserved: ${(reserved as any[])[0].reason}` });
                return;
            }

            // Check if already in use
            const existing = await projectsRepo.findProjectByCode(upperCode);
            if (existing) {
                res.json({ available: false, reason: `Code '${upperCode}' is used by project: ${existing.name}` });
                return;
            }

            res.json({ available: true, code: upperCode });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Check project code error:', errorMessage);
            res.status(500).json({ error: 'Failed to check project code' });
        }
    }

    // ========================================================================
    // Epics CRUD
    // ========================================================================

    private async getProjectEpics(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using epicsRepo.findAllEpicsWithStats()
            const { id } = req.params;
            const { status } = req.query;

            const filters: any = { projectId: parseInt(id) };
            if (status) filters.status = status as string;

            const result = await epicsRepo.findAllEpicsWithStats(filters);
            const epics = (result[0] as unknown as RowDataPacket[]);

            res.json({ epics });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Get project epics error:', errorMessage);
            res.status(500).json({ error: 'Failed to get epics' });
        }
    }

    private async getEpicById(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using epicsRepo.findEpicWithStats() + tasksRepo.findAllTasks()
            const { id } = req.params;

            const result = await epicsRepo.findEpicWithStats(parseInt(id));
            const epics = result[0] as unknown as any[];

            if (epics.length === 0) {
                res.status(404).json({ error: 'Epic not found' });
                return;
            }

            // Get associated tasks
            const tasks = await tasksRepo.findAllTasks({ epicId: parseInt(id) });

            res.json({
                epic: epics[0],
                tasks
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Get epic by id error:', errorMessage);
            res.status(500).json({ error: 'Failed to get epic' });
        }
    }

    private async createEpic(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // project_id
            const projectId = parseInt(id, 10);
            const { name, description, color, status, start_date, target_date } = req.body;

            // Validation: name is required
            if (!name) {
                res.status(400).json({ error: 'Epic name is required' });
                return;
            }

            // Validation: name format for agents (must be descriptive, not random)
            if (name.length < 3) {
                res.status(400).json({
                    error: 'Epic name must be at least 3 characters',
                    hint: 'Use descriptive names like "User Authentication" or "Payment Integration"'
                });
                return;
            }

            // Validation: status must be valid
            const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
            if (status && !validStatuses.includes(status)) {
                res.status(400).json({
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
                return;
            }

            // ✅ MIGRATED TO DRIZZLE ORM - Using epicsRepo.createEpic()
            const epic = await epicsRepo.createEpic({
                projectId,
                name,
                epicNumber: 0, // Placeholder, will be overwritten by repository
                description: description || null,
                color: color || '#6366f1',
                status: status || 'open',
                startDate: start_date || null,
                targetDate: target_date || null,
                createdBy: req.user?.userId || null
            });

            const epicCode = `EPIC${String(epic.epicNumber).padStart(3, '0')}`;

            // Log activity and emit Socket.IO event
            await this.logActivity({
                action: 'epic_created',
                message: `Epic ${epicCode} creado: ${name}`,
                category: 'epic',
                level: 'info',
                project_id: projectId,
                metadata: { epicId: epic.id, epicNumber: epic.epicNumber, epicCode, name }
            });

            // Emit epic_created event for real-time updates
            this.io.to('notifications').emit('epic_created', {
                id: epic.id,
                epicNumber: epic.epicNumber,
                name,
                projectId
            });

            res.status(201).json({
                id: epic.id,
                epic_number: epic.epicNumber,
                epic_code: epicCode,
                message: 'Epic created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Create epic error:', errorMessage);
            res.status(500).json({ error: 'Failed to create epic' });
        }
    }

    private async updateEpic(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using epicsRepo.updateEpic()
            const { id } = req.params;
            const { name, description, color, status, start_date, target_date } = req.body;

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (color !== undefined) updateData.color = color;
            if (status !== undefined) updateData.status = status;
            if (start_date !== undefined) updateData.startDate = start_date;
            if (target_date !== undefined) updateData.targetDate = target_date;

            const epic = await epicsRepo.updateEpic(parseInt(id), updateData);

            if (!epic) {
                res.status(404).json({ error: 'Epic not found' });
                return;
            }

            res.json({ message: 'Epic updated successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Update epic error:', errorMessage);
            res.status(500).json({ error: 'Failed to update epic' });
        }
    }

    private async deleteEpic(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using epicsRepo.deleteEpic()
            const { id } = req.params;

            // Tasks with this epic_id will have it set to NULL via FK constraint
            const result = await epicsRepo.deleteEpic(parseInt(id));

            if (result[0].affectedRows === 0) {
                res.status(404).json({ error: 'Epic not found' });
                return;
            }

            res.json({ message: 'Epic deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Delete epic error:', errorMessage);
            res.status(500).json({ error: 'Failed to delete epic' });
        }
    }

    // ========================================================================
    // Sprints CRUD
    // ========================================================================

    private async getProjectSprints(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using sprintsRepo.findAllSprintsWithStats()
            const { id } = req.params;
            const { status } = req.query;

            const filters: any = { projectId: parseInt(id) };
            if (status) filters.status = status as string;

            const result = await sprintsRepo.findAllSprintsWithStats(filters);
            const sprints = (result[0] as unknown as RowDataPacket[]);

            res.json({ sprints });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Get project sprints error:', errorMessage);
            res.status(500).json({ error: 'Failed to get sprints' });
        }
    }

    private async getSprintById(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using sprintsRepo.findSprintWithStats() + tasksRepo.findAllTasks()
            const { id } = req.params;

            const result = await sprintsRepo.findSprintWithStats(parseInt(id));
            const sprints = result[0] as unknown as any[];

            if (sprints.length === 0) {
                res.status(404).json({ error: 'Sprint not found' });
                return;
            }

            // Get associated tasks
            const tasks = await tasksRepo.findAllTasks({ sprintId: parseInt(id) });

            res.json({
                sprint: sprints[0],
                tasks
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Get sprint by id error:', errorMessage);
            res.status(500).json({ error: 'Failed to get sprint' });
        }
    }

    private async createSprint(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // project_id
            const projectId = parseInt(id, 10);
            const { title, name, goal, status, start_date, end_date, velocity, capacity } = req.body;

            // Accept either 'title' or 'name' parameter, prefer 'title' for consistency with create_task
            const sprintName = title || name;

            // Validation: title or name is required
            if (!sprintName) {
                res.status(400).json({
                    error: 'Sprint title or name is required',
                    hint: 'Use either "title" or "name" parameter. Prefer "title" for consistency with tasks.'
                });
                return;
            }

            // Validation: name format for agents (must be descriptive, not random)
            if (sprintName.length < 3) {
                res.status(400).json({
                    error: 'Sprint title/name must be at least 3 characters',
                    hint: 'Use descriptive names like "MVP Release" or "Security Hardening"'
                });
                return;
            }

            // Validation: status must be valid
            const validStatuses = ['planned', 'active', 'completed', 'cancelled'];
            if (status && !validStatuses.includes(status)) {
                res.status(400).json({
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
                return;
            }

            // Validation: velocity and capacity must be non-negative
            if (velocity !== undefined && velocity < 0) {
                res.status(400).json({ error: 'Velocity must be non-negative' });
                return;
            }
            if (capacity !== undefined && capacity < 0) {
                res.status(400).json({ error: 'Capacity must be non-negative' });
                return;
            }

            // ✅ MIGRATED TO DRIZZLE ORM - Using sprintsRepo.createSprint()
            const sprint = await sprintsRepo.createSprint({
                projectId,
                name: sprintName,
                sprintNumber: 0, // Placeholder, will be overwritten by repository
                goal: goal || null,
                status: status || 'planned',
                startDate: start_date || null,
                endDate: end_date || null,
                velocity: velocity || 0,
                capacity: capacity || 0,
                createdBy: req.user?.userId || null
            });

            const sprintCode = `SPRINT${String(sprint.sprintNumber).padStart(3, '0')}`;

            // Log activity and emit Socket.IO event
            await this.logActivity({
                action: 'sprint_created',
                message: `Sprint ${sprintCode} creado: ${sprintName}`,
                category: 'sprint',
                level: 'info',
                project_id: projectId,
                metadata: { sprintId: sprint.id, sprintNumber: sprint.sprintNumber, sprintCode, name: sprintName, goal }
            });

            // Emit sprint_created event for real-time updates
            this.io.to('notifications').emit('sprint_created', {
                id: sprint.id,
                sprintNumber: sprint.sprintNumber,
                name: sprintName,
                projectId
            });

            res.status(201).json({
                id: sprint.id,
                sprint_number: sprint.sprintNumber,
                sprint_code: sprintCode,
                message: 'Sprint created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Create sprint error:', errorMessage);
            res.status(500).json({ error: 'Failed to create sprint' });
        }
    }

    private async updateSprint(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using sprintsRepo.updateSprint()
            const { id } = req.params;
            const { name, goal, status, start_date, end_date, velocity, capacity } = req.body;

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (goal !== undefined) updateData.goal = goal;
            if (status !== undefined) updateData.status = status;
            if (start_date !== undefined) updateData.startDate = start_date;
            if (end_date !== undefined) updateData.endDate = end_date;
            if (velocity !== undefined) updateData.velocity = velocity;
            if (capacity !== undefined) updateData.capacity = capacity;

            const sprint = await sprintsRepo.updateSprint(parseInt(id), updateData);

            if (!sprint) {
                res.status(404).json({ error: 'Sprint not found' });
                return;
            }

            res.json({ message: 'Sprint updated successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Update sprint error:', errorMessage);
            res.status(500).json({ error: 'Failed to update sprint' });
        }
    }

    private async deleteSprint(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using sprintsRepo.deleteSprint()
            const { id } = req.params;

            // Tasks with this sprint_id will have it set to NULL via FK constraint
            const result = await sprintsRepo.deleteSprint(parseInt(id));

            if (result[0].affectedRows === 0) {
                res.status(404).json({ error: 'Sprint not found' });
                return;
            }

            res.json({ message: 'Sprint deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Delete sprint error:', errorMessage);
            res.status(500).json({ error: 'Failed to delete sprint' });
        }
    }

    /**
     * Get full Sprint hierarchy with Epics and Tasks
     * Returns Sprint → Epics → Tasks structure
     */
    private async getSprintFullHierarchy(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using sprintsRepo, epicsRepo, tasksRepo
            const { id } = req.params;
            const sprintId = parseInt(id);

            // 1. Get sprint details with project and stats
            const [sprintData] = await sprintsRepo.findSprintWithStats(sprintId);
            const sprint = (sprintData as any)?.[0];

            if (!sprint) {
                res.status(404).json({ error: 'Sprint not found' });
                return;
            }

            // 2. Get epics with task counts (single query, no N+1)
            const [epicsData] = await epicsRepo.findAllEpicsWithStats({ sprintId });
            const epicsWithCounts = epicsData as any[];

            // 3. Get tasks for each epic (batch query)
            const epicsWithTasks = await Promise.all(
                epicsWithCounts.map(async (epic: any) => {
                    const [tasks] = await tasksRepo.getEpicTasks(epic.id);

                    return {
                        ...epic,
                        progress: this.calculateProgress(epic.tasks_completed, epic.tasks_total),
                        tasks,
                    };
                })
            );

            // 4. Get standalone tasks (direct sprint assignment, no epic)
            const [standaloneTasks] = await tasksRepo.getStandaloneSprintTasks(sprintId);

            // 5. Calculate sprint progress
            const totalTasks = epicsWithTasks.reduce((sum, e) => sum + e.tasks_total, 0) + (standaloneTasks as any[]).length;
            const completedTasks = epicsWithTasks.reduce((sum, e) => sum + e.tasks_completed, 0) +
                (standaloneTasks as any[]).filter((t: any) => t.status === 'completed').length;

            res.json({
                sprint: {
                    ...sprint,
                    progress: this.calculateProgress(completedTasks, totalTasks),
                    epics_total: epicsWithTasks.length,
                    tasks_total: totalTasks,
                    tasks_completed: completedTasks,
                },
                epics: epicsWithTasks,
                standaloneTasks,
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Get sprint full hierarchy error:', errorMessage);
            res.status(500).json({ error: 'Failed to get sprint hierarchy' });
        }
    }

    private async getProjectClient(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.findProjectClient()
            const { id } = req.params;
            const client = await projectsRepo.findProjectClient(parseInt(id));

            if (!client) {
                res.json({ client: null, message: 'No client info found' });
                return;
            }

            res.json({ client });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting project client:', errorMessage);
            res.status(500).json({ error: 'Failed to get project client' });
        }
    }

    private async updateProjectClient(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.upsertProjectClient()
            const { id } = req.params;
            const { name, fiscal_name, rfc, website, address, fiscal_address, contact_name, contact_email, contact_phone, logo_url, notes } = req.body;

            await projectsRepo.upsertProjectClient(parseInt(id), {
                name,
                fiscalName: fiscal_name,
                rfc,
                website,
                address,
                fiscalAddress: fiscal_address,
                contactName: contact_name,
                contactEmail: contact_email,
                contactPhone: contact_phone,
                logoUrl: logo_url,
                notes
            });

            res.json({ message: 'Project client updated successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error updating project client:', errorMessage);
            res.status(500).json({ error: 'Failed to update project client' });
        }
    }

    private async getProjectDocuments(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.findProjectDocuments()
            // TODO: Add uploader_name join to repository (LEFT JOIN users)
            const { id } = req.params;
            const documents = await projectsRepo.findProjectDocuments(parseInt(id));
            res.json({ documents });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting project documents:', errorMessage);
            res.status(500).json({ error: 'Failed to get project documents' });
        }
    }

    private async createProjectDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.createProjectDocument()
            const { id } = req.params;
            const { name, type, url, description, file_size } = req.body;
            const uploaded_by = req.user?.userId || null;

            if (!name || !url) {
                res.status(400).json({ error: 'Name and URL are required' });
                return;
            }

            const document = await projectsRepo.createProjectDocument({
                projectId: parseInt(id),
                name,
                type: type || 'other',
                url,
                description,
                fileSize: file_size,
                uploadedBy: uploaded_by
            });

            res.status(201).json({
                id: document.id,
                message: 'Document created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error creating project document:', errorMessage);
            res.status(500).json({ error: 'Failed to create project document' });
        }
    }

    private async deleteProjectDocument(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.deleteProjectDocument()
            const { id, docId } = req.params;

            await projectsRepo.deleteProjectDocument(parseInt(docId), parseInt(id));

            // TODO: Add affectedRows check for proper 404 handling (similar to deleteAgentMcpConfig)

            res.json({ message: 'Document deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting project document:', errorMessage);
            res.status(500).json({ error: 'Failed to delete project document' });
        }
    }

    // ===================================================================
    // Inline Documents Methods
    // ===================================================================

    private async getProjectInlineDocuments(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using inlineDocumentsRepo.findInlineDocumentsByProject()
            const { id } = req.params;
            const { type } = req.query;

            const result = await inlineDocumentsRepo.findInlineDocumentsByProject(
                parseInt(id),
                type as string | undefined
            );
            const rows = (result[0] as unknown as RowDataPacket[]);

            res.json({ documents: rows });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting inline documents:', errorMessage);
            res.status(500).json({ error: 'Failed to get inline documents' });
        }
    }

    private async createInlineDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using inlineDocumentsRepo.createInlineDocument()
            const { id } = req.params;
            const { name, type, content_md } = req.body;
            const created_by_agent_id = req.user?.userId || null;

            if (!name || !content_md) {
                res.status(400).json({ error: 'Name and content_md are required' });
                return;
            }

            const newDoc = await inlineDocumentsRepo.createInlineDocument({
                projectId: parseInt(id),
                name,
                type: type || 'plan',
                contentMd: content_md,
                createdByAgentId: created_by_agent_id
            });

            res.status(201).json({
                document: newDoc,
                message: 'Inline document created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error creating inline document:', errorMessage);
            res.status(500).json({ error: 'Failed to create inline document' });
        }
    }

    private async getInlineDocument(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using inlineDocumentsRepo.findInlineDocumentById()
            const { id } = req.params;

            const result = await inlineDocumentsRepo.findInlineDocumentById(parseInt(id));
            const rows = (result[0] as unknown as RowDataPacket[]);

            if (rows.length === 0) {
                res.status(404).json({ error: 'Document not found' });
                return;
            }

            res.json({ document: rows[0] });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting inline document:', errorMessage);
            res.status(500).json({ error: 'Failed to get inline document' });
        }
    }

    private async updateInlineDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using inlineDocumentsRepo.updateInlineDocument()
            const { id } = req.params;
            const { name, type, content_md, change_summary } = req.body;

            const result = await inlineDocumentsRepo.updateInlineDocument(parseInt(id), {
                name,
                type,
                contentMd: content_md,
                changeSummary: change_summary,
                createdByAgentId: req.user?.userId || null
            });

            if (!result) {
                res.status(404).json({ error: 'Document not found' });
                return;
            }

            res.json({
                document: result.document,
                previous_version: result.previousVersion,
                message: 'Document updated to version ' + (result.previousVersion + 1)
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error updating inline document:', errorMessage);
            res.status(500).json({ error: 'Failed to update inline document' });
        }
    }

    private async deleteInlineDocument(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using inlineDocumentsRepo.deleteInlineDocument()
            const { id } = req.params;

            const result = await inlineDocumentsRepo.deleteInlineDocument(parseInt(id));
            const affectedRows = (result[0] as any).affectedRows;

            if (affectedRows === 0) {
                res.status(404).json({ error: 'Document not found' });
                return;
            }

            res.json({ message: 'Document deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting inline document:', errorMessage);
            res.status(500).json({ error: 'Failed to delete inline document' });
        }
    }

    private async searchInlineDocuments(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using inlineDocumentsRepo.searchInlineDocuments()
            const { query, project_id, type, limit } = req.query;

            if (!query) {
                res.status(400).json({ error: 'Query parameter is required' });
                return;
            }

            const result = await inlineDocumentsRepo.searchInlineDocuments(
                query as string,
                project_id ? parseInt(project_id as string) : undefined
            );
            const rows = (result[0] as unknown as RowDataPacket[]);

            res.json({ documents: rows, total: rows.length });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error searching inline documents:', errorMessage);
            res.status(500).json({ error: 'Failed to search inline documents' });
        }
    }

    private async getProjectRequests(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.findProjectRequests()
            // TODO: Add status/priority filters and assigned_agent_name join to repository
            const { id } = req.params;
            // const { status, priority } = req.query; // Filtros pendientes en repo

            const requests = await projectsRepo.findProjectRequests(parseInt(id));
            res.json({ requests });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting project requests:', errorMessage);
            res.status(500).json({ error: 'Failed to get project requests' });
        }
    }

    private async createProjectRequest(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.createProjectRequest()
            const { id } = req.params;
            const { text, status, priority, requested_by, assigned_to, notes } = req.body;

            if (!text) {
                res.status(400).json({ error: 'Request text is required' });
                return;
            }

            const request = await projectsRepo.createProjectRequest({
                projectId: parseInt(id),
                text,
                status: status || 'pending',
                priority: priority || 'medium',
                requestedBy: requested_by,
                assignedTo: assigned_to,
                notes
            });

            res.status(201).json({
                id: request.id,
                message: 'Request created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error creating project request:', errorMessage);
            res.status(500).json({ error: 'Failed to create project request' });
        }
    }

    private async updateProjectRequest(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.updateProjectRequest()
            // TODO: Add resolved_at logic to repository when status === 'completed'
            const { id, reqId } = req.params;
            const { text, status, priority, assigned_to, notes } = req.body;

            const updates: any = {};
            if (text !== undefined) updates.text = text;
            if (status !== undefined) updates.status = status;
            if (priority !== undefined) updates.priority = priority;
            if (assigned_to !== undefined) updates.assignedTo = assigned_to;
            if (notes !== undefined) updates.notes = notes;

            if (Object.keys(updates).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            const updatedRequest = await projectsRepo.updateProjectRequest(parseInt(reqId), updates);

            if (!updatedRequest) {
                res.status(404).json({ error: 'Request not found' });
                return;
            }

            res.json({ message: 'Request updated successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error updating project request:', errorMessage);
            res.status(500).json({ error: 'Failed to update project request' });
        }
    }

    private async deleteProjectRequest(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.deleteProjectRequest()
            const { id, reqId } = req.params;

            await projectsRepo.deleteProjectRequest(parseInt(reqId), parseInt(id));

            // TODO: Add affectedRows check for proper 404 handling

            res.json({ message: 'Request deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting project request:', errorMessage);
            res.status(500).json({ error: 'Failed to delete project request' });
        }
    }

    // ========================================================================
    // Agent Handlers
    // ========================================================================

    private async getAgents(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentsRepo.findAgentsWithStats()
            // TODO: Add role/status filters and pagination to agentsRepo if needed
            const agents = await agentsRepo.findAgentsWithStats();
            res.json(agents);
        } catch (error) {
            console.error('Error fetching agents:', error);
            res.status(500).json({ error: 'Failed to fetch agents' });
        }
    }

    private async getAgent(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentsRepo.findAgentById()
            // TODO: Add findAgentByIdWithStats() to repository for task counts
            const { id } = req.params;
            const agent = await agentsRepo.findAgentById(parseInt(id));

            if (!agent) {
                res.status(404).json({ error: 'Agent not found' });
                return;
            }

            res.json(agent);
        } catch (error) {
            console.error('Error fetching agent:', error);
            res.status(500).json({ error: 'Failed to fetch agent' });
        }
    }

    private async getAgentPerformance(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentsRepo.getAgentPerformance()
            const { id } = req.params;
            // const { period = '7d' } = req.query;

            const result = await agentsRepo.getAgentPerformance(parseInt(id), 7);
            const performance = (result[0] as unknown as RowDataPacket[]);

            res.json(performance);

        } catch (error) {
            console.error('Error fetching agent performance:', error);
            res.status(500).json({ error: 'Failed to fetch agent performance' });
        }
    }

    private async updateAgentStatus(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentsRepo.updateAgentStatus()
            const { id } = req.params;
            const { status } = req.body;

            await agentsRepo.updateAgentStatus(parseInt(id), status);
            res.json({ message: 'Agent status updated successfully' });
        } catch (error) {
            console.error('Error updating agent status:', error);
            res.status(500).json({ error: 'Failed to update agent status' });
        }
    }

    // ========================================================================
    // Agent MCP Configuration Handlers
    // ========================================================================

    private async getAgentMcpConfigs(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentMcpConfigsRepo.findAllAgentMcpConfigs()
            const { id } = req.params;

            const configs = await agentMcpConfigsRepo.findAllAgentMcpConfigs(parseInt(id));

            res.json(configs);

        } catch (error) {
            console.error('Error fetching agent MCP configs:', error);
            res.status(500).json({ error: 'Failed to fetch MCP configurations' });
        }
    }

    private async getAgentMcpConfig(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentMcpConfigsRepo.findAgentMcpConfigById()
            const { id, configId } = req.params;

            const config = await agentMcpConfigsRepo.findAgentMcpConfigById(
                parseInt(configId),
                parseInt(id)
            );

            if (!config) {
                res.status(404).json({ error: 'Configuration not found' });
                return;
            }

            res.json(config);

        } catch (error) {
            console.error('Error fetching agent MCP config:', error);
            res.status(500).json({ error: 'Failed to fetch MCP configuration' });
        }
    }

    private async createAgentMcpConfig(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentMcpConfigsRepo.createAgentMcpConfig()
            const { id } = req.params;

            // Validate request body with Zod
            const validation = CreateAgentMcpConfigSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.format()
                });
                return;
            }

            const {
                server_name,
                server_url,
                auth_type,
                auth_credentials,
                transport_type,
                config_options,
                enabled
            } = validation.data;

            // Check for duplicate server_name for this agent
            const existing = await agentMcpConfigsRepo.findAgentMcpConfigByServerName(
                parseInt(id),
                server_name
            );

            if (existing) {
                res.status(409).json({ error: 'Configuration for this server already exists' });
                return;
            }

            const config = await agentMcpConfigsRepo.createAgentMcpConfig({
                agentId: parseInt(id),
                serverName: server_name,
                serverUrl: server_url,
                // Map Zod "api-key" to DB "api_key"
                authType: auth_type === 'api-key' ? 'api_key' : auth_type,
                authCredentials: auth_credentials || {},
                transportType: transport_type,
                configOptions: config_options || {},
                enabled: enabled ?? true
            });

            res.status(201).json({
                id: config.id,
                message: 'MCP configuration created successfully'
            });

        } catch (error) {
            console.error('Error creating agent MCP config:', error);
            res.status(500).json({ error: 'Failed to create MCP configuration' });
        }
    }

    private async updateAgentMcpConfig(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentMcpConfigsRepo.updateAgentMcpConfig()
            const { id, configId } = req.params;

            // Validate request body with Zod
            const validation = UpdateAgentMcpConfigSchema.safeParse(req.body);
            if (!validation.success) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.format()
                });
                return;
            }

            const validatedData = validation.data;

            // Map snake_case request fields to camelCase repository fields
            const updateData: Partial<NewAgentMcpConfig> = {};

            if ('server_name' in validatedData) updateData.serverName = validatedData.server_name;
            if ('server_url' in validatedData) updateData.serverUrl = validatedData.server_url;
            // Map Zod "api-key" to DB "api_key"
            if ('auth_type' in validatedData) {
                updateData.authType = validatedData.auth_type === 'api-key' ? 'api_key' : validatedData.auth_type;
            }
            if ('auth_credentials' in validatedData) updateData.authCredentials = validatedData.auth_credentials;
            if ('transport_type' in validatedData) updateData.transportType = validatedData.transport_type;
            if ('config_options' in validatedData) updateData.configOptions = validatedData.config_options;
            if ('enabled' in validatedData) updateData.enabled = validatedData.enabled;

            const result = await agentMcpConfigsRepo.updateAgentMcpConfig(
                parseInt(configId),
                parseInt(id),
                updateData
            );

            if (!result) {
                res.status(404).json({ error: 'Configuration not found' });
                return;
            }

            res.json({ message: 'MCP configuration updated successfully' });

        } catch (error) {
            console.error('Error updating agent MCP config:', error);
            res.status(500).json({ error: 'Failed to update MCP configuration' });
        }
    }

    private async deleteAgentMcpConfig(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentMcpConfigsRepo.deleteAgentMcpConfig()
            const { id, configId } = req.params;

            const result = await agentMcpConfigsRepo.deleteAgentMcpConfig(
                parseInt(configId),
                parseInt(id)
            );

            // Drizzle returns array with single element containing affectedRows-like info
            // For now, check if result exists (repository method won't throw on 0 rows)
            // TODO: Enhance repository to return affectedRows count for proper 404 handling

            res.json({ message: 'MCP configuration deleted successfully' });

        } catch (error) {
            console.error('Error deleting agent MCP config:', error);
            res.status(500).json({ error: 'Failed to delete MCP configuration' });
        }
    }

    private async testAgentMcpConnection(req: Request, res: Response): Promise<void> {
        try {
            // ✅ PARTIAL MIGRATION - GET config uses agentMcpConfigsRepo
            // TODO: Create updateConnectionStatus() method in repository for status updates
            const { id, configId } = req.params;

            // Get config using repository
            const config = await agentMcpConfigsRepo.findAgentMcpConfigById(
                parseInt(configId),
                parseInt(id)
            );

            if (!config) {
                res.status(404).json({ error: 'Configuration not found' });
                return;
            }

            // Import MCPClientManager dynamically
            const { getMCPClientManager } = await import('../mcp-server/dist/src/client/mcp-client-manager.js');
            const manager = getMCPClientManager();

            // Test connection
            try {
                await manager.connect({
                    name: config.serverName,
                    transport: {
                        type: config.transportType as 'http' | 'stdio' | 'sse',
                        url: config.serverUrl,
                    },
                    auth: config.authType === 'none'
                        ? { type: 'none' }
                        : {
                            type: 'api-key' as const,
                            apiKey: (config.authCredentials as any)?.apiKey || '',
                        },
                    healthCheck: {
                        enabled: true,
                        interval: 60000,
                        timeout: 5000,
                    },
                    retry: {
                        maxAttempts: 1,
                        backoffMs: 1000,
                    },
                });

                // Get tools list
                const tools = manager.listTools(config.serverName);

                // Update connection status (TODO: Move to repository method)
                await this.db!.execute(`
                    UPDATE agent_mcp_configs
                    SET connection_status = 'connected',
                        last_connected_at = NOW(),
                        last_error = NULL
                    WHERE id = ?
                `, [configId]);

                // Disconnect test connection
                await manager.disconnect(config.serverName);

                res.json({
                    success: true,
                    message: 'Connection successful',
                    tools_count: tools.length,
                    tools: tools.map((t: { name: string; description?: string }) => ({
                        name: t.name,
                        description: t.description
                    }))
                });

            } catch (connError) {
                const errorMessage = connError instanceof Error ? connError.message : 'Unknown error';

                // Update error status
                await this.db!.execute(`
                    UPDATE agent_mcp_configs
                    SET connection_status = 'error',
                        last_error = ?
                    WHERE id = ?
                `, [errorMessage, configId]);

                res.status(400).json({
                    success: false,
                    error: 'Connection failed',
                    details: errorMessage
                });
            }

        } catch (error) {
            console.error('Error testing MCP connection:', error);
            res.status(500).json({ error: 'Failed to test connection' });
        }
    }

    // ========================================================================
    // Task Handlers
    // ========================================================================

    /**
     * Helper: Recalculate task progress based on completed items
     * Also auto-completes task when all items are done
     */
    private async recalculateTaskProgress(taskId: number): Promise<{ progress: number; completed: number; total: number }> {
        // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.recalculateTaskProgress()
        const result = await tasksRepo.recalculateTaskProgress(taskId);

        // Emit WebSocket update
        this.io.to('notifications').emit('task_updated', {
            task_id: taskId,
            progress: result.progress,
            items_completed: result.completed,
            items_total: result.total
        } as any);

        return result;
    }

    private async getTasks(req: Request, res: Response): Promise<void> {
        try {
            const { project_id, agent_id, status, sort_by = 'created_at', sort_order = 'desc', limit = '200' } = req.query;

            // Whitelist of allowed sort columns for security
            const allowedSortColumns: Record<string, string> = {
                'created_at': 't.created_at',
                'updated_at': 't.updated_at',
                'title': 't.title',
                'priority': 't.priority',
                'status': 't.status',
                'progress': 't.progress',
                'task_number': 't.task_number',
                'project_name': 'p.name',
                'agent_name': 'aa.name',
                'completed_at': 't.completed_at'
            };

            const sortColumn = allowedSortColumns[sort_by as string] || 't.created_at';
            const sortDirection = (sort_order as string).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
            const safeLimit = Math.min(Math.max(parseInt(limit as string) || 200, 1), 500);

            let query = `
                SELECT
                    t.*,
                    p.name as project_name,
                    p.code as project_code,
                    CONCAT(
                        COALESCE(p.code, 'TSK'), '-',
                        LPAD(COALESCE(t.task_number, t.id), 3, '0')
                    ) as task_code,
                    aa.name as agent_name,
                    u.username as assigned_by_name,
                    (SELECT COUNT(*) FROM task_items WHERE task_id = t.id) as items_total,
                    (SELECT COUNT(*) FROM task_items WHERE task_id = t.id AND is_completed = 1) as items_completed
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                LEFT JOIN users u ON t.assigned_by = u.id
                WHERE 1=1
            `;

            const params: (string | number)[] = [];

            if (project_id) {
                query += ' AND t.project_id = ?';
                params.push(parseInt(project_id as string));
            }

            if (agent_id) {
                query += ' AND t.assigned_agent_id = ?';
                params.push(parseInt(agent_id as string));
            }

            if (status) {
                query += ' AND t.status = ?';
                params.push(status as string);
            }

            query += ` ORDER BY ${sortColumn} ${sortDirection} LIMIT ${safeLimit}`;

            const [tasks] = await this.db!.execute<RowDataPacket[]>(query, params);
            res.json(tasks);

        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    private async getTask(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.findTaskWithDetails(), tasksRepo.findTaskItems()
            const { id } = req.params;

            // Get task with details (JOINs project, agent, user)
            const taskResult = await tasksRepo.findTaskWithDetails(parseInt(id));
            const taskRows = taskResult[0] as unknown as Array<any>;

            if (!taskRows || taskRows.length === 0) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            const task = taskRows[0];

            // Get task items (subtasks/checklist)
            const items = await tasksRepo.findTaskItems(parseInt(id), true);

            // Assemble result
            const result = task as any;
            result.items = items;
            result.items_total = items.length;
            result.items_completed = items.filter((i: any) => i.isCompleted).length;

            res.json(result);

        } catch (error) {
            console.error('Error fetching task:', error);
            res.status(500).json({ error: 'Failed to fetch task' });
        }
    }

    private async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo, agentsRepo, epicsRepo, sprintsRepo
            const {
                title,
                description,
                project_id,
                epic_id,
                sprint_id,
                assigned_agent_id,
                priority = 'medium',
                estimated_hours,
                deadline
            } = req.body;

            // Auto-assign "Claude Code" agent if not specified
            let agentId = assigned_agent_id;
            if (!agentId) {
                const agent = await agentsRepo.findAgentByName('Claude Code', 'active');
                if (agent) {
                    agentId = agent.id;
                }
            }

            // Create task via repository (task_number auto-increment handled internally)
            const createdTask = await tasksRepo.createTask({
                title: title || 'Nueva tarea',
                description: description ?? null,
                projectId: project_id ?? null,
                epicId: epic_id ?? null,
                sprintId: sprint_id ?? null,
                assignedAgentId: agentId ?? null,
                priority: priority || 'medium',
                estimatedHours: estimated_hours ?? null,
                deadline: deadline ?? null,
                assignedBy: req.user?.userId ?? null,
            });

            const taskNumber = createdTask.taskNumber;

            // Generate task_code with suffix
            let taskCode = `#${taskNumber}`;
            let suffix = '';
            let epics: any[] = [];

            if (project_id) {
                // Use repository to get project code
                const project = await projectsRepo.findProjectById(project_id);

                if (project && project.code) {
                    taskCode = `${project.code}-${String(taskNumber).padStart(3, '0')}`;

                    // Add suffix based on epic or sprint
                    if (epic_id) {
                        const epic = await epicsRepo.findEpicById(epic_id);
                        if (epic && epic.epicNumber) {
                            suffix = `-EPIC${String(epic.epicNumber).padStart(2, '0')}`;
                            epics = [epic]; // Para compatibilidad con emit posterior
                        }
                    } else if (sprint_id) {
                        const sprint = await sprintsRepo.findSprintById(sprint_id);
                        if (sprint && sprint.sprintNumber) {
                            suffix = `-SP${String(sprint.sprintNumber).padStart(2, '0')}`;
                        }
                    }
                    taskCode += suffix;
                }
            }

            // Emit task:created notification (colon format for NotificationContext)
            (this.io as any).emit('task:created', {
                id: createdTask.id,
                taskId: createdTask.id,
                task_code: taskCode,
                task_number: taskNumber,
                epic_id: epic_id || null,
                epic_number: epic_id && epics.length > 0 ? epics[0].epicNumber : null,
                title: title || 'Nueva tarea',
                description: description || '',
                projectId: project_id || null,
                project_id: project_id || null,
                assigned_agent_id: agentId || null,
                priority: priority || 'medium',
                status: 'pending',
                progress: 0,
                created_at: new Date().toISOString()
            } as any);

            // Dispatch webhook event for n8n integration
            this.dispatchWebhookEvent('task.created', {
                task_id: createdTask.id,
                task_code: taskCode,
                task_number: taskNumber,
                title: title || 'Nueva tarea',
                description: description || '',
                assigned_agent_id: agentId || null,
                priority: priority || 'medium',
                status: 'pending',
                epic_id: epic_id || null,
                sprint_id: sprint_id || null,
                estimated_hours: estimated_hours || null
            }, project_id || undefined);

            res.status(201).json({
                id: createdTask.id,
                task_code: taskCode,
                task_number: taskNumber,
                message: 'Task created successfully'
            });

        } catch (error) {
            console.error('Error creating task:', error);
            res.status(500).json({ error: 'Failed to create task' });
        }
    }

    private async updateTask(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.updateTask(), tasksRepo.findTaskWithDetails()
            const { id } = req.params;
            const updates = req.body;

            // Build update object with camelCase fields for Drizzle
            const data: any = {};

            if (updates.title !== undefined) data.title = updates.title;
            if (updates.description !== undefined) data.description = updates.description;
            if (updates.status !== undefined) data.status = updates.status;
            if (updates.priority !== undefined) data.priority = updates.priority;
            if (updates.progress !== undefined) data.progress = updates.progress;
            if (updates.project_id !== undefined) data.projectId = updates.project_id;
            if (updates.epic_id !== undefined) data.epicId = updates.epic_id;
            if (updates.sprint_id !== undefined) data.sprintId = updates.sprint_id;
            if (updates.actual_hours !== undefined) data.actualHours = updates.actual_hours;
            if (updates.notes !== undefined) data.notes = updates.notes;
            if (updates.assigned_agent_id !== undefined) data.assignedAgentId = updates.assigned_agent_id;

            // Auto-set progress to 100% when task is marked as completed
            if (updates.status === 'completed' && updates.progress === undefined) {
                data.progress = 100;
            }

            if (Object.keys(data).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            // Update task via repository
            const updatedTask = await tasksRepo.updateTask(parseInt(id), data);

            if (!updatedTask) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            // Fetch task data for WebSocket notification
            const taskResult = await tasksRepo.findTaskWithDetails(parseInt(id));
            const taskForEmit: any = (taskResult[0] as unknown as any[])?.[0] || {};
            let taskCode = taskForEmit.project_code && taskForEmit.task_number
                ? `${taskForEmit.project_code}-${String(taskForEmit.task_number).padStart(3, '0')}`
                : `TASK-${id}`;

            // Emit task:updated for real-time updates (colon format for NotificationContext)
            (this.io as any).emit('task:updated', {
                taskId: parseInt(id),
                task_id: parseInt(id),
                id: parseInt(id),
                task_code: taskCode,
                task_number: taskForEmit.task_number,
                title: taskForEmit.title || updates.title,
                projectId: taskForEmit.project_id,
                project_id: taskForEmit.project_id,
                project_name: taskForEmit.project_name,
                ...updates,
                updated_at: new Date().toISOString()
            } as any);

            // Emit task_completed notification if status changed to completed
            if (updates.status === 'completed') {
                const completedTaskResult = await tasksRepo.findTaskWithDetails(parseInt(id));
                const task: any = (completedTaskResult[0] as unknown as any[])?.[0] || {};

                // Generate task_code
                let completedTaskCode = task.project_code && task.task_number
                    ? `${task.project_code}-${String(task.task_number).padStart(3, '0')}`
                    : `TASK-${id}`;

                // Emit task:completed (colon format for NotificationContext)
                (this.io as any).emit('task:completed', {
                    taskId: parseInt(id),
                    id: parseInt(id),
                    task_code: completedTaskCode,
                    task_number: task.task_number,
                    title: task.title || `Tarea #${id}`,
                    projectId: task.project_id,
                    project_id: task.project_id,
                    project_name: task.project_name || 'Sin proyecto',
                    agent_name: task.agent_name,
                    priority: task.priority || 'medium'
                } as any);

                // Dispatch webhook event for task completed
                this.dispatchWebhookEvent('task.completed', {
                    task_id: parseInt(id),
                    title: task.title,
                    project_name: task.project_name,
                    agent_name: task.agent_name,
                    priority: task.priority
                }, task.project_id || undefined);
            }

            // Dispatch webhook event for task updated
            this.dispatchWebhookEvent('task.updated', {
                task_id: parseInt(id),
                task_code: taskCode,
                title: taskForEmit.title || updates.title,
                project_id: taskForEmit.project_id,
                ...updates
            }, taskForEmit.project_id || undefined);

            // Dispatch status_changed if status was updated
            if (updates.status !== undefined) {
                this.dispatchWebhookEvent('task.status_changed', {
                    task_id: parseInt(id),
                    task_code: taskCode,
                    title: taskForEmit.title,
                    new_status: updates.status,
                    project_id: taskForEmit.project_id
                }, taskForEmit.project_id || undefined);
            }

            // Dispatch task.assigned if agent was changed
            if (updates.assigned_agent_id !== undefined) {
                this.dispatchWebhookEvent('task.assigned', {
                    task_id: parseInt(id),
                    task_code: taskCode,
                    title: taskForEmit.title,
                    assigned_agent_id: updates.assigned_agent_id,
                    project_id: taskForEmit.project_id
                }, taskForEmit.project_id || undefined);
            }

            res.json({ message: 'Task updated successfully' });

        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({ error: 'Failed to update task' });
        }
    }

    private async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            // ✅ PARTIALLY MIGRATED TO DRIZZLE ORM - Using tasksRepo
            // TODO: Add cascade delete helpers to repository (task_items, task_tag_assignments)
            const { id } = req.params;

            // Check if task exists and get metadata for events
            const task = await tasksRepo.findTaskById(parseInt(id));
            if (!task) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            // Delete associated task_items first (cascade delete)
            await this.db!.execute('DELETE FROM task_items WHERE task_id = ?', [id]);

            // Delete associated task_tag_assignments (cascade delete)
            await this.db!.execute('DELETE FROM task_tag_assignments WHERE task_id = ?', [id]);

            // Delete the task via repository
            await tasksRepo.deleteTask(parseInt(id));

            // Emit task:deleted (colon format for NotificationContext)
            (this.io as any).emit('task:deleted', {
                taskId: task.id,
                id: task.id,
                title: task.title,
                projectId: task.projectId,
                project_id: task.projectId
            } as any);

            // Dispatch webhook event for n8n integration
            this.dispatchWebhookEvent('task.deleted', {
                task_id: task.id,
                title: task.title
            }, task.projectId || undefined);

            res.json({ message: 'Task deleted successfully', deleted_id: task.id });

        } catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({ error: 'Failed to delete task' });
        }
    }

    private async getTaskItems(req: Request, res: Response): Promise<void> {
        try {
            // ✅ PARTIALLY MIGRATED TO DRIZZLE ORM - Using tasksRepo.findTaskItems()
            // TODO: Add completed_by_name join to repository (LEFT JOIN ai_agents)
            const taskId = parseInt(req.params.id);

            const items = await tasksRepo.findTaskItems(taskId, true);

            res.json({
                items,
                task_id: taskId,
                total: items.length,
                completed: items.filter((i: any) => i.isCompleted).length
            });
        } catch (error) {
            console.error('Error fetching task items:', error);
            res.status(500).json({ error: 'Failed to fetch task items' });
        }
    }

    private async createTaskItems(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.createTaskItems()
            const taskId = parseInt(req.params.id);
            let { items } = req.body;

            // Support single item or array
            if (!Array.isArray(items)) {
                items = [req.body];
            }

            // Map to repository format (snake_case → camelCase)
            const itemsData = items.map((item: any) => ({
                title: item.title,
                description: item.description || null,
                estimatedMinutes: item.estimated_minutes || 0,
            }));

            const createdItems = await tasksRepo.createTaskItems(taskId, itemsData);

            // Recalculate progress (repository updateTaskProgress already called internally)
            const progress = await this.recalculateTaskProgress(taskId);

            // TODO: Migrate to activity_logs repository when available
            // Log activity (still raw SQL - pending activity_logs repository)
            await this.logActivity({
                action: `Created ${createdItems.length} checklist item(s) for task #${taskId}`,
                category: 'task',
                level: 'info'
            });

            res.status(201).json({
                items: createdItems,
                task_id: taskId,
                ...progress
            });
        } catch (error) {
            console.error('Error creating task items:', error);
            res.status(500).json({ error: 'Failed to create task items' });
        }
    }

    private async updateTaskItem(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.updateTaskItem() and completeTaskItem()
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);
            const { title, description, is_completed, notes, actual_minutes, completed_by_agent_id } = req.body;

            // Check if this is a completion request
            if (is_completed !== undefined && is_completed === true) {
                await tasksRepo.completeTaskItem(
                    taskId,
                    itemId,
                    notes,
                    actual_minutes,
                    completed_by_agent_id
                );
            } else {
                // Build update data object (snake_case → camelCase)
                const data: any = {};
                if (title !== undefined) data.title = title;
                if (description !== undefined) data.description = description;
                if (notes !== undefined) data.notes = notes;
                if (actual_minutes !== undefined) data.actualMinutes = actual_minutes;

                // Handle un-completion
                if (is_completed === false) {
                    data.isCompleted = false;
                    data.completedAt = null;
                    data.completedByAgentId = null;
                }

                if (Object.keys(data).length === 0) {
                    res.status(400).json({ error: 'No fields to update' });
                    return;
                }

                await tasksRepo.updateTaskItem(taskId, itemId, data);
            }

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            // Get updated items
            const items = await tasksRepo.findTaskItems(taskId);
            const updatedItem = items.find(i => i.id === itemId);

            res.json({ item: updatedItem, ...progress });
        } catch (error) {
            console.error('Error updating task item:', error);
            res.status(500).json({ error: 'Failed to update task item' });
        }
    }

    private async toggleTaskItemComplete(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.toggleTaskItemComplete()
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);
            const { notes, actual_minutes, agent_id } = req.body;

            const result = await tasksRepo.toggleTaskItemComplete(
                taskId,
                itemId,
                notes,
                actual_minutes,
                agent_id
            );

            res.json(result);
        } catch (error) {
            console.error('Error toggling task item:', error);
            res.status(500).json({ error: 'Failed to toggle task item' });
        }
    }

    private async deleteTaskItem(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.deleteTaskItem()
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);

            await tasksRepo.deleteTaskItem(taskId, itemId);

            // Recalculate progress (repository updateTaskProgress already called internally)
            const progress = await this.recalculateTaskProgress(taskId);

            res.json({ deleted: true, item_id: itemId, ...progress });
        } catch (error) {
            console.error('Error deleting task item:', error);
            res.status(500).json({ error: 'Failed to delete task item' });
        }
    }

    private async reorderTaskItems(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.reorderTaskItems()
            const taskId = parseInt(req.params.id);
            const { order } = req.body; // Array of { id, sort_order }

            await tasksRepo.reorderTaskItems(taskId, order);

            res.json({ reordered: true, task_id: taskId });
        } catch (error) {
            console.error('Error reordering task items:', error);
            res.status(500).json({ error: 'Failed to reorder task items' });
        }
    }

    private async getTaskTagAssignments(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.findTaskTags()
            const taskId = parseInt(req.params.id);
            const result = await tasksRepo.findTaskTags(taskId);
            const tags = result[0] as unknown as any[];
            res.json({ task_id: taskId, tags });
        } catch (error) {
            console.error('Error fetching task tag assignments:', error);
            res.status(500).json({ error: 'Failed to fetch task tags' });
        }
    }

    private async addTaskTag(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.addTagToTask() and findTagByName()
            const taskId = parseInt(req.params.id);
            const { tag_id, tag_name } = req.body;
            const userId = req.user?.userId || null;

            let tagIdToAssign = tag_id;

            // If tag_name provided instead of tag_id, look up the tag
            if (!tagIdToAssign && tag_name) {
                const tag = await tasksRepo.findTagByName(tag_name);
                if (!tag) {
                    res.status(404).json({ error: `Tag '${tag_name}' not found` });
                    return;
                }
                tagIdToAssign = tag.id;
            }

            if (!tagIdToAssign) {
                res.status(400).json({ error: 'tag_id or tag_name required' });
                return;
            }

            // Add tag to task (includes incrementing usage count)
            await tasksRepo.addTagToTask(taskId, tagIdToAssign, userId);

            // Get the added tag info from result
            const result = await tasksRepo.findTaskTags(taskId);
            const tags = result[0] as unknown as any[];
            const addedTag = tags.find((t: any) => t.id === tagIdToAssign);

            // Emit WebSocket event
            this.io.emit('task_tag_added', {
                task_id: taskId,
                tag: addedTag
            } as any);

            res.json({ success: true, task_id: taskId, tag: addedTag });
        } catch (error: any) {
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: 'Tag already assigned to this task' });
                return;
            }
            console.error('Error adding task tag:', error);
            res.status(500).json({ error: 'Failed to add tag to task' });
        }
    }

    private async removeTaskTag(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using tasksRepo.removeTagFromTask()
            const taskId = parseInt(req.params.id);
            const tagId = parseInt(req.params.tagId);

            const deleted = await tasksRepo.removeTagFromTask(taskId, tagId);

            if (!deleted) {
                res.status(404).json({ error: 'Tag assignment not found' });
                return;
            }

            // Emit WebSocket event
            this.io.emit('task_tag_removed', {
                task_id: taskId,
                tag_id: tagId
            } as any);

            res.json({ success: true, task_id: taskId, tag_id: tagId });
        } catch (error) {
            console.error('Error removing task tag:', error);
            res.status(500).json({ error: 'Failed to remove tag from task' });
        }
    }

    private async getTasksByTag(req: Request, res: Response): Promise<void> {
        try {
            const { tagName } = req.params;
            const { project_id, status, limit = '50' } = req.query;
            const safeLimit = Math.min(Math.max(parseInt(limit as string) || 50, 1), 200);

            let query = `
                SELECT t.*,
                       p.name as project_name,
                       aa.name as agent_name,
                       CONCAT('PROJ-', LPAD(t.project_id, 2, '0'), '-', LPAD(t.task_number, 3, '0')) as code
                FROM tasks t
                JOIN task_tag_assignments tta ON t.id = tta.task_id
                JOIN task_tags tt ON tta.tag_id = tt.id
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                WHERE tt.name = ?
            `;
            const params: (string | number)[] = [tagName.toLowerCase()];

            if (project_id) {
                query += ' AND t.project_id = ?';
                params.push(parseInt(project_id as string));
            }
            if (status) {
                query += ' AND t.status = ?';
                params.push(status as string);
            }

            query += ` ORDER BY t.created_at DESC LIMIT ?`;
            params.push(safeLimit);

            const [rows] = await this.db!.execute<RowDataPacket[]>(query, params);

            res.json({
                tag: tagName,
                count: rows.length,
                tasks: rows
            });
        } catch (error) {
            console.error('Error fetching tasks by tag:', error);
            res.status(500).json({ error: 'Failed to fetch tasks by tag' });
        }
    }

    // ========================================================================
    // Business Handlers
    // ========================================================================

    private async getBusinesses(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findAllBusinesses()
            // TODO: Add count aggregation to repository
            const { status, limit = 50, offset = 0 } = req.query;

            const filters: any = {
                limit: Number(limit),
                offset: Number(offset)
            };
            if (status) filters.status = String(status);

            const businesses = await businessesRepo.findAllBusinesses(filters);

            // Get total count (SQL until repository supports COUNT aggregation)
            const [countResult] = await this.db!.execute<RowDataPacket[]>(
                'SELECT COUNT(*) as total FROM businesses'
            );

            res.json({
                businesses,
                pagination: {
                    total: countResult[0]?.total || 0,
                    limit: Number(limit),
                    offset: Number(offset)
                }
            });
        } catch (error) {
            console.error('Error fetching businesses:', error);
            res.status(500).json({ error: 'Failed to fetch businesses' });
        }
    }

    private async getBusiness(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findBusinessById()
            // TODO: Migrate projects and financials queries to projectsRepo
            const { id } = req.params;

            const business = await businessesRepo.findBusinessById(parseInt(id));

            if (!business) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            // Get associated projects (SQL until projectsRepo supports client filter)
            const [projects] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    id, name, code, status, description,
                    start_date, deadline, completion_percentage,
                    budget, actual_cost
                FROM projects
                WHERE client = ?
                ORDER BY created_at DESC
            `, [business.name]);

            // Get financial summary (SQL until projectsRepo supports aggregations)
            const [financials] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    SUM(budget) as total_budget,
                    SUM(actual_cost) as total_spent,
                    COUNT(*) as total_projects,
                    AVG(completion_percentage) as avg_progress
                FROM projects
                WHERE client = ?
            `, [business.name]);

            res.json({
                business,
                projects,
                financials: financials[0] || {}
            });
        } catch (error) {
            console.error('Error fetching business:', error);
            res.status(500).json({ error: 'Failed to fetch business' });
        }
    }

    private async createBusiness(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.createBusiness()
            // TODO: Migrate activity_logs to repository
            const {
                name,
                description,
                website,
                status = 'inactive',
                revenue = 0,
                expenses = 0,
                logo_url
            } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Name is required' });
                return;
            }

            const profit = Number(revenue) - Number(expenses);

            const business = await businessesRepo.createBusiness({
                name,
                description: description || null,
                website: website || null,
                status: status || 'inactive',
                revenue: String(revenue),
                expenses: String(expenses),
                profit: String(profit),
                logoUrl: logo_url || null
            });

            // Log activity (SQL until activity_logs repository exists)
            await this.db!.execute(`
                INSERT INTO activity_logs (action, details, category, level)
                VALUES ('business_created', ?, 'management', 'info')
            `, [JSON.stringify({ business_id: business.id, name })]);

            res.status(201).json({
                id: business.id,
                message: 'Business created successfully'
            });
        } catch (error) {
            console.error('Error creating business:', error);
            res.status(500).json({ error: 'Failed to create business' });
        }
    }

    private async updateBusiness(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.updateBusiness()
            // TODO: Migrate activity_logs to repository
            const { id } = req.params;
            const {
                name,
                description,
                website,
                status,
                revenue,
                expenses,
                profit,
                logo_url
            } = req.body;

            // Check if business exists
            const existing = await businessesRepo.findBusinessById(parseInt(id));

            if (!existing) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            // Build update data object with only provided fields
            const updateData: any = {};

            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (website !== undefined) updateData.website = website;
            if (status !== undefined) updateData.status = status;
            if (revenue !== undefined) updateData.revenue = String(revenue);
            if (expenses !== undefined) updateData.expenses = String(expenses);
            if (logo_url !== undefined) updateData.logoUrl = logo_url;

            // Handle profit: allow direct update OR auto-calculate from revenue/expenses
            if (profit !== undefined) {
                updateData.profit = String(profit);
            } else if (revenue !== undefined || expenses !== undefined) {
                // Recalculate profit if revenue or expenses changed but profit not provided
                const currentRevenue = revenue !== undefined ? Number(revenue) : Number(existing.revenue);
                const currentExpenses = expenses !== undefined ? Number(expenses) : Number(existing.expenses);
                updateData.profit = String(currentRevenue - currentExpenses);
            }

            if (Object.keys(updateData).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            await businessesRepo.updateBusiness(parseInt(id), updateData);

            // Log activity (SQL until activity_logs repository exists)
            await this.db!.execute(`
                INSERT INTO activity_logs (action, details, category, level)
                VALUES ('business_updated', ?, 'management', 'info')
            `, [JSON.stringify({ business_id: id, updates: Object.keys(req.body) })]);

            res.json({ message: 'Business updated successfully' });
        } catch (error) {
            console.error('Error updating business:', error);
            res.status(500).json({ error: 'Failed to update business' });
        }
    }

    private async deleteBusiness(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.deleteBusiness()
            // TODO: Migrate project count validation and nullify to projectsRepo
            // TODO: Migrate activity_logs to repository
            const { id } = req.params;

            // Check if business exists and has no active projects (SQL until projectsRepo supports filters)
            const [existing] = await this.db!.execute<RowDataPacket[]>(`
                SELECT b.id, b.name, COUNT(p.id) as project_count
                FROM businesses b
                LEFT JOIN projects p ON p.business_id = b.id AND p.status IN ('active', 'planning')
                WHERE b.id = ?
                GROUP BY b.id
            `, [id]);

            if (existing.length === 0) {
                res.status(404).json({ error: 'Business not found' });
                return;
            }

            if (existing[0].project_count > 0) {
                res.status(400).json({
                    error: 'Cannot delete business with active projects',
                    project_count: existing[0].project_count
                });
                return;
            }

            // Nullify business_id in related projects (SQL until projectsRepo supports bulk update)
            await this.db!.execute('UPDATE projects SET business_id = NULL WHERE business_id = ?', [id]);

            // Delete business
            await businessesRepo.deleteBusiness(parseInt(id));

            // Log activity (SQL until activity_logs repository exists)
            await this.db!.execute(`
                INSERT INTO activity_logs (action, details, category, level)
                VALUES ('business_deleted', ?, 'management', 'warning')
            `, [JSON.stringify({ business_id: id, name: existing[0].name })]);

            res.json({ message: 'Business deleted successfully' });
        } catch (error) {
            console.error('Error deleting business:', error);
            res.status(500).json({ error: 'Failed to delete business' });
        }
    }

    // ========================================================================
    // Log Handlers (Stubs)
    // ========================================================================

    private async getLogs(req: Request, res: Response): Promise<void> {
        try {
            const {
                project_id,
                agent_id,
                category,
                level,
                limit = 100,
                offset = 0,
                from_date,
                to_date
            } = req.query;

            let query = `
                SELECT
                    al.id,
                    al.project_id,
                    al.agent_id,
                    al.task_id,
                    al.user_id,
                    al.action,
                    al.details,
                    al.category,
                    al.level,
                    al.timestamp,
                    al.created_at,
                    p.name as project_name,
                    p.code as project_code,
                    aa.name as agent_name,
                    t.title as task_title,
                    t.task_number,
                    u.username as user_name
                FROM activity_logs al
                LEFT JOIN projects p ON al.project_id = p.id
                LEFT JOIN ai_agents aa ON al.agent_id = aa.id
                LEFT JOIN tasks t ON al.task_id = t.id
                LEFT JOIN users u ON al.user_id = u.id
                WHERE 1=1
            `;
            const params: (string | number)[] = [];

            if (project_id) {
                query += ' AND al.project_id = ?';
                params.push(Number(project_id));
            }
            if (agent_id) {
                query += ' AND al.agent_id = ?';
                params.push(Number(agent_id));
            }
            if (category) {
                query += ' AND al.category = ?';
                params.push(String(category));
            }
            if (level) {
                query += ' AND al.level = ?';
                params.push(String(level));
            }
            if (from_date) {
                query += ' AND al.created_at >= ?';
                params.push(String(from_date));
            }
            if (to_date) {
                query += ' AND al.created_at <= ?';
                params.push(String(to_date));
            }

            query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));

            const [logs] = await this.db!.execute<RowDataPacket[]>(query, params);

            // Get total count
            let countQuery = 'SELECT COUNT(*) as total FROM activity_logs al WHERE 1=1';
            const countParams: (string | number)[] = [];

            if (project_id) {
                countQuery += ' AND al.project_id = ?';
                countParams.push(Number(project_id));
            }
            if (agent_id) {
                countQuery += ' AND al.agent_id = ?';
                countParams.push(Number(agent_id));
            }
            if (category) {
                countQuery += ' AND al.category = ?';
                countParams.push(String(category));
            }
            if (level) {
                countQuery += ' AND al.level = ?';
                countParams.push(String(level));
            }

            const [countResult] = await this.db!.execute<RowDataPacket[]>(countQuery, countParams);
            const total = countResult[0]?.total || 0;

            // Test expects direct array, not object with pagination
            res.json(logs);
        } catch (error) {
            console.error('Error fetching logs:', error);
            res.status(500).json({ error: 'Failed to fetch logs' });
        }
    }

    private async getAuditLogs(req: Request, res: Response): Promise<void> {
        try {
            const {
                project_id,
                user_id,
                action,
                limit = 50,
                offset = 0
            } = req.query;

            // Audit logs focus on security-sensitive actions
            const auditActions = [
                'login', 'logout', 'login_failed',
                'user_created', 'user_updated', 'user_deleted',
                'permission_changed', 'role_changed',
                'project_created', 'project_deleted', 'project_archived',
                'task_deleted', 'document_deleted',
                'api_key_created', 'api_key_revoked',
                'settings_changed', 'backup_created', 'backup_restored'
            ];

            let query = `
                SELECT
                    al.id,
                    al.project_id,
                    al.agent_id,
                    al.task_id,
                    al.user_id,
                    al.action,
                    al.details,
                    al.category,
                    al.level,
                    al.timestamp,
                    al.created_at,
                    p.name as project_name,
                    p.code as project_code,
                    u.username as user_name,
                    INET_NTOA(CONV(SUBSTRING(al.details, LOCATE('"ip":"', al.details) + 6,
                        LOCATE('"', al.details, LOCATE('"ip":"', al.details) + 6) - LOCATE('"ip":"', al.details) - 6
                    ), 10, 10)) as ip_address
                FROM activity_logs al
                LEFT JOIN projects p ON al.project_id = p.id
                LEFT JOIN users u ON al.user_id = u.id
                WHERE (al.category = 'security' OR al.action IN (${auditActions.map(() => '?').join(',')}))
            `;
            const params: (string | number)[] = [...auditActions];

            if (project_id) {
                query += ' AND al.project_id = ?';
                params.push(Number(project_id));
            }
            if (user_id) {
                query += ' AND al.user_id = ?';
                params.push(Number(user_id));
            }
            if (action) {
                query += ' AND al.action = ?';
                params.push(String(action));
            }

            query += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
            params.push(Number(limit), Number(offset));

            const [logs] = await this.db!.execute<RowDataPacket[]>(query, params);

            // Get audit summary stats
            const [stats] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    COUNT(*) as total_entries,
                    COUNT(CASE WHEN level = 'warning' THEN 1 END) as warnings,
                    COUNT(CASE WHEN level = 'error' THEN 1 END) as errors,
                    COUNT(CASE WHEN level = 'critical' THEN 1 END) as critical,
                    COUNT(CASE WHEN action LIKE 'login_failed%' THEN 1 END) as failed_logins,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(DISTINCT project_id) as affected_projects
                FROM activity_logs
                WHERE category = 'security'
                   OR action IN (${auditActions.map(() => '?').join(',')})
            `, auditActions);

            res.json({
                logs,
                stats: stats[0] || {},
                pagination: {
                    limit: Number(limit),
                    offset: Number(offset),
                    has_more: logs.length === Number(limit)
                }
            });
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            res.status(500).json({ error: 'Failed to fetch audit logs' });
        }
    }

    // ========================================================================
    // Report Handlers
    // ========================================================================

    private async getProjectReports(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.getProjectReports()
            const result = await projectsRepo.getProjectReports();
            const reports = (result[0] as unknown as RowDataPacket[]);

            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch project reports' });
        }
    }

    private async getAgentReports(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using agentsRepo.getAgentReports()
            const result = await agentsRepo.getAgentReports();
            const reports = (result[0] as unknown as RowDataPacket[]);

            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch agent reports' });
        }
    }

    private async getFinancialReports(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using projectsRepo.getFinancialReports()
            const result = await projectsRepo.getFinancialReports();
            const reports = (result[0] as unknown as RowDataPacket[]);

            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch financial reports' });
        }
    }

    // ========================================================================
    // Docs Handlers
    // ========================================================================

    private async getOpenAPISpec(_req: Request, res: Response): Promise<void> {
        const openApiSpec = {
            openapi: '3.0.3',
            info: {
                title: 'SOLARIA DFO API',
                version: '3.2.0',
                description: 'Digital Field Operations API for project management, task tracking, and AI agent coordination',
                contact: { email: 'charlie@solaria.agency' }
            },
            servers: [
                { url: 'https://dfo.solaria.agency/api', description: 'Production' },
                { url: 'http://localhost:3030/api', description: 'Development' }
            ],
            tags: [
                { name: 'Auth', description: 'Authentication endpoints' },
                { name: 'Projects', description: 'Project management' },
                { name: 'Tasks', description: 'Task management' },
                { name: 'Agents', description: 'AI Agent management' },
                { name: 'Businesses', description: 'Business entities' },
                { name: 'Memories', description: 'Persistent memory system' },
                { name: 'Dashboard', description: 'Analytics and metrics' },
                { name: 'Logs', description: 'Activity and audit logs' },
                { name: 'Public', description: 'Public endpoints (no auth)' }
            ],
            paths: {
                '/auth/login': {
                    post: { tags: ['Auth'], summary: 'Login', requestBody: { content: { 'application/json': { schema: { properties: { username: { type: 'string' }, password: { type: 'string' } } } } } } }
                },
                '/auth/verify': {
                    get: { tags: ['Auth'], summary: 'Verify token', security: [{ bearerAuth: [] }] }
                },
                '/projects': {
                    get: { tags: ['Projects'], summary: 'List projects', parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }] },
                    post: { tags: ['Projects'], summary: 'Create project', security: [{ bearerAuth: [] }] }
                },
                '/projects/{id}': {
                    get: { tags: ['Projects'], summary: 'Get project details', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }] },
                    put: { tags: ['Projects'], summary: 'Update project', security: [{ bearerAuth: [] }] },
                    delete: { tags: ['Projects'], summary: 'Delete project', security: [{ bearerAuth: [] }] }
                },
                '/projects/{id}/epics': {
                    get: { tags: ['Projects'], summary: 'List project epics' },
                    post: { tags: ['Projects'], summary: 'Create epic', security: [{ bearerAuth: [] }] }
                },
                '/projects/{id}/sprints': {
                    get: { tags: ['Projects'], summary: 'List project sprints' },
                    post: { tags: ['Projects'], summary: 'Create sprint', security: [{ bearerAuth: [] }] }
                },
                '/tasks': {
                    get: { tags: ['Tasks'], summary: 'List tasks', parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'blocked'] } }, { name: 'project_id', in: 'query', schema: { type: 'integer' } }] },
                    post: { tags: ['Tasks'], summary: 'Create task', security: [{ bearerAuth: [] }] }
                },
                '/tasks/{id}': {
                    get: { tags: ['Tasks'], summary: 'Get task details' },
                    put: { tags: ['Tasks'], summary: 'Update task', security: [{ bearerAuth: [] }] },
                    delete: { tags: ['Tasks'], summary: 'Delete task', security: [{ bearerAuth: [] }] }
                },
                '/tasks/{id}/items': {
                    get: { tags: ['Tasks'], summary: 'Get task items/subtasks' },
                    post: { tags: ['Tasks'], summary: 'Create task items' }
                },
                '/agents': {
                    get: { tags: ['Agents'], summary: 'List AI agents' }
                },
                '/agents/{id}': {
                    get: { tags: ['Agents'], summary: 'Get agent details' }
                },
                '/agents/{id}/status': {
                    put: { tags: ['Agents'], summary: 'Update agent status' }
                },
                '/businesses': {
                    get: { tags: ['Businesses'], summary: 'List businesses' },
                    post: { tags: ['Businesses'], summary: 'Create business', security: [{ bearerAuth: [] }] }
                },
                '/businesses/{id}': {
                    get: { tags: ['Businesses'], summary: 'Get business details' },
                    put: { tags: ['Businesses'], summary: 'Update business', security: [{ bearerAuth: [] }] },
                    delete: { tags: ['Businesses'], summary: 'Delete business', security: [{ bearerAuth: [] }] }
                },
                '/memories': {
                    get: { tags: ['Memories'], summary: 'List memories', parameters: [{ name: 'tags', in: 'query', schema: { type: 'string' } }, { name: 'query', in: 'query', schema: { type: 'string' } }] },
                    post: { tags: ['Memories'], summary: 'Create memory' }
                },
                '/memories/search': {
                    get: { tags: ['Memories'], summary: 'Search memories with full-text' }
                },
                '/memories/{id}': {
                    get: { tags: ['Memories'], summary: 'Get memory details' },
                    put: { tags: ['Memories'], summary: 'Update memory' },
                    delete: { tags: ['Memories'], summary: 'Delete memory' }
                },
                '/dashboard/overview': {
                    get: { tags: ['Dashboard'], summary: 'Get dashboard overview with KPIs' }
                },
                '/dashboard/metrics': {
                    get: { tags: ['Dashboard'], summary: 'Get detailed metrics' }
                },
                '/dashboard/alerts': {
                    get: { tags: ['Dashboard'], summary: 'Get active alerts' }
                },
                '/logs': {
                    get: { tags: ['Logs'], summary: 'Get activity logs', parameters: [{ name: 'project_id', in: 'query', schema: { type: 'integer' } }, { name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'level', in: 'query', schema: { type: 'string' } }] }
                },
                '/logs/audit': {
                    get: { tags: ['Logs'], summary: 'Get security audit logs' }
                },
                '/public/projects': {
                    get: { tags: ['Public'], summary: 'List projects (public)' }
                },
                '/public/tasks': {
                    get: { tags: ['Public'], summary: 'List tasks (public)' }
                },
                '/public/dashboard': {
                    get: { tags: ['Public'], summary: 'Dashboard stats (public)' }
                }
            },
            components: {
                securitySchemes: {
                    bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
                },
                schemas: {
                    Project: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            code: { type: 'string' },
                            status: { type: 'string', enum: ['planning', 'active', 'paused', 'completed', 'cancelled'] },
                            description: { type: 'string' },
                            progress: { type: 'integer', minimum: 0, maximum: 100 }
                        }
                    },
                    Task: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            title: { type: 'string' },
                            description: { type: 'string' },
                            status: { type: 'string', enum: ['pending', 'in_progress', 'completed', 'blocked'] },
                            priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                            project_id: { type: 'integer' },
                            epic_id: { type: 'integer' },
                            sprint_id: { type: 'integer' }
                        }
                    },
                    Memory: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            content: { type: 'string' },
                            summary: { type: 'string' },
                            tags: { type: 'array', items: { type: 'string' } },
                            importance: { type: 'number', minimum: 0, maximum: 1 }
                        }
                    }
                }
            }
        };

        res.json(openApiSpec);
    }

    private async getDocumentsList(_req: Request, res: Response): Promise<void> {
        try {
            const repoPath = process.env.REPO_PATH || '/repo';
            const fs = await import('fs');
            const path = await import('path');

            const docPatterns = [
                { pattern: /\.md$/i, type: 'markdown', icon: 'fa-file-lines' },
                { pattern: /\.txt$/i, type: 'text', icon: 'fa-file-alt' },
                { pattern: /\.json$/i, type: 'json', icon: 'fa-file-code' },
                { pattern: /\.ya?ml$/i, type: 'yaml', icon: 'fa-file-code' },
                { pattern: /\.sql$/i, type: 'sql', icon: 'fa-database' },
                { pattern: /\.env/i, type: 'env', icon: 'fa-cog' },
                { pattern: /Dockerfile/i, type: 'docker', icon: 'fa-docker' },
                { pattern: /docker-compose/i, type: 'docker', icon: 'fa-docker' }
            ];

            const documents: Array<{
                name: string;
                path: string;
                type: string;
                icon: string;
                size: number;
                modified: Date;
                repoUrl: string;
            }> = [];
            const dirsToScan = ['', 'docs', 'documentation', 'specs', 'config'];

            const getFileType = (filename: string) => {
                for (const p of docPatterns) {
                    if (p.pattern.test(filename)) return { type: p.type, icon: p.icon };
                }
                return { type: 'file', icon: 'fa-file' };
            };

            const scanDir = (dir: string) => {
                const fullPath = path.join(repoPath, dir);
                if (!fs.existsSync(fullPath)) return;

                try {
                    const files = fs.readdirSync(fullPath);
                    for (const file of files) {
                        const filePath = path.join(fullPath, file);
                        const stat = fs.statSync(filePath);

                        if (stat.isFile()) {
                            const { type, icon } = getFileType(file);
                            if (type !== 'file' || file.endsWith('.md')) {
                                documents.push({
                                    name: file,
                                    path: path.join(dir, file),
                                    type: type,
                                    icon: icon,
                                    size: stat.size,
                                    modified: stat.mtime,
                                    repoUrl: 'https://github.com/SOLARIA-AGENCY/akademate.com/blob/main/' + path.join(dir, file).replace(/^\//, '')
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error scanning dir:', dir, e);
                }
            };

            for (const dir of dirsToScan) {
                scanDir(dir);
            }

            documents.sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.name.localeCompare(b.name);
            });

            res.json({
                total: documents.length,
                documents: documents.slice(0, 50)
            });
        } catch (error) {
            console.error('Error listing documents:', error);
            res.status(500).json({ error: 'Failed to list documents' });
        }
    }

    private async getProjectSpecs(_req: Request, res: Response): Promise<void> {
        try {
            res.json({
                project: 'SOLARIA Digital Field Operations',
                specs: {
                    technical: {
                        frontend: {
                            framework: 'Vanilla JS + TailwindCSS',
                            styling: 'shadcn/ui design system',
                            charts: 'Chart.js',
                            realtime: 'Socket.IO'
                        },
                        backend: {
                            runtime: 'Node.js 20',
                            framework: 'Express.js',
                            database: 'MySQL 8.0',
                            authentication: 'JWT + SHA256'
                        },
                        infrastructure: {
                            containerization: 'Docker + Docker Compose',
                            proxy: 'Nginx',
                            ports: { dashboard: 3000, mysql: 3306 }
                        }
                    },
                    features: [
                        'C-Suite Dashboard (CEO/CTO/COO/CFO)',
                        'Real-time project monitoring',
                        'AI Agent coordination',
                        'Quick Access authentication',
                        'Project metrics visualization',
                        'Alert management',
                        'Task tracking'
                    ],
                    requirements: {
                        minimum: { node: '18.0.0', npm: '8.0.0', docker: '20.0.0' },
                        recommended: { node: '20.0.0', npm: '10.0.0', docker: '24.0.0' }
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch specs' });
        }
    }

    private async getProjectCredentials(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (req.user?.role !== 'ceo' && req.user?.role !== 'admin') {
                res.status(403).json({ error: 'Access denied. CEO or Admin role required.' });
                return;
            }

            res.json({
                warning: 'CONFIDENTIAL - Handle with care',
                environments: {
                    development: {
                        dashboard: { url: 'http://localhost:3000', user: 'carlosjperez', password: 'bypass' },
                        database: { host: 'localhost', port: 3306, user: 'solaria_user', password: 'solaria2024', database: 'solaria_construction' },
                        jwt_secret: 'solaria_jwt_secret_key_2024_secure_change_in_production'
                    },
                    production: {
                        note: 'Configure in .env file',
                        required_vars: ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET']
                    }
                },
                api_keys: {
                    openai: 'Configure OPENAI_API_KEY in .env',
                    anthropic: 'Configure ANTHROPIC_API_KEY in .env'
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch credentials' });
        }
    }

    private async getProjectArchitecture(_req: Request, res: Response): Promise<void> {
        try {
            res.json({
                project: 'SOLARIA Digital Field Operations',
                architecture: {
                    overview: 'Microservices-based digital construction office',
                    layers: {
                        presentation: {
                            components: ['Login Screen', 'Dashboard', 'Sidebar Navigation', 'Stat Cards', 'Charts'],
                            technology: 'HTML5 + TailwindCSS + Chart.js'
                        },
                        application: {
                            components: ['Authentication Service', 'Dashboard API', 'Project Service', 'Agent Service', 'Real-time Updates'],
                            technology: 'Express.js + Socket.IO'
                        },
                        data: {
                            components: ['MySQL Database', 'Redis Cache (optional)'],
                            tables: ['users', 'projects', 'ai_agents', 'tasks', 'alerts', 'activity_logs', 'project_metrics']
                        },
                        infrastructure: {
                            components: ['Docker Containers', 'Nginx Reverse Proxy'],
                            services: ['dashboard-backend', 'mysql', 'redis', 'nginx']
                        }
                    },
                    dataFlow: [
                        'User -> Nginx -> Dashboard Backend -> MySQL',
                        'Dashboard Backend <-> Socket.IO -> Browser (real-time)',
                        'AI Agents -> API -> Database -> Dashboard'
                    ]
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch architecture' });
        }
    }

    private async getProjectRoadmap(_req: Request, res: Response): Promise<void> {
        try {
            res.json({
                project: 'SOLARIA Digital Field Operations',
                roadmap: {
                    completed: [
                        { phase: 'Phase 1', name: 'Core Infrastructure', items: ['Docker setup', 'MySQL database', 'Express server'] },
                        { phase: 'Phase 2', name: 'Dashboard UI', items: ['Login screen', 'Main dashboard', 'shadcn styling'] },
                        { phase: 'Phase 3', name: 'Authentication', items: ['JWT auth', 'Quick Access', 'Role-based access'] }
                    ],
                    inProgress: [
                        { phase: 'Phase 4', name: 'C-Suite Views', items: ['CEO Dashboard', 'CTO Dashboard', 'COO Dashboard', 'CFO Dashboard'], progress: 45 }
                    ],
                    planned: [
                        { phase: 'Phase 5', name: 'AI Integration', items: ['Claude API', 'Agent automation', 'Task assignment'] },
                        { phase: 'Phase 6', name: 'Advanced Features', items: ['Notifications', 'Reports export', 'API documentation'] }
                    ]
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch roadmap' });
        }
    }

    // ========================================================================
    // C-Suite Handlers
    // ========================================================================

    private async getCEODashboard(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using csuiteRepo functions
            const [projectsData] = await csuiteRepo.getCEOProjectsWithStats();
            const [budgetData] = await csuiteRepo.getCEOBudgetSummary();
            const [alertsData] = await csuiteRepo.getCEOCriticalAlerts();
            const [tasksData] = await csuiteRepo.getCEOTopTasks(5);

            const projects = projectsData as any[];
            const budgetSummary = budgetData as any[];
            const criticalAlerts = alertsData as any[];
            const topTasks = tasksData as any[];

            const akademateProject = projects.find(p => p.name && p.name.toLowerCase().includes('akademate'));
            const mainProject = akademateProject || projects[0];
            const executiveSummary = `${mainProject?.name || 'Proyecto'}: ${Math.round(mainProject?.completion_percentage || 0)}% completado; ${criticalAlerts.length} alertas críticas activas; presupuesto utilizado ${(budgetSummary[0]?.total_spent || 0)} / ${(budgetSummary[0]?.total_budget || 0)}.`;

            res.json({
                role: 'CEO',
                title: 'Strategic Overview',
                focus: ['ROI', 'Budget', 'Critical Alerts', 'Tareas clave'],
                kpis: {
                    totalProjects: projects.length,
                    totalBudget: budgetSummary[0]?.total_budget || 0,
                    totalSpent: budgetSummary[0]?.total_spent || 0,
                    budgetRemaining: budgetSummary[0]?.remaining || 0,
                    avgCompletion: Math.round(budgetSummary[0]?.avg_completion || 0),
                    roi: (budgetSummary[0]?.total_budget || 0) > 0
                        ? Math.round((((budgetSummary[0]?.total_budget || 0) - (budgetSummary[0]?.total_spent || 0)) / (budgetSummary[0]?.total_budget || 0)) * 100)
                        : 0
                },
                projects,
                criticalAlerts,
                strategicDecisions: topTasks.map((t, idx) => ({
                    id: idx + 1,
                    title: t.title,
                    status: t.status,
                    priority: t.priority,
                    progress: t.progress
                })),
                executiveSummary
            });
        } catch (error) {
            console.error('CEO Dashboard error:', error);
            res.status(500).json({ error: 'Failed to fetch CEO dashboard' });
        }
    }

    private async getCTODashboard(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using csuiteRepo, agentsRepo, and projectsRepo
            const agents = await agentsRepo.findAllAgents();
            const [techMetrics] = await csuiteRepo.getCTOTechMetrics(7);
            const [techDebt] = await csuiteRepo.getCTOTechDebt();
            const projects = await projectsRepo.findAllProjects();

            res.json({
                role: 'CTO',
                title: 'Technology Overview',
                focus: ['Architecture', 'Code Quality', 'Tech Debt', 'Agent Performance'],
                kpis: {
                    totalAgents: agents.length,
                    activeAgents: agents.filter(a => a.status === 'active').length,
                    codeQuality: Math.round(techMetrics[0].avg_quality || 85),
                    testCoverage: Math.round(techMetrics[0].avg_coverage || 70),
                    agentEfficiency: Math.round(techMetrics[0].avg_efficiency || 90),
                    techDebtItems: techDebt[0].count
                },
                projects: projects,
                agents: agents,
                techStack: {
                    frontend: ['HTML5', 'TailwindCSS', 'Chart.js', 'Socket.IO'],
                    backend: ['Node.js 20', 'Express.js', 'MySQL 8'],
                    infrastructure: ['Docker', 'Nginx']
                },
                architectureDecisions: [
                    { id: 1, title: 'Database optimization', status: 'in_review', impact: 'high' },
                    { id: 2, title: 'API versioning strategy', status: 'approved', impact: 'medium' }
                ]
            });
        } catch (error) {
            console.error('CTO Dashboard error:', error);
            res.status(500).json({ error: 'Failed to fetch CTO dashboard' });
        }
    }

    private async getCOODashboard(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using csuiteRepo functions
            const [tasks] = await csuiteRepo.getCOORecentTasks(20);
            const [taskStats] = await csuiteRepo.getCOOTaskStats();
            const [agentWorkload] = await csuiteRepo.getCOOAgentWorkload();

            res.json({
                role: 'COO',
                title: 'Operations Overview',
                focus: ['Daily Operations', 'Task Management', 'Resource Utilization', 'Workflow'],
                kpis: {
                    totalTasks: taskStats[0].total,
                    completedTasks: taskStats[0].completed,
                    inProgressTasks: taskStats[0].in_progress,
                    blockedTasks: taskStats[0].blocked,
                    pendingTasks: taskStats[0].pending,
                    completionRate: taskStats[0].total > 0
                        ? Math.round((taskStats[0].completed / taskStats[0].total) * 100)
                        : 0
                },
                recentTasks: tasks,
                agentWorkload: agentWorkload,
                operationalAlerts: [
                    { id: 1, message: 'Agent NEMESIS-DEV-01 at high capacity', severity: 'medium' },
                    { id: 2, message: '2 tasks approaching deadline', severity: 'high' }
                ]
            });
        } catch (error) {
            console.error('COO Dashboard error:', error);
            res.status(500).json({ error: 'Failed to fetch COO dashboard' });
        }
    }

    private async getCFODashboard(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using csuiteRepo functions
            const [financials] = await csuiteRepo.getCFOFinancials();
            const [costByProject] = await csuiteRepo.getCFOCostByProject();
            const [monthlySpend] = await csuiteRepo.getCFOMonthlySpend(6);

            res.json({
                role: 'CFO',
                title: 'Financial Overview',
                focus: ['Budget', 'Costs', 'ROI', 'Financial Projections'],
                kpis: {
                    totalBudget: financials[0].total_budget || 0,
                    totalSpent: financials[0].total_cost || 0,
                    remainingBudget: financials[0].remaining_budget || 0,
                    burnRate: financials[0].total_budget > 0
                        ? Math.round((financials[0].total_cost / financials[0].total_budget) * 100)
                        : 0,
                    projectedROI: 35,
                    costPerTask: 7500
                },
                costByProject: costByProject,
                monthlySpend: monthlySpend,
                financialAlerts: [
                    { id: 1, message: 'Budget on track - 18% utilized', severity: 'low' },
                    { id: 2, message: 'Q1 projection positive', severity: 'info' }
                ],
                approvalsPending: [
                    { id: 1, title: 'Infrastructure upgrade', amount: 15000, status: 'pending' },
                    { id: 2, title: 'Additional AI agents', amount: 8000, status: 'review' }
                ]
            });
        } catch (error) {
            console.error('CFO Dashboard error:', error);
            res.status(500).json({ error: 'Failed to fetch CFO dashboard' });
        }
    }

    // ========================================================================
    // Agent API Handlers
    // ========================================================================

    private async registerDocument(req: Request, res: Response): Promise<void> {
        try {
            const { project_id, name, type, path, description } = req.body;

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO activity_logs (project_id, action, details, category, level)
                VALUES (?, 'document_registered', ?, 'management', 'info')
            `, [project_id || 1, JSON.stringify({ name, type, path, description })]);

            res.status(201).json({
                success: true,
                id: result.insertId,
                message: `Document '${name}' registered successfully`
            });
        } catch (error) {
            console.error('Register document error:', error);
            res.status(500).json({ error: 'Failed to register document' });
        }
    }

    private async updateProjectFromAgent(req: Request, res: Response): Promise<void> {
        try {
            const { project_id, updates } = req.body;

            const fields: string[] = [];
            const values: (string | number)[] = [];

            if (updates.name) { fields.push('name = ?'); values.push(updates.name); }
            if (updates.description) { fields.push('description = ?'); values.push(updates.description); }
            if (updates.status) { fields.push('status = ?'); values.push(updates.status); }
            if (updates.completion_percentage !== undefined) {
                fields.push('completion_percentage = ?');
                values.push(updates.completion_percentage);
            }
            if (updates.tech_stack) {
                fields.push('tech_stack = ?');
                values.push(JSON.stringify(updates.tech_stack));
            }

            if (fields.length > 0) {
                values.push(project_id || 1);
                await this.db!.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
            }

            await this.db!.execute(`
                INSERT INTO activity_logs (project_id, action, details, category, level)
                VALUES (?, 'project_updated_by_agent', ?, 'management', 'info')
            `, [project_id || 1, JSON.stringify(updates)]);

            res.json({ success: true, message: 'Project updated by agent' });
        } catch (error) {
            console.error('Update project from agent error:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    }

    private async addTaskFromAgent(req: Request, res: Response): Promise<void> {
        try {
            const {
                project_id,
                title,
                description,
                agent_id,
                priority = 'medium',
                estimated_hours,
                status = 'pending'
            } = req.body;

            const effectiveProjectId = project_id || 1;

            const [maxTask] = await this.db!.execute<RowDataPacket[]>(
                'SELECT COALESCE(MAX(task_number), 0) + 1 as next_number FROM tasks WHERE project_id = ?',
                [effectiveProjectId]
            );
            const taskNumber = maxTask[0].next_number;

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO tasks (title, description, project_id, assigned_agent_id, task_number, priority, estimated_hours, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                title ?? 'Nueva tarea',
                description ?? null,
                effectiveProjectId,
                agent_id ?? null,
                taskNumber,
                priority ?? 'medium',
                estimated_hours ?? null,
                status ?? 'pending'
            ]);

            let taskCode = `#${taskNumber}`;
            const [projects] = await this.db!.execute<RowDataPacket[]>(
                'SELECT code FROM projects WHERE id = ?',
                [effectiveProjectId]
            );
            if (projects.length > 0 && projects[0].code) {
                taskCode = `${projects[0].code}-${String(taskNumber).padStart(3, '0')}`;
            }

            await this.db!.execute(`
                INSERT INTO activity_logs (project_id, agent_id, action, details, category, level)
                VALUES (?, ?, 'task_created_by_agent', ?, 'development', 'info')
            `, [effectiveProjectId, agent_id ?? null, JSON.stringify({ task_id: result.insertId, task_code: taskCode, title: title ?? 'Task' })]);

            this.io.to('notifications').emit('task_created', {
                id: result.insertId,
                task_code: taskCode,
                task_number: taskNumber,
                title,
                project_id: effectiveProjectId,
                priority
            } as Record<string, unknown>);

            res.status(201).json({
                success: true,
                task_id: result.insertId,
                task_code: taskCode,
                task_number: taskNumber,
                message: `Task '${title}' (${taskCode}) created successfully`
            });
        } catch (error) {
            console.error('Add task from agent error:', error);
            res.status(500).json({ error: 'Failed to add task' });
        }
    }

    private async logAgentActivity(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using alertsRepo.createActivityLog()
            const { project_id, agent_id, action, details, category = 'system', level = 'info' } = req.body;

            // Serialize details if object
            const safeDetails = details ? JSON.stringify(details) : null;

            // Create activity log via repository (snake_case → camelCase)
            const createdLog = await alertsRepo.createActivityLog({
                projectId: project_id ?? null,
                agentId: agent_id ?? null,
                action: action ?? 'unknown',
                details: safeDetails,
                category,
                level,
            });

            res.status(201).json({
                success: true,
                log_id: createdLog.id,
                message: 'Activity logged successfully'
            });
        } catch (error) {
            console.error('Log agent activity error:', error);
            res.status(500).json({ error: 'Failed to log activity' });
        }
    }

    private async updateMetricsFromAgent(req: Request, res: Response): Promise<void> {
        try {
            const {
                project_id,
                completion_percentage,
                agent_efficiency,
                code_quality_score,
                test_coverage,
                tasks_completed,
                tasks_pending,
                tasks_blocked,
                budget_used
            } = req.body;

            await this.db!.execute(`
                INSERT INTO project_metrics (
                    project_id, metric_date, completion_percentage, agent_efficiency,
                    code_quality_score, test_coverage, tasks_completed, tasks_pending,
                    tasks_blocked, budget_used
                ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    completion_percentage = VALUES(completion_percentage),
                    agent_efficiency = VALUES(agent_efficiency),
                    code_quality_score = VALUES(code_quality_score),
                    test_coverage = VALUES(test_coverage),
                    tasks_completed = VALUES(tasks_completed),
                    tasks_pending = VALUES(tasks_pending),
                    tasks_blocked = VALUES(tasks_blocked),
                    budget_used = VALUES(budget_used)
            `, [
                project_id || 1,
                completion_percentage || 0,
                agent_efficiency || 0,
                code_quality_score || 0,
                test_coverage || 0,
                tasks_completed || 0,
                tasks_pending || 0,
                tasks_blocked || 0,
                budget_used || 0
            ]);

            res.json({ success: true, message: 'Metrics updated successfully' });
        } catch (error) {
            console.error('Update metrics error:', error);
            res.status(500).json({ error: 'Failed to update metrics' });
        }
    }

    private async getAgentInstructions(_req: Request, res: Response): Promise<void> {
        try {
            res.json({
                project: 'SOLARIA Digital Field Operations',
                instructions: {
                    initialization: [
                        'Register your agent using POST /api/agent/register',
                        'Log your activities using POST /api/agent/log-activity',
                        'Update project status using POST /api/agent/update-project'
                    ],
                    taskManagement: [
                        'Create tasks using POST /api/agent/add-task',
                        'Update task progress using PUT /api/tasks/:id',
                        'Log completion using POST /api/agent/log-activity'
                    ],
                    metricsReporting: [
                        'Update metrics daily using POST /api/agent/update-metrics',
                        'Include: completion_percentage, agent_efficiency, code_quality_score'
                    ]
                },
                endpoints: {
                    registerDocument: 'POST /api/agent/register-doc',
                    updateProject: 'POST /api/agent/update-project',
                    addTask: 'POST /api/agent/add-task',
                    logActivity: 'POST /api/agent/log-activity',
                    updateMetrics: 'POST /api/agent/update-metrics'
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch agent instructions' });
        }
    }

    // ========================================================================
    // Memory Handlers (Integrated from Memora)
    // ========================================================================

    private async getMemories(req: Request, res: Response): Promise<void> {
        try {
            const { project_id, query, tags, limit = '20', offset = '0', sort_by = 'importance' } = req.query;

            let sql = `
                SELECT m.*, p.name as project_name, aa.name as agent_name
                FROM memories m
                LEFT JOIN projects p ON m.project_id = p.id
                LEFT JOIN ai_agents aa ON m.agent_id = aa.id
                WHERE 1=1
            `;
            const params: (string | number)[] = [];

            if (project_id) {
                sql += ' AND m.project_id = ?';
                params.push(parseInt(project_id as string));
            }

            if (query) {
                sql += ' AND (m.content LIKE ? OR m.summary LIKE ?)';
                params.push(`%${query}%`, `%${query}%`);
            }

            if (tags && tags !== '' && tags !== '[]') {
                try {
                    const tagList = JSON.parse(tags as string) as string[];
                    if (Array.isArray(tagList) && tagList.length > 0) {
                        const tagConditions = tagList.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
                        sql += ` AND (${tagConditions})`;
                        tagList.forEach(tag => params.push(JSON.stringify(tag)));
                    }
                } catch (parseError) {
                    console.warn('Invalid tags parameter in getMemories, ignoring:', tags);
                    // Continue without tag filtering
                }
            }

            // Sort order
            const sortMap: Record<string, string> = {
                'importance': 'm.importance DESC, m.created_at DESC',
                'created_at': 'm.created_at DESC',
                'updated_at': 'm.updated_at DESC',
                'access_count': 'm.access_count DESC'
            };
            sql += ` ORDER BY ${sortMap[sort_by as string] || sortMap['importance']}`;

            sql += ` LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}`;

            const [memories] = await this.db!.execute<RowDataPacket[]>(sql, params);

            // Parse JSON fields
            memories.forEach((m: any) => {
                m.tags = m.tags ? JSON.parse(m.tags) : [];
                m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
            });

            res.json({ memories, count: memories.length });
        } catch (error) {
            console.error('Get memories error:', error);
            res.status(500).json({ error: 'Failed to fetch memories' });
        }
    }

    private async searchMemories(req: Request, res: Response): Promise<void> {
        try {
            const { query, project_id, tags, min_importance = '0', limit = '10' } = req.query;

            if (!query) {
                res.status(400).json({ error: 'Query parameter required' });
                return;
            }

            let sql = `
                SELECT m.*,
                    MATCH(m.content, m.summary) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance,
                    p.name as project_name
                FROM memories m
                LEFT JOIN projects p ON m.project_id = p.id
                WHERE MATCH(m.content, m.summary) AGAINST(? IN NATURAL LANGUAGE MODE)
                AND m.importance >= ?
            `;
            const params: (string | number)[] = [query as string, query as string, parseFloat(min_importance as string)];

            if (project_id) {
                sql += ' AND m.project_id = ?';
                params.push(parseInt(project_id as string));
            }

            if (tags && tags !== '' && tags !== '[]') {
                try {
                    const tagList = JSON.parse(tags as string) as string[];
                    if (Array.isArray(tagList) && tagList.length > 0) {
                        const tagConditions = tagList.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
                        sql += ` AND (${tagConditions})`;
                        tagList.forEach(tag => params.push(JSON.stringify(tag)));
                    }
                } catch (parseError) {
                    console.warn('Invalid tags parameter in searchMemories, ignoring:', tags);
                    // Continue without tag filtering
                }
            }

            sql += ` ORDER BY relevance DESC, m.importance DESC LIMIT ${parseInt(limit as string)}`;

            const [memories] = await this.db!.execute<RowDataPacket[]>(sql, params);

            memories.forEach((m: any) => {
                m.tags = m.tags ? JSON.parse(m.tags) : [];
                m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
            });

            res.json({ results: memories, count: memories.length, query });
        } catch (error) {
            console.error('Search memories error:', error);
            res.status(500).json({ error: 'Failed to search memories' });
        }
    }

    /**
     * Semantic search memories using vector embeddings
     * Combines cosine similarity (60%) with FULLTEXT score (40%)
     */
    private async semanticSearchMemories(req: Request, res: Response): Promise<void> {
        try {
            const { query, project_id, min_similarity = 0.5, limit = 10, include_fulltext = true } = req.query;

            if (!query || typeof query !== 'string') {
                res.status(400).json({ error: 'Query parameter is required' });
                return;
            }

            // Get query embedding from worker
            const queryEmbedding = await this.getQueryEmbedding(query);

            if (!queryEmbedding) {
                // Fallback to FULLTEXT search if embedding service unavailable
                console.warn('[semantic-search] Embedding service unavailable, falling back to FULLTEXT');
                return this.searchMemories(req, res);
            }

            // Fetch memories with embeddings
            let sql = `
                SELECT m.*, p.name as project_name, aa.name as agent_name,
                       MATCH(m.content) AGAINST(? IN NATURAL LANGUAGE MODE) as fulltext_score
                FROM memories m
                LEFT JOIN projects p ON m.project_id = p.id
                LEFT JOIN ai_agents aa ON m.agent_id = aa.id
                WHERE m.embedding IS NOT NULL
            `;
            const params: (string | number)[] = [query];

            if (project_id) {
                sql += ' AND m.project_id = ?';
                params.push(Number(project_id));
            }

            sql += ' ORDER BY m.importance DESC, m.created_at DESC LIMIT 100';

            const [memories] = await this.db!.execute<RowDataPacket[]>(sql, params);

            // Calculate hybrid scores and rank
            const scoredMemories = memories.map((memory: any) => {
                const embedding = memory.embedding ? JSON.parse(memory.embedding) : null;

                let cosineSim = 0;
                if (embedding && Array.isArray(embedding)) {
                    cosineSim = this.cosineSimilarity(queryEmbedding, embedding);
                }

                // Normalize fulltext score (typically 0-20+)
                const normalizedFulltext = Math.min(memory.fulltext_score / 10, 1);

                // Hybrid score: 60% semantic + 40% keyword
                const hybridScore = include_fulltext === 'true'
                    ? (0.6 * cosineSim) + (0.4 * normalizedFulltext)
                    : cosineSim;

                return {
                    ...memory,
                    tags: memory.tags ? JSON.parse(memory.tags) : [],
                    metadata: memory.metadata ? JSON.parse(memory.metadata) : {},
                    embedding: undefined, // Don't return embedding in response
                    similarity: cosineSim,
                    fulltext_score: normalizedFulltext,
                    hybrid_score: hybridScore
                };
            });

            // Filter by minimum similarity and sort by hybrid score
            const filteredMemories = scoredMemories
                .filter((m: any) => m.similarity >= Number(min_similarity))
                .sort((a: any, b: any) => b.hybrid_score - a.hybrid_score)
                .slice(0, Number(limit));

            res.json({
                memories: filteredMemories,
                count: filteredMemories.length,
                query,
                embedding_available: true,
                search_type: include_fulltext === 'true' ? 'hybrid' : 'semantic'
            });
        } catch (error) {
            console.error('Semantic search error:', error);
            res.status(500).json({ error: 'Failed to perform semantic search' });
        }
    }

    private async getMemory(req: Request, res: Response): Promise<void> {
        try {
            // ✅ PARTIALLY MIGRATED TO DRIZZLE ORM - Using memoriesRepo
            // TODO: Add project_name and agent_name JOINs to repository
            const { id } = req.params;
            const { track_access } = req.query;

            const memory = await memoriesRepo.findMemoryById(parseInt(id));

            if (!memory) {
                res.status(404).json({ error: 'Memory not found' });
                return;
            }

            // Track access if requested
            if (track_access === 'true') {
                await memoriesRepo.accessMemory(parseInt(id));
            }

            // Parse JSON fields
            const memoryData = memory as any;
            memoryData.tags = memoryData.tags ? JSON.parse(memoryData.tags) : [];
            memoryData.metadata = memoryData.metadata ? JSON.parse(memoryData.metadata) : {};

            // TODO: Add project_name and agent_name via separate queries or enhance repository
            // For now, returning memory without these fields

            res.json(memoryData);
        } catch (error) {
            console.error('Get memory error:', error);
            res.status(500).json({ error: 'Failed to fetch memory' });
        }
    }

    private async createMemory(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using memoriesRepo.createMemory()
            const { content, summary, tags, metadata, importance = 0.5, project_id, agent_id } = req.body;

            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return;
            }

            // Serialize tags and metadata for Drizzle
            const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
            const metadataJson = typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {});

            // Create memory via repository (snake_case → camelCase)
            const createdMemory = await memoriesRepo.createMemory({
                content,
                summary: summary || content.substring(0, 200),
                tags: tagsJson,
                metadata: metadataJson,
                importance: importance.toString(),
                projectId: project_id || null,
                agentId: agent_id || null,
            });

            // Queue embedding generation job (async, don't wait)
            this.queueEmbeddingJob(createdMemory.id).catch(err => {
                console.warn(`[memory] Failed to queue embedding job for memory #${createdMemory.id}:`, err.message);
            });

            res.status(201).json({
                id: createdMemory.id,
                message: 'Memory created successfully',
                embedding_queued: true
            });
        } catch (error) {
            console.error('Create memory error:', error);
            res.status(500).json({ error: 'Failed to create memory' });
        }
    }

    private async updateMemory(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using memoriesRepo.updateMemory()
            const { id } = req.params;
            const updates = req.body;

            // Build Partial<NewMemory> object with camelCase fields
            const data: any = {};

            if (updates.content !== undefined) data.content = updates.content;
            if (updates.summary !== undefined) data.summary = updates.summary;
            if (updates.tags !== undefined) {
                data.tags = typeof updates.tags === 'string' ? updates.tags : JSON.stringify(updates.tags);
            }
            if (updates.metadata !== undefined) {
                data.metadata = typeof updates.metadata === 'string' ? updates.metadata : JSON.stringify(updates.metadata);
            }
            if (updates.importance !== undefined) data.importance = updates.importance.toString();

            if (Object.keys(data).length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            await memoriesRepo.updateMemory(parseInt(id), data);

            // Note: updateMemory() doesn't return affected rows, so we can't check 404
            // If the memory doesn't exist, the update will silently succeed with no error
            // TODO: Enhance repository to return updated memory or throw on not found

            res.json({ message: 'Memory updated successfully' });
        } catch (error) {
            console.error('Update memory error:', error);
            res.status(500).json({ error: 'Failed to update memory' });
        }
    }

    private async deleteMemory(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using memoriesRepo.deleteMemory()
            const { id } = req.params;

            // Check if memory exists before deleting (for 404 response)
            const existingMemory = await memoriesRepo.findMemoryById(parseInt(id));
            if (!existingMemory) {
                res.status(404).json({ error: 'Memory not found' });
                return;
            }

            await memoriesRepo.deleteMemory(parseInt(id));

            res.json({ message: 'Memory deleted successfully' });
        } catch (error) {
            console.error('Delete memory error:', error);
            res.status(500).json({ error: 'Failed to delete memory' });
        }
    }

    private async getMemoryTags(_req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using memoriesRepo.findAllMemoryTags()
            const tags = await memoriesRepo.findAllMemoryTags();

            res.json({ tags });
        } catch (error) {
            console.error('Get memory tags error:', error);
            res.status(500).json({ error: 'Failed to fetch tags' });
        }
    }

    private async getMemoryStats(req: Request, res: Response): Promise<void> {
        try {
            // ✅ PARTIALLY MIGRATED TO DRIZZLE ORM - Using memoriesRepo
            // TODO: Add project_id filter support to getMemoryStats() in repository
            const { project_id } = req.query;

            let stats: any;
            if (project_id) {
                // Custom query with project filter (SQL until repository supports it)
                const [countResult] = await this.db!.execute<RowDataPacket[]>(
                    `SELECT COUNT(*) as total_memories, AVG(importance) as avg_importance, SUM(access_count) as total_accesses FROM memories WHERE project_id = ?`,
                    [parseInt(project_id as string)]
                );
                stats = countResult[0];
            } else {
                // Use repository for global stats
                const result = await memoriesRepo.getMemoryStats();
                stats = (result[0] as unknown as RowDataPacket[])[0];
            }

            // Get top tags via repository
            const allTags = await memoriesRepo.findAllMemoryTags();
            const top_tags = allTags.slice(0, 10).map((tag: any) => ({
                name: tag.name,
                usage_count: tag.usageCount
            }));

            res.json({
                total_memories: stats.total_memories || 0,
                avg_importance: parseFloat(stats.avg_importance) || 0,
                total_accesses: stats.total_accesses || 0,
                top_tags
            });
        } catch (error) {
            console.error('Get memory stats error:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    private async boostMemory(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using memoriesRepo.boostImportance()
            const { id } = req.params;
            const { boost_amount = 0.1 } = req.body;

            const safeBoost = Math.min(Math.max(parseFloat(boost_amount), 0), 0.5);

            const updatedMemory = await memoriesRepo.boostImportance(parseInt(id), safeBoost);

            if (!updatedMemory) {
                res.status(404).json({ error: 'Memory not found' });
                return;
            }

            res.json({ message: 'Memory boosted successfully', boost_applied: safeBoost });
        } catch (error) {
            console.error('Boost memory error:', error);
            res.status(500).json({ error: 'Failed to boost memory' });
        }
    }

    private async getRelatedMemories(req: Request, res: Response): Promise<void> {
        try {
            // ✅ PARTIALLY MIGRATED TO DRIZZLE ORM - Using memoriesRepo
            // TODO: Add type filter support to findRelatedMemories() in repository
            const { id } = req.params;
            const { type } = req.query;

            let related: any[];
            if (type) {
                // Custom query with type filter (SQL until repository supports it)
                const [results] = await this.db!.execute<RowDataPacket[]>(`
                    SELECT m.*, mc.relationship_type, mc.strength
                    FROM memory_crossrefs mc
                    JOIN memories m ON mc.target_memory_id = m.id
                    WHERE mc.source_memory_id = ? AND mc.relationship_type = ?
                    ORDER BY mc.strength DESC, m.importance DESC
                `, [parseInt(id), type]);
                related = results;
            } else {
                // Use repository for all related memories
                const result = await memoriesRepo.findRelatedMemories(parseInt(id));
                related = result[0] as unknown as any[];
            }

            // Parse JSON fields
            related.forEach((m: any) => {
                m.tags = m.tags ? JSON.parse(m.tags) : [];
                m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
            });

            res.json({ related, count: related.length });
        } catch (error) {
            console.error('Get related memories error:', error);
            res.status(500).json({ error: 'Failed to fetch related memories' });
        }
    }

    private async createMemoryCrossref(req: Request, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using memoriesRepo.createCrossref()
            // TODO: Add ON DUPLICATE KEY UPDATE support to repository (currently errors on duplicates)
            const { source_memory_id, target_memory_id, relationship_type = 'related', strength = 0.5 } = req.body;

            if (!source_memory_id || !target_memory_id) {
                res.status(400).json({ error: 'source_memory_id and target_memory_id are required' });
                return;
            }

            const crossref = await memoriesRepo.createCrossref(
                source_memory_id,
                target_memory_id,
                relationship_type,
                strength
            );

            res.status(201).json({
                id: crossref.id,
                message: 'Cross-reference created successfully'
            });
        } catch (error) {
            console.error('Create crossref error:', error);
            res.status(500).json({ error: 'Failed to create cross-reference' });
        }
    }

    // ========================================================================
    // GitHub Webhook Handler (Incoming)
    // ========================================================================

    /**
     * Handle GitHub push webhook
     * SOL-5: Auto-sync commits → DFO tasks
     *
     * When GitHub pushes to main branch with commits containing [DFO-XXX]:
     * - Logs commit reference in activity logs
     * - Auto-completes task if commit message contains "completes/closes/fixes/resolves DFO-XXX"
     */
    private async handleGitHubWebhook(req: Request, res: Response): Promise<void> {
        try {
            // Verify GitHub signature (if secret is configured)
            const secret = process.env.GITHUB_WEBHOOK_SECRET;
            if (secret) {
                const signature = req.headers['x-hub-signature-256'] as string;
                if (!signature) {
                    console.warn('GitHub webhook: Missing signature');
                    res.status(401).json({ error: 'Missing signature' });
                    return;
                }

                const payload = JSON.stringify(req.body);
                const isValid = verifyGitHubSignature(payload, signature, secret);
                if (!isValid) {
                    console.warn('GitHub webhook: Invalid signature');
                    res.status(401).json({ error: 'Invalid signature' });
                    return;
                }
            }

            // Process the push event
            if (!this.db) {
                res.status(503).json({ error: 'Database not connected' });
                return;
            }

            const result = await handleGitHubPush(req.body, this.db);

            console.log(`GitHub webhook processed: ${result.status}, ${result.processed} tasks updated`);
            if (result.errors.length > 0) {
                console.error('GitHub webhook errors:', result.errors);
            }

            res.json({
                success: true,
                ...result,
            });
        } catch (error) {
            console.error('GitHub webhook error:', error);
            res.status(500).json({
                error: 'Failed to process GitHub webhook',
                details: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Handle GitHub Actions workflow_run webhook
     * DFO-201-EPIC21: Receive workflow status updates
     *
     * Events handled:
     * - workflow_run.queued
     * - workflow_run.in_progress
     * - workflow_run.completed
     */
    private async handleGitHubActionsWebhook(req: Request, res: Response): Promise<void> {
        try {
            // Verify GitHub signature (if secret is configured)
            const secret = process.env.GITHUB_WEBHOOK_SECRET;
            if (secret) {
                const signature = req.headers['x-hub-signature-256'] as string;
                if (!signature) {
                    console.warn('GitHub Actions webhook: Missing signature');
                    res.status(401).json({ error: 'Missing signature' });
                    return;
                }

                const payload = JSON.stringify(req.body);
                const isValid = verifyGitHubSignature(payload, signature, secret);
                if (!isValid) {
                    console.warn('GitHub Actions webhook: Invalid signature');
                    res.status(401).json({ error: 'Invalid signature' });
                    return;
                }
            }

            // Validate event type
            const event = req.headers['x-github-event'] as string;
            if (event !== 'workflow_run') {
                console.warn(`GitHub Actions webhook: Unsupported event '${event}'`);
                res.status(400).json({
                    error: 'Unsupported event',
                    details: `Expected 'workflow_run', got '${event}'`,
                });
                return;
            }

            // Process workflow run event
            const payload = req.body as GitHubWorkflowRunPayload;
            const result = await handleWorkflowRunEvent(payload, this.db, this.io);

            console.log(
                `GitHub Actions webhook processed: ${result.status}` +
                    (result.updated ? `, workflow run updated` : '')
            );

            if (result.error) {
                console.warn('GitHub Actions webhook warning:', result.error);
            }

            res.json({
                success: result.updated,
                status: result.status,
                error: result.error,
            });
        } catch (error) {
            console.error('GitHub Actions webhook error:', error);
            res.status(500).json({
                error: 'Failed to process GitHub Actions webhook',
                details: error instanceof Error ? error.message : String(error),
            });
        }
    }

    // ========================================================================
    // Webhooks Handlers (n8n Integration)
    // ========================================================================

    private async getWebhooks(req: Request, res: Response): Promise<void> {
        try {
            if (!this.webhookService) {
                res.status(503).json({ error: 'Webhook service not initialized' });
                return;
            }

            const projectId = req.query.project_id ? parseInt(req.query.project_id as string, 10) : undefined;
            const webhooks = await this.webhookService.list(projectId);

            res.json({
                webhooks,
                count: webhooks.length
            });
        } catch (error) {
            console.error('Get webhooks error:', error);
            res.status(500).json({ error: 'Failed to fetch webhooks' });
        }
    }

    private async getWebhook(req: Request, res: Response): Promise<void> {
        try {
            if (!this.webhookService) {
                res.status(503).json({ error: 'Webhook service not initialized' });
                return;
            }

            const id = parseInt(req.params.id, 10);
            const webhook = await this.webhookService.get(id);

            if (!webhook) {
                res.status(404).json({ error: 'Webhook not found' });
                return;
            }

            res.json(webhook);
        } catch (error) {
            console.error('Get webhook error:', error);
            res.status(500).json({ error: 'Failed to fetch webhook' });
        }
    }

    private async getWebhookDeliveries(req: Request, res: Response): Promise<void> {
        try {
            if (!this.webhookService) {
                res.status(503).json({ error: 'Webhook service not initialized' });
                return;
            }

            const id = parseInt(req.params.id, 10);
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
            const deliveries = await this.webhookService.getDeliveries(id, limit);

            res.json({
                deliveries,
                count: deliveries.length
            });
        } catch (error) {
            console.error('Get webhook deliveries error:', error);
            res.status(500).json({ error: 'Failed to fetch webhook deliveries' });
        }
    }

    private async createWebhook(req: Request, res: Response): Promise<void> {
        try {
            if (!this.webhookService) {
                res.status(503).json({ error: 'Webhook service not initialized' });
                return;
            }

            const { name, url, event_type, project_id, http_method, secret, headers, max_retries, retry_delay_ms } = req.body;

            if (!name || !url || !event_type) {
                res.status(400).json({ error: 'name, url, and event_type are required' });
                return;
            }

            const webhookId = await this.webhookService.create({
                name,
                url,
                event_type,
                project_id,
                http_method,
                secret,
                headers,
                max_retries,
                retry_delay_ms
            });

            res.status(201).json({
                id: webhookId,
                message: 'Webhook created successfully'
            });
        } catch (error) {
            console.error('Create webhook error:', error);
            res.status(500).json({ error: 'Failed to create webhook' });
        }
    }

    private async updateWebhook(req: Request, res: Response): Promise<void> {
        try {
            if (!this.webhookService) {
                res.status(503).json({ error: 'Webhook service not initialized' });
                return;
            }

            const id = parseInt(req.params.id, 10);
            const updated = await this.webhookService.update(id, req.body);

            if (!updated) {
                res.status(404).json({ error: 'Webhook not found or no changes made' });
                return;
            }

            res.json({ message: 'Webhook updated successfully' });
        } catch (error) {
            console.error('Update webhook error:', error);
            res.status(500).json({ error: 'Failed to update webhook' });
        }
    }

    private async deleteWebhook(req: Request, res: Response): Promise<void> {
        try {
            if (!this.webhookService) {
                res.status(503).json({ error: 'Webhook service not initialized' });
                return;
            }

            const id = parseInt(req.params.id, 10);
            const deleted = await this.webhookService.delete(id);

            if (!deleted) {
                res.status(404).json({ error: 'Webhook not found' });
                return;
            }

            res.json({ message: 'Webhook deleted successfully' });
        } catch (error) {
            console.error('Delete webhook error:', error);
            res.status(500).json({ error: 'Failed to delete webhook' });
        }
    }

    // ========================================================================
    // Agent Execution Handlers
    // ========================================================================

    /**
     * Queue a new agent execution job
     * POST /api/agent-execution/queue
     */
    private async queueAgentJob(req: Request, res: Response): Promise<void> {
        try {
            if (!this.agentExecutionService) {
                res.status(503).json({ error: 'Agent execution service not initialized' });
                return;
            }

            // Validate request body with Zod
            const validation = QueueAgentJobSchema.safeParse(req.body);

            if (!validation.success) {
                res.status(400).json({
                    error: 'Validation failed',
                    details: validation.error.format()
                });
                return;
            }

            const { taskId, agentId, metadata, context, mcpConfigs } = validation.data;

            // Fetch task and agent info from database
            // Generate task_code dynamically (no code column exists)
            const [taskRows] = await this.db!.execute<RowDataPacket[]>(
                `SELECT
                    t.id,
                    t.project_id,
                    CONCAT(
                        COALESCE(p.code, 'TSK'), '-',
                        LPAD(COALESCE(t.task_number, t.id), 3, '0')
                    ) as code
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.id = ?`,
                [taskId]
            );

            if (!taskRows || taskRows.length === 0) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            const task = taskRows[0];

            const [agentRows] = await this.db!.execute<RowDataPacket[]>(
                'SELECT name FROM ai_agents WHERE id = ?',
                [agentId]
            );

            if (!agentRows || agentRows.length === 0) {
                res.status(404).json({ error: 'Agent not found' });
                return;
            }

            const agent = agentRows[0];

            // Queue the job
            const job = await this.agentExecutionService.queueJob({
                taskId,
                taskCode: task.code,
                agentId,
                agentName: agent.name,
                projectId: task.project_id,
                mcpConfigs,
                context,
                metadata
            });

            // Log success
            console.log(`[AgentExecution] Job queued successfully: ${job.id} | Task: ${task.code} | Agent: ${agent.name}`);

            // Log to activity log
            await this.db!.execute(
                `INSERT INTO activity_logs (action, category, level, agent_id, project_id, details)
                 VALUES (?, 'system', 'info', ?, ?, ?)`,
                [
                    `Agent job queued: ${task.code}`,
                    agentId,
                    task.project_id,
                    JSON.stringify({ jobId: job.id, taskId, priority: metadata?.priority || 'medium' })
                ]
            );

            res.status(201).json({
                success: true,
                data: {
                    jobId: job.id,
                    taskId,
                    taskCode: task.code,
                    agentId,
                    agentName: agent.name,
                    projectId: task.project_id,
                    status: 'queued',
                    priority: metadata?.priority || 'medium',
                    queuedAt: new Date().toISOString()
                },
                message: 'Job queued successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error('[AgentExecution] Queue agent job error:', {
                error: errorMessage,
                stack: errorStack,
                taskId: req.body.taskId,
                agentId: req.body.agentId
            });
            res.status(500).json({
                error: 'Failed to queue job',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    /**
     * Get agent job status
     * GET /api/agent-execution/jobs/:id
     */
    private async getAgentJobStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!this.agentExecutionService) {
                res.status(503).json({ error: 'Agent execution service not initialized' });
                return;
            }

            const jobId = req.params.id;

            if (!jobId) {
                res.status(400).json({ error: 'Job ID is required' });
                return;
            }

            const status = await this.agentExecutionService.getJobStatus(jobId);

            if (!status) {
                console.warn(`[AgentExecution] Job not found: ${jobId}`);
                res.status(404).json({ error: 'Job not found' });
                return;
            }

            console.log(`[AgentExecution] Job status retrieved: ${jobId} | Status: ${status.status}`);

            res.json({
                success: true,
                data: status
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error('[AgentExecution] Get job status error:', {
                error: errorMessage,
                stack: errorStack,
                jobId
            });
            res.status(500).json({
                error: 'Failed to retrieve job status',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    /**
     * Cancel an agent job
     * POST /api/agent-execution/jobs/:id/cancel
     */
    private async cancelAgentJob(req: Request, res: Response): Promise<void> {
        const jobId = req.params.id; // Move outside try block for error handler access

        try {
            if (!this.agentExecutionService) {
                res.status(503).json({ error: 'Agent execution service not initialized' });
                return;
            }

            if (!jobId) {
                res.status(400).json({ error: 'Job ID is required' });
                return;
            }

            const cancelled = await this.agentExecutionService.cancelJob(jobId);

            if (!cancelled) {
                console.warn(`[AgentExecution] Cannot cancel job: ${jobId} (may be completed or not found)`);
                res.status(404).json({
                    error: 'Job not found or cannot be cancelled',
                    details: 'Job may already be completed or does not exist'
                });
                return;
            }

            console.log(`[AgentExecution] Job cancelled successfully: ${jobId}`);

            // Log to activity log
            await this.db!.execute(
                `INSERT INTO activity_logs (action, category, level, details)
                 VALUES (?, 'system', 'info', ?)`,
                [
                    `Agent job cancelled: ${jobId}`,
                    JSON.stringify({ jobId, cancelledAt: new Date().toISOString() })
                ]
            );

            res.json({
                success: true,
                data: {
                    jobId,
                    status: 'cancelled',
                    cancelledAt: new Date().toISOString()
                },
                message: 'Job cancelled successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error('[AgentExecution] Cancel job error:', {
                error: errorMessage,
                stack: errorStack,
                jobId
            });
            res.status(500).json({
                error: 'Failed to cancel job',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    /**
     * Get worker status and queue metrics
     * GET /api/agent-execution/workers
     */
    private async getWorkerStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!this.agentExecutionService) {
                res.status(503).json({ error: 'Agent execution service not initialized' });
                return;
            }

            // Get queue metrics
            const metrics = await this.agentExecutionService.getQueueMetrics();

            // Get active jobs
            const activeJobs = await this.agentExecutionService.getActiveJobs(10);

            // Worker configuration (from queue.ts)
            const workerConfig = {
                concurrency: 5, // From getWorkerOptions in queue.ts
                lockDuration: 30000,
                queueName: 'agent-execution'
            };

            console.log(`[AgentExecution] Worker status retrieved | Active: ${metrics.active} | Waiting: ${metrics.waiting} | Success rate: ${metrics.successRate.toFixed(2)}%`);

            res.json({
                success: true,
                data: {
                    workers: {
                        concurrency: workerConfig.concurrency,
                        lockDuration: workerConfig.lockDuration,
                        queueName: workerConfig.queueName,
                        status: 'active' // Assume active if service initialized
                    },
                    queue: {
                        waiting: metrics.waiting,
                        active: metrics.active,
                        completed: metrics.completed,
                        failed: metrics.failed,
                        delayed: metrics.delayed,
                        cancelled: metrics.cancelled,
                        avgExecutionTimeMs: Math.round(metrics.avgExecutionTimeMs),
                        successRate: Math.round(metrics.successRate * 100) / 100
                    },
                    activeJobs: activeJobs.map(job => ({
                        jobId: job.jobId,
                        taskId: job.taskId,
                        taskCode: job.taskCode,
                        agentId: job.agentId,
                        state: job.state,
                        progress: job.progress,
                        startedAt: job.startedAt
                    })),
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error('[AgentExecution] Get worker status error:', {
                error: errorMessage,
                stack: errorStack
            });
            res.status(500).json({
                error: 'Failed to retrieve worker status',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    /**
     * List agent jobs with optional filtering
     * GET /api/agent-execution/jobs?projectId=X&limit=100
     */
    private async listAgentJobs(req: Request, res: Response): Promise<void> {
        try {
            if (!this.agentExecutionService) {
                res.status(503).json({ error: 'Agent execution service not initialized' });
                return;
            }

            // Parse query parameters
            const projectId = req.query.projectId ? parseInt(req.query.projectId as string, 10) : undefined;
            const agentId = req.query.agentId ? parseInt(req.query.agentId as string, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
            const statusesParam = req.query.statuses as string | undefined;
            const statuses = statusesParam ? statusesParam.split(',') : ['waiting', 'active', 'delayed'];

            // Validate parameters
            if (limit < 1 || limit > 500) {
                res.status(400).json({
                    error: 'Invalid limit parameter',
                    details: 'Limit must be between 1 and 500'
                });
                return;
            }

            if (projectId !== undefined && (isNaN(projectId) || projectId <= 0)) {
                res.status(400).json({
                    error: 'Invalid projectId parameter',
                    details: 'projectId must be a positive integer'
                });
                return;
            }

            if (agentId !== undefined && (isNaN(agentId) || agentId <= 0)) {
                res.status(400).json({
                    error: 'Invalid agentId parameter',
                    details: 'agentId must be a positive integer'
                });
                return;
            }

            // List jobs with filters
            const jobs = await this.agentExecutionService.listJobs({
                projectId,
                agentId,
                statuses,
                limit
            });

            console.log(`[AgentExecution] Listed ${jobs.length} jobs | Filters: projectId=${projectId}, agentId=${agentId}, statuses=${statuses.join(',')}`);

            res.json({
                success: true,
                data: {
                    jobs,
                    count: jobs.length,
                    filters: {
                        projectId,
                        agentId,
                        statuses,
                        limit
                    }
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error('[AgentExecution] List jobs error:', {
                error: errorMessage,
                stack: errorStack
            });
            res.status(500).json({
                error: 'Failed to list jobs',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    }

    // ========================================================================
    // CodeRabbit Code Review API Handlers
    // ========================================================================

    /**
     * Get CodeRabbit review comments for a pull request
     * GET /api/code-review/:owner/:repo/:pullNumber
     */
    private async getCodeRabbitComments(req: Request, res: Response): Promise<void> {
        try {
            const { owner, repo, pullNumber } = req.params;

            // Validate parameters
            if (!owner || !repo || !pullNumber) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_PARAMETERS',
                        message: 'Missing required parameters: owner, repo, or pullNumber',
                    },
                });
                return;
            }

            const prNumber = parseInt(pullNumber, 10);
            if (isNaN(prNumber) || prNumber <= 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_PULL_NUMBER',
                        message: 'Pull number must be a positive integer',
                    },
                });
                return;
            }

            // Check Redis cache first (5 min TTL)
            const cacheKey = `coderabbit:${owner}:${repo}:${prNumber}`;
            let cachedData: string | null = null;
            let cacheHit = false;

            if (this.redis) {
                try {
                    cachedData = await this.redis.get(cacheKey);
                    if (cachedData) {
                        cacheHit = true;
                        console.log(`[CodeRabbit] Cache HIT for ${cacheKey}`);
                        const parsedCache = JSON.parse(cachedData);
                        res.json({
                            success: true,
                            data: {
                                comments: parsedCache.comments || [],
                            },
                            metadata: {
                                cached: true,
                                timestamp: parsedCache.timestamp,
                            },
                        });
                        return;
                    } else {
                        console.log(`[CodeRabbit] Cache MISS for ${cacheKey}`);
                    }
                } catch (cacheError) {
                    console.warn('[CodeRabbit] Redis cache read error, falling back to MCP:', cacheError);
                }
            }

            // Call MCP server to proxy CodeRabbit tool
            const mcpEndpoint = process.env.MCP_SERVER_URL || 'http://localhost:3031';
            const mcpResponse = await fetch(mcpEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer default',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'tools/call',
                    params: {
                        name: 'proxy_external_tool',
                        arguments: {
                            server_name: 'coderabbit',
                            tool_name: 'get_review_comments',
                            params: {
                                owner,
                                repo,
                                pullNumber: prNumber,
                            },
                            format: 'json',
                        },
                    },
                }),
            });

            if (!mcpResponse.ok) {
                throw new Error(`MCP server returned ${mcpResponse.status}: ${mcpResponse.statusText}`);
            }

            const mcpData = await mcpResponse.json();

            // Check for MCP-level errors
            if (mcpData.error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'MCP_ERROR',
                        message: mcpData.error.message || 'MCP server error',
                        details: mcpData.error,
                    },
                });
                return;
            }

            // Extract result from MCP response
            const result = mcpData.result?.content?.[0]?.text;
            if (!result) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INVALID_MCP_RESPONSE',
                        message: 'Invalid response structure from MCP server',
                    },
                });
                return;
            }

            // Parse the JSON result
            let parsedResult;
            try {
                parsedResult = JSON.parse(result);
            } catch (parseError) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INVALID_JSON',
                        message: 'Failed to parse MCP response as JSON',
                    },
                });
                return;
            }

            // Store in Redis cache (5 min TTL = 300 seconds)
            const commentsData = parsedResult.data?.result || [];
            if (this.redis && !cacheHit) {
                try {
                    const cachePayload = {
                        comments: commentsData,
                        timestamp: new Date().toISOString(),
                    };
                    await this.redis.setex(cacheKey, 300, JSON.stringify(cachePayload));
                    console.log(`[CodeRabbit] Cached ${commentsData.length} comments for ${cacheKey} (TTL: 5 min)`);
                } catch (cacheError) {
                    console.warn('[CodeRabbit] Redis cache write error:', cacheError);
                    // Don't fail the request if caching fails
                }
            }

            // Return success response
            res.json({
                success: true,
                data: {
                    comments: commentsData,
                },
                metadata: {
                    cached: false,
                    timestamp: new Date().toISOString(),
                },
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[CodeRabbit] Get comments error:', {
                error: errorMessage,
                owner: req.params.owner,
                repo: req.params.repo,
                pullNumber: req.params.pullNumber,
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch CodeRabbit comments',
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
                },
            });
        }
    }

    /**
     * Resolve or dismiss a CodeRabbit comment
     * POST /api/code-review/:owner/:repo/comments/:commentId/resolve
     */
    private async resolveCodeRabbitComment(req: Request, res: Response): Promise<void> {
        try {
            const { owner, repo, commentId } = req.params;
            const { resolution, note } = req.body;

            // Validate parameters
            if (!owner || !repo || !commentId) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_PARAMETERS',
                        message: 'Missing required parameters: owner, repo, or commentId',
                    },
                });
                return;
            }

            const commentIdNum = parseInt(commentId, 10);
            if (isNaN(commentIdNum) || commentIdNum <= 0) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_COMMENT_ID',
                        message: 'Comment ID must be a positive integer',
                    },
                });
                return;
            }

            // Validate resolution type
            const validResolutions = ['addressed', 'wont_fix', 'not_applicable'];
            if (resolution && !validResolutions.includes(resolution)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_RESOLUTION',
                        message: `Resolution must be one of: ${validResolutions.join(', ')}`,
                    },
                });
                return;
            }

            // Call MCP server to proxy CodeRabbit resolve_comment tool
            const mcpEndpoint = process.env.MCP_SERVER_URL || 'http://localhost:3031';
            const mcpResponse = await fetch(mcpEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer default',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method: 'tools/call',
                    params: {
                        name: 'proxy_external_tool',
                        arguments: {
                            server_name: 'coderabbit',
                            tool_name: 'resolve_comment',
                            params: {
                                owner,
                                repo,
                                commentId: commentIdNum,
                                resolution: resolution || 'addressed',
                                note: note || '',
                            },
                            format: 'json',
                        },
                    },
                }),
            });

            if (!mcpResponse.ok) {
                throw new Error(`MCP server returned ${mcpResponse.status}: ${mcpResponse.statusText}`);
            }

            const mcpData = await mcpResponse.json();

            // Check for MCP-level errors
            if (mcpData.error) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'MCP_ERROR',
                        message: mcpData.error.message || 'MCP server error',
                        details: mcpData.error,
                    },
                });
                return;
            }

            // Extract result from MCP response
            const result = mcpData.result?.content?.[0]?.text;
            if (!result) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INVALID_MCP_RESPONSE',
                        message: 'Invalid response structure from MCP server',
                    },
                });
                return;
            }

            // Parse the JSON result
            let parsedResult;
            try {
                parsedResult = JSON.parse(result);
            } catch (parseError) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'INVALID_JSON',
                        message: 'Failed to parse MCP response as JSON',
                    },
                });
                return;
            }

            // Invalidate cache for this repository (all PRs)
            // We don't have the PR number here, so we invalidate all cached comments for this repo
            if (this.redis) {
                try {
                    const cachePattern = `coderabbit:${owner}:${repo}:*`;
                    const keys = await this.redis.keys(cachePattern);
                    if (keys.length > 0) {
                        await this.redis.del(...keys);
                        console.log(`[CodeRabbit] Invalidated ${keys.length} cache entries for ${owner}/${repo}`);
                    }
                } catch (cacheError) {
                    console.warn('[CodeRabbit] Redis cache invalidation error:', cacheError);
                    // Don't fail the request if cache invalidation fails
                }
            }

            // Return success response
            res.json({
                success: true,
                data: parsedResult.data,
                message: 'CodeRabbit comment resolved successfully',
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[CodeRabbit] Resolve comment error:', {
                error: errorMessage,
                owner: req.params.owner,
                repo: req.params.repo,
                commentId: req.params.commentId,
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to resolve CodeRabbit comment',
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
                },
            });
        }
    }

    // ========================================================================
    // GitHub Actions API Handlers
    // ========================================================================

    /**
     * Trigger a GitHub Actions workflow
     * POST /api/github/trigger-workflow
     */
    private async triggerWorkflow(req: Request, res: Response): Promise<void> {
        try {
            if (!this.githubActionsService) {
                res.status(503).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'GitHub Actions service not initialized',
                        suggestion: 'Ensure GITHUB_TOKEN environment variable is set'
                    }
                });
                return;
            }

            // Validate request body with Zod
            const validation = TriggerWorkflowSchema.safeParse(req.body);

            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: validation.error.format()
                    }
                });
                return;
            }

            const { owner, repo, workflowId, ref, inputs, projectId, taskId } = validation.data;

            // Trigger the workflow
            const result = await this.githubActionsService.triggerWorkflow({
                owner,
                repo,
                workflowId,
                ref,
                inputs,
                projectId,
                taskId
            });

            if (!result.success) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'WORKFLOW_TRIGGER_FAILED',
                        message: result.error || 'Failed to trigger workflow',
                        details: { owner, repo, workflowId, ref }
                    }
                });
                return;
            }

            console.log(`[GitHub] Workflow triggered successfully: ${owner}/${repo}/${workflowId} | Ref: ${ref} | Run ID: ${result.githubRunId}`);

            // Log to activity log
            await this.db!.execute(
                `INSERT INTO activity_logs (action, category, level, project_id, details)
                 VALUES (?, 'github', 'info', ?, ?)`,
                [
                    `GitHub workflow triggered: ${owner}/${repo}/${workflowId}`,
                    projectId,
                    JSON.stringify({
                        workflowId: result.workflowId,
                        githubRunId: result.githubRunId,
                        ref,
                        taskId
                    })
                ]
            );

            res.status(201).json({
                success: true,
                data: {
                    workflowId: result.workflowId,
                    runId: result.runId,
                    githubRunId: result.githubRunId,
                    owner,
                    repo,
                    ref,
                    triggeredAt: new Date().toISOString()
                },
                message: 'Workflow triggered successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error('[GitHub] Trigger workflow error:', {
                error: errorMessage,
                stack: errorStack
            });
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to trigger workflow',
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                }
            });
        }
    }

    /**
     * Get GitHub Actions workflow run status
     * GET /api/github/workflow-status/:run_id
     */
    private async getWorkflowStatus(req: Request, res: Response): Promise<void> {
        try {
            if (!this.githubActionsService) {
                res.status(503).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'GitHub Actions service not initialized'
                    }
                });
                return;
            }

            const runId = parseInt(req.params.run_id, 10);

            if (isNaN(runId)) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_RUN_ID',
                        message: 'Run ID must be a valid integer'
                    }
                });
                return;
            }

            // Get workflow run from database to get owner/repo/github_run_id
            const [runRows] = await this.db!.execute<RowDataPacket[]>(
                `SELECT wr.github_run_id, w.owner, w.repo
                 FROM github_workflow_runs wr
                 JOIN github_workflows w ON wr.workflow_id = w.id
                 WHERE wr.id = ?`,
                [runId]
            );

            if (!runRows || runRows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'RUN_NOT_FOUND',
                        message: 'Workflow run not found'
                    }
                });
                return;
            }

            const run = runRows[0];

            // Fetch status from GitHub
            const status = await this.githubActionsService.getRunStatus(
                run.owner,
                run.repo,
                run.github_run_id
            );

            console.log(`[GitHub] Workflow status retrieved: Run ${runId} | Status: ${status.status} | Conclusion: ${status.conclusion || 'N/A'}`);

            res.json({
                success: true,
                data: {
                    runId,
                    githubRunId: status.id,
                    status: status.status,
                    conclusion: status.conclusion,
                    runNumber: status.runNumber,
                    htmlUrl: status.htmlUrl,
                    startedAt: status.startedAt,
                    completedAt: status.completedAt,
                    durationSeconds: status.durationSeconds
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[GitHub] Get workflow status error:', errorMessage);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to retrieve workflow status',
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                }
            });
        }
    }

    /**
     * Create a GitHub issue from a DFO task
     * POST /api/github/create-issue
     */
    private async createIssue(req: Request, res: Response): Promise<void> {
        try {
            if (!this.githubActionsService) {
                res.status(503).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'GitHub Actions service not initialized'
                    }
                });
                return;
            }

            // Validate request body with Zod
            const validation = CreateIssueSchema.safeParse(req.body);

            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: validation.error.format()
                    }
                });
                return;
            }

            const { owner, repo, title, body, labels, assignees, taskId, projectId } = validation.data;

            // Create the issue
            const result = await this.githubActionsService.createIssue({
                owner,
                repo,
                title,
                body,
                labels,
                assignees,
                taskId,
                projectId
            });

            if (!result.success) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'ISSUE_CREATE_FAILED',
                        message: result.error || 'Failed to create issue',
                        details: { owner, repo, taskId }
                    }
                });
                return;
            }

            console.log(`[GitHub] Issue created successfully: ${owner}/${repo}#${result.issueNumber} | Task: ${taskId}`);

            // Log to activity log
            await this.db!.execute(
                `INSERT INTO activity_logs (action, category, level, project_id, details)
                 VALUES (?, 'github', 'info', ?, ?)`,
                [
                    `GitHub issue created: ${owner}/${repo}#${result.issueNumber}`,
                    projectId,
                    JSON.stringify({
                        issueNumber: result.issueNumber,
                        issueUrl: result.issueUrl,
                        taskId,
                        taskLinkId: result.taskLinkId
                    })
                ]
            );

            res.status(201).json({
                success: true,
                data: {
                    issueNumber: result.issueNumber,
                    issueUrl: result.issueUrl,
                    taskLinkId: result.taskLinkId,
                    taskId,
                    owner,
                    repo,
                    createdAt: new Date().toISOString()
                },
                message: 'Issue created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[GitHub] Create issue error:', errorMessage);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create issue',
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                }
            });
        }
    }

    /**
     * Create a GitHub pull request from a DFO task
     * POST /api/github/create-pr
     */
    private async createPR(req: Request, res: Response): Promise<void> {
        try {
            if (!this.githubActionsService) {
                res.status(503).json({
                    success: false,
                    error: {
                        code: 'SERVICE_NOT_INITIALIZED',
                        message: 'GitHub Actions service not initialized'
                    }
                });
                return;
            }

            // Validate request body with Zod
            const validation = CreatePRSchema.safeParse(req.body);

            if (!validation.success) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Validation failed',
                        details: validation.error.format()
                    }
                });
                return;
            }

            const { owner, repo, title, body, head, base, labels, assignees, taskId, projectId } = validation.data;

            // Create the PR
            const result = await this.githubActionsService.createPR({
                owner,
                repo,
                title,
                body,
                head,
                base,
                labels,
                assignees,
                taskId,
                projectId
            });

            if (!result.success) {
                res.status(500).json({
                    success: false,
                    error: {
                        code: 'PR_CREATE_FAILED',
                        message: result.error || 'Failed to create pull request',
                        details: { owner, repo, head, base, taskId }
                    }
                });
                return;
            }

            console.log(`[GitHub] PR created successfully: ${owner}/${repo}#${result.prNumber} | Task: ${taskId}`);

            // Log to activity log
            await this.db!.execute(
                `INSERT INTO activity_logs (action, category, level, project_id, details)
                 VALUES (?, 'github', 'info', ?, ?)`,
                [
                    `GitHub PR created: ${owner}/${repo}#${result.prNumber}`,
                    projectId,
                    JSON.stringify({
                        prNumber: result.prNumber,
                        prUrl: result.prUrl,
                        head,
                        base,
                        taskId,
                        taskLinkId: result.taskLinkId
                    })
                ]
            );

            res.status(201).json({
                success: true,
                data: {
                    prNumber: result.prNumber,
                    prUrl: result.prUrl,
                    taskLinkId: result.taskLinkId,
                    taskId,
                    owner,
                    repo,
                    head,
                    base,
                    createdAt: new Date().toISOString()
                },
                message: 'Pull request created successfully'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[GitHub] Create PR error:', errorMessage);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create pull request',
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                }
            });
        }
    }

    private async testWebhook(req: Request, res: Response): Promise<void> {
        try {
            if (!this.webhookService) {
                res.status(503).json({ error: 'Webhook service not initialized' });
                return;
            }

            const id = parseInt(req.params.id, 10);
            const result = await this.webhookService.test(id);

            res.json({
                success: result.success,
                status_code: result.statusCode,
                response_time_ms: result.responseTimeMs,
                error: result.error,
                response_body: result.responseBody
            });
        } catch (error) {
            console.error('Test webhook error:', error);
            res.status(500).json({ error: 'Failed to test webhook' });
        }
    }

    /**
     * Dispatch webhook event (internal use)
     * Called when task/project events occur
     */
    public async dispatchWebhookEvent(
        eventType: string,
        data: Record<string, unknown>,
        projectId?: number
    ): Promise<void> {
        if (!this.webhookService) {
            console.warn('WebhookService not initialized, skipping event dispatch');
            return;
        }

        await this.webhookService.dispatch(eventType, data, projectId);
    }

    // ========================================================================
    // Office CRM API Handlers
    // ========================================================================

    private async getOfficeDashboard(_req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using csuiteRepo functions
            const [clientStats] = await csuiteRepo.getOfficeClientStats();
            const [projectStats] = await csuiteRepo.getOfficeProjectStats();
            const [paymentStats] = await csuiteRepo.getOfficePaymentStats();
            const [recentClients] = await csuiteRepo.getOfficeRecentClients(5);

            res.json({
                success: true,
                dashboard: {
                    clients: clientStats[0] || { total: 0, active: 0, leads: 0, prospects: 0, total_ltv: 0 },
                    projects: projectStats[0] || { total: 0, in_development: 0, completed: 0, total_budget: 0 },
                    payments: paymentStats[0] || { total: 0, received: 0, pending: 0 },
                    recent_clients: recentClients
                }
            });
        } catch (error) {
            console.error('Error getting office dashboard:', error);
            res.status(500).json({ error: 'Failed to get dashboard' });
        }
    }

    private async getOfficeClients(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findOfficeClients()
            const { status, industry, search, limit = 50, offset = 0 } = req.query;

            const result = await businessesRepo.findOfficeClients({
                status: status as string,
                industry: industry as string,
                search: search as string,
                limit: Number(limit),
                offset: Number(offset)
            });
            const clients = (result[0] as unknown as RowDataPacket[]);

            // Get total count
            const countResult = await businessesRepo.countOfficeClients({
                status: status as string,
                industry: industry as string,
                search: search as string
            });
            const count = (countResult[0] as unknown as RowDataPacket[])[0];

            res.json({
                success: true,
                clients,
                total: count?.total || 0,
                limit: Number(limit),
                offset: Number(offset)
            });
        } catch (error) {
            console.error('Error getting office clients:', error);
            res.status(500).json({ error: 'Failed to get clients' });
        }
    }

    private async getOfficeClient(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findOfficeClientWithDetails()
            const { id } = req.params;

            const details = await businessesRepo.findOfficeClientWithDetails(parseInt(id));

            if (!details.client) {
                res.status(404).json({ error: 'Client not found' });
                return;
            }

            res.json({
                success: true,
                client: {
                    ...details.client,
                    contacts: details.contacts,
                    projects: details.projects,
                    payments: details.payments
                }
            });
        } catch (error) {
            console.error('Error getting office client:', error);
            res.status(500).json({ error: 'Failed to get client' });
        }
    }

    private async createOfficeClient(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.createOfficeClient()
            const {
                name, commercial_name, industry, company_size, status,
                primary_email, primary_phone, website,
                address_line1, address_line2, city, state, postal_code, country,
                tax_id, fiscal_name, notes, assigned_to
            } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Client name is required' });
                return;
            }

            const clientId = await businessesRepo.createOfficeClient({
                name,
                commercialName: commercial_name,
                industry,
                companySize: company_size,
                status,
                primaryEmail: primary_email,
                primaryPhone: primary_phone,
                website,
                addressLine1: address_line1,
                addressLine2: address_line2,
                city,
                state,
                postalCode: postal_code,
                country,
                taxId: tax_id,
                fiscalName: fiscal_name,
                notes,
                createdBy: req.user?.userId || null,
                assignedTo: assigned_to
            });

            res.status(201).json({
                success: true,
                message: 'Client created',
                client_id: clientId
            });
        } catch (error) {
            console.error('Error creating office client:', error);
            res.status(500).json({ error: 'Failed to create client' });
        }
    }

    private async updateOfficeClient(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.updateOfficeClient()
            const { id } = req.params;
            const updates = req.body;

            const result = await businessesRepo.updateOfficeClient(parseInt(id), updates);

            if (!result) {
                res.status(400).json({ error: 'No valid fields to update' });
                return;
            }

            res.json({ success: true, message: 'Client updated' });
        } catch (error) {
            console.error('Error updating office client:', error);
            res.status(500).json({ error: 'Failed to update client' });
        }
    }

    private async deleteOfficeClient(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.updateOfficeClient()
            const { id } = req.params;

            // Soft delete - change status to churned
            await businessesRepo.updateOfficeClient(parseInt(id), { status: 'churned' });

            res.json({ success: true, message: 'Client archived' });
        } catch (error) {
            console.error('Error deleting office client:', error);
            res.status(500).json({ error: 'Failed to delete client' });
        }
    }

    private async getClientContacts(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findClientContacts()
            const { id } = req.params;

            const result = await businessesRepo.findClientContacts(parseInt(id));
            const contacts = (result[0] as unknown as RowDataPacket[]);

            res.json({ success: true, contacts });
        } catch (error) {
            console.error('Error getting client contacts:', error);
            res.status(500).json({ error: 'Failed to get contacts' });
        }
    }

    private async createClientContact(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.createClientContact()
            const { id: client_id } = req.params;
            const { name, title, email, phone, is_primary, notes } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Contact name is required' });
                return;
            }

            const contactId = await businessesRepo.createClientContact({
                clientId: parseInt(client_id),
                name,
                title,
                email,
                phone,
                isPrimary: is_primary,
                notes
            });

            res.status(201).json({
                success: true,
                message: 'Contact created',
                contact_id: contactId
            });
        } catch (error) {
            console.error('Error creating client contact:', error);
            res.status(500).json({ error: 'Failed to create contact' });
        }
    }

    private async updateClientContact(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.updateClientContact()
            const { id } = req.params;
            const { name, title, email, phone, is_primary, notes } = req.body;

            await businessesRepo.updateClientContact(parseInt(id), {
                name,
                title,
                email,
                phone,
                isPrimary: is_primary,
                notes
            });

            res.json({ success: true, message: 'Contact updated' });
        } catch (error) {
            console.error('Error updating client contact:', error);
            res.status(500).json({ error: 'Failed to update contact' });
        }
    }

    private async deleteClientContact(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.deleteClientContact()
            const { id } = req.params;

            await businessesRepo.deleteClientContact(parseInt(id));

            res.json({ success: true, message: 'Contact deleted' });
        } catch (error) {
            console.error('Error deleting client contact:', error);
            res.status(500).json({ error: 'Failed to delete contact' });
        }
    }

    private async getClientProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findClientProjects()
            const { id } = req.params;

            const result = await businessesRepo.findClientProjects(parseInt(id));
            const projects = (result[0] as unknown as RowDataPacket[]);

            res.json({ success: true, projects });
        } catch (error) {
            console.error('Error getting client projects:', error);
            res.status(500).json({ error: 'Failed to get projects' });
        }
    }

    private async getOfficePayments(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findOfficePayments()
            const { status, client_id, project_id, limit = 50, offset = 0 } = req.query;

            const result = await businessesRepo.findOfficePayments({
                status: status as string,
                clientId: client_id ? Number(client_id) : undefined,
                projectId: project_id ? Number(project_id) : undefined,
                limit: Number(limit),
                offset: Number(offset)
            });
            const payments = (result[0] as unknown as RowDataPacket[]);

            res.json({ success: true, payments });
        } catch (error) {
            console.error('Error getting office payments:', error);
            res.status(500).json({ error: 'Failed to get payments' });
        }
    }

    private async getOfficePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findOfficePaymentById()
            const { id } = req.params;

            const result = await businessesRepo.findOfficePaymentById(parseInt(id));
            const payments = (result[0] as unknown as RowDataPacket[]);

            if (payments.length === 0) {
                res.status(404).json({ error: 'Payment not found' });
                return;
            }

            res.json({ success: true, payment: payments[0] });
        } catch (error) {
            console.error('Error getting office payment:', error);
            res.status(500).json({ error: 'Failed to get payment' });
        }
    }

    private async createOfficePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.createOfficePayment()
            const {
                client_id, project_id, amount, currency, status,
                payment_type, payment_date, due_date, reference, invoice_number, notes
            } = req.body;

            if (!amount) {
                res.status(400).json({ error: 'Amount is required' });
                return;
            }

            const paymentId = await businessesRepo.createOfficePayment({
                clientId: client_id,
                projectId: project_id,
                amount,
                currency,
                status,
                paymentType: payment_type,
                paymentDate: payment_date,
                dueDate: due_date,
                reference,
                invoiceNumber: invoice_number,
                notes,
                createdBy: req.user?.userId || null
            });

            res.status(201).json({
                success: true,
                message: 'Payment created',
                payment_id: paymentId
            });
        } catch (error) {
            console.error('Error creating office payment:', error);
            res.status(500).json({ error: 'Failed to create payment' });
        }
    }

    private async updateOfficePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.updateOfficePayment()
            const { id } = req.params;
            const updates = req.body;

            const result = await businessesRepo.updateOfficePayment(parseInt(id), updates);

            if (!result) {
                res.status(400).json({ error: 'No valid fields to update' });
                return;
            }

            res.json({ success: true, message: 'Payment updated' });
        } catch (error) {
            console.error('Error updating office payment:', error);
            res.status(500).json({ error: 'Failed to update payment' });
        }
    }

    private async getOfficeProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using businessesRepo.findOfficeProjectsWithStats()
            const { status, client_id, limit = 50, offset = 0 } = req.query;

            const result = await businessesRepo.findOfficeProjectsWithStats({
                status: status as string,
                clientId: client_id ? Number(client_id) : undefined,
                limit: Number(limit),
                offset: Number(offset)
            });
            const projects = (result[0] as unknown as RowDataPacket[]);

            res.json({ success: true, projects });
        } catch (error) {
            console.error('Error getting office projects:', error);
            res.status(500).json({ error: 'Failed to get projects' });
        }
    }

    private async getPermissions(_req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using permissionsRepo
            const permissions = await permissionsRepo.findAllPermissions();
            const rolePermissionsResult: any = await permissionsRepo.findAllRolePermissions();
            const rolePermissionsRaw = rolePermissionsResult[0];

            // Group permissions by role
            const roleMap: Record<string, string[]> = {};
            for (const rp of rolePermissionsRaw) {
                if (!roleMap[rp.role]) roleMap[rp.role] = [];
                roleMap[rp.role].push(rp.permission);
            }

            res.json({
                success: true,
                permissions,
                roles: roleMap
            });
        } catch (error) {
            console.error('Error getting permissions:', error);
            res.status(500).json({ error: 'Failed to get permissions' });
        }
    }

    private async getMyPermissions(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // ✅ MIGRATED TO DRIZZLE ORM - Using permissionsRepo.findPermissionsByRole()
            const userRole = req.user?.role;
            if (!userRole) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }

            const result = await permissionsRepo.findPermissionsByRole(userRole);
            const permissions = (result[0] as unknown as RowDataPacket[]);

            res.json({
                success: true,
                role: userRole,
                permissions: permissions.map((p: RowDataPacket) => p.code),
                details: permissions
            });
        } catch (error) {
            console.error('Error getting my permissions:', error);
            res.status(500).json({ error: 'Failed to get permissions' });
        }
    }

    // ========================================================================
    // Server Start
    // ========================================================================

    public start(): void {
        this.server.listen(this.port, () => {
            console.log(`SOLARIA C-Suite Dashboard running on port ${this.port}`);
            console.log(`Dashboard available at: http://localhost:${this.port}`);
            console.log(`Secure authentication enabled`);
            console.log(`Real-time updates active`);
        });
    }
}

// Start server
const server = new SolariaDashboardServer();
server.start();

export default SolariaDashboardServer;

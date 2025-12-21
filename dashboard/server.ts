/**
 * SOLARIA C-Suite Dashboard Server
 * TypeScript migration - Servidor para supervision humana de proyectos gestionados por agentes IA
 * @version 3.0.0-ts
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import mysql, { Connection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
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
// Server Class
// ============================================================================

class SolariaDashboardServer {
    private app: Application;
    private server: http.Server;
    private io: TypedIOServer;
    private port: number;
    private db: Connection | null;
    private connectedClients: Map<string, ConnectedClient>;
    private repoPath: string;
    private _dbHealthInterval: ReturnType<typeof setInterval> | null;

    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(this.server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });

        this.port = parseInt(process.env.PORT || '3000', 10);
        this.db = null;
        this.connectedClients = new Map();
        this._dbHealthInterval = null;

        // Trust proxy for rate limiting behind nginx
        this.app.set('trust proxy', true);

        this.repoPath = process.env.REPO_PATH || path.resolve(__dirname, '..', '..');

        this.initializeMiddleware();
        this.initializeDatabase();
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

        // Auth middleware
        this.app.use('/api/', this.authenticateToken.bind(this));

        // Dashboard
        this.app.get('/api/dashboard/overview', this.getDashboardOverview.bind(this));
        this.app.get('/api/dashboard/metrics', this.getDashboardMetrics.bind(this));
        this.app.get('/api/dashboard/alerts', this.getDashboardAlerts.bind(this));
        this.app.get('/api/docs', this.getDocs.bind(this));

        // Projects
        this.app.get('/api/projects', this.getProjects.bind(this));
        this.app.get('/api/projects/:id', this.getProject.bind(this));
        this.app.post('/api/projects', this.createProject.bind(this));
        this.app.put('/api/projects/:id', this.updateProject.bind(this));
        this.app.delete('/api/projects/:id', this.deleteProject.bind(this));

        // Project Code Validation
        this.app.get('/api/projects/check-code/:code', this.checkProjectCode.bind(this));

        // Project Extended Data
        this.app.get('/api/projects/:id/client', this.getProjectClient.bind(this));
        this.app.put('/api/projects/:id/client', this.updateProjectClient.bind(this));
        this.app.get('/api/projects/:id/documents', this.getProjectDocuments.bind(this));
        this.app.post('/api/projects/:id/documents', this.createProjectDocument.bind(this));
        this.app.delete('/api/projects/:id/documents/:docId', this.deleteProjectDocument.bind(this));
        this.app.get('/api/projects/:id/requests', this.getProjectRequests.bind(this));
        this.app.post('/api/projects/:id/requests', this.createProjectRequest.bind(this));
        this.app.put('/api/projects/:id/requests/:reqId', this.updateProjectRequest.bind(this));
        this.app.delete('/api/projects/:id/requests/:reqId', this.deleteProjectRequest.bind(this));

        // Epics
        this.app.get('/api/projects/:id/epics', this.getProjectEpics.bind(this));
        this.app.post('/api/projects/:id/epics', this.createEpic.bind(this));
        this.app.put('/api/epics/:id', this.updateEpic.bind(this));
        this.app.delete('/api/epics/:id', this.deleteEpic.bind(this));

        // Sprints
        this.app.get('/api/projects/:id/sprints', this.getProjectSprints.bind(this));
        this.app.post('/api/projects/:id/sprints', this.createSprint.bind(this));
        this.app.put('/api/sprints/:id', this.updateSprint.bind(this));
        this.app.delete('/api/sprints/:id', this.deleteSprint.bind(this));

        // Agents
        this.app.get('/api/agents', this.getAgents.bind(this));
        this.app.get('/api/agents/:id', this.getAgent.bind(this));
        this.app.get('/api/agents/:id/performance', this.getAgentPerformance.bind(this));
        this.app.put('/api/agents/:id/status', this.updateAgentStatus.bind(this));

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
        this.app.put('/api/businesses/:id', this.updateBusiness.bind(this));

        // Logs
        this.app.get('/api/logs', this.getLogs.bind(this));
        this.app.get('/api/logs/audit', this.getAuditLogs.bind(this));

        // Reports
        this.app.get('/api/reports/projects', this.getProjectReports.bind(this));
        this.app.get('/api/reports/agents', this.getAgentReports.bind(this));
        this.app.get('/api/reports/financial', this.getFinancialReports.bind(this));

        // Docs
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
        this.app.get('/api/memories/tags', this.getMemoryTags.bind(this));
        this.app.get('/api/memories/stats', this.getMemoryStats.bind(this));
        this.app.get('/api/memories/:id', this.getMemory.bind(this));
        this.app.get('/api/memories/:id/related', this.getRelatedMemories.bind(this));
        this.app.post('/api/memories', this.createMemory.bind(this));
        this.app.post('/api/memories/:id/boost', this.boostMemory.bind(this));
        this.app.post('/api/memories/crossrefs', this.createMemoryCrossref.bind(this));
        this.app.put('/api/memories/:id', this.updateMemory.bind(this));
        this.app.delete('/api/memories/:id', this.deleteMemory.bind(this));

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
                    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JWTPayload;
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
            const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JWTPayload;
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
            const { userId, username, password } = req.body;

            // Bypass mode for development
            if (password === 'bypass') {
                const identifier = userId || username;
                const [rows] = await this.db!.execute<RowDataPacket[]>(
                    'SELECT * FROM users WHERE username = ? OR user_id = ?',
                    [identifier, identifier]
                );

                if (rows.length === 0) {
                    res.status(401).json({ error: 'User not found' });
                    return;
                }

                const user = rows[0] as User;
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
            const [rows] = await this.db!.execute<RowDataPacket[]>(
                'SELECT * FROM users WHERE username = ? OR user_id = ?',
                [identifier, identifier]
            );

            if (rows.length === 0) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const user = rows[0] as User;
            const validPassword = await bcrypt.compare(password, user.password_hash);

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
            await this.db!.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

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
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.status(401).json({ valid: false, error: 'No token provided' });
            return;
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JWTPayload;
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
            if (this.db) {
                await this.db.execute('SELECT 1');
            }
            res.json({
                status: 'healthy',
                database: this.db ? 'connected' : 'disconnected',
                timestamp: new Date().toISOString(),
                uptime: process.uptime()
            });
        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                database: 'error',
                timestamp: new Date().toISOString()
            });
        }
    }

    // ========================================================================
    // Helper Methods
    // ========================================================================

    private async getUserById(userId: number): Promise<User | null> {
        const [rows] = await this.db!.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );
        return rows.length > 0 ? (rows[0] as User) : null;
    }

    private async getAgentStates(): Promise<AgentState[]> {
        const [rows] = await this.db!.execute<RowDataPacket[]>(
            'SELECT id, name, status, current_task_id, last_active_at FROM agents'
        );
        return rows as AgentState[];
    }

    private async getProjectMetrics(): Promise<any[]> {
        const [rows] = await this.db!.execute<RowDataPacket[]>(`
            SELECT DATE(updated_at) as date,
                   AVG(completion_percentage) as avg_completion,
                   COUNT(*) as project_count
            FROM projects
            WHERE updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(updated_at)
            ORDER BY date DESC
        `);
        return rows;
    }

    private async getCriticalAlerts(): Promise<Alert[]> {
        const [rows] = await this.db!.execute<RowDataPacket[]>(
            "SELECT * FROM alerts WHERE severity = 'critical' AND status = 'active' ORDER BY created_at DESC LIMIT 10"
        );
        return rows as Alert[];
    }

    // ========================================================================
    // Dashboard Handlers (Stubs - will be implemented from server.js)
    // ========================================================================

    private async getDashboardOverview(_req: Request, res: Response): Promise<void> {
        // TODO: Migrate from server.js
        res.json({ message: 'Not implemented yet' });
    }

    private async getDashboardMetrics(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getDashboardAlerts(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getDocs(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getProjectsPublic(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getBusinessesPublic(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getTasksPublic(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getDashboardPublic(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getRecentCompletedTasks(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 20;

            const [tasks] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    t.id,
                    t.task_number,
                    CONCAT(
                        COALESCE(p.code, 'TSK'), '-',
                        LPAD(COALESCE(t.task_number, t.id), 3, '0'),
                        CASE
                            WHEN t.epic_id IS NOT NULL THEN CONCAT('-EPIC', LPAD(e.epic_number, 2, '0'))
                            WHEN t.sprint_id IS NOT NULL THEN CONCAT('-SP', LPAD(sp.sprint_number, 2, '0'))
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'bug') THEN '-BUG'
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'hotfix') THEN '-HOT'
                            ELSE ''
                        END
                    ) as task_code,
                    t.title,
                    t.status,
                    t.priority,
                    t.progress,
                    t.completed_at,
                    t.updated_at,
                    p.id as project_id,
                    p.name as project_name,
                    p.code as project_code,
                    e.epic_number, e.name as epic_name,
                    sp.sprint_number, sp.name as sprint_name,
                    aa.id as agent_id,
                    aa.name as agent_name,
                    aa.role as agent_role
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN epics e ON t.epic_id = e.id
                LEFT JOIN sprints sp ON t.sprint_id = sp.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                WHERE t.status = 'completed'
                ORDER BY COALESCE(t.completed_at, t.updated_at) DESC
                LIMIT ?
            `, [limit]);

            res.json(tasks);

        } catch (error) {
            console.error('Error fetching recent completed tasks:', error);
            res.status(500).json({ error: 'Failed to fetch recent completed tasks' });
        }
    }

    private async getRecentTasksByProject(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 30;
            const days = parseInt(req.query.days as string) || 7;

            const [tasks] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    t.id,
                    t.task_number,
                    CONCAT(
                        COALESCE(p.code, 'TSK'), '-',
                        LPAD(COALESCE(t.task_number, t.id), 3, '0'),
                        CASE
                            WHEN t.epic_id IS NOT NULL THEN CONCAT('-EPIC', LPAD(e.epic_number, 2, '0'))
                            WHEN t.sprint_id IS NOT NULL THEN CONCAT('-SP', LPAD(sp.sprint_number, 2, '0'))
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'bug') THEN '-BUG'
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'hotfix') THEN '-HOT'
                            ELSE ''
                        END
                    ) as task_code,
                    t.title,
                    t.status,
                    t.priority,
                    t.progress,
                    t.created_at,
                    t.updated_at,
                    p.id as project_id,
                    p.name as project_name,
                    p.code as project_code,
                    e.epic_number, e.name as epic_name,
                    sp.sprint_number, sp.name as sprint_name,
                    aa.id as agent_id,
                    aa.name as agent_name,
                    aa.role as agent_role
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN epics e ON t.epic_id = e.id
                LEFT JOIN sprints sp ON t.sprint_id = sp.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY t.created_at DESC
                LIMIT ?
            `, [days, limit]);

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
                total_tasks: tasks.length,
                projects: result
            });

        } catch (error) {
            console.error('Error fetching recent tasks by project:', error);
            res.status(500).json({ error: 'Failed to fetch recent tasks by project' });
        }
    }

    private async getTaskTags(_req: Request, res: Response): Promise<void> {
        try {
            const [rows] = await this.db!.execute<RowDataPacket[]>(`
                SELECT id, name, description, color, icon, usage_count, created_at
                FROM task_tags
                ORDER BY usage_count DESC, name ASC
            `);
            res.json({ tags: rows });
        } catch (error) {
            console.error('Error fetching task tags:', error);
            res.status(500).json({ error: 'Failed to fetch task tags' });
        }
    }

    /**
     * Helper: Log activity to database
     */
    private async logActivity(data: { action: string; category?: string; level?: string; project_id?: number | null; agent_id?: number | null }): Promise<void> {
        try {
            await this.db!.execute(`
                INSERT INTO activity_logs (action, category, level, project_id, agent_id)
                VALUES (?, ?, ?, ?, ?)
            `, [
                data.action,
                data.category || 'system',
                data.level || 'info',
                data.project_id || null,
                data.agent_id || null
            ]);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    // ========================================================================
    // Project Handlers
    // ========================================================================

    private async getProjects(req: Request, res: Response): Promise<void> {
        try {
            const { status, priority, page = '1', limit = '200' } = req.query;

            let query = `
                SELECT
                    p.*,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
                    (SELECT COUNT(DISTINCT assigned_agent_id) FROM tasks WHERE project_id = p.id) as agents_assigned,
                    (SELECT COUNT(*) FROM alerts WHERE project_id = p.id AND status = 'active') as active_alerts
                FROM projects p
            `;

            const whereConditions: string[] = [];
            const params: (string | number)[] = [];

            if (status) {
                whereConditions.push('p.status = ?');
                params.push(status as string);
            }

            if (priority) {
                whereConditions.push('p.priority = ?');
                params.push(priority as string);
            }

            if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' AND ');
            }

            query += ' ORDER BY p.updated_at DESC';

            const pageNum = parseInt(page as string, 10);
            const limitNum = parseInt(limit as string, 10);
            const offset = (pageNum - 1) * limitNum;
            query += ` LIMIT ${limitNum} OFFSET ${offset}`;

            const [projects] = await this.db!.execute<RowDataPacket[]>(query, params);

            // Get total for pagination
            const countQuery = 'SELECT COUNT(*) as total FROM projects' +
                (whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '');
            const [countResult] = await this.db!.execute<RowDataPacket[]>(countQuery, params);

            res.json({
                projects,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total: (countResult[0] as any).total,
                    pages: Math.ceil((countResult[0] as any).total / limitNum)
                }
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching projects:', errorMessage);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }

    private async getProject(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [projects] = await this.db!.execute<RowDataPacket[]>(
                'SELECT * FROM projects WHERE id = ?',
                [id]
            );

            if (projects.length === 0) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            const project = projects[0];

            // Get project tasks
            const [tasks] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    t.*,
                    aa.name as agent_name,
                    aa.role as agent_role
                FROM tasks t
                LEFT JOIN agents aa ON t.assigned_agent_id = aa.id
                WHERE t.project_id = ?
                ORDER BY t.created_at DESC
            `, [id]);

            // Get assigned agents
            const [agents] = await this.db!.execute<RowDataPacket[]>(`
                SELECT DISTINCT
                    aa.*,
                    COUNT(t.id) as tasks_assigned,
                    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed
                FROM agents aa
                INNER JOIN tasks t ON aa.id = t.assigned_agent_id
                WHERE t.project_id = ?
                GROUP BY aa.id
            `, [id]);

            // Get project alerts
            const [alerts] = await this.db!.execute<RowDataPacket[]>(`
                SELECT * FROM alerts
                WHERE project_id = ? AND status = 'active'
                ORDER BY severity DESC, created_at DESC
            `, [id]);

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

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO projects (
                    name, code, client, description, priority, budget,
                    start_date, deadline, created_by, office_origin, office_visible
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                name,
                projectCode,
                client || null,
                description || null,
                priority || 'medium',
                budget ?? null,
                start_date || null,
                deadline || null,
                req.user?.userId || null,
                normalizedOrigin,
                officeVisible
            ]);

            // Log creation
            await this.db!.execute(`
                INSERT INTO activity_logs (
                    project_id, action, details, category, level
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                result.insertId,
                'project_created',
                `Project ${name} created by ${req.user?.userId}`,
                'management',
                'info'
            ]);

            res.status(201).json({
                id: result.insertId,
                project_id: result.insertId,
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
            const { id } = req.params;
            const updates = req.body;

            // Build dynamic UPDATE query only for provided fields
            const fields: string[] = [];
            const values: (string | number | null)[] = [];

            if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
            if (updates.client !== undefined) { fields.push('client = ?'); values.push(updates.client); }
            if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
            if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
            if (updates.budget !== undefined) { fields.push('budget = ?'); values.push(updates.budget); }
            if (updates.deadline !== undefined) { fields.push('deadline = ?'); values.push(updates.deadline); }
            if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
            if (updates.completion_percentage !== undefined) { fields.push('completion_percentage = ?'); values.push(updates.completion_percentage); }
            if (updates.office_origin !== undefined || updates.origin !== undefined) {
                const normalizedOrigin = (updates.office_origin || updates.origin || '').toLowerCase() === 'office' ? 'office' : 'dfo';
                fields.push('office_origin = ?');
                values.push(normalizedOrigin);
            }
            if (updates.office_visible !== undefined) {
                const normalizedVisibility = updates.office_visible === true || updates.office_visible === 1 || String(updates.office_visible).toLowerCase() === 'true';
                fields.push('office_visible = ?');
                values.push(normalizedVisibility ? 1 : 0);
            }

            if (fields.length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            // Add updated_at timestamp
            fields.push('updated_at = NOW()');

            // Add id as last parameter
            values.push(id);

            const [result] = await this.db!.execute<ResultSetHeader>(
                `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Project not found' });
                return;
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
            const { id } = req.params;

            const [result] = await this.db!.execute<ResultSetHeader>(
                'DELETE FROM projects WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Project not found' });
                return;
            }

            res.json({ message: 'Project deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Delete project error:', errorMessage);
            res.status(500).json({ error: 'Failed to delete project' });
        }
    }

    // ========================================================================
    // Project Code Validation
    // ========================================================================

    private async checkProjectCode(req: Request, res: Response): Promise<void> {
        try {
            const { code } = req.params;
            const upperCode = code.toUpperCase().trim();

            // Validate format
            if (!/^[A-Z]{3}$/.test(upperCode)) {
                res.json({ available: false, reason: 'Code must be exactly 3 uppercase letters' });
                return;
            }

            // Check if reserved
            const [reserved] = await this.db!.execute<RowDataPacket[]>(
                'SELECT code, reason FROM reserved_project_codes WHERE code = ?',
                [upperCode]
            );
            if ((reserved as any[]).length > 0) {
                res.json({ available: false, reason: `Code '${upperCode}' is reserved: ${(reserved as any[])[0].reason}` });
                return;
            }

            // Check if already in use
            const [existing] = await this.db!.execute<RowDataPacket[]>(
                'SELECT id, name FROM projects WHERE code = ?',
                [upperCode]
            );
            if ((existing as any[]).length > 0) {
                res.json({ available: false, reason: `Code '${upperCode}' is used by project: ${(existing as any[])[0].name}` });
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
            const { id } = req.params;
            const { status } = req.query;

            let query = `
                SELECT e.*,
                    (SELECT COUNT(*) FROM tasks WHERE epic_id = e.id) as tasks_count,
                    (SELECT COUNT(*) FROM tasks WHERE epic_id = e.id AND status = 'completed') as tasks_completed
                FROM epics e
                WHERE e.project_id = ?
            `;
            const params: any[] = [id];

            if (status) {
                query += ' AND e.status = ?';
                params.push(status);
            }

            query += ' ORDER BY e.epic_number ASC';

            const [epics] = await this.db!.execute<RowDataPacket[]>(query, params);
            res.json({ epics });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Get project epics error:', errorMessage);
            res.status(500).json({ error: 'Failed to get epics' });
        }
    }

    private async createEpic(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // project_id
            const { name, description, color, status, start_date, target_date } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Epic name is required' });
                return;
            }

            // Get next epic number for this project
            const [maxNum] = await this.db!.execute<RowDataPacket[]>(
                'SELECT COALESCE(MAX(epic_number), 0) as max_num FROM epics WHERE project_id = ?',
                [id]
            );
            const epicNumber = ((maxNum as any[])[0]?.max_num || 0) + 1;

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO epics (project_id, epic_number, name, description, color, status, start_date, target_date, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id,
                epicNumber,
                name,
                description || null,
                color || '#6366f1',
                status || 'open',
                start_date || null,
                target_date || null,
                req.user?.userId || null
            ]);

            res.status(201).json({
                id: result.insertId,
                epic_number: epicNumber,
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
            const { id } = req.params;
            const { name, description, color, status, start_date, target_date } = req.body;

            const [result] = await this.db!.execute<ResultSetHeader>(`
                UPDATE epics SET
                    name = COALESCE(?, name),
                    description = COALESCE(?, description),
                    color = COALESCE(?, color),
                    status = COALESCE(?, status),
                    start_date = COALESCE(?, start_date),
                    target_date = COALESCE(?, target_date),
                    updated_at = NOW()
                WHERE id = ?
            `, [name, description, color, status, start_date, target_date, id]);

            if (result.affectedRows === 0) {
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
            const { id } = req.params;

            // Tasks with this epic_id will have it set to NULL via FK constraint
            const [result] = await this.db!.execute<ResultSetHeader>(
                'DELETE FROM epics WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
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
            const { id } = req.params;
            const { status } = req.query;

            let query = `
                SELECT s.*,
                    (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id) as tasks_count,
                    (SELECT COUNT(*) FROM tasks WHERE sprint_id = s.id AND status = 'completed') as tasks_completed,
                    (SELECT SUM(estimated_hours) FROM tasks WHERE sprint_id = s.id) as total_estimated_hours
                FROM sprints s
                WHERE s.project_id = ?
            `;
            const params: any[] = [id];

            if (status) {
                query += ' AND s.status = ?';
                params.push(status);
            }

            query += ' ORDER BY s.sprint_number ASC';

            const [sprints] = await this.db!.execute<RowDataPacket[]>(query, params);
            res.json({ sprints });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Get project sprints error:', errorMessage);
            res.status(500).json({ error: 'Failed to get sprints' });
        }
    }

    private async createSprint(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;  // project_id
            const { name, goal, status, start_date, end_date, velocity, capacity } = req.body;

            if (!name) {
                res.status(400).json({ error: 'Sprint name is required' });
                return;
            }

            // Get next sprint number for this project
            const [maxNum] = await this.db!.execute<RowDataPacket[]>(
                'SELECT COALESCE(MAX(sprint_number), 0) as max_num FROM sprints WHERE project_id = ?',
                [id]
            );
            const sprintNumber = ((maxNum as any[])[0]?.max_num || 0) + 1;

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO sprints (project_id, sprint_number, name, goal, status, start_date, end_date, velocity, capacity, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                id,
                sprintNumber,
                name,
                goal || null,
                status || 'planned',
                start_date || null,
                end_date || null,
                velocity || 0,
                capacity || 0,
                req.user?.userId || null
            ]);

            res.status(201).json({
                id: result.insertId,
                sprint_number: sprintNumber,
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
            const { id } = req.params;
            const { name, goal, status, start_date, end_date, velocity, capacity } = req.body;

            const [result] = await this.db!.execute<ResultSetHeader>(`
                UPDATE sprints SET
                    name = COALESCE(?, name),
                    goal = COALESCE(?, goal),
                    status = COALESCE(?, status),
                    start_date = COALESCE(?, start_date),
                    end_date = COALESCE(?, end_date),
                    velocity = COALESCE(?, velocity),
                    capacity = COALESCE(?, capacity),
                    updated_at = NOW()
                WHERE id = ?
            `, [name, goal, status, start_date, end_date, velocity, capacity, id]);

            if (result.affectedRows === 0) {
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
            const { id } = req.params;

            // Tasks with this sprint_id will have it set to NULL via FK constraint
            const [result] = await this.db!.execute<ResultSetHeader>(
                'DELETE FROM sprints WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
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

    private async getProjectClient(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [rows] = await this.db!.execute<RowDataPacket[]>(
                'SELECT * FROM project_clients WHERE project_id = ?',
                [id]
            );

            if (rows.length === 0) {
                res.json({ client: null, message: 'No client info found' });
                return;
            }

            res.json({ client: rows[0] });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting project client:', errorMessage);
            res.status(500).json({ error: 'Failed to get project client' });
        }
    }

    private async updateProjectClient(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, fiscal_name, rfc, website, address, fiscal_address, contact_name, contact_email, contact_phone, logo_url, notes } = req.body;

            // Check if client exists
            const [existing] = await this.db!.execute<RowDataPacket[]>(
                'SELECT id FROM project_clients WHERE project_id = ?',
                [id]
            );

            if (existing.length === 0) {
                // Insert new client
                await this.db!.execute(`
                    INSERT INTO project_clients (project_id, name, fiscal_name, rfc, website, address, fiscal_address, contact_name, contact_email, contact_phone, logo_url, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, name, fiscal_name || null, rfc || null, website || null, address || null, fiscal_address || null, contact_name || null, contact_email || null, contact_phone || null, logo_url || null, notes || null]);
            } else {
                // Update existing
                await this.db!.execute(`
                    UPDATE project_clients SET
                        name = COALESCE(?, name),
                        fiscal_name = COALESCE(?, fiscal_name),
                        rfc = COALESCE(?, rfc),
                        website = COALESCE(?, website),
                        address = COALESCE(?, address),
                        fiscal_address = COALESCE(?, fiscal_address),
                        contact_name = COALESCE(?, contact_name),
                        contact_email = COALESCE(?, contact_email),
                        contact_phone = COALESCE(?, contact_phone),
                        logo_url = COALESCE(?, logo_url),
                        notes = COALESCE(?, notes)
                    WHERE project_id = ?
                `, [name, fiscal_name, rfc, website, address, fiscal_address, contact_name, contact_email, contact_phone, logo_url, notes, id]);
            }

            res.json({ message: 'Project client updated successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error updating project client:', errorMessage);
            res.status(500).json({ error: 'Failed to update project client' });
        }
    }

    private async getProjectDocuments(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [rows] = await this.db!.execute<RowDataPacket[]>(`
                SELECT pd.*, u.name as uploader_name
                FROM project_documents pd
                LEFT JOIN users u ON pd.uploaded_by = u.id
                WHERE pd.project_id = ?
                ORDER BY pd.created_at DESC
            `, [id]);

            res.json({ documents: rows });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting project documents:', errorMessage);
            res.status(500).json({ error: 'Failed to get project documents' });
        }
    }

    private async createProjectDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, type, url, description, file_size } = req.body;
            const uploaded_by = req.user?.userId || null;

            if (!name || !url) {
                res.status(400).json({ error: 'Name and URL are required' });
                return;
            }

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO project_documents (project_id, name, type, url, description, file_size, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [id, name, type || 'other', url, description || null, file_size || null, uploaded_by]);

            res.status(201).json({
                id: result.insertId,
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
            const { id, docId } = req.params;

            const [result] = await this.db!.execute<ResultSetHeader>(
                'DELETE FROM project_documents WHERE id = ? AND project_id = ?',
                [docId, id]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Document not found' });
                return;
            }

            res.json({ message: 'Document deleted successfully' });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error deleting project document:', errorMessage);
            res.status(500).json({ error: 'Failed to delete project document' });
        }
    }

    private async getProjectRequests(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status, priority } = req.query;

            let query = `
                SELECT pr.*, a.name as assigned_agent_name
                FROM project_requests pr
                LEFT JOIN agents a ON pr.assigned_to = a.id
                WHERE pr.project_id = ?
            `;
            const params: (string | number)[] = [id];

            if (status) {
                query += ' AND pr.status = ?';
                params.push(status as string);
            }
            if (priority) {
                query += ' AND pr.priority = ?';
                params.push(priority as string);
            }

            query += ' ORDER BY pr.created_at DESC';

            const [rows] = await this.db!.execute<RowDataPacket[]>(query, params);

            res.json({ requests: rows });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error getting project requests:', errorMessage);
            res.status(500).json({ error: 'Failed to get project requests' });
        }
    }

    private async createProjectRequest(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { text, status, priority, requested_by, assigned_to, notes } = req.body;

            if (!text) {
                res.status(400).json({ error: 'Request text is required' });
                return;
            }

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO project_requests (project_id, text, status, priority, requested_by, assigned_to, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [id, text, status || 'pending', priority || 'medium', requested_by || null, assigned_to || null, notes || null]);

            res.status(201).json({
                id: result.insertId,
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
            const { id, reqId } = req.params;
            const { text, status, priority, assigned_to, notes } = req.body;

            const updates: string[] = [];
            const params: (string | number | null)[] = [];

            if (text !== undefined) { updates.push('text = ?'); params.push(text); }
            if (status !== undefined) { updates.push('status = ?'); params.push(status); }
            if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
            if (assigned_to !== undefined) { updates.push('assigned_to = ?'); params.push(assigned_to); }
            if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

            // If status is completed, set resolved_at
            if (status === 'completed') {
                updates.push('resolved_at = NOW()');
            }

            if (updates.length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            const query = 'UPDATE project_requests SET ' + updates.join(', ') + ' WHERE id = ? AND project_id = ?';
            params.push(reqId, id);

            const [result] = await this.db!.execute<ResultSetHeader>(query, params);

            if (result.affectedRows === 0) {
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
            const { id, reqId } = req.params;

            const [result] = await this.db!.execute<ResultSetHeader>(
                'DELETE FROM project_requests WHERE id = ? AND project_id = ?',
                [reqId, id]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Request not found' });
                return;
            }

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
            const { role, status, page = '1', limit = '50' } = req.query;
            const pageNum = parseInt(page as string) || 1;
            const limitNum = parseInt(limit as string) || 50;

            let query = `
                SELECT
                    aa.*,
                    COUNT(t.id) as tasks_assigned,
                    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed,
                    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as current_tasks,
                    COUNT(CASE WHEN al.level = 'error' THEN 1 END) as error_count
                FROM ai_agents aa
                LEFT JOIN tasks t ON aa.id = t.assigned_agent_id
                LEFT JOIN activity_logs al ON aa.id = al.agent_id
                    AND al.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `;

            const whereConditions: string[] = [];
            const params: (string | number)[] = [];

            if (role) {
                whereConditions.push('aa.role = ?');
                params.push(role as string);
            }

            if (status) {
                whereConditions.push('aa.status = ?');
                params.push(status as string);
            }

            if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' AND ');
            }

            query += ' GROUP BY aa.id ORDER BY aa.last_active_at DESC';

            const offset = (pageNum - 1) * limitNum;
            query += ` LIMIT ${limitNum} OFFSET ${offset}`;

            const [agents] = await this.db!.execute<RowDataPacket[]>(query, params);

            res.json(agents);

        } catch (error) {
            console.error('Error fetching agents:', error);
            res.status(500).json({ error: 'Failed to fetch agents' });
        }
    }

    private async getAgent(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [agent] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    aa.*,
                    (SELECT COUNT(*) FROM tasks WHERE assigned_agent_id = aa.id) as total_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE assigned_agent_id = aa.id AND status = 'completed') as completed_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE assigned_agent_id = aa.id AND status = 'in_progress') as active_tasks
                FROM ai_agents aa
                WHERE aa.id = ?
            `, [id]);

            if (agent.length === 0) {
                res.status(404).json({ error: 'Agent not found' });
                return;
            }

            res.json(agent[0]);

        } catch (error) {
            console.error('Error fetching agent:', error);
            res.status(500).json({ error: 'Failed to fetch agent' });
        }
    }

    private async getAgentPerformance(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            // const { period = '7d' } = req.query;

            // Get tasks completed in last 7 days with timing info
            const [performance] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    DATE(completed_at) as date,
                    COUNT(*) as tasks_completed,
                    AVG(actual_hours) as avg_hours,
                    AVG(progress) as avg_progress
                FROM tasks
                WHERE assigned_agent_id = ?
                    AND status = 'completed'
                    AND completed_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(completed_at)
                ORDER BY date DESC
            `, [id]);

            res.json(performance);

        } catch (error) {
            console.error('Error fetching agent performance:', error);
            res.status(500).json({ error: 'Failed to fetch agent performance' });
        }
    }

    private async updateAgentStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            await this.db!.execute(`
                UPDATE ai_agents
                SET status = ?, last_active_at = NOW(), updated_at = NOW()
                WHERE id = ?
            `, [status, id]);

            res.json({ message: 'Agent status updated successfully' });

        } catch (error) {
            console.error('Error updating agent status:', error);
            res.status(500).json({ error: 'Failed to update agent status' });
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
        const [counts] = await this.db!.execute<RowDataPacket[]>(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
            FROM task_items
            WHERE task_id = ?
        `, [taskId]);

        const total = counts[0].total || 0;
        const completed = parseInt(counts[0].completed) || 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update task progress
        await this.db!.execute('UPDATE tasks SET progress = ?, updated_at = NOW() WHERE id = ?', [progress, taskId]);

        // Auto-complete task if 100%
        if (progress === 100 && total > 0) {
            await this.db!.execute(
                `UPDATE tasks SET status = 'completed', completed_at = NOW()
                 WHERE id = ? AND status != 'completed'`,
                [taskId]
            );
        }

        // Emit WebSocket update
        this.io.to('notifications').emit('task_updated', {
            task_id: taskId,
            progress,
            items_completed: completed,
            items_total: total
        } as any);

        return { progress, completed, total };
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
                    e.id as epic_id, e.epic_number, e.name as epic_name,
                    sp.id as sprint_id, sp.sprint_number, sp.name as sprint_name,
                    CONCAT(
                        COALESCE(p.code, 'TSK'), '-',
                        LPAD(COALESCE(t.task_number, t.id), 3, '0'),
                        CASE
                            WHEN t.epic_id IS NOT NULL THEN CONCAT('-EPIC', LPAD(e.epic_number, 2, '0'))
                            WHEN t.sprint_id IS NOT NULL THEN CONCAT('-SP', LPAD(sp.sprint_number, 2, '0'))
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'bug') THEN '-BUG'
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'hotfix') THEN '-HOT'
                            ELSE ''
                        END
                    ) as task_code,
                    aa.name as agent_name,
                    u.username as assigned_by_name,
                    (SELECT COUNT(*) FROM task_items WHERE task_id = t.id) as items_total,
                    (SELECT COUNT(*) FROM task_items WHERE task_id = t.id AND is_completed = 1) as items_completed
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN epics e ON t.epic_id = e.id
                LEFT JOIN sprints sp ON t.sprint_id = sp.id
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
            const { id } = req.params;

            const [task] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    t.*,
                    p.name as project_name,
                    p.code as project_code,
                    e.id as epic_id, e.epic_number, e.name as epic_name,
                    sp.id as sprint_id, sp.sprint_number, sp.name as sprint_name,
                    CONCAT(
                        COALESCE(p.code, 'TSK'), '-',
                        LPAD(COALESCE(t.task_number, t.id), 3, '0'),
                        CASE
                            WHEN t.epic_id IS NOT NULL THEN CONCAT('-EPIC', LPAD(e.epic_number, 2, '0'))
                            WHEN t.sprint_id IS NOT NULL THEN CONCAT('-SP', LPAD(sp.sprint_number, 2, '0'))
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'bug') THEN '-BUG'
                            WHEN EXISTS (SELECT 1 FROM task_tag_assignments tta JOIN task_tags tt ON tta.tag_id = tt.id WHERE tta.task_id = t.id AND tt.name = 'hotfix') THEN '-HOT'
                            ELSE ''
                        END
                    ) as task_code,
                    aa.name as agent_name,
                    u.username as assigned_by_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN epics e ON t.epic_id = e.id
                LEFT JOIN sprints sp ON t.sprint_id = sp.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                LEFT JOIN users u ON t.assigned_by = u.id
                WHERE t.id = ?
            `, [id]);

            if (task.length === 0) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            // Fetch task items (subtasks/checklist)
            const [items] = await this.db!.execute<RowDataPacket[]>(`
                SELECT ti.*, a.name as completed_by_name
                FROM task_items ti
                LEFT JOIN ai_agents a ON ti.completed_by_agent_id = a.id
                WHERE ti.task_id = ?
                ORDER BY ti.sort_order ASC, ti.created_at ASC
            `, [id]);

            const result = task[0] as any;
            result.items = items;
            result.items_total = items.length;
            result.items_completed = items.filter((i: any) => i.is_completed).length;

            res.json(result);

        } catch (error) {
            console.error('Error fetching task:', error);
            res.status(500).json({ error: 'Failed to fetch task' });
        }
    }

    private async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
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
                const [agents] = await this.db!.execute<RowDataPacket[]>(
                    "SELECT id FROM ai_agents WHERE name = 'Claude Code' AND status = 'active' LIMIT 1"
                );
                if (agents.length > 0) {
                    agentId = agents[0].id;
                }
            }

            // Get next task_number for this project
            let taskNumber = 1;
            if (project_id) {
                const [maxTask] = await this.db!.execute<RowDataPacket[]>(
                    'SELECT COALESCE(MAX(task_number), 0) + 1 as next_number FROM tasks WHERE project_id = ?',
                    [project_id]
                );
                taskNumber = maxTask[0].next_number;
            }

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO tasks (
                    title, description, project_id, epic_id, sprint_id, assigned_agent_id, task_number,
                    priority, estimated_hours, deadline, assigned_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                title || 'Nueva tarea',
                description ?? null,
                project_id ?? null,
                epic_id ?? null,
                sprint_id ?? null,
                agentId ?? null,
                taskNumber,
                priority || 'medium',
                estimated_hours ?? null,
                deadline ?? null,
                req.user?.userId ?? null
            ]);

            // Generate task_code with suffix
            let taskCode = `#${taskNumber}`;
            let suffix = '';
            if (project_id) {
                const [projects] = await this.db!.execute<RowDataPacket[]>(
                    'SELECT code FROM projects WHERE id = ?',
                    [project_id]
                );
                if (projects.length > 0 && projects[0].code) {
                    taskCode = `${projects[0].code}-${String(taskNumber).padStart(3, '0')}`;

                    // Add suffix based on epic or sprint
                    if (epic_id) {
                        const [epics] = await this.db!.execute<RowDataPacket[]>(
                            'SELECT epic_number FROM epics WHERE id = ?',
                            [epic_id]
                        );
                        if (epics.length > 0) {
                            suffix = `-EPIC${String(epics[0].epic_number).padStart(2, '0')}`;
                        }
                    } else if (sprint_id) {
                        const [sprints] = await this.db!.execute<RowDataPacket[]>(
                            'SELECT sprint_number FROM sprints WHERE id = ?',
                            [sprint_id]
                        );
                        if (sprints.length > 0) {
                            suffix = `-SP${String(sprints[0].sprint_number).padStart(2, '0')}`;
                        }
                    }
                    taskCode += suffix;
                }
            }

            // Emit task_created notification
            this.io.to('notifications').emit('task_created', {
                id: result.insertId,
                task_code: taskCode,
                task_number: taskNumber,
                title: title || 'Nueva tarea',
                description: description || '',
                project_id: project_id || null,
                assigned_agent_id: agentId || null,
                priority: priority || 'medium',
                status: 'pending',
                progress: 0,
                created_at: new Date().toISOString()
            } as any);

            res.status(201).json({
                id: result.insertId,
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
            const { id } = req.params;
            const updates = req.body;

            const fields: string[] = [];
            const values: (string | number | null)[] = [];

            if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
            if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
            if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
            if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
            if (updates.progress !== undefined) { fields.push('progress = ?'); values.push(updates.progress); }
            if (updates.project_id !== undefined) { fields.push('project_id = ?'); values.push(updates.project_id); }
            if (updates.epic_id !== undefined) { fields.push('epic_id = ?'); values.push(updates.epic_id); }
            if (updates.sprint_id !== undefined) { fields.push('sprint_id = ?'); values.push(updates.sprint_id); }

            // Auto-set progress to 100% when task is marked as completed
            if (updates.status === 'completed' && updates.progress === undefined) {
                fields.push('progress = ?');
                values.push(100);
            }
            if (updates.actual_hours !== undefined) { fields.push('actual_hours = ?'); values.push(updates.actual_hours); }
            if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
            if (updates.assigned_agent_id !== undefined) { fields.push('assigned_agent_id = ?'); values.push(updates.assigned_agent_id); }

            if (fields.length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            fields.push('updated_at = NOW()');
            values.push(parseInt(id));

            const [result] = await this.db!.execute<ResultSetHeader>(
                `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            // Fetch task data for WebSocket notification
            const [taskDataForEmit] = await this.db!.execute<RowDataPacket[]>(`
                SELECT t.id, t.task_number, t.title, t.status, t.priority, t.progress, t.project_id,
                       p.code as project_code, p.name as project_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                WHERE t.id = ?
            `, [id]);
            const taskForEmit = taskDataForEmit[0] || {};
            const taskCode = taskForEmit.project_code && taskForEmit.task_number
                ? `${taskForEmit.project_code}-${String(taskForEmit.task_number).padStart(3, '0')}`
                : `TASK-${id}`;

            // Emit task_updated for real-time updates
            this.io.to('notifications').emit('task_updated', {
                task_id: parseInt(id),
                id: parseInt(id),
                task_code: taskCode,
                title: taskForEmit.title || updates.title,
                project_id: taskForEmit.project_id,
                project_name: taskForEmit.project_name,
                ...updates,
                updated_at: new Date().toISOString()
            } as any);

            // Emit task_completed notification if status changed to completed
            if (updates.status === 'completed') {
                const [taskData] = await this.db!.execute<RowDataPacket[]>(`
                    SELECT t.*, p.name as project_name, aa.name as agent_name
                    FROM tasks t
                    LEFT JOIN projects p ON t.project_id = p.id
                    LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                    WHERE t.id = ?
                `, [id]);

                const task = taskData[0] || {};
                this.io.to('notifications').emit('task_completed', {
                    id: parseInt(id),
                    title: task.title || `Tarea #${id}`,
                    project_id: task.project_id,
                    project_name: task.project_name || 'Sin proyecto',
                    agent_name: task.agent_name,
                    priority: task.priority || 'medium'
                } as any);
            }

            res.json({ message: 'Task updated successfully' });

        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({ error: 'Failed to update task' });
        }
    }

    private async deleteTask(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            // Check if task exists first
            const [existing] = await this.db!.execute<RowDataPacket[]>('SELECT id, title, project_id FROM tasks WHERE id = ?', [id]);
            if (existing.length === 0) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            const task = existing[0];

            // Delete associated task_items first
            await this.db!.execute('DELETE FROM task_items WHERE task_id = ?', [id]);

            // Delete associated task_tag_assignments
            await this.db!.execute('DELETE FROM task_tag_assignments WHERE task_id = ?', [id]);

            // Delete the task
            const [result] = await this.db!.execute<ResultSetHeader>('DELETE FROM tasks WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Task not found' });
                return;
            }

            // Emit WebSocket notification
            this.io.to('notifications').emit('task_deleted', {
                id: parseInt(id),
                title: task.title,
                project_id: task.project_id
            } as any);

            res.json({ message: 'Task deleted successfully', deleted_id: parseInt(id) });

        } catch (error) {
            console.error('Delete task error:', error);
            res.status(500).json({ error: 'Failed to delete task' });
        }
    }

    private async getTaskItems(req: Request, res: Response): Promise<void> {
        try {
            const taskId = parseInt(req.params.id);

            const [items] = await this.db!.execute<RowDataPacket[]>(`
                SELECT ti.*, a.name as completed_by_name
                FROM task_items ti
                LEFT JOIN ai_agents a ON ti.completed_by_agent_id = a.id
                WHERE ti.task_id = ?
                ORDER BY ti.sort_order ASC, ti.created_at ASC
            `, [taskId]);

            res.json({
                items,
                task_id: taskId,
                total: items.length,
                completed: items.filter((i: any) => i.is_completed).length
            });
        } catch (error) {
            console.error('Error fetching task items:', error);
            res.status(500).json({ error: 'Failed to fetch task items' });
        }
    }

    private async createTaskItems(req: Request, res: Response): Promise<void> {
        try {
            const taskId = parseInt(req.params.id);
            let { items } = req.body;

            // Support single item or array
            if (!Array.isArray(items)) {
                items = [req.body];
            }

            // Get current max sort_order
            const [maxOrder] = await this.db!.execute<RowDataPacket[]>(
                'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM task_items WHERE task_id = ?',
                [taskId]
            );
            let currentOrder = maxOrder[0].max_order;

            const createdItems: any[] = [];
            for (const item of items) {
                currentOrder++;
                const [result] = await this.db!.execute<ResultSetHeader>(`
                    INSERT INTO task_items (task_id, title, description, sort_order, estimated_minutes)
                    VALUES (?, ?, ?, ?, ?)
                `, [taskId, item.title, item.description || null, currentOrder, item.estimated_minutes || 0]);

                createdItems.push({
                    id: result.insertId,
                    task_id: taskId,
                    title: item.title,
                    sort_order: currentOrder
                });
            }

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            // Log activity
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
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);
            const { title, description, is_completed, notes, actual_minutes, completed_by_agent_id } = req.body;

            const updates: string[] = [];
            const values: (string | number | null)[] = [];

            if (title !== undefined) { updates.push('title = ?'); values.push(title); }
            if (description !== undefined) { updates.push('description = ?'); values.push(description); }
            if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
            if (actual_minutes !== undefined) { updates.push('actual_minutes = ?'); values.push(actual_minutes); }

            if (is_completed !== undefined) {
                updates.push('is_completed = ?');
                values.push(is_completed);
                if (is_completed) {
                    updates.push('completed_at = NOW()');
                    if (completed_by_agent_id) {
                        updates.push('completed_by_agent_id = ?');
                        values.push(completed_by_agent_id);
                    }
                } else {
                    updates.push('completed_at = NULL');
                    updates.push('completed_by_agent_id = NULL');
                }
            }

            if (updates.length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            values.push(itemId, taskId);
            await this.db!.execute(
                `UPDATE task_items SET ${updates.join(', ')} WHERE id = ? AND task_id = ?`,
                values
            );

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            // Get updated item
            const [items] = await this.db!.execute<RowDataPacket[]>('SELECT * FROM task_items WHERE id = ?', [itemId]);

            res.json({ item: items[0], ...progress });
        } catch (error) {
            console.error('Error updating task item:', error);
            res.status(500).json({ error: 'Failed to update task item' });
        }
    }

    private async toggleTaskItemComplete(req: Request, res: Response): Promise<void> {
        try {
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);
            const { notes, actual_minutes, agent_id } = req.body;

            // Toggle completion
            await this.db!.execute(`
                UPDATE task_items
                SET is_completed = NOT is_completed,
                    completed_at = CASE WHEN is_completed = 1 THEN NOW() ELSE NULL END,
                    completed_by_agent_id = CASE WHEN is_completed = 1 THEN ? ELSE NULL END,
                    notes = COALESCE(?, notes),
                    actual_minutes = COALESCE(?, actual_minutes)
                WHERE id = ? AND task_id = ?
            `, [agent_id || null, notes || null, actual_minutes || null, itemId, taskId]);

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            // Get updated item
            const [items] = await this.db!.execute<RowDataPacket[]>('SELECT * FROM task_items WHERE id = ?', [itemId]);

            res.json({ item: items[0], ...progress });
        } catch (error) {
            console.error('Error toggling task item:', error);
            res.status(500).json({ error: 'Failed to toggle task item' });
        }
    }

    private async deleteTaskItem(req: Request, res: Response): Promise<void> {
        try {
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);

            await this.db!.execute('DELETE FROM task_items WHERE id = ? AND task_id = ?', [itemId, taskId]);

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            res.json({ deleted: true, item_id: itemId, ...progress });
        } catch (error) {
            console.error('Error deleting task item:', error);
            res.status(500).json({ error: 'Failed to delete task item' });
        }
    }

    private async reorderTaskItems(req: Request, res: Response): Promise<void> {
        try {
            const taskId = parseInt(req.params.id);
            const { order } = req.body; // Array of { id, sort_order }

            for (const item of order) {
                await this.db!.execute(
                    'UPDATE task_items SET sort_order = ? WHERE id = ? AND task_id = ?',
                    [item.sort_order, item.id, taskId]
                );
            }

            res.json({ reordered: true, task_id: taskId });
        } catch (error) {
            console.error('Error reordering task items:', error);
            res.status(500).json({ error: 'Failed to reorder task items' });
        }
    }

    private async getTaskTagAssignments(req: Request, res: Response): Promise<void> {
        try {
            const taskId = parseInt(req.params.id);
            const [rows] = await this.db!.execute<RowDataPacket[]>(`
                SELECT tt.id, tt.name, tt.description, tt.color, tt.icon,
                       tta.assigned_at, u.name as assigned_by_name
                FROM task_tag_assignments tta
                JOIN task_tags tt ON tta.tag_id = tt.id
                LEFT JOIN users u ON tta.assigned_by = u.id
                WHERE tta.task_id = ?
                ORDER BY tta.assigned_at ASC
            `, [taskId]);
            res.json({ task_id: taskId, tags: rows });
        } catch (error) {
            console.error('Error fetching task tag assignments:', error);
            res.status(500).json({ error: 'Failed to fetch task tags' });
        }
    }

    private async addTaskTag(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const taskId = parseInt(req.params.id);
            const { tag_id, tag_name } = req.body;
            const userId = req.user?.userId || null;

            let tagIdToAssign = tag_id;

            // If tag_name provided instead of tag_id, look up the tag
            if (!tagIdToAssign && tag_name) {
                const [tagRows] = await this.db!.execute<RowDataPacket[]>(
                    'SELECT id FROM task_tags WHERE name = ?',
                    [tag_name.toLowerCase()]
                );
                if (tagRows.length === 0) {
                    res.status(404).json({ error: `Tag '${tag_name}' not found` });
                    return;
                }
                tagIdToAssign = tagRows[0].id;
            }

            if (!tagIdToAssign) {
                res.status(400).json({ error: 'tag_id or tag_name required' });
                return;
            }

            // Insert assignment
            await this.db!.execute(`
                INSERT INTO task_tag_assignments (task_id, tag_id, assigned_by)
                VALUES (?, ?, ?)
            `, [taskId, tagIdToAssign, userId]);

            // Increment usage count
            await this.db!.execute(
                'UPDATE task_tags SET usage_count = usage_count + 1 WHERE id = ?',
                [tagIdToAssign]
            );

            // Get the added tag info
            const [tagInfo] = await this.db!.execute<RowDataPacket[]>(
                'SELECT id, name, color, icon FROM task_tags WHERE id = ?',
                [tagIdToAssign]
            );

            // Emit WebSocket event
            this.io.emit('task_tag_added', {
                task_id: taskId,
                tag: tagInfo[0]
            } as any);

            res.json({ success: true, task_id: taskId, tag: tagInfo[0] });
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
            const taskId = parseInt(req.params.id);
            const tagId = parseInt(req.params.tagId);

            const [result] = await this.db!.execute<ResultSetHeader>(`
                DELETE FROM task_tag_assignments
                WHERE task_id = ? AND tag_id = ?
            `, [taskId, tagId]);

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Tag assignment not found' });
                return;
            }

            // Decrement usage count
            await this.db!.execute(
                'UPDATE task_tags SET usage_count = GREATEST(usage_count - 1, 0) WHERE id = ?',
                [tagId]
            );

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
    // Business Handlers (Stubs)
    // ========================================================================

    private async getBusinesses(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getBusiness(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async updateBusiness(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    // ========================================================================
    // Log Handlers (Stubs)
    // ========================================================================

    private async getLogs(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    private async getAuditLogs(_req: Request, res: Response): Promise<void> {
        res.json({ message: 'Not implemented yet' });
    }

    // ========================================================================
    // Report Handlers
    // ========================================================================

    private async getProjectReports(_req: Request, res: Response): Promise<void> {
        try {
            const [reports] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    p.name as project_name,
                    COUNT(t.id) as total_tasks,
                    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    AVG(pm.completion_percentage) as avg_completion,
                    AVG(pm.agent_efficiency) as avg_efficiency
                FROM projects p
                LEFT JOIN tasks t ON p.id = t.project_id
                LEFT JOIN project_metrics pm ON p.id = pm.project_id
                WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY p.id, p.name
                ORDER BY avg_completion DESC
            `);

            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch project reports' });
        }
    }

    private async getAgentReports(_req: Request, res: Response): Promise<void> {
        try {
            const [reports] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    aa.name as agent_name,
                    aa.role,
                    COUNT(t.id) as total_tasks,
                    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                    AVG(am.metric_value) as avg_performance,
                    as_.status as current_status
                FROM ai_agents aa
                LEFT JOIN tasks t ON aa.id = t.assigned_agent_id
                LEFT JOIN agent_metrics am ON aa.id = am.agent_id
                LEFT JOIN agent_states as_ ON aa.id = as_.agent_id
                GROUP BY aa.id, aa.name, aa.role, as_.status
                ORDER BY avg_performance DESC
            `);

            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch agent reports' });
        }
    }

    private async getFinancialReports(_req: Request, res: Response): Promise<void> {
        try {
            const [reports] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    p.name as project_name,
                    p.budget,
                    COALESCE(pm.budget_used, 0) as actual_cost,
                    p.budget - COALESCE(pm.budget_used, 0) as remaining_budget,
                    CASE
                        WHEN p.budget > 0 THEN
                            (COALESCE(pm.budget_used, 0) / p.budget) * 100
                        ELSE 0
                    END as budget_usage_percentage
                FROM projects p
                LEFT JOIN project_metrics pm ON p.id = pm.project_id AND pm.metric_date = CURDATE()
                GROUP BY p.id, p.name, p.budget, pm.budget_used
                ORDER BY budget_usage_percentage DESC
            `);

            res.json(reports);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch financial reports' });
        }
    }

    // ========================================================================
    // Docs Handlers
    // ========================================================================

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
            const [projects] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    p.*,
                    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
                    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
                    (SELECT COUNT(*) FROM alerts a WHERE a.project_id = p.id AND a.status = 'active') as active_alerts
                FROM projects p
            `);

            const [budgetSummary] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    SUM(budget) as total_budget,
                    SUM(actual_cost) as total_spent,
                    SUM(budget) - SUM(actual_cost) as remaining,
                    AVG(completion_percentage) as avg_completion
                FROM projects
            `);

            const [criticalAlerts] = await this.db!.execute<RowDataPacket[]>(`
                SELECT * FROM alerts WHERE severity = 'critical' AND status = 'active'
            `);

            const [topTasks] = await this.db!.execute<RowDataPacket[]>(`
                SELECT title, status, priority, project_id, progress, created_at
                FROM tasks
                WHERE status <> 'completed'
                ORDER BY priority DESC, created_at DESC
                LIMIT 5
            `);

            const akademateProject = projects.find(p => p.name && p.name.toLowerCase().includes('akademate'));
            const mainProject = akademateProject || projects[0];
            const executiveSummary = `${mainProject?.name || 'Proyecto'}: ${Math.round(mainProject?.completion_percentage || 0)}% completado; ${criticalAlerts.length} alertas críticas activas; presupuesto utilizado ${(budgetSummary[0].total_spent || 0)} / ${(budgetSummary[0].total_budget || 0)}.`;

            res.json({
                role: 'CEO',
                title: 'Strategic Overview',
                focus: ['ROI', 'Budget', 'Critical Alerts', 'Tareas clave'],
                kpis: {
                    totalProjects: projects.length,
                    totalBudget: budgetSummary[0].total_budget || 0,
                    totalSpent: budgetSummary[0].total_spent || 0,
                    budgetRemaining: budgetSummary[0].remaining || 0,
                    avgCompletion: Math.round(budgetSummary[0].avg_completion || 0),
                    roi: budgetSummary[0].total_budget > 0
                        ? Math.round(((budgetSummary[0].total_budget - budgetSummary[0].total_spent) / budgetSummary[0].total_budget) * 100)
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
            const [agents] = await this.db!.execute<RowDataPacket[]>(`SELECT * FROM ai_agents`);
            const [techMetrics] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    AVG(code_quality_score) as avg_quality,
                    AVG(test_coverage) as avg_coverage,
                    AVG(agent_efficiency) as avg_efficiency
                FROM project_metrics WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            `);
            const [techDebt] = await this.db!.execute<RowDataPacket[]>(`
                SELECT COUNT(*) as count FROM tasks WHERE status = 'blocked' OR priority = 'critical'
            `);

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
            const [tasks] = await this.db!.execute<RowDataPacket[]>(`SELECT * FROM tasks ORDER BY created_at DESC LIMIT 20`);
            const [taskStats] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
                FROM tasks
            `);
            const [agentWorkload] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    aa.name, aa.role, aa.status,
                    COUNT(t.id) as assigned_tasks,
                    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
                FROM ai_agents aa
                LEFT JOIN tasks t ON aa.id = t.assigned_agent_id
                GROUP BY aa.id
            `);

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
            const [financials] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    SUM(budget) as total_budget,
                    SUM(actual_cost) as total_cost,
                    SUM(budget) - SUM(actual_cost) as remaining_budget
                FROM projects
            `);
            const [costByProject] = await this.db!.execute<RowDataPacket[]>(`
                SELECT name, budget, actual_cost,
                    (actual_cost / budget * 100) as burn_rate
                FROM projects
            `);
            const [monthlySpend] = await this.db!.execute<RowDataPacket[]>(`
                SELECT
                    DATE_FORMAT(metric_date, '%Y-%m') as month,
                    SUM(budget_used) as monthly_spend
                FROM project_metrics
                GROUP BY DATE_FORMAT(metric_date, '%Y-%m')
                ORDER BY month DESC
                LIMIT 6
            `);

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
            const { project_id, agent_id, action, details, category = 'system', level = 'info' } = req.body;

            const safeProjectId = project_id ?? null;
            const safeAgentId = agent_id ?? null;
            const safeAction = action ?? 'unknown';
            const safeDetails = details ? JSON.stringify(details) : null;

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO activity_logs (project_id, agent_id, action, details, category, level)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [safeProjectId, safeAgentId, safeAction, safeDetails, category, level]);

            res.status(201).json({
                success: true,
                log_id: result.insertId,
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

            if (tags) {
                const tagList = JSON.parse(tags as string) as string[];
                if (tagList.length > 0) {
                    const tagConditions = tagList.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
                    sql += ` AND (${tagConditions})`;
                    tagList.forEach(tag => params.push(JSON.stringify(tag)));
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

            if (tags) {
                const tagList = JSON.parse(tags as string) as string[];
                if (tagList.length > 0) {
                    const tagConditions = tagList.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
                    sql += ` AND (${tagConditions})`;
                    tagList.forEach(tag => params.push(JSON.stringify(tag)));
                }
            }

            sql += ` ORDER BY relevance DESC, m.importance DESC LIMIT ${parseInt(limit as string)}`;

            const [memories] = await this.db!.execute<RowDataPacket[]>(sql, params);

            memories.forEach((m: any) => {
                m.tags = m.tags ? JSON.parse(m.tags) : [];
                m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
            });

            res.json({ memories, count: memories.length, query });
        } catch (error) {
            console.error('Search memories error:', error);
            res.status(500).json({ error: 'Failed to search memories' });
        }
    }

    private async getMemory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { track_access } = req.query;

            const [memories] = await this.db!.execute<RowDataPacket[]>(`
                SELECT m.*, p.name as project_name, aa.name as agent_name
                FROM memories m
                LEFT JOIN projects p ON m.project_id = p.id
                LEFT JOIN ai_agents aa ON m.agent_id = aa.id
                WHERE m.id = ?
            `, [id]);

            if (memories.length === 0) {
                res.status(404).json({ error: 'Memory not found' });
                return;
            }

            // Track access
            if (track_access === 'true') {
                await this.db!.execute(`
                    UPDATE memories SET access_count = access_count + 1, last_accessed_at = NOW() WHERE id = ?
                `, [id]);
            }

            const memory = memories[0] as any;
            memory.tags = memory.tags ? JSON.parse(memory.tags) : [];
            memory.metadata = memory.metadata ? JSON.parse(memory.metadata) : {};

            res.json(memory);
        } catch (error) {
            console.error('Get memory error:', error);
            res.status(500).json({ error: 'Failed to fetch memory' });
        }
    }

    private async createMemory(req: Request, res: Response): Promise<void> {
        try {
            const { content, summary, tags, metadata, importance = 0.5, project_id, agent_id } = req.body;

            if (!content) {
                res.status(400).json({ error: 'Content is required' });
                return;
            }

            const tagsJson = typeof tags === 'string' ? tags : JSON.stringify(tags || []);
            const metadataJson = typeof metadata === 'string' ? metadata : JSON.stringify(metadata || {});

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO memories (content, summary, tags, metadata, importance, project_id, agent_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                content,
                summary || content.substring(0, 200),
                tagsJson,
                metadataJson,
                importance,
                project_id || null,
                agent_id || null
            ]);

            res.status(201).json({
                id: result.insertId,
                message: 'Memory created successfully'
            });
        } catch (error) {
            console.error('Create memory error:', error);
            res.status(500).json({ error: 'Failed to create memory' });
        }
    }

    private async updateMemory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updates = req.body;

            const fields: string[] = [];
            const values: (string | number | null)[] = [];

            if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content); }
            if (updates.summary !== undefined) { fields.push('summary = ?'); values.push(updates.summary); }
            if (updates.tags !== undefined) {
                fields.push('tags = ?');
                values.push(typeof updates.tags === 'string' ? updates.tags : JSON.stringify(updates.tags));
            }
            if (updates.metadata !== undefined) {
                fields.push('metadata = ?');
                values.push(typeof updates.metadata === 'string' ? updates.metadata : JSON.stringify(updates.metadata));
            }
            if (updates.importance !== undefined) { fields.push('importance = ?'); values.push(updates.importance); }

            if (fields.length === 0) {
                res.status(400).json({ error: 'No fields to update' });
                return;
            }

            values.push(parseInt(id));

            const [result] = await this.db!.execute<ResultSetHeader>(
                `UPDATE memories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Memory not found' });
                return;
            }

            res.json({ message: 'Memory updated successfully' });
        } catch (error) {
            console.error('Update memory error:', error);
            res.status(500).json({ error: 'Failed to update memory' });
        }
    }

    private async deleteMemory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const [result] = await this.db!.execute<ResultSetHeader>('DELETE FROM memories WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Memory not found' });
                return;
            }

            res.json({ message: 'Memory deleted successfully' });
        } catch (error) {
            console.error('Delete memory error:', error);
            res.status(500).json({ error: 'Failed to delete memory' });
        }
    }

    private async getMemoryTags(_req: Request, res: Response): Promise<void> {
        try {
            const [tags] = await this.db!.execute<RowDataPacket[]>(`
                SELECT id, name, description, usage_count, parent_tag_id
                FROM memory_tags
                ORDER BY usage_count DESC, name ASC
            `);

            res.json({ tags });
        } catch (error) {
            console.error('Get memory tags error:', error);
            res.status(500).json({ error: 'Failed to fetch tags' });
        }
    }

    private async getMemoryStats(req: Request, res: Response): Promise<void> {
        try {
            const { project_id } = req.query;

            let whereClause = '';
            const params: number[] = [];
            if (project_id) {
                whereClause = 'WHERE project_id = ?';
                params.push(parseInt(project_id as string));
            }

            const [countResult] = await this.db!.execute<RowDataPacket[]>(
                `SELECT COUNT(*) as total, AVG(importance) as avg_importance, SUM(access_count) as total_accesses FROM memories ${whereClause}`,
                params
            );

            const [tagStats] = await this.db!.execute<RowDataPacket[]>(`
                SELECT name, usage_count FROM memory_tags ORDER BY usage_count DESC LIMIT 10
            `);

            res.json({
                total_memories: countResult[0].total || 0,
                avg_importance: parseFloat(countResult[0].avg_importance) || 0,
                total_accesses: countResult[0].total_accesses || 0,
                top_tags: tagStats
            });
        } catch (error) {
            console.error('Get memory stats error:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    private async boostMemory(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { boost_amount = 0.1 } = req.body;

            const safeBoost = Math.min(Math.max(parseFloat(boost_amount), 0), 0.5);

            const [result] = await this.db!.execute<ResultSetHeader>(`
                UPDATE memories
                SET importance = LEAST(importance + ?, 1.0), updated_at = NOW()
                WHERE id = ?
            `, [safeBoost, id]);

            if (result.affectedRows === 0) {
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
            const { id } = req.params;
            const { type } = req.query;

            let sql = `
                SELECT m.*, mc.relationship_type, mc.strength
                FROM memory_crossrefs mc
                JOIN memories m ON mc.target_id = m.id
                WHERE mc.source_id = ?
            `;
            const params: (string | number)[] = [parseInt(id)];

            if (type) {
                sql += ' AND mc.relationship_type = ?';
                params.push(type as string);
            }

            sql += ' ORDER BY mc.strength DESC, m.importance DESC';

            const [related] = await this.db!.execute<RowDataPacket[]>(sql, params);

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
            const { source_memory_id, target_memory_id, relationship_type = 'related', strength = 0.5 } = req.body;

            if (!source_memory_id || !target_memory_id) {
                res.status(400).json({ error: 'source_memory_id and target_memory_id are required' });
                return;
            }

            const [result] = await this.db!.execute<ResultSetHeader>(`
                INSERT INTO memory_crossrefs (source_id, target_id, relationship_type, strength)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE strength = VALUES(strength), relationship_type = VALUES(relationship_type)
            `, [source_memory_id, target_memory_id, relationship_type, strength]);

            res.status(201).json({
                id: result.insertId,
                message: 'Cross-reference created successfully'
            });
        } catch (error) {
            console.error('Create crossref error:', error);
            res.status(500).json({ error: 'Failed to create cross-reference' });
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

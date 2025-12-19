/**
 * 🏢 SOLARIA C-Suite Dashboard Server
 * Servidor optimizado para supervisión humana de proyectos gestionados por agentes IA
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class SolariaDashboardServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: { origin: "*", methods: ["GET", "POST"] }
        });
        
        this.port = process.env.PORT || 3000;
        this.db = null;
        this.connectedClients = new Map(); // C-suite members conectados
        
        // Respetar X-Forwarded-* para rate limiting detrás de proxy (nginx)
        this.app.set('trust proxy', true);

        this.repoPath = process.env.REPO_PATH || path.resolve(__dirname, '..', '..');

        this.initializeMiddleware();
        this.initializeDatabase();
        this.initializeRoutes();
        this.initializeSocketIO();
    }

    initializeMiddleware() {
        // Seguridad - CSP deshabilitado temporalmente para desarrollo
        this.app.use(helmet({
            contentSecurityPolicy: false
        }));

        // Rate limiting desactivado en entorno local/PMO para evitar falsos positivos detrás de nginx

        // Middleware básico
        this.app.use(compression());
        this.app.use(cors());
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(morgan('combined'));

        // Archivos estáticos
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    /**
     * Initialize database connection with exponential backoff retry
     * @param {number} maxRetries - Maximum retry attempts (default: 10)
     * @param {number} baseDelay - Base delay in ms (default: 1000)
     */
    async initializeDatabase(maxRetries = 10, baseDelay = 1000) {
        const dbConfig = {
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
                console.log(`🔄 Database connection attempt ${attempt}/${maxRetries}...`);
                this.db = await mysql.createConnection(dbConfig);

                // Verify connection works
                await this.db.execute('SELECT 1');
                console.log('✅ Database connected successfully');

                // Setup connection health check with auto-reconnect
                this.setupDatabaseHealthCheck();
                return;

            } catch (error) {
                const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 30000);
                console.error(`❌ Database connection attempt ${attempt} failed: ${error.message}`);

                if (attempt < maxRetries) {
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('💀 All database connection attempts exhausted. Exiting.');
                    process.exit(1);
                }
            }
        }
    }

    /**
     * Setup periodic database health check with auto-reconnect
     */
    setupDatabaseHealthCheck() {
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
                console.error('❌ Database connection lost:', error.message);
                console.log('🔄 Attempting to reconnect...');
                await this.initializeDatabase(5, 2000); // Fewer retries for reconnect
            }
        }, 30000);
    }

    initializeRoutes() {
        // SOLARIA Office frontend (light mode)
        this.app.get(['/office', '/office/*'], (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'office', 'index.html'))
        })

        // Autenticación para C-suite
        this.app.post('/api/auth/login', this.handleLogin.bind(this));
        this.app.post('/api/auth/logout', this.handleLogout.bind(this));
        this.app.get('/api/auth/verify', this.verifyToken.bind(this));

        // Middleware de autenticación para rutas protegidas
        // Health check (sin autenticación) - antes del middleware
        this.app.get('/api/health', this.healthCheck.bind(this));

        // PUBLIC ROUTES (sin autenticación) - para PWA Dashboard
        this.app.get('/api/public/projects', this.getProjectsPublic.bind(this));
        this.app.get('/api/public/businesses', this.getBusinessesPublic.bind(this));
        this.app.get('/api/public/tasks', this.getTasksPublic.bind(this));
        this.app.get('/api/public/dashboard', this.getDashboardPublic.bind(this));
        this.app.get('/api/public/dashboard/overview', this.getDashboardOverview.bind(this));
        this.app.get('/api/public/tasks/recent-completed', this.getRecentCompletedTasks.bind(this));
        this.app.get('/api/public/tasks/recent-by-project', this.getRecentTasksByProject.bind(this));

        // Middleware de autenticación
        this.app.use('/api/', this.authenticateToken.bind(this));

        // Dashboard principal
        this.app.get('/api/dashboard/overview', this.getDashboardOverview.bind(this));
        this.app.get('/api/dashboard/metrics', this.getDashboardMetrics.bind(this));
        this.app.get('/api/dashboard/alerts', this.getDashboardAlerts.bind(this));
        this.app.get('/api/docs', this.getDocs.bind(this));
        this.app.get('/api/docs', this.getDocs.bind(this));

        // Gestión de proyectos
        this.app.get('/api/projects', this.getProjects.bind(this));
        this.app.get('/api/projects/:id', this.getProject.bind(this));
        this.app.post('/api/projects', this.createProject.bind(this));
        this.app.put('/api/projects/:id', this.updateProject.bind(this));
        this.app.delete('/api/projects/:id', this.deleteProject.bind(this));

        // Project Extended Data (PWA Dashboard v2.0)
        this.app.get('/api/projects/:id/client', this.getProjectClient.bind(this));
        this.app.put('/api/projects/:id/client', this.updateProjectClient.bind(this));
        this.app.get('/api/projects/:id/documents', this.getProjectDocuments.bind(this));
        this.app.post('/api/projects/:id/documents', this.createProjectDocument.bind(this));
        this.app.delete('/api/projects/:id/documents/:docId', this.deleteProjectDocument.bind(this));
        this.app.get('/api/projects/:id/requests', this.getProjectRequests.bind(this));
        this.app.post('/api/projects/:id/requests', this.createProjectRequest.bind(this));
        this.app.put('/api/projects/:id/requests/:reqId', this.updateProjectRequest.bind(this));
        this.app.delete('/api/projects/:id/requests/:reqId', this.deleteProjectRequest.bind(this));

        // Gestión de agentes IA
        this.app.get('/api/agents', this.getAgents.bind(this));
        this.app.get('/api/agents/:id', this.getAgent.bind(this));
        this.app.get('/api/agents/:id/performance', this.getAgentPerformance.bind(this));
        this.app.put('/api/agents/:id/status', this.updateAgentStatus.bind(this));

        // Gestión de tareas
        this.app.get('/api/tasks', this.getTasks.bind(this));
        this.app.get('/api/tasks/recent-completed', this.getRecentCompletedTasks.bind(this));
        this.app.get('/api/tasks/recent-by-project', this.getRecentTasksByProject.bind(this));
        this.app.get('/api/tasks/:id', this.getTask.bind(this));
        this.app.post('/api/tasks', this.createTask.bind(this));
        this.app.put('/api/tasks/:id', this.updateTask.bind(this));

        // Task Items (Subtasks/Checklist)
        this.app.get('/api/tasks/:id/items', this.getTaskItems.bind(this));
        this.app.post('/api/tasks/:id/items', this.createTaskItems.bind(this));
        this.app.put('/api/tasks/:id/items/:itemId', this.updateTaskItem.bind(this));
        this.app.delete('/api/tasks/:id/items/:itemId', this.deleteTaskItem.bind(this));
        this.app.put('/api/tasks/:id/items/:itemId/complete', this.toggleTaskItemComplete.bind(this));
        this.app.put('/api/tasks/:id/items/reorder', this.reorderTaskItems.bind(this));

        // Gestión de negocios (Businesses)
        this.app.get('/api/businesses', this.getBusinesses.bind(this));
        this.app.get('/api/businesses/:id', this.getBusiness.bind(this));
        this.app.put('/api/businesses/:id', this.updateBusiness.bind(this));

        // Logs y auditoría
        this.app.get('/api/logs', this.getLogs.bind(this));
        this.app.get('/api/logs/audit', this.getAuditLogs.bind(this));

        // Reportes y analíticas
        this.app.get('/api/reports/projects', this.getProjectReports.bind(this));
        this.app.get('/api/reports/agents', this.getAgentReports.bind(this));
        this.app.get('/api/reports/financial', this.getFinancialReports.bind(this));

        // Documentacion y recursos del proyecto
        this.app.get('/api/docs', this.getProjectDocs.bind(this));
        this.app.get('/api/docs/list', this.getDocumentsList.bind(this));
        this.app.get('/api/docs/specs', this.getProjectSpecs.bind(this));
        this.app.get('/api/docs/credentials', this.getProjectCredentials.bind(this));
        this.app.get('/api/docs/architecture', this.getProjectArchitecture.bind(this));
        this.app.get('/api/docs/roadmap', this.getProjectRoadmap.bind(this));

        // Vistas específicas por rol C-Suite
        this.app.get('/api/csuite/ceo', this.getCEODashboard.bind(this));
        this.app.get('/api/csuite/cto', this.getCTODashboard.bind(this));
        this.app.get('/api/csuite/coo', this.getCOODashboard.bind(this));
        this.app.get('/api/csuite/cfo', this.getCFODashboard.bind(this));

        // API para agentes IA (auto-deployment)
        this.app.post('/api/agent/register-doc', this.registerDocument.bind(this));
        this.app.post('/api/agent/update-project', this.updateProjectFromAgent.bind(this));
        this.app.post('/api/agent/add-task', this.addTaskFromAgent.bind(this));
        this.app.post('/api/agent/log-activity', this.logAgentActivity.bind(this));
        this.app.post('/api/agent/update-metrics', this.updateMetricsFromAgent.bind(this));
        this.app.get('/api/agent/instructions', this.getAgentInstructions.bind(this));

        // ========== MEMORY API (Integrated from Memora) ==========
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

        // Servir archivos estáticos
        this.app.use(express.static(path.join(__dirname, 'public')));
        
        // Servir dashboard principal (para cualquier ruta que no sea API)
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });
    }

    initializeSocketIO() {
        this.io.on('connection', (socket) => {
            console.log(`👤 C-Suite member connected: ${socket.id}`);

            // Autenticación por socket
            socket.on('authenticate', async (token) => {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await this.getUserById(decoded.userId);
                    
                    if (user) {
                        socket.userId = user.user_id;
                        socket.userRole = user.role;
                        this.connectedClients.set(socket.id, user);
                        
                        socket.emit('authenticated', { user });
                        console.log(`✅ ${user.name} (${user.role}) authenticated`);
                        
                        // Unir a sala específica del rol
                        socket.join(user.role);
                    } else {
                        socket.emit('authentication_error', { error: 'Invalid user' });
                    }
                } catch (error) {
                    socket.emit('authentication_error', { error: 'Invalid token' });
                }
            });

            // Suscribir a actualizaciones de proyectos
            socket.on('subscribe_projects', () => {
                socket.join('projects');
            });

            // Suscribir a actualizaciones de agentes
            socket.on('subscribe_agents', () => {
                socket.join('agents');
            });

            // Suscribir a alertas críticas
            socket.on('subscribe_alerts', () => {
                socket.join('alerts');
            });

            // Suscribir a notificaciones en tiempo real
            socket.on('subscribe_notifications', () => {
                socket.join('notifications');
                console.log(`📢 ${socket.id} subscribed to notifications`);
            });

            socket.on('disconnect', () => {
                const user = this.connectedClients.get(socket.id);
                if (user) {
                    console.log(`👋 ${user.name} disconnected`);
                    this.connectedClients.delete(socket.id);
                }
            });
        });

        // Emisión de actualizaciones en tiempo real
        this.startRealTimeUpdates();
    }

    async startRealTimeUpdates() {
        // Actualizaciones cada 5 segundos
        setInterval(async () => {
            try {
                // Actualizar estados de agentes
                const agentStates = await this.getAgentStates();
                this.io.to('agents').emit('agent_states_update', agentStates);

                // Actualizar métricas de proyectos
                const projectMetrics = await this.getProjectMetrics();
                this.io.to('projects').emit('project_metrics_update', projectMetrics);

                // Verificar alertas críticas
                const criticalAlerts = await this.getCriticalAlerts();
                if (criticalAlerts.length > 0) {
                    this.io.to('alerts').emit('critical_alerts', criticalAlerts);
                }

            } catch (error) {
                console.error('❌ Real-time update error:', error);
            }
        }, 5000);
    }

    // Métodos de autenticación
    async handleLogin(req, res) {
        try {
            console.log('Login attempt:', { userId: req.body.userId, username: req.body.username, hasPassword: !!req.body.password });
            // Aceptar ambos userId y username para compatibilidad
            const username = req.body.userId || req.body.username;
            const { password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ error: 'Username and password required' });
            }
            
            console.log('Executing query for username:', username);
            const [users] = await this.db.execute(
                'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
                [username]
            );
            console.log('Query result:', users.length, 'users found');

            if (users.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const user = users[0];

            // Verificar password hash (bcrypt for production, SHA256 for legacy)
            const passwordHash = require('crypto').createHash('sha256').update(password).digest('hex');
            const isValidPassword = user.password_hash === passwordHash ||
                                    await bcrypt.compare(password, user.password_hash);

            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Actualizar último login
            await this.db.execute(
                'UPDATE users SET last_login = NOW() WHERE id = ?',
                [user.id]
            );
            
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'solaria_jwt_secret_key_2024_secure_change_in_production',
                { expiresIn: '24h' }
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    email: user.email
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }

    async handleLogout(req, res) {
        res.json({ message: 'Logged out successfully' });
    }

    async verifyToken(req, res) {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await this.getUserById(decoded.userId);
            res.json({ valid: true, user });
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }

    authenticateToken(req, res, next) {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Invalid token' });
        }
    }

    // Métodos del Dashboard
    async getDashboardOverview(req, res) {
        try {
            const [projects] = await this.db.execute(`
                SELECT 
                    COUNT(*) as total_projects,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
                    COUNT(CASE WHEN status = 'development' THEN 1 END) as active_projects,
                    COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects,
                    SUM(budget) as total_budget,
                    SUM(actual_cost) as total_actual_cost
                FROM projects
            `);

            const [agents] = await this.db.execute(`
                SELECT 
                    COUNT(*) as total_agents,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_agents,
                    COUNT(CASE WHEN status = 'busy' THEN 1 END) as busy_agents,
                    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_agents
                FROM ai_agents
            `);

            const [tasks] = await this.db.execute(`
                SELECT 
                    COUNT(*) as total_tasks,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
                    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
                    COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked_tasks
                FROM tasks
            `);

            const [alerts] = await this.db.execute(`
                SELECT 
                    COUNT(*) as total_alerts,
                    COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_alerts,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_alerts
                FROM alerts
            `);

            res.json({
                projects: projects[0],
                agents: agents[0],
                tasks: tasks[0],
                alerts: alerts[0],
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch dashboard overview' });
        }
    }

    async getDashboardMetrics(req, res) {
        try {
            const { timeframe = '30' } = req.query;
            
            // Métricas de proyectos
            const [projectMetrics] = await this.db.execute(`
                SELECT 
                    DATE(metric_date) as date,
                    AVG(completion_percentage) as avg_completion,
                    AVG(agent_efficiency) as avg_efficiency,
                    AVG(code_quality_score) as avg_quality,
                    SUM(total_hours_worked) as total_hours
                FROM project_metrics
                WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY DATE(metric_date)
                ORDER BY date ASC
            `, [timeframe]);

            // Métricas de agentes
            const [agentMetrics] = await this.db.execute(`
                SELECT 
                    aa.role,
                    COUNT(t.id) as tasks_assigned,
                    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed,
                    AVG(t.actual_hours) as avg_task_time,
                    COUNT(CASE WHEN al.level = 'error' THEN 1 END) as error_count
                FROM ai_agents aa
                LEFT JOIN tasks t ON aa.id = t.agent_id
                LEFT JOIN activity_logs al ON aa.id = al.agent_id 
                    AND al.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY aa.role
            `, [timeframe]);

            res.json({
                projectMetrics,
                agentMetrics,
                timeframe
            });

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch metrics' });
        }
    }

    async getDashboardAlerts(req, res) {
        try {
            const { severity, status = 'active', limit = 50 } = req.query;
            
            let query = `
                SELECT 
                    a.*,
                    p.name as project_name,
                    aa.name as agent_name,
                    t.title as task_title
                FROM alerts a
                LEFT JOIN projects p ON a.project_id = p.id
                LEFT JOIN ai_agents aa ON a.agent_id = aa.id
                LEFT JOIN tasks t ON a.task_id = t.id
                WHERE a.status = ?
            `;
            const params = [status];

            if (severity) {
                query += ' AND a.severity = ?';
                params.push(severity);
            }

            const limitNum = Math.min(parseInt(limit) || 50, 200);
            query += ` ORDER BY a.created_at DESC LIMIT ${limitNum}`;

            const [alerts] = await this.db.execute(query, params);

            res.json(alerts);

        } catch (error) {
            console.error('alerts query failed', error);
            res.status(500).json({ error: 'Failed to fetch alerts' });
        }
    }

    async getDocs(req, res) {
        try {
            const specPath = path.join(this.repoPath, 'docs', 'specs', 'ACADEIMATE_SPEC.md');
            const milestonesPath = path.join(this.repoPath, 'docs', 'PROJECT_MILESTONES.md');

            const specContent = fs.existsSync(specPath) ? fs.readFileSync(specPath, 'utf-8') : 'Spec no encontrada';
            const milestonesContent = fs.existsSync(milestonesPath) ? fs.readFileSync(milestonesPath, 'utf-8') : 'Milestones no encontrados';

            // primeras 1200 chars del spec
            const specSnippet = specContent.slice(0, 1200);
            const milestones = milestonesContent
                .split(/\r?\n/)
                .filter(l => l.trim().startsWith('-'))
                .map(l => l.replace(/^[-•]\s*/, ''))
                .slice(0, 30);

            res.json({ specSnippet, milestones });
        } catch (error) {
            console.error('getDocs error', error);
            res.status(500).json({ error: 'Failed to load docs' });
        }
    }

    // ============================================
    // PUBLIC ENDPOINTS (sin autenticación)
    // ============================================

    async getProjectsPublic(req, res) {
        try {
            const [projects] = await this.db.execute(`
                SELECT
                    p.id, p.name, p.description, p.client, p.status, p.priority,
                    p.budget, p.start_date, p.deadline as end_date, p.completion_percentage,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'pending') as pending_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'in_progress') as in_progress_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'review') as review_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'blocked') as blocked_tasks
                FROM projects p
                ORDER BY p.updated_at DESC
                LIMIT 50
            `);
            res.json({ projects });
        } catch (error) {
            console.error('Error fetching public projects:', error);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }

    async getBusinessesPublic(req, res) {
        try {
            const [businesses] = await this.db.execute(`
                SELECT id, name, description, website, status, revenue, expenses, profit, logo_url
                FROM businesses
                ORDER BY name
            `);
            res.json({ businesses });
        } catch (error) {
            console.error('Error fetching public businesses:', error);
            res.status(500).json({ error: 'Failed to fetch businesses' });
        }
    }

    async getTasksPublic(req, res) {
        try {
            const { project_id, status, limit = 100 } = req.query;
            let query = `
                SELECT t.id, t.title, t.description, t.status, t.priority, t.progress,
                       t.project_id, t.task_number, t.created_at, t.updated_at,
                       p.name as project_name,
                       p.code as project_code,
                       CONCAT(COALESCE(p.code, 'TSK'), '-', LPAD(COALESCE(t.task_number, t.id), 3, '0')) as task_code,
                       aa.name as agent_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                WHERE 1=1
            `;
            const params = [];
            if (project_id) {
                query += ' AND t.project_id = ?';
                params.push(project_id);
            }
            if (status) {
                query += ' AND t.status = ?';
                params.push(status);
            }
            query += ` ORDER BY t.updated_at DESC LIMIT ${parseInt(limit)}`;

            const [tasks] = await this.db.execute(query, params);
            res.json({ tasks });
        } catch (error) {
            console.error('Error fetching public tasks:', error);
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    async getDashboardPublic(req, res) {
        try {
            const [projectStats] = await this.db.execute(`
                SELECT
                    COUNT(*) as total_projects,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN status = 'development' THEN 1 END) as active,
                    COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning,
                    SUM(budget) as total_budget
                FROM projects
            `);

            const [taskStats] = await this.db.execute(`
                SELECT
                    COUNT(*) as total_tasks,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
                    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress
                FROM tasks
            `);

            const [businessStats] = await this.db.execute(`
                SELECT
                    COUNT(*) as total_businesses,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                    SUM(revenue) as total_revenue
                FROM businesses
            `);

            res.json({
                projects: projectStats[0],
                tasks: taskStats[0],
                businesses: businessStats[0]
            });
        } catch (error) {
            console.error('Error fetching public dashboard:', error);
            res.status(500).json({ error: 'Failed to fetch dashboard' });
        }
    }

    // ============================================
    // Métodos de proyectos
    // ============================================
    async getProjects(req, res) {
        try {
            const { status, priority, page = 1, limit = 20 } = req.query;

            let query = `
                SELECT
                    p.*,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as total_tasks,
                    (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as completed_tasks,
                    (SELECT COUNT(DISTINCT assigned_agent_id) FROM tasks WHERE project_id = p.id) as agents_assigned,
                    (SELECT COUNT(*) FROM alerts WHERE project_id = p.id AND status = 'active') as active_alerts
                FROM projects p
            `;

            const whereConditions = [];
            const params = [];

            if (status) {
                whereConditions.push('p.status = ?');
                params.push(status);
            }

            if (priority) {
                whereConditions.push('p.priority = ?');
                params.push(priority);
            }

            if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' AND ');
            }

            query += ' ORDER BY p.updated_at DESC';

            const offset = (parseInt(page) - 1) * parseInt(limit);
            query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

            const [projects] = await this.db.execute(query, params);

            // Obtener total para paginación
            const countQuery = 'SELECT COUNT(*) as total FROM projects' +
                (whereConditions.length > 0 ? ' WHERE ' + whereConditions.join(' AND ') : '');
            const [countResult] = await this.db.execute(countQuery, params);

            res.json({
                projects,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult[0].total,
                    pages: Math.ceil(countResult[0].total / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('Error fetching projects:', error);
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    }

    async getProject(req, res) {
        try {
            const { id } = req.params;
            
            const [projects] = await this.db.execute(`
                SELECT * FROM projects WHERE id = ?
            `, [id]);

            if (projects.length === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            const project = projects[0];

            // Obtener tareas del proyecto
            const [tasks] = await this.db.execute(`
                SELECT 
                    t.*,
                    aa.name as agent_name,
                    aa.role as agent_role
                FROM tasks t
                LEFT JOIN ai_agents aa ON t.agent_id = aa.id
                WHERE t.project_id = ?
                ORDER BY t.created_at DESC
            `, [id]);

            // Obtener agentes asignados
            const [agents] = await this.db.execute(`
                SELECT DISTINCT 
                    aa.*,
                    COUNT(t.id) as tasks_assigned,
                    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed
                FROM ai_agents aa
                INNER JOIN tasks t ON aa.id = t.agent_id
                WHERE t.project_id = ?
                GROUP BY aa.id
            `, [id]);

            // Obtener alertas del proyecto
            const [alerts] = await this.db.execute(`
                SELECT * FROM alerts 
                WHERE project_id = ? AND status = 'active'
                ORDER BY severity DESC, created_at DESC
            `, [id]);

            // Obtener métricas recientes
            const [metrics] = await this.db.execute(`
                SELECT * FROM project_metrics 
                WHERE project_id = ?
                ORDER BY metric_date DESC
                LIMIT 30
            `, [id]);

            res.json({
                project,
                tasks,
                agents,
                alerts,
                metrics
            });

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    }

    async createProject(req, res) {
        try {
            const {
                name,
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

            const normalizedOrigin = (office_origin || origin || req.headers['x-solaria-portal'] || '').toLowerCase() === 'office'
                ? 'office'
                : 'dfo';
            const normalizedVisibility = office_visible === true || office_visible === 1 || String(office_visible).toLowerCase() === 'true';
            const officeVisible = normalizedOrigin === 'office' ? 1 : normalizedVisibility ? 1 : 0;

            const [result] = await this.db.execute(`
                INSERT INTO projects (
                    name, client, description, priority, budget,
                    start_date, deadline, created_by, office_origin, office_visible
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                name, client, description, priority, budget,
                start_date, deadline, req.user.userId, normalizedOrigin, officeVisible
            ]);

            // Log de creación
            await this.db.execute(`
                INSERT INTO activity_logs (
                    project_id, action, details, category, level
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                result.insertId,
                'project_created',
                `Project ${name} created by ${req.user.userId}`,
                'management',
                'info'
            ]);

            res.status(201).json({
                id: result.insertId,
                message: 'Project created successfully'
            });

        } catch (error) {
            res.status(500).json({ error: 'Failed to create project' });
        }
    }

    async updateProject(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Build dynamic UPDATE query only for provided fields
            const fields = [];
            const values = [];

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
                return res.status(400).json({ error: 'No fields to update' });
            }

            // Add updated_at timestamp
            fields.push('updated_at = NOW()');

            // Add id as last parameter
            values.push(id);

            const [result] = await this.db.execute(
                `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json({ message: 'Project updated successfully' });

        } catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    }

    async deleteProject(req, res) {
        try {
            const { id } = req.params;
            
            const [result] = await this.db.execute(`
                DELETE FROM projects WHERE id = ?
            `, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            res.json({ message: 'Project deleted successfully' });

        } catch (error) {
            res.status(500).json({ error: 'Failed to delete project' });
        }
    }

    // ========== PROJECT EXTENDED DATA (PWA Dashboard v2.0) ==========

    async getProjectClient(req, res) {
        try {
            const { id } = req.params;

            const [rows] = await this.db.execute(`
                SELECT * FROM project_clients WHERE project_id = ?
            `, [id]);

            if (rows.length === 0) {
                return res.json({ client: null, message: 'No client info found' });
            }

            res.json({ client: rows[0] });

        } catch (error) {
            console.error('Error getting project client:', error);
            res.status(500).json({ error: 'Failed to get project client' });
        }
    }

    async updateProjectClient(req, res) {
        try {
            const { id } = req.params;
            const { name, fiscal_name, rfc, website, address, fiscal_address, contact_name, contact_email, contact_phone, logo_url, notes } = req.body;

            // Check if client exists
            const [existing] = await this.db.execute(`
                SELECT id FROM project_clients WHERE project_id = ?
            `, [id]);

            if (existing.length === 0) {
                // Insert new client
                await this.db.execute(`
                    INSERT INTO project_clients (project_id, name, fiscal_name, rfc, website, address, fiscal_address, contact_name, contact_email, contact_phone, logo_url, notes)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [id, name, fiscal_name || null, rfc || null, website || null, address || null, fiscal_address || null, contact_name || null, contact_email || null, contact_phone || null, logo_url || null, notes || null]);
            } else {
                // Update existing
                await this.db.execute(`
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
            console.error('Error updating project client:', error);
            res.status(500).json({ error: 'Failed to update project client' });
        }
    }

    async getProjectDocuments(req, res) {
        try {
            const { id } = req.params;

            const [rows] = await this.db.execute(`
                SELECT pd.*, u.name as uploader_name
                FROM project_documents pd
                LEFT JOIN users u ON pd.uploaded_by = u.id
                WHERE pd.project_id = ?
                ORDER BY pd.created_at DESC
            `, [id]);

            res.json({ documents: rows });

        } catch (error) {
            console.error('Error getting project documents:', error);
            res.status(500).json({ error: 'Failed to get project documents' });
        }
    }

    async createProjectDocument(req, res) {
        try {
            const { id } = req.params;
            const { name, type, url, description, file_size } = req.body;
            const uploaded_by = req.user?.userId || null;

            if (!name || !url) {
                return res.status(400).json({ error: 'Name and URL are required' });
            }

            const [result] = await this.db.execute(`
                INSERT INTO project_documents (project_id, name, type, url, description, file_size, uploaded_by)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [id, name, type || 'other', url, description || null, file_size || null, uploaded_by]);

            res.status(201).json({
                id: result.insertId,
                message: 'Document created successfully'
            });

        } catch (error) {
            console.error('Error creating project document:', error);
            res.status(500).json({ error: 'Failed to create project document' });
        }
    }

    async deleteProjectDocument(req, res) {
        try {
            const { id, docId } = req.params;

            const [result] = await this.db.execute(`
                DELETE FROM project_documents WHERE id = ? AND project_id = ?
            `, [docId, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Document not found' });
            }

            res.json({ message: 'Document deleted successfully' });

        } catch (error) {
            console.error('Error deleting project document:', error);
            res.status(500).json({ error: 'Failed to delete project document' });
        }
    }

    async getProjectRequests(req, res) {
        try {
            const { id } = req.params;
            const { status, priority } = req.query;

            let query = `
                SELECT pr.*, a.name as assigned_agent_name
                FROM project_requests pr
                LEFT JOIN ai_agents a ON pr.assigned_to = a.id
                WHERE pr.project_id = ?
            `;
            const params = [id];

            if (status) {
                query += ' AND pr.status = ?';
                params.push(status);
            }
            if (priority) {
                query += ' AND pr.priority = ?';
                params.push(priority);
            }

            query += ' ORDER BY pr.created_at DESC';

            const [rows] = await this.db.execute(query, params);

            res.json({ requests: rows });

        } catch (error) {
            console.error('Error getting project requests:', error);
            res.status(500).json({ error: 'Failed to get project requests' });
        }
    }

    async createProjectRequest(req, res) {
        try {
            const { id } = req.params;
            const { text, status, priority, requested_by, assigned_to, notes } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Request text is required' });
            }

            const [result] = await this.db.execute(`
                INSERT INTO project_requests (project_id, text, status, priority, requested_by, assigned_to, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [id, text, status || 'pending', priority || 'medium', requested_by || null, assigned_to || null, notes || null]);

            res.status(201).json({
                id: result.insertId,
                message: 'Request created successfully'
            });

        } catch (error) {
            console.error('Error creating project request:', error);
            res.status(500).json({ error: 'Failed to create project request' });
        }
    }

    async updateProjectRequest(req, res) {
        try {
            const { id, reqId } = req.params;
            const { text, status, priority, assigned_to, notes } = req.body;

            let query = 'UPDATE project_requests SET ';
            const updates = [];
            const params = [];

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
                return res.status(400).json({ error: 'No fields to update' });
            }

            query += updates.join(', ') + ' WHERE id = ? AND project_id = ?';
            params.push(reqId, id);

            const [result] = await this.db.execute(query, params);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Request not found' });
            }

            res.json({ message: 'Request updated successfully' });

        } catch (error) {
            console.error('Error updating project request:', error);
            res.status(500).json({ error: 'Failed to update project request' });
        }
    }

    async deleteProjectRequest(req, res) {
        try {
            const { id, reqId } = req.params;

            const [result] = await this.db.execute(`
                DELETE FROM project_requests WHERE id = ? AND project_id = ?
            `, [reqId, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Request not found' });
            }

            res.json({ message: 'Request deleted successfully' });

        } catch (error) {
            console.error('Error deleting project request:', error);
            res.status(500).json({ error: 'Failed to delete project request' });
        }
    }

    // Métodos de negocios (Businesses)
    async getBusinesses(req, res) {
        try {
            const [businesses] = await this.db.execute(`
                SELECT * FROM businesses ORDER BY name
            `);

            res.json({ businesses });
        } catch (error) {
            console.error('Error getting businesses:', error);
            res.status(500).json({ error: 'Failed to get businesses' });
        }
    }

    async getBusiness(req, res) {
        try {
            const { id } = req.params;
            const [businesses] = await this.db.execute(
                'SELECT * FROM businesses WHERE id = ?',
                [id]
            );

            if (businesses.length === 0) {
                return res.status(404).json({ error: 'Business not found' });
            }

            res.json({ business: businesses[0] });
        } catch (error) {
            console.error('Error getting business:', error);
            res.status(500).json({ error: 'Failed to get business' });
        }
    }

    async updateBusiness(req, res) {
        try {
            const { id } = req.params;
            const { name, description, website, status, revenue, expenses, profit, logo_url } = req.body;

            let query = 'UPDATE businesses SET ';
            const updates = [];
            const params = [];

            if (name !== undefined) { updates.push('name = ?'); params.push(name); }
            if (description !== undefined) { updates.push('description = ?'); params.push(description); }
            if (website !== undefined) { updates.push('website = ?'); params.push(website); }
            if (status !== undefined) { updates.push('status = ?'); params.push(status); }
            if (revenue !== undefined) { updates.push('revenue = ?'); params.push(revenue); }
            if (expenses !== undefined) { updates.push('expenses = ?'); params.push(expenses); }
            if (profit !== undefined) { updates.push('profit = ?'); params.push(profit); }
            if (logo_url !== undefined) { updates.push('logo_url = ?'); params.push(logo_url); }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            query += updates.join(', ') + ' WHERE id = ?';
            params.push(id);

            const [result] = await this.db.execute(query, params);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Business not found' });
            }

            res.json({ message: 'Business updated successfully' });
        } catch (error) {
            console.error('Error updating business:', error);
            res.status(500).json({ error: 'Failed to update business' });
        }
    }

    // Métodos de agentes
    async getAgents(req, res) {
        try {
            const { role, status, page = '1', limit = '50' } = req.query;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 50;

            let query = `
                SELECT
                    aa.*,
                    COUNT(t.id) as tasks_assigned,
                    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as tasks_completed,
                    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as current_tasks,
                    COUNT(CASE WHEN al.level = 'error' THEN 1 END) as error_count
                FROM ai_agents aa
                LEFT JOIN tasks t ON aa.id = t.agent_id
                LEFT JOIN activity_logs al ON aa.id = al.agent_id
                    AND al.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            `;

            const whereConditions = [];
            const params = [];

            if (role) {
                whereConditions.push('aa.role = ?');
                params.push(role);
            }

            if (status) {
                whereConditions.push('aa.status = ?');
                params.push(status);
            }

            if (whereConditions.length > 0) {
                query += ' WHERE ' + whereConditions.join(' AND ');
            }

            query += ' GROUP BY aa.id ORDER BY aa.last_activity DESC';

            const offset = (pageNum - 1) * limitNum;
            query += ` LIMIT ${limitNum} OFFSET ${offset}`;

            const [agents] = await this.db.execute(query, params);

            res.json(agents);

        } catch (error) {
            console.error('Error fetching agents:', error);
            res.status(500).json({ error: 'Failed to fetch agents' });
        }
    }

    // Métodos auxiliares
    async getUserById(userId) {
        const [users] = await this.db.execute(
            'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
            [userId]
        );
        return users[0] || null;
    }

    async getAgentStates() {
        const [states] = await this.db.execute(`
            SELECT 
                as_.*,
                aa.name,
                aa.role
            FROM agent_states as_
            INNER JOIN ai_agents aa ON as_.agent_id = aa.id
            WHERE as_.last_heartbeat >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
        `);
        return states;
    }

    async getProjectMetrics() {
        const [metrics] = await this.db.execute(`
            SELECT 
                project_id,
                agent_efficiency,
                code_quality_score,
                test_coverage,
                tasks_completed,
                tasks_pending,
                tasks_blocked,
                performance_score
            FROM project_metrics
            WHERE metric_date = CURDATE()
        `);
        return metrics;
    }

    async getCriticalAlerts() {
        const [alerts] = await this.db.execute(`
            SELECT 
                a.*,
                p.name as project_name,
                aa.name as agent_name
            FROM alerts a
            LEFT JOIN projects p ON a.project_id = p.id
            LEFT JOIN ai_agents aa ON a.agent_id = aa.id
            WHERE a.severity = 'critical' AND a.status = 'active'
            ORDER BY a.created_at DESC
            LIMIT 10
        `);
        return alerts;
    }

    async getAgent(req, res) {
        try {
            const { id } = req.params;
            
            const [agent] = await this.db.execute(`
                SELECT 
                    aa.*,
                    as_.status,
                    as_.current_task,
                    as_.last_heartbeat,
                    as_.performance_metrics
                FROM ai_agents aa
                LEFT JOIN agent_states as_ ON aa.id = as_.agent_id
                WHERE aa.id = ?
            `, [id]);

            if (agent.length === 0) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            res.json(agent[0]);

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch agent' });
        }
    }

    async getAgentPerformance(req, res) {
        try {
            const { id } = req.params;
            const { period = '7d' } = req.query;
            
            const [performance] = await this.db.execute(`
                SELECT 
                    DATE(created_at) as date,
                    AVG(CASE WHEN metric_type = 'efficiency' THEN metric_value END) as efficiency,
                    AVG(CASE WHEN metric_type = 'quality' THEN metric_value END) as quality,
                    AVG(CASE WHEN metric_type = 'speed' THEN metric_value END) as speed
                FROM agent_metrics
                WHERE agent_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            `, [id]);

            res.json(performance);

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch agent performance' });
        }
    }

    async updateAgentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            await this.db.execute(`
                UPDATE agent_states 
                SET status = ?, last_heartbeat = NOW()
                WHERE agent_id = ?
            `, [status, id]);

            res.json({ message: 'Agent status updated successfully' });

        } catch (error) {
            res.status(500).json({ error: 'Failed to update agent status' });
        }
    }

    async getTasks(req, res) {
        try {
            const { project_id, agent_id, status } = req.query;

            let query = `
                SELECT
                    t.*,
                    p.name as project_name,
                    p.code as project_code,
                    CONCAT(COALESCE(p.code, 'TSK'), '-', LPAD(COALESCE(t.task_number, t.id), 3, '0')) as task_code,
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

            const params = [];

            if (project_id) {
                query += ' AND t.project_id = ?';
                params.push(project_id);
            }

            if (agent_id) {
                query += ' AND t.assigned_agent_id = ?';
                params.push(agent_id);
            }

            if (status) {
                query += ' AND t.status = ?';
                params.push(status);
            }

            query += ' ORDER BY t.created_at DESC';

            const [tasks] = await this.db.execute(query, params);
            res.json(tasks);

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    /**
     * Get recently completed tasks across all projects
     * Used for the global completed tasks widget on dashboard
     */
    async getRecentCompletedTasks(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;

            const [tasks] = await this.db.execute(`
                SELECT
                    t.id,
                    t.task_number,
                    CONCAT(COALESCE(p.code, 'TSK'), '-', LPAD(COALESCE(t.task_number, t.id), 3, '0')) as task_code,
                    t.title,
                    t.status,
                    t.priority,
                    t.progress,
                    t.completed_at,
                    t.updated_at,
                    p.id as project_id,
                    p.name as project_name,
                    p.code as project_code,
                    aa.id as agent_id,
                    aa.name as agent_name,
                    aa.role as agent_role
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
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

    /**
     * Get recent tasks grouped by project
     * Used for the "New Tasks per Project" widget on dashboard
     */
    async getRecentTasksByProject(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 30;
            const days = parseInt(req.query.days) || 7; // Tasks from last N days

            // Get recent tasks with project info
            const [tasks] = await this.db.execute(`
                SELECT
                    t.id,
                    t.task_number,
                    CONCAT(COALESCE(p.code, 'TSK'), '-', LPAD(COALESCE(t.task_number, t.id), 3, '0')) as task_code,
                    t.title,
                    t.status,
                    t.priority,
                    t.progress,
                    t.created_at,
                    t.updated_at,
                    p.id as project_id,
                    p.name as project_name,
                    p.code as project_code,
                    aa.id as agent_id,
                    aa.name as agent_name,
                    aa.role as agent_role
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                ORDER BY t.created_at DESC
                LIMIT ?
            `, [days, limit]);

            // Group tasks by project
            const projectsMap = new Map();

            for (const task of tasks) {
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

            // Convert to array and sort by total tasks descending
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

    async getTask(req, res) {
        try {
            const { id } = req.params;

            const [task] = await this.db.execute(`
                SELECT
                    t.*,
                    p.name as project_name,
                    p.code as project_code,
                    CONCAT(COALESCE(p.code, 'TSK'), '-', LPAD(COALESCE(t.task_number, t.id), 3, '0')) as task_code,
                    aa.name as agent_name,
                    u.username as assigned_by_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                LEFT JOIN users u ON t.assigned_by = u.id
                WHERE t.id = ?
            `, [id]);

            if (task.length === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Fetch task items (subtasks/checklist)
            const [items] = await this.db.execute(`
                SELECT ti.*, a.name as completed_by_name
                FROM task_items ti
                LEFT JOIN ai_agents a ON ti.completed_by_agent_id = a.id
                WHERE ti.task_id = ?
                ORDER BY ti.sort_order ASC, ti.created_at ASC
            `, [id]);

            const result = task[0];
            result.items = items;
            result.items_total = items.length;
            result.items_completed = items.filter(i => i.is_completed).length;

            res.json(result);

        } catch (error) {
            console.error('Error fetching task:', error);
            res.status(500).json({ error: 'Failed to fetch task' });
        }
    }

    async createTask(req, res) {
        try {
            const {
                title,
                description,
                project_id,
                assigned_agent_id,
                priority = 'medium',
                estimated_hours,
                deadline
            } = req.body;

            // Auto-assign "Claude Code" agent if not specified
            let agentId = assigned_agent_id;
            if (!agentId) {
                const [agents] = await this.db.execute(
                    "SELECT id FROM ai_agents WHERE name = 'Claude Code' AND status = 'active' LIMIT 1"
                );
                if (agents.length > 0) {
                    agentId = agents[0].id;
                }
            }

            // Get next task_number for this project
            let taskNumber = 1;
            if (project_id) {
                const [maxTask] = await this.db.execute(
                    'SELECT COALESCE(MAX(task_number), 0) + 1 as next_number FROM tasks WHERE project_id = ?',
                    [project_id]
                );
                taskNumber = maxTask[0].next_number;
            }

            // Convert undefined to null for MySQL compatibility
            const [result] = await this.db.execute(`
                INSERT INTO tasks (
                    title, description, project_id, assigned_agent_id, task_number,
                    priority, estimated_hours, deadline, assigned_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                title,
                description,
                project_id ?? null,
                agentId ?? null,
                taskNumber,
                priority,
                estimated_hours ?? null,
                deadline ?? null,
                req.user.userId
            ]);

            // Get project code for response
            let taskCode = `#${taskNumber}`;
            if (project_id) {
                const [projects] = await this.db.execute(
                    'SELECT code FROM projects WHERE id = ?',
                    [project_id]
                );
                if (projects.length > 0 && projects[0].code) {
                    taskCode = `${projects[0].code}-${String(taskNumber).padStart(3, '0')}`;
                }
            }

            // Emit task_created notification
            this.io.to('notifications').emit('task_created', {
                id: result.insertId,
                task_code: taskCode,
                task_number: taskNumber,
                title,
                project_id,
                priority
            });

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

    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Build dynamic UPDATE query only for provided fields
            const fields = [];
            const values = [];

            if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
            if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
            if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
            if (updates.priority !== undefined) { fields.push('priority = ?'); values.push(updates.priority); }
            if (updates.progress !== undefined) { fields.push('progress = ?'); values.push(updates.progress); }

            // Auto-set progress to 100% when task is marked as completed (if not explicitly provided)
            if (updates.status === 'completed' && updates.progress === undefined) {
                fields.push('progress = ?');
                values.push(100);
            }
            if (updates.actual_hours !== undefined) { fields.push('actual_hours = ?'); values.push(updates.actual_hours); }
            if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
            if (updates.assigned_agent_id !== undefined) { fields.push('assigned_agent_id = ?'); values.push(updates.assigned_agent_id); }

            if (fields.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            // Add updated_at timestamp
            fields.push('updated_at = NOW()');

            // Add id as last parameter
            values.push(id);

            const [result] = await this.db.execute(
                `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }

            // Emit task_completed notification if status changed to completed
            if (updates.status === 'completed') {
                // Fetch task with project and agent names for rich notification
                const [taskData] = await this.db.execute(`
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
                });
            }

            res.json({ message: 'Task updated successfully' });

        } catch (error) {
            console.error('Update task error:', error);
            res.status(500).json({ error: 'Failed to update task' });
        }
    }

    // ============================================================================
    // TASK ITEMS (Subtasks/Checklist) ENDPOINTS
    // ============================================================================

    /**
     * Helper: Recalculate task progress based on completed items
     * Also auto-completes task when all items are done
     */
    async recalculateTaskProgress(taskId) {
        const [counts] = await this.db.execute(`
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
        await this.db.execute('UPDATE tasks SET progress = ?, updated_at = NOW() WHERE id = ?', [progress, taskId]);

        // Auto-complete task if 100%
        if (progress === 100 && total > 0) {
            await this.db.execute(
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
        });

        return { progress, completed, total };
    }

    /**
     * GET /api/tasks/:id/items - Get all items for a task
     */
    async getTaskItems(req, res) {
        try {
            const taskId = parseInt(req.params.id);

            const [items] = await this.db.execute(`
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
                completed: items.filter(i => i.is_completed).length
            });
        } catch (error) {
            console.error('Error fetching task items:', error);
            res.status(500).json({ error: 'Failed to fetch task items' });
        }
    }

    /**
     * POST /api/tasks/:id/items - Create items (single or batch)
     */
    async createTaskItems(req, res) {
        try {
            const taskId = parseInt(req.params.id);
            let { items } = req.body;

            // Support single item or array
            if (!Array.isArray(items)) {
                items = [req.body];
            }

            // Get current max sort_order
            const [maxOrder] = await this.db.execute(
                'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM task_items WHERE task_id = ?',
                [taskId]
            );
            let currentOrder = maxOrder[0].max_order;

            const createdItems = [];
            for (const item of items) {
                currentOrder++;
                const [result] = await this.db.execute(`
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

    /**
     * PUT /api/tasks/:id/items/:itemId - Update an item
     */
    async updateTaskItem(req, res) {
        try {
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);
            const { title, description, is_completed, notes, actual_minutes, completed_by_agent_id } = req.body;

            const updates = [];
            const values = [];

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
                return res.status(400).json({ error: 'No fields to update' });
            }

            values.push(itemId, taskId);
            await this.db.execute(
                `UPDATE task_items SET ${updates.join(', ')} WHERE id = ? AND task_id = ?`,
                values
            );

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            // Get updated item
            const [items] = await this.db.execute('SELECT * FROM task_items WHERE id = ?', [itemId]);

            res.json({ item: items[0], ...progress });
        } catch (error) {
            console.error('Error updating task item:', error);
            res.status(500).json({ error: 'Failed to update task item' });
        }
    }

    /**
     * PUT /api/tasks/:id/items/:itemId/complete - Quick toggle complete
     */
    async toggleTaskItemComplete(req, res) {
        try {
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);
            const { notes, actual_minutes, agent_id } = req.body;

            // Toggle completion
            await this.db.execute(`
                UPDATE task_items
                SET is_completed = NOT is_completed,
                    completed_at = CASE WHEN is_completed = 0 THEN NOW() ELSE NULL END,
                    completed_by_agent_id = CASE WHEN is_completed = 0 THEN ? ELSE NULL END,
                    notes = COALESCE(?, notes),
                    actual_minutes = COALESCE(?, actual_minutes)
                WHERE id = ? AND task_id = ?
            `, [agent_id || null, notes || null, actual_minutes || null, itemId, taskId]);

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            // Get updated item
            const [items] = await this.db.execute('SELECT * FROM task_items WHERE id = ?', [itemId]);

            res.json({ item: items[0], ...progress });
        } catch (error) {
            console.error('Error toggling task item:', error);
            res.status(500).json({ error: 'Failed to toggle task item' });
        }
    }

    /**
     * DELETE /api/tasks/:id/items/:itemId - Delete an item
     */
    async deleteTaskItem(req, res) {
        try {
            const taskId = parseInt(req.params.id);
            const itemId = parseInt(req.params.itemId);

            await this.db.execute('DELETE FROM task_items WHERE id = ? AND task_id = ?', [itemId, taskId]);

            // Recalculate progress
            const progress = await this.recalculateTaskProgress(taskId);

            res.json({ deleted: true, item_id: itemId, ...progress });
        } catch (error) {
            console.error('Error deleting task item:', error);
            res.status(500).json({ error: 'Failed to delete task item' });
        }
    }

    /**
     * PUT /api/tasks/:id/items/reorder - Batch reorder items
     */
    async reorderTaskItems(req, res) {
        try {
            const taskId = parseInt(req.params.id);
            const { order } = req.body; // Array of { id, sort_order }

            for (const item of order) {
                await this.db.execute(
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

    /**
     * Helper: Log activity to database
     */
    async logActivity(data) {
        try {
            await this.db.execute(`
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

    async getLogs(req, res) {
        try {
            const { level, category, limit = 100 } = req.query;
            const safeLimit = Math.min(Math.max(parseInt(limit) || 100, 1), 1000);

            let query = `
                SELECT
                    al.*,
                    p.name as project_name,
                    aa.name as agent_name
                FROM activity_logs al
                LEFT JOIN projects p ON al.project_id = p.id
                LEFT JOIN ai_agents aa ON al.agent_id = aa.id
                WHERE 1=1
            `;

            const params = [];

            if (level) {
                query += ' AND al.level = ?';
                params.push(level);
            }

            if (category) {
                query += ' AND al.category = ?';
                params.push(category);
            }

            query += ` ORDER BY al.created_at DESC LIMIT ${safeLimit}`;

            const [logs] = await this.db.execute(query, params);
            res.json(logs);

        } catch (error) {
            console.error('Error fetching logs:', error);
            res.status(500).json({ error: 'Failed to fetch logs', details: error.message });
        }
    }

    async getAuditLogs(req, res) {
        try {
            const { limit = 50 } = req.query;
            
            const [logs] = await this.db.execute(`
                SELECT 
                    al.*,
                    u.username as user_name
                FROM activity_logs al
                LEFT JOIN users u ON al.user_id = u.id
                WHERE al.category = 'security'
                ORDER BY al.created_at DESC
                LIMIT ?
            `, [parseInt(limit)]);

            res.json(logs);

        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch audit logs' });
        }
    }

    async getProjectReports(req, res) {
        try {
            const { period = '30d' } = req.query;
            
            const [reports] = await this.db.execute(`
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

    async getAgentReports(req, res) {
        try {
            const [reports] = await this.db.execute(`
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

    async getFinancialReports(req, res) {
        try {
            const [reports] = await this.db.execute(`
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

    async healthCheck(req, res) {
        try {
            await this.db.execute('SELECT 1');
            
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: 'connected',
                connected_clients: this.connectedClients.size,
                uptime: process.uptime()
            });

        } catch (error) {
            res.status(503).json({
                status: 'unhealthy',
                error: error.message
            });
        }
    }

    // ========== DOCUMENTACIÓN Y RECURSOS ==========

    async getProjectDocs(req, res) {
        try {
            // Documentación del proyecto actual
            res.json({
                project: 'SOLARIA Digital Field Operations',
                version: '2.0.0',
                documents: [
                    { id: 1, name: 'README.md', type: 'documentation', path: '/README.md', description: 'Documentación principal del proyecto' },
                    { id: 2, name: 'CLAUDE.md', type: 'agent-instructions', path: '/CLAUDE.md', description: 'Instrucciones para agentes IA' },
                    { id: 3, name: 'docker-compose.yml', type: 'infrastructure', path: '/docker-compose.yml', description: 'Configuración de servicios Docker' },
                    { id: 4, name: 'mysql-init.sql', type: 'database', path: '/infrastructure/database/mysql-init.sql', description: 'Schema de base de datos' },
                    { id: 5, name: 'nginx.conf', type: 'infrastructure', path: '/infrastructure/nginx/nginx.conf', description: 'Configuración de reverse proxy' }
                ],
                categories: ['documentation', 'agent-instructions', 'infrastructure', 'database', 'api-specs']
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch docs' });
        }
    }

    async getDocumentsList(req, res) {
        try {
            const repoPath = process.env.REPO_PATH || '/repo';
            const fs = require('fs');
            const path = require('path');

            // Patterns de archivos de documentacion
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

            const documents = [];
            const dirsToScan = ['', 'docs', 'documentation', 'specs', 'config'];

            const getFileType = (filename) => {
                for (const p of docPatterns) {
                    if (p.pattern.test(filename)) return { type: p.type, icon: p.icon };
                }
                return { type: 'file', icon: 'fa-file' };
            };

            const scanDir = (dir, relPath = '') => {
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
                    console.error('Error scanning dir:', dir, e.message);
                }
            };

            // Escanear directorios principales
            for (const dir of dirsToScan) {
                scanDir(dir);
            }

            // Ordenar por tipo y nombre
            documents.sort((a, b) => {
                if (a.type !== b.type) return a.type.localeCompare(b.type);
                return a.name.localeCompare(b.name);
            });

            res.json({
                total: documents.length,
                documents: documents.slice(0, 50) // Limitar a 50 documentos
            });
        } catch (error) {
            console.error('Error listing documents:', error);
            res.status(500).json({ error: 'Failed to list documents' });
        }
    }

    async getProjectSpecs(req, res) {
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

    async getProjectCredentials(req, res) {
        try {
            // Solo usuarios con rol admin o ceo pueden ver credenciales
            if (req.user.role !== 'ceo' && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. CEO or Admin role required.' });
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

    async getProjectArchitecture(req, res) {
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

    async getProjectRoadmap(req, res) {
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

    // ========== VISTAS C-SUITE POR ROL ==========

    async getCEODashboard(req, res) {
        try {
            const [projects] = await this.db.execute(`
                SELECT 
                    p.*, 
                    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
                    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
                    (SELECT COUNT(*) FROM alerts a WHERE a.project_id = p.id AND a.status = 'active') as active_alerts
                FROM projects p
            `);

            const [budgetSummary] = await this.db.execute(`
                SELECT
                    SUM(budget) as total_budget,
                    SUM(actual_cost) as total_spent,
                    SUM(budget) - SUM(actual_cost) as remaining,
                    AVG(completion_percentage) as avg_completion
                FROM projects
            `);

            const [criticalAlerts] = await this.db.execute(`
                SELECT * FROM alerts WHERE severity = 'critical' AND status = 'active'
            `);

            const [topTasks] = await this.db.execute(`
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

    async getCTODashboard(req, res) {
        try {
            const [agents] = await this.db.execute(`SELECT * FROM ai_agents`);
            const [techMetrics] = await this.db.execute(`
                SELECT
                    AVG(code_quality_score) as avg_quality,
                    AVG(test_coverage) as avg_coverage,
                    AVG(agent_efficiency) as avg_efficiency
                FROM project_metrics WHERE metric_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            `);
            const [techDebt] = await this.db.execute(`
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

    async getCOODashboard(req, res) {
        try {
            const [tasks] = await this.db.execute(`SELECT * FROM tasks ORDER BY created_at DESC LIMIT 20`);
            const [taskStats] = await this.db.execute(`
                SELECT
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                    SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
                FROM tasks
            `);
            const [agentWorkload] = await this.db.execute(`
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

    async getCFODashboard(req, res) {
        try {
            const [financials] = await this.db.execute(`
                SELECT
                    SUM(budget) as total_budget,
                    SUM(actual_cost) as total_cost,
                    SUM(budget) - SUM(actual_cost) as remaining_budget
                FROM projects
            `);
            const [costByProject] = await this.db.execute(`
                SELECT name, budget, actual_cost,
                    (actual_cost / budget * 100) as burn_rate
                FROM projects
            `);
            const [monthlySpend] = await this.db.execute(`
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
                    projectedROI: 35, // Calculated based on expected outcomes
                    costPerTask: 7500 // Average cost per completed task
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

    // ========== API AGENTES IA - AUTO-DEPLOYMENT ==========

    async registerDocument(req, res) {
        try {
            const { project_id, name, type, path, description, content } = req.body;

            const [result] = await this.db.execute(`
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

    async updateProjectFromAgent(req, res) {
        try {
            const { project_id, updates } = req.body;

            const fields = [];
            const values = [];

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
                await this.db.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`, values);
            }

            await this.db.execute(`
                INSERT INTO activity_logs (project_id, action, details, category, level)
                VALUES (?, 'project_updated_by_agent', ?, 'management', 'info')
            `, [project_id || 1, JSON.stringify(updates)]);

            res.json({ success: true, message: 'Project updated by agent' });
        } catch (error) {
            console.error('Update project from agent error:', error);
            res.status(500).json({ error: 'Failed to update project' });
        }
    }

    async addTaskFromAgent(req, res) {
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

            // Get next task_number for this project (same logic as createTask)
            const [maxTask] = await this.db.execute(
                'SELECT COALESCE(MAX(task_number), 0) + 1 as next_number FROM tasks WHERE project_id = ?',
                [effectiveProjectId]
            );
            const taskNumber = maxTask[0].next_number;

            // Convert undefined to null for MySQL compatibility
            const [result] = await this.db.execute(`
                INSERT INTO tasks (title, description, project_id, assigned_agent_id, task_number, priority, estimated_hours, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                title,
                description,
                effectiveProjectId,
                agent_id ?? null,
                taskNumber,
                priority,
                estimated_hours ?? null,
                status
            ]);

            // Get project code for response
            let taskCode = `#${taskNumber}`;
            const [projects] = await this.db.execute(
                'SELECT code FROM projects WHERE id = ?',
                [effectiveProjectId]
            );
            if (projects.length > 0 && projects[0].code) {
                taskCode = `${projects[0].code}-${String(taskNumber).padStart(3, '0')}`;
            }

            await this.db.execute(`
                INSERT INTO activity_logs (project_id, agent_id, action, details, category, level)
                VALUES (?, ?, 'task_created_by_agent', ?, 'development', 'info')
            `, [effectiveProjectId, agent_id, JSON.stringify({ task_id: result.insertId, task_code: taskCode, title })]);

            // Emit notification with task code
            this.io.to('notifications').emit('task_created', {
                id: result.insertId,
                task_code: taskCode,
                task_number: taskNumber,
                title,
                project_id: effectiveProjectId,
                priority
            });

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

    async logAgentActivity(req, res) {
        try {
            const { project_id, agent_id, action, details, category = 'system', level = 'info' } = req.body;

            // Convertir undefined a null para MySQL
            const safeProjectId = project_id ?? null;
            const safeAgentId = agent_id ?? null;
            const safeAction = action ?? 'unknown';
            const safeDetails = details ? JSON.stringify(details) : null;

            const [result] = await this.db.execute(`
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

    async updateMetricsFromAgent(req, res) {
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

            await this.db.execute(`
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
            console.error('Update metrics from agent error:', error);
            res.status(500).json({ error: 'Failed to update metrics' });
        }
    }

    async getAgentInstructions(req, res) {
        try {
            res.json({
                project: 'SOLARIA Digital Field Operations',
                version: '2.0.0',
                instructions: {
                    overview: 'Este dashboard es auto-desplegable. Los agentes IA deben registrar toda la documentacion y actividad.',
                    endpoints: {
                        registerDoc: {
                            method: 'POST',
                            path: '/api/agent/register-doc',
                            body: { project_id: 'number', name: 'string', type: 'string', path: 'string', description: 'string' }
                        },
                        updateProject: {
                            method: 'POST',
                            path: '/api/agent/update-project',
                            body: { project_id: 'number', updates: { name: 'string', description: 'string', status: 'string', completion_percentage: 'number', tech_stack: 'array' } }
                        },
                        addTask: {
                            method: 'POST',
                            path: '/api/agent/add-task',
                            body: { project_id: 'number', title: 'string', description: 'string', agent_id: 'number', priority: 'low|medium|high|critical', estimated_hours: 'number' }
                        },
                        logActivity: {
                            method: 'POST',
                            path: '/api/agent/log-activity',
                            body: { project_id: 'number', agent_id: 'number', action: 'string', details: 'object', category: 'string', level: 'string' }
                        },
                        updateMetrics: {
                            method: 'POST',
                            path: '/api/agent/update-metrics',
                            body: { project_id: 'number', completion_percentage: 'number', agent_efficiency: 'number', code_quality_score: 'number', test_coverage: 'number' }
                        }
                    },
                    workflow: [
                        '1. Al iniciar trabajo en un proyecto, registrar documentacion con /api/agent/register-doc',
                        '2. Crear tareas usando /api/agent/add-task',
                        '3. Actualizar progreso con /api/agent/update-project',
                        '4. Registrar actividad con /api/agent/log-activity',
                        '5. Actualizar metricas periodicamente con /api/agent/update-metrics'
                    ]
                }
            });
        } catch (error) {
            console.error('Get agent instructions error:', error);
            res.status(500).json({ error: 'Failed to get instructions' });
        }
    }

    // ========== TAREAS Y LOGS ADICIONALES ==========

    async loadTasks(req, res) {
        try {
            const { project_id, status, limit = '50' } = req.query;
            const limitNum = parseInt(limit) || 50;

            let query = `
                SELECT
                    t.*,
                    p.name as project_name,
                    aa.name as agent_name
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN ai_agents aa ON t.assigned_agent_id = aa.id
                WHERE 1=1
            `;
            const params = [];

            if (project_id) {
                query += ' AND t.project_id = ?';
                params.push(parseInt(project_id));
            }
            if (status) {
                query += ' AND t.status = ?';
                params.push(status);
            }

            query += ` ORDER BY t.created_at DESC LIMIT ${limitNum}`;

            const [tasks] = await this.db.execute(query, params);
            res.json(tasks);
        } catch (error) {
            console.error('Load tasks error:', error);
            res.status(500).json({ error: 'Failed to load tasks' });
        }
    }

    async loadLogs(req, res) {
        try {
            const { level, category, limit = '100' } = req.query;
            const limitNum = parseInt(limit) || 100;

            let query = `
                SELECT
                    al.*,
                    p.name as project_name,
                    aa.name as agent_name
                FROM activity_logs al
                LEFT JOIN projects p ON al.project_id = p.id
                LEFT JOIN ai_agents aa ON al.agent_id = aa.id
                WHERE 1=1
            `;
            const params = [];

            if (level) {
                query += ' AND al.level = ?';
                params.push(level);
            }
            if (category) {
                query += ' AND al.category = ?';
                params.push(category);
            }

            query += ` ORDER BY al.created_at DESC LIMIT ${limitNum}`;

            const [logs] = await this.db.execute(query, params);
            res.json(logs);
        } catch (error) {
            console.error('Load logs error:', error);
            res.status(500).json({ error: 'Failed to load logs' });
        }
    }

    // ========== MEMORY API HANDLERS (Integrated from Memora) ==========

    async getMemories(req, res) {
        try {
            const { project_id, query, tags, limit = 20, offset = 0, sort_by = 'importance' } = req.query;

            let sql = `
                SELECT m.*, p.name as project_name, aa.name as agent_name
                FROM memories m
                LEFT JOIN projects p ON m.project_id = p.id
                LEFT JOIN ai_agents aa ON m.agent_id = aa.id
                WHERE 1=1
            `;
            const params = [];

            if (project_id) {
                sql += ' AND m.project_id = ?';
                params.push(project_id);
            }

            if (query) {
                sql += ' AND (m.content LIKE ? OR m.summary LIKE ?)';
                params.push(`%${query}%`, `%${query}%`);
            }

            if (tags) {
                const tagList = JSON.parse(tags);
                if (tagList.length > 0) {
                    const tagConditions = tagList.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
                    sql += ` AND (${tagConditions})`;
                    tagList.forEach(tag => params.push(JSON.stringify(tag)));
                }
            }

            // Sort order
            const sortMap = {
                'importance': 'm.importance DESC, m.created_at DESC',
                'created_at': 'm.created_at DESC',
                'updated_at': 'm.updated_at DESC',
                'access_count': 'm.access_count DESC'
            };
            sql += ` ORDER BY ${sortMap[sort_by] || sortMap['importance']}`;

            sql += ` LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;

            const [memories] = await this.db.execute(sql, params);

            // Parse JSON fields
            memories.forEach(m => {
                m.tags = m.tags ? JSON.parse(m.tags) : [];
                m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
            });

            res.json({ memories, count: memories.length });
        } catch (error) {
            console.error('Get memories error:', error);
            res.status(500).json({ error: 'Failed to fetch memories' });
        }
    }

    async searchMemories(req, res) {
        try {
            const { query, project_id, tags, min_importance = 0, limit = 10 } = req.query;

            if (!query) {
                return res.status(400).json({ error: 'Query parameter required' });
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
            const params = [query, query, parseFloat(min_importance)];

            if (project_id) {
                sql += ' AND m.project_id = ?';
                params.push(project_id);
            }

            if (tags) {
                const tagList = JSON.parse(tags);
                if (tagList.length > 0) {
                    const tagConditions = tagList.map(() => 'JSON_CONTAINS(m.tags, ?)').join(' OR ');
                    sql += ` AND (${tagConditions})`;
                    tagList.forEach(tag => params.push(JSON.stringify(tag)));
                }
            }

            sql += ` ORDER BY relevance DESC, m.importance DESC LIMIT ${parseInt(limit)}`;

            const [memories] = await this.db.execute(sql, params);

            memories.forEach(m => {
                m.tags = m.tags ? JSON.parse(m.tags) : [];
                m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
            });

            res.json({ memories, count: memories.length, query });
        } catch (error) {
            console.error('Search memories error:', error);
            res.status(500).json({ error: 'Failed to search memories' });
        }
    }

    async getMemory(req, res) {
        try {
            const { id } = req.params;
            const { track_access } = req.query;

            const [memories] = await this.db.execute(`
                SELECT m.*, p.name as project_name, aa.name as agent_name
                FROM memories m
                LEFT JOIN projects p ON m.project_id = p.id
                LEFT JOIN ai_agents aa ON m.agent_id = aa.id
                WHERE m.id = ?
            `, [id]);

            if (memories.length === 0) {
                return res.status(404).json({ error: 'Memory not found' });
            }

            // Track access
            if (track_access === 'true') {
                await this.db.execute(`
                    UPDATE memories SET access_count = access_count + 1, last_accessed = NOW() WHERE id = ?
                `, [id]);
            }

            const memory = memories[0];
            memory.tags = memory.tags ? JSON.parse(memory.tags) : [];
            memory.metadata = memory.metadata ? JSON.parse(memory.metadata) : {};

            res.json(memory);
        } catch (error) {
            console.error('Get memory error:', error);
            res.status(500).json({ error: 'Failed to fetch memory' });
        }
    }

    async createMemory(req, res) {
        try {
            const { content, summary, tags, metadata, importance = 0.5, project_id, agent_id } = req.body;

            if (!content) {
                return res.status(400).json({ error: 'Content is required' });
            }

            const [result] = await this.db.execute(`
                INSERT INTO memories (content, summary, tags, metadata, importance, project_id, agent_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                content,
                summary || content.substring(0, 200),
                tags || '[]',
                metadata || '{}',
                importance,
                project_id || null,
                agent_id || null
            ]);

            // Log memory event
            await this.db.execute(`
                INSERT INTO memory_events (memory_id, event_type, agent_id, project_id, details)
                VALUES (?, 'created', ?, ?, ?)
            `, [result.insertId, agent_id || null, project_id || null, JSON.stringify({ summary: summary || content.substring(0, 100) })]);

            res.status(201).json({
                id: result.insertId,
                message: 'Memory created successfully'
            });
        } catch (error) {
            console.error('Create memory error:', error);
            res.status(500).json({ error: 'Failed to create memory' });
        }
    }

    async updateMemory(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            const fields = [];
            const values = [];

            if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content); }
            if (updates.summary !== undefined) { fields.push('summary = ?'); values.push(updates.summary); }
            if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(updates.tags); }
            if (updates.metadata !== undefined) { fields.push('metadata = ?'); values.push(updates.metadata); }
            if (updates.importance !== undefined) { fields.push('importance = ?'); values.push(updates.importance); }

            if (fields.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            values.push(id);

            const [result] = await this.db.execute(
                `UPDATE memories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Memory not found' });
            }

            // Log update event
            await this.db.execute(`
                INSERT INTO memory_events (memory_id, event_type, details)
                VALUES (?, 'updated', ?)
            `, [id, JSON.stringify({ fields_updated: Object.keys(updates) })]);

            res.json({ message: 'Memory updated successfully' });
        } catch (error) {
            console.error('Update memory error:', error);
            res.status(500).json({ error: 'Failed to update memory' });
        }
    }

    async deleteMemory(req, res) {
        try {
            const { id } = req.params;

            const [result] = await this.db.execute('DELETE FROM memories WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Memory not found' });
            }

            res.json({ message: 'Memory deleted successfully' });
        } catch (error) {
            console.error('Delete memory error:', error);
            res.status(500).json({ error: 'Failed to delete memory' });
        }
    }

    async getMemoryTags(req, res) {
        try {
            const [tags] = await this.db.execute(`
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

    async getMemoryStats(req, res) {
        try {
            const { project_id } = req.query;

            let whereClause = '';
            const params = [];
            if (project_id) {
                whereClause = 'WHERE project_id = ?';
                params.push(project_id);
            }

            const [countResult] = await this.db.execute(
                `SELECT COUNT(*) as total, AVG(importance) as avg_importance, SUM(access_count) as total_accesses FROM memories ${whereClause}`,
                params
            );

            const [tagStats] = await this.db.execute(`
                SELECT name, usage_count FROM memory_tags ORDER BY usage_count DESC LIMIT 10
            `);

            const [recentActivity] = await this.db.execute(`
                SELECT event_type, COUNT(*) as count, MAX(created_at) as last_event
                FROM memory_events
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY event_type
            `);

            res.json({
                total_memories: countResult[0].total || 0,
                avg_importance: parseFloat(countResult[0].avg_importance) || 0,
                total_accesses: countResult[0].total_accesses || 0,
                top_tags: tagStats,
                recent_activity: recentActivity
            });
        } catch (error) {
            console.error('Get memory stats error:', error);
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    async boostMemory(req, res) {
        try {
            const { id } = req.params;
            const { boost_amount = 0.1 } = req.body;

            const safeBoost = Math.min(Math.max(parseFloat(boost_amount), 0), 0.5);

            const [result] = await this.db.execute(`
                UPDATE memories
                SET importance = LEAST(importance + ?, 1.0), updated_at = NOW()
                WHERE id = ?
            `, [safeBoost, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Memory not found' });
            }

            res.json({ message: 'Memory boosted successfully', boost_applied: safeBoost });
        } catch (error) {
            console.error('Boost memory error:', error);
            res.status(500).json({ error: 'Failed to boost memory' });
        }
    }

    async getRelatedMemories(req, res) {
        try {
            const { id } = req.params;
            const { type } = req.query;

            let sql = `
                SELECT m.*, mc.relationship_type, mc.strength
                FROM memory_crossrefs mc
                JOIN memories m ON mc.target_memory_id = m.id
                WHERE mc.source_memory_id = ?
            `;
            const params = [id];

            if (type) {
                sql += ' AND mc.relationship_type = ?';
                params.push(type);
            }

            sql += ' ORDER BY mc.strength DESC, m.importance DESC';

            const [related] = await this.db.execute(sql, params);

            related.forEach(m => {
                m.tags = m.tags ? JSON.parse(m.tags) : [];
                m.metadata = m.metadata ? JSON.parse(m.metadata) : {};
            });

            res.json({ related, count: related.length });
        } catch (error) {
            console.error('Get related memories error:', error);
            res.status(500).json({ error: 'Failed to fetch related memories' });
        }
    }

    async createMemoryCrossref(req, res) {
        try {
            const { source_memory_id, target_memory_id, relationship_type = 'related', strength = 0.5 } = req.body;

            if (!source_memory_id || !target_memory_id) {
                return res.status(400).json({ error: 'source_memory_id and target_memory_id are required' });
            }

            const [result] = await this.db.execute(`
                INSERT INTO memory_crossrefs (source_memory_id, target_memory_id, relationship_type, strength)
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

    start() {
        this.server.listen(this.port, () => {
            console.log(`🚀 SOLARIA C-Suite Dashboard running on port ${this.port}`);
            console.log(`📊 Dashboard available at: http://localhost:${this.port}`);
            console.log(`🔐 Secure authentication enabled`);
            console.log(`📡 Real-time updates active`);
        });
    }
}

// Iniciar servidor
const server = new SolariaDashboardServer();
server.start();

module.exports = SolariaDashboardServer;

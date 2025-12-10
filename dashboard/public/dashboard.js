/**
 * SOLARIA C-Suite Dashboard - Frontend
 * Optimizado para supervisión humana de proyectos gestionados por agentes IA
 */

class SolariaDashboard {
    constructor() {
        this.apiBase = '/api';
        this.token = localStorage.getItem('solaria_token');
        this.user = null;
        this.socket = null;
        this.charts = {};
        this.refreshInterval = null;
        
        this.init();
    }

    async init() {
        if (this.token) {
            await this.verifyToken();
        } else {
            this.showLogin();
        }
    }

    // Authentication
    async verifyToken() {
        try {
            const response = await fetch(`${this.apiBase}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                this.showDashboard();
                this.initializeSocket();
                this.startRealTimeUpdates();
            } else {
                this.showLogin();
            }
        } catch (error) {
            this.showLogin();
        }
    }

    async login(userId, password) {
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('solaria_token', this.token);
                this.showDashboard();
                this.initializeSocket();
                this.startRealTimeUpdates();
                return true;
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (error) {
            this.showError('loginError', error.message);
            return false;
        }
    }

    logout() {
        localStorage.removeItem('solaria_token');
        this.token = null;
        this.user = null;
        if (this.socket) {
            this.socket.disconnect();
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.showLogin();
    }

    // UI Management
    showLogin() {
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboardScreen').classList.add('hidden');
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.remove('hidden');
        
        // Update user info
        document.getElementById('userName').textContent = this.user.name;
        document.getElementById('userRole').textContent = this.user.role.toUpperCase();
        document.getElementById('userInitial').textContent = this.user.name.charAt(0).toUpperCase();
        
        // Load initial data
        this.loadDashboardData();
        this.showSection('overview');
    }

    showSection(sectionName) {
        // Hide all sections
        const sections = ['overview', 'projects', 'agents', 'tasks', 'alerts', 'analytics', 'logs', 'settings'];
        sections.forEach(section => {
            const el = document.getElementById(`${section}Section`);
            if (el) el.classList.add('hidden');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active', 'text-foreground');
            btn.classList.add('text-muted-foreground');
        });

        const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNav) {
            activeNav.classList.add('active', 'text-foreground');
            activeNav.classList.remove('text-muted-foreground');
        }

        // Update page title
        const titles = {
            overview: { title: 'Overview', subtitle: 'Monitor your AI-powered construction projects' },
            projects: { title: 'Projects', subtitle: 'Manage and track all your projects' },
            agents: { title: 'AI Agents', subtitle: 'Monitor your AI workforce performance' },
            tasks: { title: 'Tasks', subtitle: 'Track all tasks across projects' },
            alerts: { title: 'Alerts', subtitle: 'System alerts and notifications' },
            analytics: { title: 'Analytics', subtitle: 'Detailed reports and insights' },
            logs: { title: 'Activity Logs', subtitle: 'System activity and audit trail' },
            settings: { title: 'Settings', subtitle: 'Configure your dashboard preferences' }
        };

        const pageInfo = titles[sectionName] || { title: sectionName, subtitle: '' };
        const titleEl = document.getElementById('pageTitle');
        const subtitleEl = document.getElementById('pageSubtitle');
        if (titleEl) titleEl.textContent = pageInfo.title;
        if (subtitleEl) subtitleEl.textContent = pageInfo.subtitle;

        this.currentSection = sectionName;

        // Load section data
        this.loadSectionData(sectionName);
    }

    // Socket.IO for real-time updates
    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to real-time updates');
            this.socket.emit('authenticate', this.token);
        });
        
        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data.user);
            this.socket.emit('subscribe_projects');
            this.socket.emit('subscribe_agents');
            this.socket.emit('subscribe_alerts');
        });
        
        this.socket.on('agent_states_update', (data) => {
            this.updateAgentStates(data);
        });
        
        this.socket.on('project_metrics_update', (data) => {
            this.updateProjectMetrics(data);
        });
        
        this.socket.on('critical_alerts', (alerts) => {
            this.showCriticalAlerts(alerts);
        });
    }

    // Data Loading
    async loadDashboardData() {
        await Promise.all([
            this.loadOverview(),
            this.loadMetrics(),
            this.loadAlerts()
        ]);
    }

    async loadOverview() {
        try {
            const response = await fetch(`${this.apiBase}/dashboard/overview`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateOverviewCards(data);
            }
        } catch (error) {
            console.error('Failed to load overview:', error);
        }
    }

    async loadMetrics() {
        try {
            const response = await fetch(`${this.apiBase}/dashboard/metrics?timeframe=30`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.updateCharts(data);
            }
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    async loadAlerts() {
        try {
            const response = await fetch(`${this.apiBase}/dashboard/alerts?limit=10`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const alerts = await response.json();
                this.updateRecentActivity(alerts);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        }
    }

    async loadSectionData(sectionName) {
        switch (sectionName) {
            case 'projects':
                await this.loadProjects();
                break;
            case 'agents':
                await this.loadAgents();
                break;
            case 'tasks':
                await this.loadTasks();
                break;
            case 'alerts':
                await this.loadAllAlerts();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
            case 'logs':
                await this.loadActivityLogs();
                break;
        }
    }

    async loadProjects() {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/projects`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.renderProjectsTable(data.projects);
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async loadAgents() {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/agents`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const agents = await response.json();
                this.renderAgentsGrid(agents);
            }
        } catch (error) {
            console.error('Failed to load agents:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async loadAllAlerts() {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/dashboard/alerts?limit=50`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (response.ok) {
                const alerts = await response.json();
                this.renderAlerts(alerts);
            }
        } catch (error) {
            console.error('Failed to load alerts:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async loadTasks() {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/tasks`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const tasks = await response.json();
                this.renderTasksList(tasks);
            }
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async loadActivityLogs() {
        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBase}/logs`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (response.ok) {
                const logs = await response.json();
                this.renderLogs(logs);
            }
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async loadAnalytics() {
        // Analytics charts are loaded with initial metrics
        await this.loadMetrics();
    }

    renderTasksList(tasks) {
        const container = document.getElementById('tasksList');
        if (!container) return;

        if (tasks.length === 0) {
            container.textContent = 'No hay tareas';
            return;
        }

        container.textContent = '';
        tasks.forEach(task => {
            const statusColors = {
                pending: 'bg-gray-500',
                in_progress: 'bg-blue-500',
                review: 'bg-yellow-500',
                completed: 'bg-green-500',
                blocked: 'bg-red-500'
            };
            const priorityColors = {
                low: 'text-gray-400',
                medium: 'text-yellow-400',
                high: 'text-orange-400',
                critical: 'text-red-400'
            };

            const taskEl = document.createElement('div');
            taskEl.className = 'bg-card rounded-lg p-4 border border-border flex items-center justify-between';
            taskEl.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-3 h-3 rounded-full ${statusColors[task.status] || 'bg-gray-500'}"></div>
                    <div>
                        <p class="font-medium text-foreground">${this.escapeHtml(task.title)}</p>
                        <p class="text-sm text-muted-foreground">${this.escapeHtml(task.project_name || 'Sin proyecto')} | ${this.escapeHtml(task.agent_name || 'Sin asignar')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm ${priorityColors[task.priority] || ''}">${(task.priority || 'medium').toUpperCase()}</span>
                    <span class="px-2 py-1 rounded text-xs bg-secondary text-foreground">${(task.status || 'pending').replace('_', ' ')}</span>
                    <span class="text-sm text-muted-foreground">${task.progress || 0}%</span>
                </div>
            `;
            container.appendChild(taskEl);
        });
    }

    renderLogs(logs) {
        const container = document.getElementById('logsContainer');
        if (!container) return;

        if (logs.length === 0) {
            container.textContent = 'No hay logs';
            return;
        }

        container.textContent = '';
        logs.forEach(log => {
            const levelColors = {
                debug: 'text-gray-400',
                info: 'text-blue-400',
                warning: 'text-yellow-400',
                error: 'text-red-400',
                critical: 'text-red-600'
            };

            const logEl = document.createElement('div');
            logEl.className = 'p-4 flex items-center justify-between border-b border-border last:border-0';
            logEl.innerHTML = `
                <div class="flex items-center gap-4">
                    <span class="w-16 text-xs font-mono ${levelColors[log.level] || ''}">${(log.level || 'info').toUpperCase()}</span>
                    <div>
                        <p class="font-medium text-foreground">${this.escapeHtml(log.action)}</p>
                        <p class="text-sm text-muted-foreground">${this.escapeHtml(log.details || '')}</p>
                    </div>
                </div>
                <div class="text-sm text-muted-foreground">
                    ${new Date(log.created_at).toLocaleString()}
                </div>
            `;
            container.appendChild(logEl);
        });
    }

    // UI Updates
    updateOverviewCards(data) {
        const totalProjects = document.getElementById('totalProjects');
        const activeAgents = document.getElementById('activeAgents');
        const completedTasks = document.getElementById('completedTasks');
        const criticalAlerts = document.getElementById('criticalAlerts');

        if (totalProjects) totalProjects.textContent = data.projects.total_projects || 0;
        if (activeAgents) activeAgents.textContent = data.agents.active_agents || 0;
        if (completedTasks) completedTasks.textContent = data.tasks.completed_tasks || 0;
        if (criticalAlerts) criticalAlerts.textContent = data.alerts.critical_alerts || 0;
        
        // Update alert indicator
        const indicator = document.getElementById('alertIndicator');
        if (data.alerts.critical_alerts > 0) {
            indicator.textContent = `${data.alerts.critical_alerts} Critical`;
            indicator.classList.add('critical-alert');
        } else {
            indicator.textContent = 'All Clear';
            indicator.classList.remove('critical-alert');
        }
    }

    updateCharts(data) {
        // Project Progress Chart
        const projectCtx = document.getElementById('projectProgressChart').getContext('2d');
        
        if (this.charts.projectProgress) {
            this.charts.projectProgress.destroy();
        }
        
        this.charts.projectProgress = new Chart(projectCtx, {
            type: 'line',
            data: {
                labels: data.projectMetrics.map(m => new Date(m.date).toLocaleDateString()),
                datasets: [{
                    label: 'Avg Completion %',
                    data: data.projectMetrics.map(m => m.avg_completion),
                    borderColor: '#f6921d',
                    backgroundColor: 'rgba(246, 146, 29, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: 'hsl(var(--muted-foreground))' },
                        grid: { color: 'hsl(var(--border))' }
                    },
                    x: {
                        ticks: { color: 'hsl(var(--muted-foreground))' },
                        grid: { color: 'hsl(var(--border))' }
                    }
                }
            }
        });

        // Agent Performance Chart
        const agentCtx = document.getElementById('agentPerformanceChart').getContext('2d');
        
        if (this.charts.agentPerformance) {
            this.charts.agentPerformance.destroy();
        }
        
        this.charts.agentPerformance = new Chart(agentCtx, {
            type: 'bar',
            data: {
                labels: data.agentMetrics.map(m => m.role.replace('_', ' ').toUpperCase()),
                datasets: [{
                    label: 'Tasks Completed',
                    data: data.agentMetrics.map(m => m.tasks_completed),
                    backgroundColor: '#f6921d'
                }, {
                    label: 'Avg Task Time (hrs)',
                    data: data.agentMetrics.map(m => m.avg_task_time),
                    backgroundColor: '#d47a0f'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { 
                        labels: { color: 'hsl(var(--muted-foreground))' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'hsl(var(--muted-foreground))' },
                        grid: { color: 'hsl(var(--border))' }
                    },
                    x: {
                        ticks: { color: 'hsl(var(--muted-foreground))' },
                        grid: { color: 'hsl(var(--border))' }
                    }
                }
            }
        });
    }

    updateRecentActivity(alerts) {
        const container = document.getElementById('recentActivity');
        
        if (alerts.length === 0) {
            container.innerHTML = '<p class="text-muted-foreground">No recent activity</p>';
            return;
        }
        
        container.innerHTML = alerts.slice(0, 5).map(alert => `
            <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-2 h-2 rounded-full ${this.getSeverityColor(alert.severity)}"></div>
                    <div>
                        <div class="font-medium text-foreground">${alert.title}</div>
                        <div class="text-sm text-muted-foreground">${new Date(alert.created_at).toLocaleString()}</div>
                    </div>
                </div>
                <span class="text-xs px-2 py-1 rounded ${this.getSeverityBadgeClass(alert.severity)}">
                    ${alert.severity.toUpperCase()}
                </span>
            </div>
        `).join('');
    }

    renderProjectsTable(projects) {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;
        
        if (projects.length === 0) {
            grid.textContent = 'No hay proyectos';
            return;
        }

        // Clear existing content
        grid.textContent = '';

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'bg-card rounded-xl p-6 border border-border hover:border-solaria/30 transition-all cursor-pointer';
            card.onclick = () => viewProject(project.id);

            const statusClass = this.getStatusBadgeClass(project.status || 'planning');
            const statusText = (project.status || 'planning').replace('_', ' ').toUpperCase();
            const progress = project.completion_percentage || 0;
            const budget = (project.budget || 0).toLocaleString();
            const alertClass = (project.active_alerts || 0) > 0 ? 'text-red-500' : 'text-green-500';

            card.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-solaria/10 flex items-center justify-center">
                            <i class="fa-solid fa-folder text-solaria"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-foreground">${this.escapeHtml(project.name)}</h3>
                            <p class="text-xs text-muted-foreground">${this.escapeHtml(project.client || 'SOLARIA')}</p>
                        </div>
                    </div>
                    <span class="px-2 py-1 rounded text-xs ${statusClass}">${statusText}</span>
                </div>
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-muted-foreground">Progreso</span>
                        <span class="text-foreground">${progress}%</span>
                    </div>
                    <div class="w-full bg-secondary rounded-full h-2">
                        <div class="bg-solaria h-2 rounded-full" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div><p class="text-muted-foreground">Presupuesto</p><p class="text-foreground font-medium">$${budget}</p></div>
                    <div><p class="text-muted-foreground">Tareas</p><p class="text-foreground font-medium">${project.completed_tasks || 0}/${project.total_tasks || 0}</p></div>
                    <div><p class="text-muted-foreground">Agentes</p><p class="text-foreground font-medium">${project.agents_assigned || 0}</p></div>
                    <div><p class="text-muted-foreground">Alertas</p><p class="${alertClass} font-medium">${project.active_alerts || 0}</p></div>
                </div>
            `;

            grid.appendChild(card);
        });
    }

    renderAgentsGrid(agents) {
        const grid = document.getElementById('agentsGrid');
        
        if (agents.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-8 text-muted-foreground">No agents found</div>';
            return;
        }
        
        grid.innerHTML = agents.map(agent => `
            <div class="bg-card text-card-foreground rounded-lg p-6 border">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span class="text-primary font-bold">${this.getAgentInitials(agent.role)}</span>
                    </div>
                    <div class="w-3 h-3 rounded-full ${this.getAgentStatusColor(agent.status)}"></div>
                </div>
                
                <h3 class="font-semibold text-lg mb-2 text-foreground">${agent.name}</h3>
                <div class="text-sm text-muted-foreground mb-4">${agent.role.replace('_', ' ').toUpperCase()}</div>
                
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Tasks Assigned:</span>
                        <span class="font-medium text-foreground">${agent.tasks_assigned}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Completed:</span>
                        <span class="font-medium text-green-600">${agent.tasks_completed}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Current:</span>
                        <span class="font-medium text-primary">${agent.current_tasks}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-muted-foreground">Errors (24h):</span>
                        <span class="font-medium text-red-600">${agent.error_count}</span>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t">
                    <div class="text-xs text-muted-foreground">
                        Last activity: ${new Date(agent.last_activity).toLocaleString()}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        
        if (alerts.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-muted-foreground">No alerts found</div>';
            return;
        }
        
        container.innerHTML = alerts.map(alert => `
            <div class="bg-card text-card-foreground rounded-lg p-6 border-l-4 ${this.getAlertBorderColor(alert.severity)}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="font-semibold text-lg text-foreground">${alert.title}</h3>
                            <span class="px-2 py-1 rounded text-xs ${this.getSeverityBadgeClass(alert.severity)}">
                                ${alert.severity.toUpperCase()}
                            </span>
                        </div>
                        <p class="text-muted-foreground mb-3">${alert.message}</p>
                        <div class="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Date: ${new Date(alert.created_at).toLocaleString()}</span>
                            ${alert.project_name ? `<span>Project: ${alert.project_name}</span>` : ''}
                            ${alert.agent_name ? `<span>Agent: ${alert.agent_name}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex space-x-2 ml-4">
                        <button onclick="acknowledgeAlert(${alert.id})" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-yellow-600 text-white hover:bg-yellow-700 h-8 px-3 py-1">
                            Acknowledge
                        </button>
                        <button onclick="resolveAlert(${alert.id})" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-8 px-3 py-1">
                            Resolve
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Utility Methods
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getSeverityColor(severity) {
        const colors = {
            low: 'bg-green-500',
            medium: 'bg-yellow-500',
            high: 'bg-orange-500',
            critical: 'bg-red-500'
        };
        return colors[severity] || 'bg-gray-500';
    }

    getSeverityBadgeClass(severity) {
        const classes = {
            low: 'bg-green-100 text-green-800 border-green-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            critical: 'bg-red-100 text-red-800 border-red-200'
        };
        return classes[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
    }

    getAlertBorderColor(severity) {
        const colors = {
            low: 'border-green-500',
            medium: 'border-yellow-500',
            high: 'border-orange-500',
            critical: 'border-red-500'
        };
        return colors[severity] || 'border-gray-500';
    }

    getStatusBadgeClass(status) {
        const classes = {
            planning: 'bg-blue-100 text-blue-800 border-blue-200',
            development: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            testing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            deployment: 'bg-orange-100 text-orange-800 border-orange-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            on_hold: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200'
        };
        return classes[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    }

    getAgentInitials(role) {
        const initials = {
            project_manager: 'PM',
            architect: 'ARC',
            developer: 'DEV',
            tester: 'TST',
            analyst: 'ANL',
            designer: 'DSN',
            devops: 'OPS',
            technical_writer: 'TW',
            security_auditor: 'SEC',
            deployment_specialist: 'DEP'
        };
        return initials[role] || 'AI';
    }

    getAgentStatusColor(status) {
        const colors = {
            active: 'bg-green-500',
            busy: 'bg-yellow-500',
            inactive: 'bg-gray-400',
            error: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-400';
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.classList.remove('hidden');
        setTimeout(() => element.classList.add('hidden'), 5000);
    }

    // Real-time Updates
    startRealTimeUpdates() {
        // Refresh overview every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadOverview();
        }, 30000);
    }

    updateAgentStates(states) {
        // Update agent status in real-time
        console.log('Agent states updated:', states);
    }

    updateProjectMetrics(metrics) {
        // Update project metrics in real-time
        console.log('Project metrics updated:', metrics);
    }

    showCriticalAlerts(alerts) {
        // Show critical alerts immediately
        alerts.forEach(alert => {
            this.showNotification(`Critical Alert: ${alert.title}`, alert.message, 'critical');
        });
    }

    showNotification(title, message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm border ${
            type === 'critical' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-primary text-primary-foreground border-primary'
        }`;
        notification.innerHTML = `
            <div class="font-semibold">${title}</div>
            <div class="text-sm">${message}</div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Action Methods
    async createProject() {
        // TODO: Implement project creation modal
        console.log('Create project clicked');
    }

    viewProject(projectId) {
        // TODO: Implement project detail view
        console.log('View project:', projectId);
    }

    editProject(projectId) {
        // TODO: Implement project editing
        console.log('Edit project:', projectId);
    }

    refreshAgents() {
        this.loadAgents();
    }

    async acknowledgeAlert(alertId) {
        try {
            const response = await fetch(`${this.apiBase}/alerts/${alertId}/acknowledge`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ acknowledged_by: this.user.id })
            });
            
            if (response.ok) {
                this.loadAllAlerts();
            }
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    }

    async resolveAlert(alertId) {
        try {
            const response = await fetch(`${this.apiBase}/alerts/${alertId}/resolve`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.loadAllAlerts();
            }
        } catch (error) {
            console.error('Failed to resolve alert:', error);
        }
    }
}

// Initialize Dashboard
const dashboard = new SolariaDashboard();

// Event Listeners
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    
    await dashboard.login(userId, password);
});

// Quick Access - Auto login bypass for development
window.quickAccess = async () => {
    // Auto-login with bypass credentials (username: carlosjperez)
    await dashboard.login('carlosjperez', 'bypass');
};

// Global functions for onclick handlers
window.logout = () => dashboard.logout();
window.showSection = (section) => dashboard.showSection(section);
window.createProject = () => dashboard.createProject();
window.viewProject = (id) => dashboard.viewProject(id);
window.editProject = (id) => dashboard.editProject(id);
window.refreshAgents = () => dashboard.refreshAgents();
window.acknowledgeAlert = (id) => dashboard.acknowledgeAlert(id);
window.resolveAlert = (id) => dashboard.resolveAlert(id);
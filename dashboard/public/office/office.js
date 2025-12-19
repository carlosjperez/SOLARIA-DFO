class OfficeDashboard {
  constructor() {
    this.apiBase = '/api'
    this.token = localStorage.getItem('solaria_office_token')
    this.user = null
    this.projects = []
    this.agents = []
    this.tasks = []
    this.documentsCache = new Map()
    this.filters = { status: 'all' }
  }

  init() {
    this.cacheDom()
    this.bindEvents()
    if (this.token) {
      this.verifyToken()
    } else {
      this.showLogin()
    }
  }

  cacheDom() {
    this.loginSection = document.getElementById('officeLogin')
    this.layout = document.getElementById('officeLayout')
    this.loginForm = document.getElementById('officeLoginForm')
    this.loginError = document.getElementById('officeLoginError')
    this.projectSelector = document.getElementById('projectSelector')
    this.projectTable = document.getElementById('projectTable')
    this.projectDetail = document.getElementById('projectDetail')
    this.projectFilters = document.getElementById('projectFilters')
    this.overviewKPI = document.getElementById('overviewKPI')
    this.budgetSnapshot = document.getElementById('budgetSnapshot')
    this.clientsTable = document.getElementById('clientsTable')
    this.agentsTable = document.getElementById('agentsTable')
    this.designHub = document.getElementById('designHub')
    this.miniKPIs = document.getElementById('miniKPIs')
    this.userName = document.getElementById('userName')
    this.userRole = document.getElementById('userRole')
    this.userAvatar = document.getElementById('userAvatar')
    this.breadcrumbs = document.getElementById('officeBreadcrumbs')
  }

  bindEvents() {
    this.loginForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const userId = document.getElementById('officeUser').value.trim()
      const password = document.getElementById('officePassword').value
      this.login(userId, password)
    })

    document.getElementById('officeLogout').addEventListener('click', () => this.logout())

    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => this.showSection(btn.dataset.section, btn))
    })

    this.projectSelector.addEventListener('change', (e) => {
      const projectId = Number(e.target.value)
      const project = this.projects.find((p) => p.id === projectId)
      if (project) {
        this.renderProjectDetail(project)
        this.updateBreadcrumb(`Proyecto · ${project.name}`)
        this.renderDesignHub(project)
      }
    })
  }

  async verifyToken() {
    try {
      const response = await fetch(`${this.apiBase}/auth/verify`, {
        headers: { Authorization: `Bearer ${this.token}` },
      })
      if (!response.ok) throw new Error('Token inválido')
      const data = await response.json()
      this.user = data.user
      this.showDashboard()
    } catch (error) {
      this.logout()
      this.showLogin()
    }
  }

  async login(userId, password) {
    try {
      const response = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      })
      if (!response.ok) throw new Error('Credenciales inválidas')
      const data = await response.json()
      this.token = data.token
      this.user = data.user
      localStorage.setItem('solaria_office_token', this.token)
      this.showDashboard()
    } catch (error) {
      this.loginError.textContent = error.message
    }
  }

  logout() {
    localStorage.removeItem('solaria_office_token')
    this.token = null
    this.user = null
    this.projects = []
    this.agents = []
    this.showLogin()
  }

  showLogin() {
    this.loginSection.classList.remove('hidden')
    this.layout.classList.add('hidden')
    this.loginError.textContent = ''
  }

  showDashboard() {
    this.loginSection.classList.add('hidden')
    this.layout.classList.remove('hidden')
    this.updateUserChip()
    this.loadData()
  }

  updateUserChip() {
    const initials = (this.user?.name || this.user?.username || 'PM').slice(0, 2).toUpperCase()
    this.userAvatar.textContent = initials
    this.userName.textContent = this.user?.name || this.user?.username || 'Usuario'
    this.userRole.textContent = (this.user?.role || 'Project Manager').toUpperCase()
  }

  async loadData() {
    await this.loadProjectsAndTasks()
    await Promise.all([this.loadOverview(), this.loadAgents()])
    this.renderClients()
    await this.renderDesignHub()
  }

  async fetchWithAuth(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...(options.headers || {}),
      },
    })
    if (!response.ok) throw new Error('Error al consultar API')
    return response.json()
  }

  async loadOverview() {
    try {
      const [overview, publicDashboard] = await Promise.all([
        this.fetchWithAuth(`${this.apiBase}/dashboard/overview`),
        fetch(`${this.apiBase}/public/dashboard`).then((r) => r.json()),
      ])

      const totalProjects = this.projects.length || overview.projects?.total_projects || 0
      const activeProjects =
        this.projects.filter((p) => OfficeUtils.statusClass(p.status) !== 'completed').length || overview.projects?.active_projects || 0
      const tasksInProgress =
        this.tasks.filter((task) => task.status === 'in_progress').length || overview.tasks?.in_progress_tasks || 0
      const activeAgents = this.agents.length || overview.agents?.active_agents || 0
      const criticalAlerts = overview.alerts?.critical_alerts || 0

      const kpis = [
        { label: 'Proyectos activos', value: activeProjects },
        { label: 'Tareas en curso', value: tasksInProgress },
        { label: 'Agentes disponibles', value: activeAgents },
        { label: 'Alertas críticas', value: criticalAlerts },
      ]

      this.overviewKPI.innerHTML = kpis
        .map(
          (kpi) => `
          <div class="kpi-card">
            <span class="kpi-label">${kpi.label}</span>
            <span class="kpi-value">${kpi.value}</span>
          </div>
        `
        )
        .join('')

      const budgets = publicDashboard.projects || {}
      const budgetTotal = this.projects.reduce((acc, p) => acc + (p.budget || 0), 0) || budgets.total_budget || 0
      const averageCompletion =
        this.projects.length
          ? Math.round(
              this.projects.reduce((acc, p) => acc + (p.completion_percentage || 0), 0) / this.projects.length
            )
          : budgets.completion || 0
      const completed = this.projects.filter((p) => OfficeUtils.statusClass(p.status) === 'completed').length || budgets.completed || 0
      const active = activeProjects || budgets.active || 0
      const segments = OfficeUtils.calculateBudgetSegments({ budget: budgetTotal, completion: averageCompletion })
      this.budgetSnapshot.innerHTML = `
        <div class="panel-head">
          <div>
            <p class="eyebrow">Presupuesto consolidado</p>
            <h3>${budgetTotal.toLocaleString('es-MX', { style: 'currency', currency: 'USD' })}</h3>
          </div>
          <div class="kpi-mini">
            <div class="chip">${active} activos</div>
            <div class="chip">${completed} completados</div>
          </div>
        </div>
        <div class="budget-breakdown">
          ${this.renderSegmentCards(segments, budgetTotal)}
        </div>
      `

      this.miniKPIs.innerHTML = `
        <div class="chip">${totalProjects} proyectos</div>
        <div class="chip">${this.tasks.length || overview.tasks.total_tasks || 0} tareas</div>
      `
    } catch (error) {
      this.overviewKPI.innerHTML = '<p class="muted">No se pudo cargar el dashboard.</p>'
    }
  }

  renderBreakdownCard(labelOrSegment, amount, total, color) {
    const segment = typeof labelOrSegment === 'object' ? labelOrSegment : { label: labelOrSegment, amount, color }
    const denominator = total ?? segment.total ?? segment.amount ?? 0
    const percentage = denominator ? Math.round((segment.amount / denominator) * 100) : segment.percentage || 0
    const meterColor = segment.color || color || '#16a34a'
    return `
      <div class="breakdown-card">
        <span class="breakdown-label">${segment.label}</span>
        <span class="breakdown-value">${segment.amount.toLocaleString('es-MX', { style: 'currency', currency: 'USD' })}</span>
        <div class="breakdown-meter"><span style="width:${percentage}%; background:${meterColor}"></span></div>
        <span class="kpi-change">${percentage}%</span>
      </div>
    `
  }

  renderSegmentCards(segments = [], total) {
    return segments
      .map((segment) => this.renderBreakdownCard(segment, segment.amount, total ?? segment.total))
      .join('')
  }

  async loadProjectsAndTasks() {
    try {
      const [projectResponse, tasksResponse] = await Promise.all([
        this.fetchWithAuth(`${this.apiBase}/projects`),
        this.fetchWithAuth(`${this.apiBase}/tasks`),
      ])

      this.tasks = Array.isArray(tasksResponse) ? tasksResponse : tasksResponse?.tasks || []
      const projects = projectResponse.projects || []
      this.projects = OfficeUtils.mergeTasksIntoProjects(projects, this.tasks)

      this.renderProjectFilters()
      this.renderProjectsTable()
      this.populateProjectSelector()
      if (this.projects.length > 0) {
        this.renderProjectDetail(this.projects[0])
      }
    } catch (error) {
      this.projectTable.innerHTML = '<p class="muted">No se pudo cargar proyectos.</p>'
    }
  }

  renderProjectsTable() {
    const filteredProjects = this.applyProjectFilters(this.projects)

    const rows = filteredProjects
      .map((project) => {
        const progress = project.completion_percentage || 0
        const budget = project.budget || 0
        const spent = Math.round(budget * (progress / 100))
        const taxes = Math.round(spent * 0.16)
        const margin = Math.max(budget - spent - taxes, 0)
        return `
          <tr data-project-id="${project.id}" class="project-row">
            <td>${project.name}</td>
            <td>${project.client || 'Sin asignar'}</td>
            <td><span class="status ${OfficeUtils.statusClass(project.status)}">${project.status || 'active'}</span></td>
            <td>
              <div class="progress-bar"><span style="width:${progress}%"></span></div>
              <small class="muted">${progress}%</small>
            </td>
            <td>${this.formatCurrency(budget)}</td>
            <td>${this.formatCurrency(spent)}</td>
            <td>${Math.min(100, Math.round((spent / (budget || 1)) * 100))}%</td>
            <td>${this.formatCurrency(margin)}</td>
          </tr>
        `
      })
      .join('')

    this.projectTable.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th>Cliente</th>
            <th>Estado</th>
            <th>Progreso</th>
            <th>Presupuesto</th>
            <th>Gastado</th>
            <th>% Consumo</th>
            <th>Margen</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `

    this.projectTable.querySelectorAll('.project-row').forEach((row) => {
      row.addEventListener('click', () => {
        const projectId = Number(row.dataset.projectId)
        const project = this.projects.find((p) => p.id === projectId)
        if (project) {
          this.renderProjectDetail(project)
          this.projectSelector.value = project.id
          this.updateBreadcrumb(`Proyecto · ${project.name}`)
        }
      })
    })
  }

  renderProjectFilters() {
    if (!this.projectFilters) return
    const statuses = [
      { key: 'all', label: 'Todos' },
      { key: 'progress', label: 'En progreso' },
      { key: 'risk', label: 'Riesgo' },
      { key: 'paused', label: 'Pausa' },
      { key: 'completed', label: 'Completados' },
    ]

    this.projectFilters.innerHTML = statuses
      .map(
        (status) => `
          <button class="tag ${this.filters.status === status.key ? 'active' : ''}" data-status="${status.key}">
            ${status.label}
          </button>
        `
      )
      .join('')

    this.projectFilters.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.filters.status = btn.dataset.status
        this.renderProjectFilters()
        this.renderProjectsTable()
      })
    })
  }

  applyProjectFilters(projects) {
    if (this.filters.status === 'all') return projects
    return projects.filter((project) => {
      const statusKey = OfficeUtils.statusClass(project.status)
      const normalized = String(project.status || '').toLowerCase()
      return statusKey === this.filters.status || normalized === this.filters.status
    })
  }

  populateProjectSelector() {
    this.projectSelector.innerHTML = this.projects
      .map((p) => `<option value="${p.id}">${p.name}</option>`)
      .join('')
  }

  renderProjectDetail(project) {
    const progress = project.completion_percentage || 0
    const budget = project.budget || 0
    const segments = OfficeUtils.calculateBudgetSegments({ budget, completion: progress })
    const projectTasks = this.tasks.filter((task) => (task.project_id || task.projectId) === project.id)
    const taskStats = this.summarizeTaskStatuses(projectTasks)
    const topTasks = projectTasks.slice(0, 5)

    this.projectDetail.innerHTML = `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Detalle de presupuesto</p>
          <h3>${project.name}</h3>
          <p class="muted">${project.client || 'Cliente por definir'}</p>
        </div>
        <div class="pill">${progress}% progreso</div>
      </div>
      <div class="grid budget-breakdown">
        ${this.renderSegmentCards(segments, budget)}
      </div>
      <div class="panel">
        <h4>Tareas y estados</h4>
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(140px,1fr));">
          <div class="kpi-card"><span class="kpi-label">Total tareas</span><span class="kpi-value">${project.total_tasks || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">En progreso</span><span class="kpi-value">${taskStats.in_progress || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">Completadas</span><span class="kpi-value">${taskStats.completed || 0}</span></div>
          <div class="kpi-card"><span class="kpi-label">Alertas</span><span class="kpi-value">${project.active_alerts || 0}</span></div>
        </div>
        <div class="table">
          <table>
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Estado</th>
                <th>Agente</th>
              </tr>
            </thead>
            <tbody>
              ${
                topTasks.length
                  ? topTasks
                      .map(
                        (task) => `
                          <tr>
                            <td>${task.title || task.name || `Tarea ${task.id}`}</td>
                            <td><span class="status ${OfficeUtils.statusClass(task.status)}">${task.status || 'pending'}</span></td>
                            <td>${task.assigned_agent || task.assigned_agent_id || '—'}</td>
                          </tr>
                        `
                      )
                      .join('')
                  : '<tr><td colspan="3" class="muted">Sin tareas registradas.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  async loadAgents() {
    try {
      this.agents = await this.fetchWithAuth(`${this.apiBase}/agents`)
      const rows = this.agents
        .map((agent) => {
          const type = agent.role && agent.role.toLowerCase().includes('human') ? 'Humano' : 'IA'
          return `
            <tr>
              <td>${agent.name}</td>
              <td>${type}</td>
              <td>${agent.role || 'Especialista'}</td>
              <td>${agent.tasks_assigned || 0}</td>
              <td>${agent.tasks_completed || 0}</td>
              <td>${agent.status || 'active'}</td>
            </tr>
          `
        })
        .join('')

      this.agentsTable.innerHTML = `
        <div class="panel-head">
          <div>
            <p class="eyebrow">Recursos</p>
            <h3>Agentes asignados</h3>
          </div>
        </div>
        <div class="table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Especialidad</th>
                <th>Proyectos activos</th>
                <th>Tareas completadas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `
    } catch (error) {
      this.agentsTable.innerHTML = '<p class="muted">No se pudo cargar agentes.</p>'
    }
  }

  renderClients() {
    if (!this.projects.length) {
      this.clientsTable.innerHTML = '<p class="muted">Sin datos de clientes.</p>'
      return
    }

    const clients = OfficeUtils.summarizeProjectsByClient(this.projects)

    const rows = clients
      .map(
        (client) => `
          <tr>
            <td>${client.name}</td>
            <td>${client.projects.length}</td>
            <td>${client.active}</td>
            <td>${this.formatCurrency(client.budget)}</td>
            <td>${client.progress}%</td>
          </tr>
        `
      )
      .join('')

    this.clientsTable.innerHTML = `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Clientes</p>
          <h3>Cartera actual</h3>
        </div>
      </div>
      <div class="table">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Proyectos</th>
              <th>Activos</th>
              <th>Presupuesto total</th>
              <th>Progreso medio</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `
  }

  async renderDesignHub(project) {
    const selected = project || this.projects.find((p) => p.id === Number(this.projectSelector.value)) || this.projects[0]
    if (!selected) {
      this.designHub.innerHTML = '<p class="muted">Selecciona un proyecto para ver assets.</p>'
      return
    }

    const documents = await this.fetchProjectDocuments(selected.id)
    const fallbackAssets = [
      { name: 'Brand Kit', tag: 'Brand', link: '#', desc: 'Colores, tipografías y uso de logo.' },
      { name: 'UI Kit', tag: 'UI', link: '#', desc: 'Componentes compartidos para el cliente.' },
      { name: 'Copy Board', tag: 'Copy', link: '#', desc: 'Mensajes clave y tono de voz.' },
      { name: 'Legal Docs', tag: 'Legal', link: '#', desc: 'Contratos y NDA vigentes.' },
    ]

    const assetsToRender = (documents || []).length
      ? documents.map((doc) => ({ name: doc.name || doc.title, tag: doc.category || 'Doc', link: doc.url || '#', desc: doc.description || doc.type || 'Documento del proyecto' }))
      : fallbackAssets

    this.designHub.innerHTML = `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Design Hub</p>
          <h3>${selected.name}</h3>
          <p class="muted">Centraliza logos, guidelines y enlaces externos (Figma, Notion).</p>
        </div>
      </div>
      <div class="asset-grid">
        ${assetsToRender
          .map(
            (asset) => `
            <div class="asset-card">
              <div class="asset-tag">${asset.tag}</div>
              <strong>${asset.name}</strong>
              <p class="muted">${asset.desc}</p>
              <a href="${asset.link}" class="muted">Abrir</a>
            </div>
          `
          )
          .join('')}
      </div>
    `
  }

  async fetchProjectDocuments(projectId) {
    if (this.documentsCache.has(projectId)) {
      return this.documentsCache.get(projectId)
    }

    try {
      const response = await this.fetchWithAuth(`${this.apiBase}/projects/${projectId}/documents`)
      const docs = Array.isArray(response) ? response : response?.documents || []
      this.documentsCache.set(projectId, docs)
      return docs
    } catch (error) {
      this.documentsCache.set(projectId, [])
      return []
    }
  }

  summarizeTaskStatuses(tasks = []) {
    return tasks.reduce((acc, task) => {
      const key = task.status || 'pending'
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }

  formatCurrency(value) {
    return (value || 0).toLocaleString('es-MX', { style: 'currency', currency: 'USD' })
  }

  showSection(section, btn) {
    document.querySelectorAll('.section').forEach((el) => el.classList.add('hidden'))
    document.getElementById(`section-${section}`).classList.remove('hidden')
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'))
    btn.classList.add('active')
    this.updateBreadcrumb(btn.textContent)
  }

  updateBreadcrumb(text) {
    this.breadcrumbs.textContent = text
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const office = new OfficeDashboard()
  office.init()
})

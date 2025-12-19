(function (globalScope) {
  function statusClass(status) {
    if (!status) return 'progress'
    const normalized = String(status).toLowerCase()
    if (['planning', 'development', 'in_progress', 'active'].includes(normalized)) return 'progress'
    if (['blocked', 'risk', 'delayed', 'at_risk'].includes(normalized)) return 'risk'
    if (['paused', 'on_hold'].includes(normalized)) return 'paused'
    if (['completed', 'done', 'closed'].includes(normalized)) return 'completed'
    return 'progress'
  }

  function calculateBudgetSegments({ budget = 0, completion = 0, taxRate = 0.16, humanShare = 0.45, aiShare = 0.2, marginFloor = 0.15 }) {
    const safeBudget = Math.max(budget, 0)
    const spent = safeBudget * Math.min(Math.max(completion, 0), 100) / 100
    const taxes = Math.round(spent * taxRate)
    const humans = Math.round(spent * humanShare)
    const ai = Math.round(spent * aiShare)
    const operational = Math.max(spent - humans - ai, 0)
    const marginBase = safeBudget - humans - ai - taxes - operational
    const margin = Math.max(Math.round(safeBudget * marginFloor), Math.round(marginBase))

    const segments = [
      { key: 'total', label: 'Total aprobado', amount: safeBudget, color: '#0ea5e9' },
      { key: 'humans', label: 'Agentes humanos', amount: humans, color: '#f59e0b' },
      { key: 'ai', label: 'Agentes IA / APIs', amount: ai, color: '#22c55e' },
      { key: 'taxes', label: 'Impuestos', amount: taxes, color: '#facc15' },
      { key: 'operational', label: 'Otros gastos', amount: operational, color: '#a855f7' },
      { key: 'margin', label: 'Margen estimado', amount: margin, color: '#0ea5e9' }
    ]

    return segments.map((segment) => ({
      ...segment,
      percentage: safeBudget ? Math.min(100, Math.round((segment.amount / safeBudget) * 100)) : 0
    }))
  }

  function isTruthy(value) {
    if (value === undefined || value === null) return false
    if (value === true || value === 1) return true
    const normalized = String(value).toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  }


  function mergeTasksIntoProjects(projects = [], tasks = []) {
    const tasksByProject = tasks.reduce((acc, task) => {
      const projectId = task.project_id || task.projectId
      if (!projectId) return acc
      if (!acc[projectId]) acc[projectId] = []
      acc[projectId].push(task)
      return acc
    }, {})

    return projects.map((project) => {
      const projectTasks = tasksByProject[project.id] || []
      const completed = projectTasks.filter((t) => t.status === 'completed').length
      const total = projectTasks.length || project.total_tasks || 0
      const completionFromTasks = total > 0 ? Math.round((completed / total) * 100) : null
      const completion_percentage = completionFromTasks ?? project.completion_percentage ?? 0
      return {
        ...project,
        total_tasks: total,
        completed_tasks: project.completed_tasks ?? completed,
        completion_percentage
      }
    })
  }

  function filterOfficeProjects(projects = [], businessName = 'Solaria Agency') {
    const normalized = businessName.toLowerCase()
    return projects.filter((project) => {
      const isOptOut = isTruthy(project.office_hidden || project.hide_from_office)
      if (isOptOut) return false

      const isOptIn = isTruthy(project.office_visible || project.share_with_office)
      const origin = (project.office_origin || project.origin || project.source || '').toLowerCase()
      const isOfficeOrigin = ['office', 'agency'].includes(origin)
      const hasOfficePrefix = (project.code || '').toLowerCase().startsWith('office-')
      const tags = Array.isArray(project.tags) ? project.tags : []
      const hasTag = tags.some((tag) => {
        if (typeof tag === 'string') {
          const normalizedTag = tag.toLowerCase()
          return normalizedTag === 'office' || normalizedTag === 'solaria-agency'
        }
        if (tag?.label) {
          const normalizedTag = String(tag.label).toLowerCase()
          return normalizedTag === 'office' || normalizedTag === 'solaria agency'
        }
        return false
      })
      const businessFields = [project.business, project.business_name, project.businessName, project.client, project.company]
      const hasBusinessMatch = businessFields.some((field) => field && String(field).toLowerCase() === normalized)

      const hasOfficeMarker = isOptIn || isOfficeOrigin || hasOfficePrefix || hasTag
      return hasOfficeMarker || (hasBusinessMatch && isOptIn)
    })
  }


  function summarizeProjectsByClient(projects = []) {
    const map = new Map()
    projects.forEach((project) => {
      const clientName = project.client || 'Cliente sin nombre'
      if (!map.has(clientName)) {
        map.set(clientName, {
          name: clientName,
          projects: [],
          active: 0,
          budget: 0,
          progress: 0
        })
      }
      const entry = map.get(clientName)
      entry.projects.push(project)
      entry.budget += project.budget || 0
      entry.progress += project.completion_percentage || 0
      if (!['completed', 'cancelled'].includes(String(project.status || '').toLowerCase())) {
        entry.active += 1
      }
    })

    return Array.from(map.values()).map((entry) => ({
      ...entry,
      progress: entry.projects.length ? Math.round(entry.progress / entry.projects.length) : 0
    }))
  }

  const OfficeUtils = {
    statusClass,
    calculateBudgetSegments,
    mergeTasksIntoProjects,
    summarizeProjectsByClient,
    filterOfficeProjects
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfficeUtils
  }
  if (globalScope) {
    globalScope.OfficeUtils = OfficeUtils
  }
})(typeof window !== 'undefined' ? window : globalThis)

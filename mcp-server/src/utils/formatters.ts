/**
 * Human-Readable Formatters
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-002
 *
 * Utilities for formatting structured data into human-readable strings
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface Task {
  task_code: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  progress: number;
  agent_name?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours?: number;
  deadline?: string;
}

interface Project {
  project_code: string;
  name: string;
  status: string;
  progress?: number;
  budget?: number;
  deadline?: string;
}

interface Agent {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'busy' | 'inactive';
}

interface Sprint {
  sprint_number: number;
  name: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  progress?: number;
}

// ============================================================================
// Icon Mappings
// ============================================================================

const StatusIcons = {
  task: {
    pending: '⏳',
    in_progress: '🔄',
    completed: '✅',
    blocked: '🚫',
  },
  priority: {
    low: '🔵',
    medium: '🟡',
    high: '🟠',
    critical: '🔴',
  },
  sprint: {
    planned: '📋',
    active: '🚀',
    completed: '✅',
    cancelled: '❌',
  },
  agent: {
    active: '🟢',
    busy: '🟡',
    inactive: '⚫',
  },
};

// ============================================================================
// Task Formatters
// ============================================================================

export function formatTask(task: Task): string {
  const statusIcon = StatusIcons.task[task.status] || '❓';
  const priorityIcon = task.priority ? StatusIcons.priority[task.priority] : '';

  const lines = [
    `${statusIcon} ${task.task_code}: ${task.title}`,
    `   Status: ${task.status} | Progress: ${task.progress}%`,
  ];

  if (task.agent_name) {
    lines.push(`   Assigned: ${task.agent_name}`);
  }

  if (task.priority) {
    lines.push(`   Priority: ${priorityIcon} ${task.priority}`);
  }

  if (task.estimated_hours) {
    lines.push(`   Estimated: ${task.estimated_hours}h`);
  }

  if (task.deadline) {
    lines.push(`   Deadline: ${formatDate(task.deadline)}`);
  }

  return lines.join('\n');
}

export function formatTaskList(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const lines = [
    `Found ${tasks.length} task${tasks.length === 1 ? '' : 's'}:`,
    '',
  ];

  tasks.forEach((task, index) => {
    const statusIcon = StatusIcons.task[task.status] || '❓';
    lines.push(
      `${index + 1}. ${statusIcon} ${task.task_code}: ${task.title}`,
      `   Status: ${task.status} | Progress: ${task.progress}% | Assigned: ${task.agent_name || 'Unassigned'}`,
      ''
    );
  });

  return lines.join('\n');
}

export function formatTaskSummary(data: {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  blocked: number;
}): string {
  const completionRate = data.total > 0
    ? Math.round((data.completed / data.total) * 100)
    : 0;

  return `
Task Summary:
─────────────────────
Total: ${data.total}
⏳ Pending: ${data.pending}
🔄 In Progress: ${data.in_progress}
✅ Completed: ${data.completed}
🚫 Blocked: ${data.blocked}
Completion Rate: ${completionRate}%
  `.trim();
}

// ============================================================================
// Project Formatters
// ============================================================================

export function formatProject(project: Project): string {
  const lines = [
    `📁 ${project.project_code}: ${project.name}`,
    `   Status: ${project.status}`,
  ];

  if (project.progress !== undefined) {
    lines.push(`   Progress: ${project.progress}%`);
  }

  if (project.budget) {
    lines.push(`   Budget: $${project.budget.toLocaleString()}`);
  }

  if (project.deadline) {
    lines.push(`   Deadline: ${formatDate(project.deadline)}`);
  }

  return lines.join('\n');
}

export function formatProjectList(projects: Project[]): string {
  if (projects.length === 0) {
    return 'No projects found.';
  }

  const lines = [
    `Found ${projects.length} project${projects.length === 1 ? '' : 's'}:`,
    '',
  ];

  projects.forEach((project, index) => {
    lines.push(
      `${index + 1}. 📁 ${project.project_code}: ${project.name}`,
      `   Status: ${project.status} | Progress: ${project.progress || 0}%`,
      ''
    );
  });

  return lines.join('\n');
}

// ============================================================================
// Agent Formatters
// ============================================================================

export function formatAgent(agent: Agent): string {
  const statusIcon = StatusIcons.agent[agent.status] || '❓';

  return `
${statusIcon} Agent #${agent.id}: ${agent.name}
   Role: ${agent.role}
   Status: ${agent.status}
  `.trim();
}

export function formatAgentList(agents: Agent[]): string {
  if (agents.length === 0) {
    return 'No agents found.';
  }

  const lines = [
    `Found ${agents.length} agent${agents.length === 1 ? '' : 's'}:`,
    '',
  ];

  agents.forEach((agent, index) => {
    const statusIcon = StatusIcons.agent[agent.status] || '❓';
    lines.push(
      `${index + 1}. ${statusIcon} ${agent.name} (#${agent.id})`,
      `   Role: ${agent.role} | Status: ${agent.status}`,
      ''
    );
  });

  return lines.join('\n');
}

// ============================================================================
// Sprint Formatters
// ============================================================================

export function formatSprint(sprint: Sprint): string {
  const statusIcon = StatusIcons.sprint[sprint.status] || '❓';

  const lines = [
    `${statusIcon} Sprint ${sprint.sprint_number}: ${sprint.name}`,
    `   Status: ${sprint.status}`,
  ];

  if (sprint.start_date && sprint.end_date) {
    lines.push(`   Duration: ${formatDate(sprint.start_date)} → ${formatDate(sprint.end_date)}`);
  }

  if (sprint.progress !== undefined) {
    lines.push(`   Progress: ${sprint.progress}%`);
  }

  return lines.join('\n');
}

export function formatSprintList(sprints: Sprint[]): string {
  if (sprints.length === 0) {
    return 'No sprints found.';
  }

  const lines = [
    `Found ${sprints.length} sprint${sprints.length === 1 ? '' : 's'}:`,
    '',
  ];

  sprints.forEach((sprint, index) => {
    const statusIcon = StatusIcons.sprint[sprint.status] || '❓';
    lines.push(
      `${index + 1}. ${statusIcon} Sprint ${sprint.sprint_number}: ${sprint.name}`,
      `   Status: ${sprint.status} | Progress: ${sprint.progress || 0}%`,
      ''
    );
  });

  return lines.join('\n');
}

// ============================================================================
// Capability Formatters
// ============================================================================

export interface Capability {
  skill_name: string;
  version: string;
  active: boolean;
  registered_at?: string;
}

export function formatCapabilities(agent_id: number, capabilities: Capability[]): string {
  if (capabilities.length === 0) {
    return `Agent ${agent_id} has no registered capabilities.`;
  }

  const activeCount = capabilities.filter(c => c.active).length;

  const lines = [
    `Agent ${agent_id} Capabilities:`,
    `Total: ${capabilities.length} | Active: ${activeCount}`,
    '',
  ];

  capabilities.forEach(cap => {
    const icon = cap.active ? '✓' : '✗';
    lines.push(`  ${icon} ${cap.skill_name} v${cap.version}`);
  });

  return lines.join('\n');
}

// ============================================================================
// Table Formatters
// ============================================================================

export function formatTable(data: any[], columns: string[]): string {
  if (data.length === 0) {
    return 'No data available.';
  }

  // Calculate column widths
  const widths: { [key: string]: number } = {};
  columns.forEach(col => {
    widths[col] = Math.max(
      col.length,
      ...data.map(row => String(row[col] || '').length)
    );
  });

  // Header
  const header = columns.map(col =>
    col.padEnd(widths[col])
  ).join(' | ');

  const separator = columns.map(col =>
    '─'.repeat(widths[col])
  ).join('─┼─');

  // Rows
  const rows = data.map(row =>
    columns.map(col =>
      String(row[col] || '').padEnd(widths[col])
    ).join(' | ')
  );

  return [header, separator, ...rows].join('\n');
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  const percent = Math.round((value / total) * 100);
  return `${percent}%`;
}

export function formatProgressBar(progress: number, width: number = 20): string {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;

  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`;
}

// ============================================================================
// Formatter Registry
// ============================================================================

// ============================================================================
// Health Formatters
// ============================================================================

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  latency_ms?: number;
  details?: Record<string, any>;
}

interface HealthData {
  status: HealthStatus;
  timestamp: string;
  uptime_seconds: number;
  version: string;
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
    disk: HealthCheckResult;
    memory: HealthCheckResult;
    cpu: HealthCheckResult;
  };
  summary: {
    total_checks: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

const HealthIcons: Record<HealthStatus, string> = {
  healthy: '✅',
  degraded: '⚠️',
  unhealthy: '❌',
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
}

export function formatHealth(data: HealthData): string {
  const lines = [
    'System Health Report',
    '====================',
    `Status: ${data.status.toUpperCase()} ${HealthIcons[data.status]}`,
    `Uptime: ${formatUptime(data.uptime_seconds)}`,
    `Version: ${data.version}`,
    '',
    'Checks:',
  ];

  const checkOrder: (keyof typeof data.checks)[] = ['database', 'redis', 'disk', 'memory', 'cpu'];

  for (const checkName of checkOrder) {
    const check = data.checks[checkName];
    const icon = HealthIcons[check.status];
    const name = checkName.charAt(0).toUpperCase() + checkName.slice(1).padEnd(7);

    let detail = '';
    if (check.latency_ms !== undefined) {
      detail = `(${check.latency_ms}ms)`;
    } else if (check.details?.use_percent !== undefined) {
      const total = check.details.total || check.details.total_size || '';
      detail = `(${check.details.use_percent}% of ${total})`;
    } else if (check.details?.load_1m !== undefined) {
      detail = `(load: ${check.details.load_1m}/${check.details.cpu_count})`;
    } else if (check.details?.configured === false) {
      detail = '(not configured)';
    }

    lines.push(`  ${name} ${icon} ${check.status} ${detail}`);
  }

  lines.push('');
  lines.push(`Summary: ${data.summary.passed} passed, ${data.summary.warnings} warning, ${data.summary.failed} failed`);

  return lines.join('\n');
}

// ============================================================================
// Stats Formatters
// ============================================================================

interface TaskStats {
  total: number;
  by_status: {
    pending: number;
    in_progress: number;
    completed: number;
    blocked: number;
  };
  by_priority: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface VelocityStats {
  current_sprint: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
}

interface StatsData {
  project_id?: number;
  project_name?: string;
  tasks: TaskStats;
  velocity: VelocityStats;
  completion_rate: number;
  health_score: number;
  agents_active: number;
  agents_total: number;
}

const TrendIcons: Record<string, string> = {
  up: '↑',
  down: '↓',
  stable: '→',
};

export function formatStats(data: StatsData): string {
  const lines = [
    'Project Statistics Dashboard',
    '============================',
  ];

  if (data.project_name) {
    lines.push(`Project: ${data.project_name} (#${data.project_id})`);
    lines.push('');
  }

  // Task Distribution
  lines.push('Task Distribution:');
  const taskTotal = data.tasks.total || 1;
  const statusBars = [
    `  ⏳ Pending:     ${formatProgressBar(Math.round((data.tasks.by_status.pending / taskTotal) * 100), 15)} (${data.tasks.by_status.pending})`,
    `  🔄 In Progress: ${formatProgressBar(Math.round((data.tasks.by_status.in_progress / taskTotal) * 100), 15)} (${data.tasks.by_status.in_progress})`,
    `  ✅ Completed:   ${formatProgressBar(Math.round((data.tasks.by_status.completed / taskTotal) * 100), 15)} (${data.tasks.by_status.completed})`,
    `  🚫 Blocked:     ${formatProgressBar(Math.round((data.tasks.by_status.blocked / taskTotal) * 100), 15)} (${data.tasks.by_status.blocked})`,
  ];
  lines.push(...statusBars);
  lines.push('');

  // Priority Distribution
  lines.push('Priority Distribution:');
  const priorityBars = [
    `  🔴 Critical: ${data.tasks.by_priority.critical}`,
    `  🟠 High:     ${data.tasks.by_priority.high}`,
    `  🟡 Medium:   ${data.tasks.by_priority.medium}`,
    `  🔵 Low:      ${data.tasks.by_priority.low}`,
  ];
  lines.push(...priorityBars);
  lines.push('');

  // Velocity
  const trendIcon = TrendIcons[data.velocity.trend] || '→';
  lines.push('Velocity:');
  lines.push(`  Current Sprint: ${data.velocity.current_sprint} pts`);
  lines.push(`  Average:        ${data.velocity.average} pts ${trendIcon}`);
  lines.push('');

  // Metrics
  lines.push('Key Metrics:');
  lines.push(`  Completion Rate: ${formatProgressBar(data.completion_rate, 15)}`);
  lines.push(`  Health Score:    ${formatProgressBar(data.health_score, 15)}`);
  lines.push(`  Active Agents:   ${data.agents_active}/${data.agents_total}`);

  return lines.join('\n');
}

// ============================================================================
// Document Formatters
// ============================================================================

interface InlineDocument {
  id: number;
  name: string;
  type: string;
  content_md?: string;
  version: number;
  created_at: string;
  updated_at: string;
  project_name?: string;
}

export function formatDocument(doc: InlineDocument): string {
  const lines = [
    `📄 ${doc.name}`,
    `   Type: ${doc.type} | Version: ${doc.version}`,
    `   Created: ${formatDate(doc.created_at)}`,
    `   Updated: ${formatDate(doc.updated_at)}`,
  ];

  if (doc.project_name) {
    lines.push(`   Project: ${doc.project_name}`);
  }

  if (doc.content_md) {
    lines.push('');
    lines.push('Content Preview:');
    lines.push('─'.repeat(40));
    // Show first 500 chars of content
    const preview = doc.content_md.length > 500
      ? doc.content_md.substring(0, 500) + '...'
      : doc.content_md;
    lines.push(preview);
  }

  return lines.join('\n');
}

export function formatDocumentList(docs: InlineDocument[]): string {
  if (docs.length === 0) {
    return 'No documents found.';
  }

  const lines = [
    `Found ${docs.length} document${docs.length === 1 ? '' : 's'}:`,
    '',
  ];

  docs.forEach((doc, index) => {
    lines.push(
      `${index + 1}. 📄 ${doc.name}`,
      `   Type: ${doc.type} | Version: ${doc.version} | Updated: ${formatDate(doc.updated_at)}`,
      ''
    );
  });

  return lines.join('\n');
}

export const Formatters = {
  task: formatTask,
  taskList: formatTaskList,
  taskSummary: formatTaskSummary,
  project: formatProject,
  projectList: formatProjectList,
  agent: formatAgent,
  agentList: formatAgentList,
  sprint: formatSprint,
  sprintList: formatSprintList,
  capabilities: formatCapabilities,
  table: formatTable,
  progressBar: formatProgressBar,
  health: formatHealth,
  stats: formatStats,
  document: formatDocument,
  documentList: formatDocumentList,
};

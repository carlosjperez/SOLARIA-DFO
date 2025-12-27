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
};

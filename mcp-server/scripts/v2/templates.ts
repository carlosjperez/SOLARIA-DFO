# SOLARIA DFO MCP v2.0 Script Library
# Pre-defined examples for common operations using run_code
#
# Usage:
#   await run_code({
#     code: getScriptTemplate('projects-list'),
#     timeout: 5000
#   })
#
# @author ECO-Lambda | SOLARIA DFO
# @date 2026-01-06
# @task MCP-SKETCH-016

export async function getScriptTemplate(name: string): Promise<string> {
  const templates: Record<string, string> = {
    'projects-list': `
// List all projects
const projects = await apiCall('/projects');
console.log('Projects:', projects);
return { projects };
`,

    'projects-get': `
// Get specific project
const project = await apiCall('/projects/1');
console.log('Project:', project);
return { project };
`,

    'projects-create': `
// Create new project
const project = await apiCall('/projects', {
  method: 'POST',
  body: JSON.stringify({
    name: 'New Project',
    client: 'Client Name',
    description: 'Description',
    budget: 100000,
    status: 'planning',
    priority: 'medium'
  })
});
console.log('Created project:', project);
return { project };
`,

    'projects-update': `
// Update project
const project = await apiCall('/projects/1', {
  method: 'PUT',
  body: JSON.stringify({
    status: 'active',
    budget: 150000
  })
});
console.log('Updated project:', project);
return { project };
`,

    'tasks-list': `
// List tasks for a project
const tasks = await apiCall('/tasks?project_id=2');
console.log('Tasks:', tasks);
return { tasks };
`,

    'tasks-create': `
// Create a new task
const task = await apiCall('/tasks', {
  method: 'POST',
  body: JSON.stringify({
    project_id: 2,
    title: 'Implement feature',
    description: 'Description',
    priority: 'high',
    status: 'pending'
  })
});
console.log('Created task:', task);
return { task };
`,

    'tasks-update': `
// Update task status
const task = await apiCall('/tasks/1', {
  method: 'PUT',
  body: JSON.stringify({
    status: 'in_progress',
    progress: 25
  })
});
console.log('Updated task:', task);
return { task };
`,

    'tasks-complete': `
// Mark task as completed
const task = await apiCall('/tasks/1', {
  method: 'PUT',
  body: JSON.stringify({
    status: 'completed',
    progress: 100,
    completion_notes: 'Work completed successfully'
  })
});
console.log('Completed task:', task);
return { task };
`,

    'agents-list': `
// List all agents
const agents = await apiCall('/agents');
console.log('Agents:', agents);
return { agents };
`,

    'agents-update-status': `
// Update agent status
const agent = await apiCall('/agents/1/status', {
  method: 'PUT',
  body: JSON.stringify({
    status: 'busy'
  })
});
console.log('Updated agent:', agent);
return { agent };
`,

    'memory-create': `
// Create a memory
const memory = await apiCall('/memories', {
  method: 'POST',
  body: JSON.stringify({
    content: 'Important decision made',
    tags: JSON.stringify(['decision', 'architecture']),
    importance: 0.9
  })
});
console.log('Created memory:', memory);
return { memory };
`,

    'memory-search': `
// Search memories
const results = await apiCall('/memories/search?query=decision');
console.log('Memories:', results);
return { results };
`,

    'memory-semantic': `
// Semantic search
const results = await apiCall('/memories/semantic-search?query=authentication');
console.log('Semantic results:', results);
return { results };
`,

    'dashboard-overview': `
// Get dashboard overview
const overview = await apiCall('/dashboard/overview');
console.log('Overview:', overview);
return { overview };
`,

    'multi-operation': `
// Example: Create tasks in batch and get overview
const [projects, overview] = await Promise.all([
  apiCall('/projects'),
  apiCall('/dashboard/overview')
]);

console.log('Projects:', projects);
console.log('Overview:', overview);
return { projects, overview };
`,
  };

  const template = templates[name];

  if (!template) {
    throw new Error(`Template "${name}" not found. Available: ${Object.keys(templates).join(', ')}`);
  }

  return template;
}

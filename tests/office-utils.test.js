const { test } = require('node:test')
const assert = require('node:assert/strict')
const { calculateBudgetSegments, mergeTasksIntoProjects, summarizeProjectsByClient, statusClass } = require('../dashboard/public/office/office-utils')

const SAMPLE_PROJECTS = [
  { id: 1, name: 'Alpha', budget: 10000, completion_percentage: 50, status: 'in_progress', client: 'Solaris' },
  { id: 2, name: 'Beta', budget: 20000, completion_percentage: 80, status: 'completed', client: 'Lumen' },
]

const SAMPLE_TASKS = [
  { id: 1, project_id: 1, status: 'completed' },
  { id: 2, project_id: 1, status: 'in_progress' },
  { id: 3, project_id: 2, status: 'completed' },
]

test('calculateBudgetSegments keeps percentages within 0-100', () => {
  const segments = calculateBudgetSegments({ budget: 1000, completion: 50 })
  const percentages = segments.map((s) => s.percentage)
  assert.strictEqual(Math.max(...percentages) <= 100, true)
  assert.strictEqual(Math.min(...percentages) >= 0, true)
})

test('mergeTasksIntoProjects injects task stats and completion', () => {
  const merged = mergeTasksIntoProjects(SAMPLE_PROJECTS, SAMPLE_TASKS)
  const projectOne = merged.find((p) => p.id === 1)
  const projectTwo = merged.find((p) => p.id === 2)

  assert.strictEqual(projectOne.completed_tasks, 1)
  assert.strictEqual(projectOne.total_tasks, 2)
  assert.strictEqual(projectOne.completion_percentage >= 50, true)

  assert.strictEqual(projectTwo.completed_tasks, 1)
  assert.strictEqual(projectTwo.total_tasks, 1)
  assert.strictEqual(projectTwo.completion_percentage >= 50, true)
})

test('summarizeProjectsByClient aggregates progress and budget', () => {
  const summary = summarizeProjectsByClient(SAMPLE_PROJECTS)
  const solaris = summary.find((c) => c.name === 'Solaris')
  const lumen = summary.find((c) => c.name === 'Lumen')

  assert.strictEqual(solaris.projects.length, 1)
  assert.strictEqual(solaris.budget, 10000)
  assert.strictEqual(solaris.progress, 50)

  assert.strictEqual(lumen.projects.length, 1)
  assert.strictEqual(lumen.budget, 20000)
  assert.strictEqual(lumen.progress, 80)
})

test('statusClass normalizes statuses to UI-friendly keys', () => {
  assert.strictEqual(statusClass('in_progress'), 'progress')
  assert.strictEqual(statusClass('blocked'), 'risk')
  assert.strictEqual(statusClass('completed'), 'completed')
})

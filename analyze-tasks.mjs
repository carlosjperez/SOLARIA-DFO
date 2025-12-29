#!/usr/bin/env node
import { readFileSync } from 'fs';

// Read the tasks file
const tasksFile = process.argv[2];
const data = JSON.parse(readFileSync(tasksFile, 'utf-8'));
const tasks = JSON.parse(data[0].text);

// Filter: exclude completed and N8N epic (37)
const pendingTasks = tasks.filter(t =>
  t.status !== 'completed' &&
  t.epic_id !== 37
);

// Group by epic
const byEpic = {};
pendingTasks.forEach(task => {
  const epicKey = task.epic_id || 'sin-epic';
  if (!byEpic[epicKey]) {
    byEpic[epicKey] = {
      epic_id: task.epic_id,
      epic_name: task.epic_name || 'Sin Epic',
      epic_number: task.epic_number,
      sprint_name: task.sprint_name,
      tasks: []
    };
  }
  byEpic[epicKey].tasks.push({
    id: task.id,
    code: task.task_code,
    title: task.title,
    status: task.status,
    priority: task.priority,
    estimated_hours: task.estimated_hours,
    progress: task.progress,
    items_total: task.items_total,
    items_completed: task.items_completed
  });
});

// Sort by epic number
const sorted = Object.values(byEpic).sort((a, b) => {
  if (a.epic_id === null) return 1;
  if (b.epic_id === null) return -1;
  return (a.epic_number || 0) - (b.epic_number || 0);
});

// Output summary
console.log('\n='.repeat(80));
console.log('ANÁLISIS DE TAREAS PENDIENTES - PROYECTO DFO');
console.log('='.repeat(80));
console.log(`\nTotal tareas: ${tasks.length}`);
console.log(`Completadas: ${tasks.filter(t => t.status === 'completed').length}`);
console.log(`Tareas N8N (excluidas): ${tasks.filter(t => t.epic_id === 37).length}`);
console.log(`Pendientes (sin N8N): ${pendingTasks.length}`);
console.log(`\nAgrupadas en ${sorted.length} epics\n`);

sorted.forEach(epic => {
  console.log('\n' + '─'.repeat(80));
  console.log(`EPIC #${epic.epic_number || 'N/A'}: ${epic.epic_name}`);
  if (epic.sprint_name) {
    console.log(`Sprint: ${epic.sprint_name}`);
  }
  console.log(`Tareas pendientes: ${epic.tasks.length}`);
  console.log('─'.repeat(80));

  epic.tasks.forEach((task, i) => {
    console.log(`\n${i + 1}. [${task.code}] ${task.title}`);
    console.log(`   Estado: ${task.status} | Prioridad: ${task.priority} | Estimado: ${task.estimated_hours}h`);
    console.log(`   Progreso: ${task.progress}% (${task.items_completed}/${task.items_total} subtareas)`);
  });
});

console.log('\n' + '='.repeat(80));

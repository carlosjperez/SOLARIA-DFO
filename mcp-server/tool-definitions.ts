/**
 * MCP Tool Definitions v2.0 (Sketch Pattern)
 * Only 2 core tools: get_context + run_code
 *
 * @module tool-definitions
 * @version 2.0.0
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MCP-SKETCH-018
 */

import { get_context_tool } from './src/endpoints/get-context.js';
import { run_code_tool } from './src/endpoints/run-code.js';
import { set_project_context_tool } from './src/endpoints/set-project-context.js';

export const toolDefinitions = [
  get_context_tool,
  run_code_tool,
  set_project_context_tool,
];

export const resourceDefinitions = [
  {
    uri: 'solaria://dashboard/overview',
    name: 'Dashboard Overview',
    description: 'Dashboard overview data',
    mimeType: 'application/json',
  },
  {
    uri: 'solaria://projects/list',
    name: 'Projects List',
    description: 'All projects',
    mimeType: 'application/json',
  },
  {
    uri: 'solaria://tasks/list',
    name: 'Tasks List',
    description: 'All tasks',
    mimeType: 'application/json',
  },
  {
    uri: 'solaria://agents/list',
    name: 'Agents List',
    description: 'All agents',
    mimeType: 'application/json',
  },
];

console.log(`[tool-definitions] Loaded ${toolDefinitions.length} tools (Sketch Pattern v2.0)`);

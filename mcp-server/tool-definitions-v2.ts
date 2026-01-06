/**
 * MCP Tool Definitions v2.0 (Sketch Pattern)
 * Only 2 core tools: get_context + run_code
 *
 * @module tool-definitions-v2
 * @version 2.0.0
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MCP-SKETCH-018
 */

import { get_context_tool } from 'src/endpoints/get-context.js';
import { run_code_tool } from 'src/endpoints/run-code.js';

export const toolDefinitions = [
  // SKETCH PATTERN CORE TOOL 1: get_context
  // Unified endpoint to get system state in a single call
  // Replaces: get_dashboard_overview, get_stats, get_health, list_projects, etc.
  get_context_tool,

  // SKETCH PATTERN CORE TOOL 2: run_code
  // Executes arbitrary JavaScript/TypeScript code in secure sandbox with DFO API access
  // Replaces: All 70+ old tools - users write custom scripts instead
  run_code_tool,
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

console.log(`[tool-definitions-v2] Loaded ${toolDefinitions.length} tools (Sketch Pattern)`);

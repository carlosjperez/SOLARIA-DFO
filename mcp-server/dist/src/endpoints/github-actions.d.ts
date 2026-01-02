/**
 * GitHub Actions Integration Endpoint Implementation
 *
 * @author ECO-Lambda | DFO 4.0 Epic 3 Sprint 3.1
 * @date 2025-12-31
 * @task DFO-3003
 *
 * Provides MCP tools for GitHub Actions integration:
 * - Trigger workflows from DFO tasks
 * - Monitor workflow run status
 * - Auto-create GitHub issues from tasks
 * - Auto-create GitHub pull requests from tasks
 */
import { Tool } from '../types/mcp.js';
/**
 * Trigger a GitHub Actions workflow
 */
export declare const triggerWorkflow: Tool;
/**
 * Get GitHub Actions workflow run status
 */
export declare const getWorkflowStatus: Tool;
/**
 * Create GitHub issue from DFO task
 */
export declare const createIssueFromTask: Tool;
/**
 * Create GitHub pull request from DFO task
 */
export declare const createPRFromTask: Tool;
export declare const githubActionsTools: Tool[];

/**
 * Agent Execution Endpoint Implementation
 *
 * @author ECO-Lambda | DFO 4.0 Implementation
 * @date 2025-12-30
 * @task DFO-189
 *
 * MCP tools for BullMQ-based parallel agent execution system.
 * Provides queue management, job status tracking, and worker monitoring.
 */
import { Tool } from '../types/mcp.js';
export declare const agentExecutionTools: Tool[];
export declare const queueAgentJobTool: Tool;
export declare const getAgentJobStatusTool: Tool;
export declare const cancelAgentJobTool: Tool;
export declare const listActiveAgentJobsTool: Tool;

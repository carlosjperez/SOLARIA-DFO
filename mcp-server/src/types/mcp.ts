/**
 * MCP Type Definitions
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 */

import { z, ZodSchema } from 'zod';

/**
 * MCP Tool Definition
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: ZodSchema;
  execute: (params: any) => Promise<any>;
}

/**
 * MCP Tool Definition (for handlers.ts compatibility)
 */
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * MCP Resource Definition
 */
export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

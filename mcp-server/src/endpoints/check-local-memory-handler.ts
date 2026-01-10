/**
 * Check Local Memory Tool Handler
 *
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MEM-005
 */

import type { MCPToolDefinition } from '../types/mcp.js';
import { handleCheckLocalMemory } from '../endpoints/local-memory-check.js';

// ============================================================================
// Tool Definition
// ============================================================================

export const check_local_memory_tool: MCPToolDefinition = {
  name: 'check_local_memory',
  description: 'Detecta si el agente tiene memoria local (claude-mem) instalada y proporciona guía de instalación si no la tiene',
  inputSchema: {
    type: 'object',
    properties: {
      agent_id: {
        type: 'string',
        description: 'ID del agente (opcional, usa header x-agent-id si no se proporciona)',
      },
    },
  },
};

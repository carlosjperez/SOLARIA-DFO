/**
 * MCP Tool: check_local_memory
 *
 * Detects if agent has local memory (claude-mem) installed
 * Provides installation guide if not installed
 *
 * @author ECO-Lambda | SOLARIA DFO
 * @date 2026-01-06
 * @task MEM-005
 */

import { z } from 'zod';
import { ResponseBuilder } from '../utils/response-builder.js';
import { db } from '../database.js';
import { Tool } from '../types/mcp.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// ============================================================================
// Configuration
// ============================================================================

const CACHE_TTL = 30000; // 30 seconds
const checkCache = new Map<string, { result: any; timestamp: number }>();

// ============================================================================
// Validation Schema
// ============================================================================

const CheckLocalMemoryInputSchema = z.object({
  agent_id: z.string().optional(),
});

// ============================================================================
// MCP Tool Export
// ============================================================================

export const check_local_memory: Tool = {
  name: 'check_local_memory',
  description: 'Detectar si el agente tiene memoria local (claude-mem) instalada',
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

// ============================================================================
// Cache Management
// ============================================================================

function getCachedCheck(agentId: string): any | null {
  const cached = checkCache.get(agentId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[local-memory] Using cached result for ${agentId}`);
    return cached.result;
  }
  return null;
}

function setCachedCheck(agentId: string, result: any): void {
  checkCache.set(agentId, {
    result,
    timestamp: Date.now(),
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

async function executeCheckScript(agentId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts/check-local-memory.sh');

    if (!fs.existsSync(scriptPath)) {
      reject(new Error('Script not found'));
      return;
    }

    const check = spawn('bash', [scriptPath, '--agent-id', agentId], {
      stdio: 'pipe',
      timeout: 5000, // 5 seconds
    });

    let output = '';
    let errorOutput = '';

    check.stdout.on('data', (data) => {
      output += data.toString();
    });

    check.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    check.on('close', (code) => {
      if (code !== 0) {
        console.error(`[local-memory] Script failed with code ${code}`);
        console.error(`[local-memory] Error output: ${errorOutput}`);
        reject(new Error(`Check script failed: ${errorOutput}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (parseError) {
        console.error(`[local-memory] Failed to parse JSON: ${parseError}`);
        reject(parseError);
      }
    });

    check.on('error', (error) => {
      console.error(`[local-memory] Script execution error:`, error);
      reject(error);
    });
  });
}

async function loadInstallationGuide(): Promise<string> {
  try {
    const guidePath = path.join(process.cwd(), 'docs/LOCAL-MEMORY-INSTALL-GUIDE.md');
    const guide = fs.readFileSync(guidePath, 'utf-8');
    return guide;
  } catch (error) {
    console.error('[local-memory] Failed to load installation guide:', error);
    return 'Error: Could not load installation guide';
  }
}

async function saveAgentStatus(agentId: string, checkResult: any): Promise<void> {
  try {
    await db.execute(`
      INSERT INTO agent_local_memory_status
        (agent_id, has_local_memory, installed_version, os_type, node_version,
         claude_code_version, installation_method, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'mcp-check', NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        has_local_memory = VALUES(has_local_memory),
        installed_version = VALUES(installed_version),
        os_type = VALUES(os_type),
        node_version = VALUES(node_version),
        claude_code_version = VALUES(claude_code_version),
        last_checked = NOW(),
        updated_at = NOW()
    `, [
      agentId,
      checkResult.installed,
      checkResult.version || null,
      checkResult.os,
      checkResult.node_version,
      checkResult.claude_code_version,
    ]);

    console.log(`[local-memory] Saved agent status for ${agentId}`);
  } catch (error) {
    console.error('[local-memory] Failed to save agent status:', error);
  }
}

async function loadLastCheck(agentId: string): Promise<any | null> {
  try {
    const [rows] = await db.execute(`
      SELECT * FROM agent_local_memory_status
      WHERE agent_id = ?
        AND last_checked > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY last_checked DESC
      LIMIT 1
    `, [agentId]);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error('[local-memory] Failed to load last check:', error);
    return null;
  }
}

// ============================================================================
// Handler Function
// ============================================================================

export async function handleCheckLocalMemory(params: any): Promise<any> {
  const agentId = params.agent_id || 'unknown';

  console.log(`[local-memory] Checking local memory status for agent: ${agentId}`);

  // Check cache first
  const cached = getCachedCheck(agentId);
  if (cached) {
    return cached;
  }

  // Load last check to avoid duplicate checks
  const lastCheck = await loadLastCheck(agentId);
  if (lastCheck) {
    console.log(`[local-memory] Using last check result from ${lastCheck.last_checked}`);
    return ResponseBuilder.success({
      ...lastCheck,
      cached: true,
      message: 'Using cached result',
    });
  }

  // Execute check script
  const checkResult = await executeCheckScript(agentId);

  // Persist agent status to database
  await saveAgentStatus(agentId, checkResult);

  setCachedCheck(agentId, checkResult);

  if (!checkResult.installed) {
    console.log(`[local-memory] Agent ${agentId} does NOT have local memory`);

    // Return response with installation guide for agents without local memory
    const installationGuide = await loadInstallationGuide();

    return ResponseBuilder.success({
      success: true,
      has_local_memory: false,
      message: '📋 No detectado sistema de memoria local',
      installation_guide: installationGuide,
      suggestion: 'Instala claude-mem para persistencia de contexto entre sesiones',
    });
  }

  console.log(`[local-memory] Agent ${agentId} has local memory v${checkResult.version}`);

  // Return success response with detected memory details
  return ResponseBuilder.success({
    success: true,
    has_local_memory: true,
    installed_version: checkResult.version,
    status: checkResult.status,
    message: `✅ Sistema de memoria local detectado (v${checkResult.version})`,
    details: {
      os: checkResult.os,
      node_version: checkResult.node_version,
      claude_code_version: checkResult.claude_code_version,
      detection_time: checkResult.detection_time,
    },
  });
}

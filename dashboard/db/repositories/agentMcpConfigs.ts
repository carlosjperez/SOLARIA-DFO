/**
 * SOLARIA DFO - Agent MCP Configs Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq, desc, and } from 'drizzle-orm';
import {
    agentMcpConfigs,
    type AgentMcpConfig,
    type NewAgentMcpConfig,
} from '../schema/index.js';

// ============================================================================
// Agent MCP Configs CRUD
// ============================================================================

export async function findAllAgentMcpConfigs(agentId: number) {
    return db
        .select()
        .from(agentMcpConfigs)
        .where(eq(agentMcpConfigs.agentId, agentId))
        .orderBy(agentMcpConfigs.serverName);
}

export async function findAgentMcpConfigById(id: number, agentId: number) {
    const result = await db
        .select()
        .from(agentMcpConfigs)
        .where(
            and(
                eq(agentMcpConfigs.id, id),
                eq(agentMcpConfigs.agentId, agentId)
            )
        )
        .limit(1);
    return result[0] || null;
}

export async function findAgentMcpConfigByServerName(agentId: number, serverName: string) {
    const result = await db
        .select()
        .from(agentMcpConfigs)
        .where(
            and(
                eq(agentMcpConfigs.agentId, agentId),
                eq(agentMcpConfigs.serverName, serverName)
            )
        )
        .limit(1);
    return result[0] || null;
}

export async function createAgentMcpConfig(data: NewAgentMcpConfig): Promise<AgentMcpConfig> {
    const insertResult = await db.insert(agentMcpConfigs).values(data);
    return findAgentMcpConfigById(insertResult[0].insertId, data.agentId!) as Promise<AgentMcpConfig>;
}

export async function updateAgentMcpConfig(
    id: number,
    agentId: number,
    data: Partial<NewAgentMcpConfig>
) {
    await db
        .update(agentMcpConfigs)
        .set(data)
        .where(
            and(
                eq(agentMcpConfigs.id, id),
                eq(agentMcpConfigs.agentId, agentId)
            )
        );
    return findAgentMcpConfigById(id, agentId);
}

export async function deleteAgentMcpConfig(id: number, agentId: number) {
    return db
        .delete(agentMcpConfigs)
        .where(
            and(
                eq(agentMcpConfigs.id, id),
                eq(agentMcpConfigs.agentId, agentId)
            )
        );
}

// ============================================================================
// Connection Status Updates
// ============================================================================

export async function updateConnectionSuccess(id: number) {
    return db
        .update(agentMcpConfigs)
        .set({
            connectionStatus: 'connected',
            lastConnectedAt: new Date(),
            lastError: null
        })
        .where(eq(agentMcpConfigs.id, id));
}

export async function updateConnectionError(id: number, errorMessage: string) {
    return db
        .update(agentMcpConfigs)
        .set({
            connectionStatus: 'error',
            lastError: errorMessage
        })
        .where(eq(agentMcpConfigs.id, id));
}

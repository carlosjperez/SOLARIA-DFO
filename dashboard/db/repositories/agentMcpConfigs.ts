/**
 * SOLARIA DFO - Agent MCP Configs Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 *
 * Updated: 2026-01-12 - Phase 2.4: BaseRepository pattern migration
 *
 * Note: This repository uses agent-scoped operations for multi-tenant security.
 * Most methods require agentId to ensure isolation between agents.
 */

import { db } from '../index.js';
import { eq, and } from 'drizzle-orm';
import {
    agentMcpConfigs,
    type AgentMcpConfig,
    type NewAgentMcpConfig,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Agent MCP Configs Repository Class
// ============================================================================

class AgentMcpConfigsRepository extends BaseRepository<AgentMcpConfig, NewAgentMcpConfig, typeof agentMcpConfigs> {
    constructor() {
        super(agentMcpConfigs, 'AgentMcpConfig');
    }

    /**
     * Find all MCP configs for a specific agent
     */
    async findByAgentId(agentId: number): Promise<AgentMcpConfig[]> {
        return db
            .select()
            .from(agentMcpConfigs)
            .where(eq(agentMcpConfigs.agentId, agentId))
            .orderBy(agentMcpConfigs.serverName);
    }

    /**
     * Find config by ID with agent scope (multi-tenant security)
     */
    async findByIdAndAgent(id: number, agentId: number): Promise<AgentMcpConfig | null> {
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

    /**
     * Find config by server name for a specific agent
     */
    async findByServerName(agentId: number, serverName: string): Promise<AgentMcpConfig | null> {
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

    /**
     * Create new MCP config for an agent
     */
    async createForAgent(data: NewAgentMcpConfig): Promise<AgentMcpConfig> {
        const insertResult = await db.insert(agentMcpConfigs).values(data);
        return this.findByIdAndAgent(insertResult[0].insertId, data.agentId!) as Promise<AgentMcpConfig>;
    }

    /**
     * Update config with agent scope (multi-tenant security)
     */
    async updateForAgent(
        id: number,
        agentId: number,
        data: Partial<NewAgentMcpConfig>
    ): Promise<AgentMcpConfig | null> {
        await db
            .update(agentMcpConfigs)
            .set(data)
            .where(
                and(
                    eq(agentMcpConfigs.id, id),
                    eq(agentMcpConfigs.agentId, agentId)
                )
            );
        return this.findByIdAndAgent(id, agentId);
    }

    /**
     * Delete config with agent scope (multi-tenant security)
     */
    async deleteForAgent(id: number, agentId: number): Promise<boolean> {
        const config = await this.findByIdAndAgent(id, agentId);
        if (!config) return false;

        await db
            .delete(agentMcpConfigs)
            .where(
                and(
                    eq(agentMcpConfigs.id, id),
                    eq(agentMcpConfigs.agentId, agentId)
                )
            );
        return true;
    }

    /**
     * Update connection status to 'connected'
     */
    async markConnected(id: number): Promise<void> {
        await db
            .update(agentMcpConfigs)
            .set({
                connectionStatus: 'connected',
                lastConnectedAt: new Date(),
                lastError: null
            })
            .where(eq(agentMcpConfigs.id, id));
    }

    /**
     * Update connection status to 'error' with message
     */
    async markError(id: number, errorMessage: string): Promise<void> {
        await db
            .update(agentMcpConfigs)
            .set({
                connectionStatus: 'error',
                lastError: errorMessage
            })
            .where(eq(agentMcpConfigs.id, id));
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const agentMcpConfigsRepo = new AgentMcpConfigsRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Find all MCP configs for an agent
 * @deprecated Use agentMcpConfigsRepo.findByAgentId() directly
 */
export async function findAllAgentMcpConfigs(agentId: number) {
    return agentMcpConfigsRepo.findByAgentId(agentId);
}

/**
 * Find config by ID with agent scope
 * @deprecated Use agentMcpConfigsRepo.findByIdAndAgent() directly
 */
export async function findAgentMcpConfigById(id: number, agentId: number) {
    return agentMcpConfigsRepo.findByIdAndAgent(id, agentId);
}

/**
 * Find config by server name
 * @deprecated Use agentMcpConfigsRepo.findByServerName() directly
 */
export async function findAgentMcpConfigByServerName(agentId: number, serverName: string) {
    return agentMcpConfigsRepo.findByServerName(agentId, serverName);
}

/**
 * Create new MCP config
 * @deprecated Use agentMcpConfigsRepo.createForAgent() directly
 */
export async function createAgentMcpConfig(data: NewAgentMcpConfig): Promise<AgentMcpConfig> {
    return agentMcpConfigsRepo.createForAgent(data);
}

/**
 * Update MCP config with agent scope
 * @deprecated Use agentMcpConfigsRepo.updateForAgent() directly
 */
export async function updateAgentMcpConfig(
    id: number,
    agentId: number,
    data: Partial<NewAgentMcpConfig>
) {
    return agentMcpConfigsRepo.updateForAgent(id, agentId, data);
}

/**
 * Delete MCP config with agent scope
 * @deprecated Use agentMcpConfigsRepo.deleteForAgent() directly
 */
export async function deleteAgentMcpConfig(id: number, agentId: number) {
    return agentMcpConfigsRepo.deleteForAgent(id, agentId);
}

/**
 * Mark connection as successful
 * @deprecated Use agentMcpConfigsRepo.markConnected() directly
 */
export async function updateConnectionSuccess(id: number) {
    return agentMcpConfigsRepo.markConnected(id);
}

/**
 * Mark connection as failed with error
 * @deprecated Use agentMcpConfigsRepo.markError() directly
 */
export async function updateConnectionError(id: number, errorMessage: string) {
    return agentMcpConfigsRepo.markError(id, errorMessage);
}

// Export repository instance for direct usage
export { agentMcpConfigsRepo };

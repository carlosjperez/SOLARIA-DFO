/**
 * Memory Sync Endpoint Implementation
 *
 * @author ECO-Lambda | Memory System Hybrid
 * @date 2026-01-06
 * @task MEM-002
 *
 * Syncs observations from edge machines (claude-mem) to central DFO database
 */

import { z } from 'zod';
import { ResponseBuilder } from '../utils/response-builder.js'
import { db } from '../database.js'
import { Tool } from '../types/mcp.js'
import { generateEmbedding, handleChromaQuery } from '../services/chroma-client.js'

// ============================================================================
// Validation Schema
// ============================================================================

const MemorySyncInputSchema = z.object({
  observations: z.array(z.object({
    session_id: z.string(),
    tool_name: z.string(),
    tool_input: z.record(z.any()),
    tool_output: z.record(z.any()),
    metadata: z.record(z.any()).optional(),
    created_at: z.string().datetime(),
  })).min(1).max(1000),

  summaries: z.array(z.object({
    session_id: z.string(),
    summary: z.string(),
    key_points: z.array(z.string()),
    tags: z.array(z.string()),
    observations_count: z.number(),
    created_at: z.string().datetime(),
  })).optional(),

  machine_id: z.string().min(1).max(255),
  machine_name: z.string().optional(),
  project: z.string().optional(),
});

const MemorySearchInputSchema = z.object({
  query: z.string().min(1).max(500),
  project: z.string().optional(),
  machine_id: z.string().optional(),
  time_range: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }).optional(),
  limit: z.number().int().min(1).max(100).default(20),
  include_embeddings: z.boolean().default(false),
  format: z.enum(['json', 'human']).default('json'),
});

const MemoryGetContextInputSchema = z.object({
  project: z.string().optional(),
  session_id: z.string().optional(),
  machine_id: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

// ============================================================================
// Tool Export
// ============================================================================

export const memory_sync_remote: Tool = {
  name: 'memory_sync_remote',
  description: 'Sincronizar memoria local con servidor central DFO',
  inputSchema: {
    type: 'object',
    properties: {
      observations: {
        type: 'array',
        description: 'Array de observaciones a sincronizar',
        items: {
          type: 'object',
        },
      },
      summaries: {
        type: 'array',
        description: 'Array de resúmenes de sesiones (opcional)',
        items: {
          type: 'object',
        },
      },
      machine_id: {
        type: 'string',
        description: 'ID único de la máquina',
      },
      machine_name: {
        type: 'string',
        description: 'Nombre legible de la máquina',
      },
      project: {
        type: 'string',
        description: 'Nombre del proyecto',
      },
    },
  },
};

export const memory_search_remote: Tool = {
  name: 'memory_search_remote',
  description: 'Buscar en memoria central (todas las máquinas) con opción de embeddings vectoriales',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Query de búsqueda',
      },
      project: {
        type: 'string',
        description: 'Filtrar por proyecto',
      },
      machine_id: {
        type: 'string',
        description: 'Filtrar por ID de máquina',
      },
      time_range: {
        type: 'object',
        description: 'Rango de fechas',
      },
      limit: {
        type: 'number',
        description: 'Límite de resultados (máx 100)',
      },
      include_embeddings: {
        type: 'boolean',
        default: false,
        description: 'Incluir embeddings vectoriales generadas por LLM local del DFO',
      },
      format: {
        type: 'string',
        enum: ['json', 'human'],
        default: 'json',
      },
    },
  },
};

export const memory_get_context: Tool = {
  name: 'memory_get_context',
  description: 'Obtener contexto relevante para sesión actual',
  inputSchema: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'Nombre del proyecto',
      },
      session_id: {
        type: 'string',
        description: 'ID de sesión actual',
      },
      machine_id: {
        type: 'string',
        description: 'ID de máquina (opcional)',
      },
      limit: {
        type: 'number',
        description: 'Límite de observaciones a inyectar',
      },
    },
  },
};

export const memory_restore: Tool = {
  name: 'memory_restore',
  description: 'Restaurar memoria desde servidor central',
  inputSchema: {
    type: 'object',
    properties: {
      machine_id: {
        type: 'string',
        description: 'ID de máquina a restaurar',
      },
      date_range: {
        type: 'object',
        properties: {
          from: { type: 'string', format: 'date-time' },
          to: { type: 'string', format: 'date-time' },
        },
      },
      include_embeddings: {
        type: 'boolean',
        description: 'Incluir embeddings vectoriales',
      },
    },
  },
};

// ============================================================================
// Handler Functions
// ============================================================================

export async function handleMemorySync(params: any) {
  const startTime = Date.now();

  try {
    const validated = MemorySyncInputSchema.parse(params);
    const { observations, summaries, machine_id, machine_name, project } = validated;

    await db.execute('BEGIN TRANSACTION');

    try {
      // 1. Register or update machine
      const [existingMachine] = await db.execute(
        'SELECT id, machine_id FROM memory_machines WHERE machine_id = ?',
        [machine_id]
      );

      if (existingMachine.length === 0) {
        await db.execute(`
          INSERT INTO memory_machines (machine_id, machine_name, first_seen_at, last_sync_at, active)
          VALUES (?, ?, NOW(), NOW(), true)
        `, [machine_id, machine_name || machine_id]);
      } else {
        await db.execute(`
          UPDATE memory_machines
          SET machine_name = ?, last_sync_at = NOW(), last_sync_status = 'success'
          WHERE machine_id = ?
        `, [machine_name || existingMachine[0].machine_name, machine_id]);
      }

      // 2. Insert observations
      let syncedObservations = 0;
      for (const obs of observations) {
        const obsId = `obs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.execute(`
          INSERT INTO memory_observations_remote (
            id, machine_id, local_observation_id, session_id, project,
            tool_name, tool_input, tool_output, text_content,
            metadata, created_at, synced_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          obsId,
          machine_id,
          obs.local_observation_id || Math.floor(Math.random() * 1000000),
          obs.session_id,
          project || null,
          obs.tool_name,
          JSON.stringify(obs.tool_input),
          JSON.stringify(obs.tool_output),
          extractTextContent(obs),
          JSON.stringify(obs.metadata || {}),
          obs.created_at,
        ]);
        syncedObservations++;
      }

      // 3. Insert summaries
      let syncedSummaries = 0;
      if (summaries) {
        for (const summary of summaries) {
          const summaryId = `sum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          await db.execute(`
            INSERT INTO memory_summaries_remote (
              id, session_id, project, summary, key_points, tags,
              observations_count, machine_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `, [
            summaryId,
            summary.session_id,
            project || null,
            summary.summary,
            JSON.stringify(summary.key_points),
            JSON.stringify(summary.tags),
            summary.observations_count,
            machine_id,
          ]);
          syncedSummaries++;
        }
      }

      // 4. Update machine statistics
      await db.execute(`
        UPDATE memory_machines
        SET 
          total_observations = total_observations + ?,
          total_syncs = total_syncs + 1,
          last_sync_at = NOW(),
          last_sync_status = 'success'
        WHERE machine_id = ?
      `, [syncedObservations, machine_id]);

      // 5. Log sync operation
      const duration = Date.now() - startTime;
      await db.execute(`
        INSERT INTO memory_sync_log (
          machine_id, sync_type, observations_count, summaries_count,
          sync_duration_ms, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'success', NOW())
      `, [machine_id, 'batch', syncedObservations, syncedSummaries, duration]);

      await db.execute('COMMIT');

      return ResponseBuilder.success({
        synced_observations: syncedObservations,
        synced_summaries: syncedSummaries,
        machine_id,
        sync_duration_ms: duration,
        message: `✅ Sync completado: ${syncedObservations} observaciones, ${syncedSummaries} resúmenes`,
      });
    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Memory sync error:', errorMessage);

    // Log failed sync
    try {
      await db.execute(`
        INSERT INTO memory_sync_log (
          machine_id, sync_type, observations_count, sync_duration_ms,
          status, error_message, created_at
        ) VALUES (?, 'batch', ?, ?, 'failed', ?, NOW())
      `, [params.machine_id, params.observations?.length || 0, Date.now() - startTime, errorMessage]);
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }

    return ResponseBuilder.error('Failed to sync memory', {
      details: errorMessage,
    });
  }
}

export async function handleMemorySearch(params: any) {
  try {
    const validated = MemorySearchInputSchema.parse(params);
    const { query, project, machine_id, time_range, limit, include_embeddings, format } = validated;

    let observations: any[] = [];
    let summaries: any[] = [];

    if (include_embeddings) {
      console.log('[memory-search] Using Chroma vector search for embeddings');

      try {
        const chromaResults = await handleChromaQuery({
          collection_name: 'memory_observations',
          query_texts: [query],
          n_results: limit,
          include: ['metadatas', 'documents', 'distances'],
        });

        if (chromaResults.success) {
          const vectorResults = chromaResults.data.results || [];

          observations = vectorResults.map((result: any) => ({
            id: result.id,
            machine_id: result.metadata?.machine_id,
            session_id: result.metadata?.session_id,
            project: result.metadata?.project,
            tool_name: result.metadata?.tool_name,
            tool_input: result.metadata?.tool_input ? JSON.parse(result.metadata.tool_input) : null,
            tool_output: result.metadata?.tool_output ? JSON.parse(result.metadata.tool_output) : null,
            text_content: result.document,
            similarity_score: result.distance ? (1 - result.distance).toFixed(4) : null,
            created_at: result.metadata?.created_at || result.metadata?.timestamp,
          }));

          console.log(`[memory-search] Chroma returned ${observations.length} vector results`);
        } else {
          console.warn('[memory-search] Chroma search failed, falling back to full-text');
          observations = await searchFullText(query, project, machine_id, time_range, limit, 'observations');
        }
      } catch (chromaError) {
        console.error('[memory-search] Chroma vector search error:', chromaError);
        console.log('[memory-search] Falling back to full-text search');
        observations = await searchFullText(query, project, machine_id, time_range, limit, 'observations');
      }

      summaries = await searchFullText(query, project, machine_id, time_range, Math.min(limit, 5), 'summaries');
    } else {
      console.log('[memory-search] Using full-text search (embeddings disabled)');
      observations = await searchFullText(query, project, machine_id, time_range, limit, 'observations');
      summaries = await searchFullText(query, project, machine_id, time_range, limit, 'summaries');
    }

    if (format === 'human') {
      const humanOutput = formatMemorySearchResults(observations, summaries, query, include_embeddings);
      return ResponseBuilder.success({
        format: 'human',
        formatted: humanOutput,
        results: {
          observations: observations.length,
          summaries: summaries.length,
        },
      });
    }

    return ResponseBuilder.success({
      observations,
      summaries,
      query,
      total_results: observations.length + summaries.length,
      search_mode: include_embeddings ? 'vector' : 'full-text',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Memory search error:', errorMessage);

    return ResponseBuilder.error('Failed to search memory', {
      details: errorMessage,
    });
  }
}

async function searchFullText(
  query: string,
  project: string | undefined,
  machine_id: string | undefined,
  time_range: any,
  limit: number,
  table: 'observations' | 'summaries'
): Promise<any[]> {
  const tableName = table === 'observations' ? 'memory_observations_remote' : 'memory_summaries_remote';

  const conditions = [];
  const queryParams = [];

  conditions.push(`text_content LIKE ?`);
  queryParams.push(`%${query}%`);

  if (project) {
    conditions.push(`project = ?`);
    queryParams.push(project);
  }

  if (machine_id) {
    conditions.push(`machine_id = ?`);
    queryParams.push(machine_id);
  }

  if (time_range?.from) {
    conditions.push(`created_at >= ?`);
    queryParams.push(time_range.from);
  }

  if (time_range?.to) {
    conditions.push(`created_at <= ?`);
    queryParams.push(time_range.to);
  }

  const whereClause = conditions.join(' AND ');

  const results = await db.execute(`
    SELECT
      ${table === 'observations' ? 'id, machine_id, session_id, project, tool_name, tool_input, tool_output, metadata, text_content, created_at, synced_at'
        : 'id, session_id, project, summary, key_points, tags, observations_count, created_at'}
    FROM ${tableName}
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT ?
  `, [...queryParams, limit]);

  return results;
}

    if (machine_id) {
      conditions.push(`machine_id = ?`);
      queryParams.push(machine_id);
    }

    if (time_range?.from) {
      conditions.push(`created_at >= ?`);
      queryParams.push(time_range.from);
    }

    if (time_range?.to) {
      conditions.push(`created_at <= ?`);
      queryParams.push(time_range.to);
    }

    const whereClause = conditions.join(' AND ');

    // Search in observations
    const observations = await db.execute(`
      SELECT
        id, machine_id, session_id, project, tool_name,
        tool_input, tool_output, metadata,
        created_at, synced_at
      FROM memory_observations_remote
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ?
    `, [...queryParams, limit]);

    // Search in summaries
    const summaries = await db.execute(`
      SELECT
        id, session_id, project, summary,
        key_points, tags, observations_count, created_at
      FROM memory_summaries_remote
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ?
    `, [...queryParams, limit]);

    if (format === 'human') {
      const humanOutput = formatMemorySearchResults(observations, summaries, query);
      return ResponseBuilder.success({
        format: 'human',
        formatted: humanOutput,
        results: {
          observations: observations.length,
          summaries: summaries.length,
        },
      });
    }

    return ResponseBuilder.success({
      observations,
      summaries,
      query,
      total_results: observations.length + summaries.length,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Memory search error:', errorMessage);

    return ResponseBuilder.error('Failed to search memory', {
      details: errorMessage,
    });
  }
}

export async function handleMemoryGetContext(params: any) {
  try {
    const validated = MemoryGetContextInputSchema.parse(params);
    const { project, session_id, machine_id, limit } = validated;

    const conditions = [];
    const queryParams = [];

    if (project) {
      conditions.push(`project = ?`);
      queryParams.push(project);
    }

    if (machine_id) {
      conditions.push(`machine_id = ?`);
      queryParams.push(machine_id);
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1 = 1';

    // Get recent observations
    const observations = await db.execute(`
      SELECT
        id, machine_id, session_id, tool_name,
        tool_input, tool_output, metadata, created_at
      FROM memory_observations_remote
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT ?
    `, [...queryParams, limit]);

    // Get recent summaries
    const summaries = await db.execute(`
      SELECT
        id, session_id, project, summary,
        key_points, tags, observations_count, created_at
      FROM memory_summaries_remote
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT 5
    `, queryParams);

    const context = formatMemoryContext(observations, summaries);

    return ResponseBuilder.success({
      context,
      observations_count: observations.length,
      summaries_count: summaries.length,
      message: '✅ Contexto recuperado exitosamente',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Memory get context error:', errorMessage);

    return ResponseBuilder.error('Failed to get memory context', {
      details: errorMessage,
    });
  }
}

export async function handleMemoryRestore(params: any) {
  try {
    const { machine_id, date_range, include_embeddings } = params;

    const conditions = [];
    const queryParams = [];

    if (machine_id) {
      conditions.push(`machine_id = ?`);
      queryParams.push(machine_id);
    }

    if (date_range?.from) {
      conditions.push(`created_at >= ?`);
      queryParams.push(date_range.from);
    }

    if (date_range?.to) {
      conditions.push(`created_at <= ?`);
      queryParams.push(date_range.to);
    }

    const whereClause = conditions.length > 0 ? conditions.join(' AND ') : '1 = 1';

    // Get observations
    const observations = await db.execute(`
      SELECT
        id, machine_id, session_id, project, tool_name,
        tool_input, tool_output, metadata, created_at
      FROM memory_observations_remote
      WHERE ${whereClause}
      ORDER BY created_at DESC
    `, queryParams);

    // Get summaries
    const summaries = await db.execute(`
      SELECT
        id, session_id, project, summary,
        key_points, tags, observations_count, created_at
      FROM memory_summaries_remote
      WHERE ${whereClause}
      ORDER BY created_at DESC
    `, queryParams);

    return ResponseBuilder.success({
      observations,
      summaries,
      machine_id,
      total_observations: observations.length,
      total_summaries: summaries.length,
      message: `✅ Memoria restaurada: ${observations.length} observaciones, ${summaries.length} resúmenes`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Memory restore error:', errorMessage);

    return ResponseBuilder.error('Failed to restore memory', {
      details: errorMessage,
    });
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractTextContent(observation: any): string {
  const parts: string[] = [];

  if (observation.tool_name) {
    parts.push(`Tool: ${observation.tool_name}`);
  }

  if (observation.tool_output?.content) {
    parts.push(String(observation.tool_output.content).substring(0, 200));
  }

  if (observation.tool_output?.summary) {
    parts.push(String(observation.tool_output.summary).substring(0, 200));
  }

  if (observation.metadata?.file) {
    parts.push(`File: ${observation.metadata.file}`);
  }

  return parts.join(' | ');
}

function formatMemorySearchResults(observations: any[], summaries: any[], query: string, includeEmbeddings: boolean = false): string {
  const lines: string[] = [];

  lines.push(`🔍 Search Results for: "${query}"`);
  if (includeEmbeddings) {
    lines.push(`   Mode: Vector Search (Chroma + LLM embeddings)`);
  }
  lines.push('');

  if (observations.length > 0) {
    lines.push(`📋 Observations (${observations.length}):`);
    lines.push('');

    observations.forEach((obs, i) => {
      const timeAgo = getTimeAgo(obs.created_at);
      lines.push(`  ${i + 1}. ${obs.tool_name} - ${timeAgo}`);

      if (includeEmbeddings && obs.similarity_score !== null) {
        const similarityPercent = (parseFloat(obs.similarity_score) * 100).toFixed(1);
        lines.push(`     Similarity: ${similarityPercent}%`);
      }

      lines.push(`     Machine: ${obs.machine_id}`);
      lines.push(`     Session: ${obs.session_id}`);
      lines.push('');
    });
  }

  if (summaries.length > 0) {
    lines.push(`📝 Summaries (${summaries.length}):`);
    lines.push('');

    summaries.forEach((sum, i) => {
      const timeAgo = getTimeAgo(sum.created_at);
      lines.push(`  ${i + 1}. ${timeAgo}`);
      lines.push(`     ${sum.summary.substring(0, 100)}...`);
      lines.push('');
    });
  }

  lines.push(`Total: ${observations.length + summaries.length} results`);

  return lines.join('\n');
}

function formatMemoryContext(observations: any[], summaries: any[]): string {
  const lines: string[] = [];

  lines.push('═════ PROJECT MEMORY CONTEXT ═════');
  lines.push('');

  if (summaries.length > 0) {
    lines.push('📋 Recent Summaries:');
    summaries.forEach((sum, i) => {
      lines.push(`  ${i + 1}. ${sum.summary.substring(0, 80)}...`);
      if (sum.key_points?.length > 0) {
        sum.key_points.forEach((point: string) => {
          lines.push(`     • ${point}`);
        });
      }
    });
    lines.push('');
  }

  if (observations.length > 0) {
    lines.push(`🔧 Recent Observations (${observations.length}):`);
    const recentObs = observations.slice(0, 10);
    recentObs.forEach((obs, i) => {
      const timeAgo = getTimeAgo(obs.created_at);
      lines.push(`  ${i + 1}. ${obs.tool_name} (${timeAgo})`);
      if (obs.metadata?.file) {
        lines.push(`     File: ${obs.metadata.file}`);
      }
    });
  }

  lines.push('════════════════════════════════════════');

  return lines.join('\n');
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

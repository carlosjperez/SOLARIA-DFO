/**
 * Chroma Service - HTTP Client Wrapper
 * @author ECO-Lambda | SOLARIA Memory System
 * @date 2026-01-06
 * @task MEM-003: Configurar Chroma vector DB integration
 *
 * Wrapper service over Chroma HTTP API for:
 * - Embedding generation and storage
 * - Vector similarity search
 * - Collection management
 */

import { z } from 'zod';
import { ResponseBuilder } from '../utils/response-builder.js';
import { Tool } from '../types/mcp.js';

// ============================================================================
// Configuration
const CHROMA_URL = process.env.CHROMA_URL || 'http://localhost:8000';
const CHROMA_COLLECTION_OBSERVATIONS = 'memory_observations';
const CHROMA_COLLECTION_SUMMARIES = 'memory_summaries';
const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || 'http://localhost:3032';
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSION = 384;
const MAX_BATCH_SIZE = 100;

// ============================================================================
// Validation Schemas
// ============================================================================

const ChromaConfigSchema = z.object({
  enabled: z.boolean().optional(),
  apiUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
});

const AddDocumentInputSchema = z.object({
  collection_name: z.string(),
  text_content: z.string(),
  metadata: z.record(z.any()).optional(),
  id: z.string().optional(),
});

const QueryInputSchema = z.object({
  collection_name: z.string(),
  query_texts: z.array(z.string()),
  n_results: z.number().int().min(1).max(100).optional(),
  include: z.array(z.enum(['metadatas', 'documents', 'distances'])).optional(),
});

const DeleteCollectionInputSchema = z.object({
  collection_name: z.string(),
});

// ============================================================================
// MCP Tool Export
// ============================================================================

export const chroma_health_check: Tool = {
  name: 'chroma_health_check',
  description: 'Verificar si el servicio Chroma está disponible',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export const chroma_add_document: Tool = {
  name: 'chroma_add_document',
  description: 'Añadir documento con embedding a Chroma',
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Nombre de colección (observations o summaries)',
      },
      text_content: {
        type: 'string',
        description: 'Contenido de texto para generar embedding',
      },
      metadata: {
        type: 'object',
        description: 'Metadatos opcionales (machine_id, session_id, tool_name, etc.)',
      },
      id: {
        type: 'string',
        description: 'ID opcional del documento',
      },
    },
  },
};

export const chroma_query: Tool = {
  name: 'chroma_query',
  description: 'Buscar documentos por similitud vectorial en Chroma',
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Nombre de colección (observations o summaries)',
      },
      query_texts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Array de textos para buscar',
      },
      n_results: {
        type: 'number',
        description: 'Número de resultados (máx 100)',
      },
      include: {
        type: 'array',
        items: { type: 'string' },
        description: 'Qué incluir en resultados (metadatas, documents, distances)',
      },
    },
  },
};

export const chroma_create_collection: Tool = {
  name: 'chroma_create_collection',
  description: 'Crear nueva colección en Chroma',
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Nombre de la colección',
      },
      metadata: {
        type: 'object',
        description: 'Metadatos de la colección',
      },
    },
  },
};

export const chroma_delete_collection: Tool = {
  name: 'chroma_delete_collection',
  description: 'Eliminar colección de Chroma',
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Nombre de la colección a eliminar',
      },
    },
  },
};

// ============================================================================
// Chroma Client Class
// ============================================================================

class ChromaClient {
  private baseUrl: string;
  private collections: Map<string, string> = new Map();

  constructor(baseUrl: string = CHROMA_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'POST',
    body?: any,
  headers?: Record<string, string>,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      timeout: 30000, // 30 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chroma API error [${method} ${endpoint}]: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.request<{ nanosecond: number }>('/api/v1/heartbeat', 'GET');
      return !!result.nanosecond;
    } catch (error) {
      console.error('Chroma health check failed:', error);
      return false;
    }
  }

  async createCollection(
    collectionName: string,
    metadata?: Record<string, any>
  ): Promise<{ id: string; name: string }> {
    const result = await this.request<{
      id: string;
      name: string;
      metadata?: Record<string, any>;
    }>('/api/v1/collections', 'POST', {
      name: collectionName,
      metadata: metadata || { description: `Collection: ${collectionName}` },
      configuration: {
        hnsw_config: {
          space: {
            type: 'l2',
            distance_func: 'cosine',
          },
          dimension: EMBEDDING_DIMENSION,
        },
      },
    });

    return result;
  }

  async deleteCollection(collectionName: string): Promise<void> {
    const collections = await this.listCollections();
    const collection = collections.find((c) => c.name === collectionName);

    if (!collection) {
      throw new Error(`Collection '${collectionName}' not found`);
    }

    await this.request(`/api/v1/collections/${collection.id}`, 'DELETE');
  }

  async listCollections(): Promise<Array<{ id: string; name: string }>> {
    const result = await this.request<Array<{ id: string; name: string }>>('/api/v1/collections', 'GET');
    return result;
  }

  async addDocument(
    collectionName: string,
    textContent: string,
    metadata?: Record<string, any>,
    id?: string
  ): Promise<{ success: boolean; id: string }> {
    const result = await this.request<{
      success: boolean;
      ids: string[];
    }>('/api/v1/collections/add', 'POST', {
      collection_name: collectionName,
      documents: [
        {
          id: id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text: textContent,
          metadata: metadata || {},
        },
      ],
    });

    return result;
  }

  async query(
    collectionName: string,
    queryTexts: string[],
    nResults: number = 10
  ): Promise<any> {
    const result = await this.request('/api/v1/query', 'POST', {
      query: {
        n_results: nResults,
        query_texts: queryTexts,
      },
      include: ['metadatas', 'documents', 'distances'],
    });

    return result;
  }

  async queryById(
    collectionName: string,
    ids: string[]
  ): Promise<any> {
    const result = await this.request('/api/v1/get', 'POST', {
        collection_name: collectionName,
        ids: ids,
      });

    return result;
  }

  getCollectionId(collectionName: string): string | null {
    return this.collections.get(collectionName) || null;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let chromaClient: ChromaClient | null = null;

function getChromaClient(): ChromaClient {
  if (!chromaClient) {
    chromaClient = new ChromaClient();
  }
  return chromaClient;
}

async function initializeCollections() {
  console.log('Initializing Chroma collections...');
  const client = getChromaClient();
  const healthOk = await client.healthCheck();

  if (!healthOk) {
    console.error('Chroma service not available');
    return;
  }

  console.log('Chroma service is healthy');

  // List existing collections
  const existingCollections = await client.listCollections();
  existingCollections.forEach((c) => {
    chromaClient.collections.set(c.name, c.id);
  });

  // Create observations collection if it doesn't exist
  if (!chromaClient.collections.has(CHROMA_COLLECTION_OBSERVATIONS)) {
    console.log(`Creating collection: ${CHROMA_COLLECTION_OBSERVATIONS}`);
    const obsCollection = await client.createCollection(CHROMA_COLLECTION_OBSERVATIONS, {
      description: 'Tool usage observations from claude-mem',
    created_at: new Date().toISOString(),
    table: 'memory_observations_remote',
    dimension: EMBEDDING_DIMENSION.toString(),
    metadata_source: 'hybrid',
    source: 'claude-mem-sync-agent',
    });
    chromaClient.collections.set(CHROMA_COLLECTION_OBSERVATIONS, obsCollection.id);
    console.log(`✓ Collection created: ${CHROMA_COLLECTION_OBSERVATIONS} (ID: ${obsCollection.id})`);
  }

  // Create summaries collection if it doesn't exist
  if (!chromaClient.collections.has(CHROMA_COLLECTION_SUMMARIES)) {
    console.log(`Creating collection: ${CHROMA_COLLECTION_SUMMARIES}`);
    const sumCollection = await client.createCollection(CHROMA_COLLECTION_SUMMARIES, {
      description: 'Session summaries from claude-mem',
      created_at: new Date().toISOString(),
      table: 'memory_summaries_remote',
      dimension: EMBEDDING_DIMENSION.toString(),
      metadata_source: 'hybrid',
      source: 'claude-mem-sync-agent',
    });
    chromaClient.collections.set(CHROMA_COLLECTION_SUMMARIES, sumCollection.id);
    console.log(`✓ Collection created: ${CHROMA_COLLECTION_SUMMARIES} (ID: ${sumCollection.id})`);
  }

  console.log('Chroma collections initialized');
  console.log(`Available collections: ${chromaClient.collections.size}`);
}

// ============================================================================
// Handler Functions
// ============================================================================

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${LLM_SERVICE_URL}/api/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DFO_API_TOKEN}`,
        },
        body: JSON.stringify({
          text: text,
          model: EMBEDDING_MODEL,
        }),
        timeout: 30000, // 30 seconds
      });

      if (!response.ok) {
        throw new Error(`LLM embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('LLM embedding generation error:', errorMessage);
      throw new Error(`Failed to generate embedding: ${errorMessage}`);
    }
  }

export async function handleChromaHealthCheck(params: any) {
  try {
    const client = getChromaClient();

    if (params?.force_init) {
      await initializeCollections();
    }

    const isHealthy = await client.healthCheck();

    return ResponseBuilder.success({
      chroma_healthy: isHealthy,
      chroma_url: CHROMA_URL,
      collections: Object.fromEntries(chromaClient.collections),
      message: isHealthy ? '✅ Chroma service is available' : '❌ Chroma service is not responding',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chroma health check error:', errorMessage);

    return ResponseBuilder.error('Failed to check Chroma health', {
      details: errorMessage,
    });
  }
}

export async function handleChromaAddDocument(params: any) {
  try {
    const validated = AddDocumentInputSchema.parse(params);
    const { collection_name, text_content, metadata, id } = validated;

    const client = getChromaClient();

    const collectionId = client.getCollectionId(collection_name);
    if (!collectionId) {
      return ResponseBuilder.error('Collection not found', {
        details: `Collection '${collection_name}' does not exist`,
        available_collections: Array.from(client.collections.keys()),
      });
    }

    const result = await client.addDocument(collectionName, text_content, metadata, id);

    return ResponseBuilder.success({
      success: result.success,
      document_id: result.ids[0],
      collection_id: collectionId,
      message: `✅ Document added to collection '${collection_name}'`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chroma add document error:', errorMessage);

    return ResponseBuilder.error('Failed to add document to Chroma', {
      details: errorMessage,
    });
  }
}

export async function handleChromaQuery(params: any) {
  try {
    const validated = QueryInputSchema.parse(params);
    const { collection_name, query_texts, n_results = 10, include } = validated;

    const client = getChromaClient();

    const collectionId = client.getCollectionId(collection_name);
    if (!collectionId) {
      return ResponseBuilder.error('Collection not found', {
        details: `Collection '${collection_name}' does not exist`,
        available_collections: Array.from(client.collections.keys()),
      });
    }

    const results = await client.query(collection_name, query_texts, n_results);

    // Format results
    const formattedResults = results.results?.[0] || [];
    const output = {
      query: query_texts.join(', '),
      n_results: formattedResults.ids?.length || 0,
      results: formattedResults.ids?.map((id, index) => ({
        id,
        index: index + 1,
        distance: formattedResults.distances?.[index],
        metadata: formattedResults.metadatas?.[index],
      })),
      collection_id: collectionId,
    };

    return ResponseBuilder.success(output);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chroma query error:', errorMessage);

    return ResponseBuilder.error('Failed to query Chroma', {
      details: errorMessage,
    });
  }
}

export async function handleChromaCreateCollection(params: any) {
  try {
    const { collection_name, metadata } = params;

    const client = getChromaClient();

    const result = await client.createCollection(collection_name, metadata);

    return ResponseBuilder.success({
      collection_id: result.id,
      collection_name: result.name,
      metadata: result.metadata,
      message: `✅ Collection created: ${result.name}`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chroma create collection error:', errorMessage);

    return ResponseBuilder.error('Failed to create collection', {
      details: errorMessage,
    });
  }
}

export async function handleChromaDeleteCollection(params: any) {
  try {
    const validated = DeleteCollectionInputSchema.parse(params);
    const { collection_name } = validated;

    const client = getChromaClient();

    await client.deleteCollection(collection_name);

    return ResponseBuilder.success({
      deleted_collection: collection_name,
      message: `✅ Collection deleted: ${collection_name}`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Chroma delete collection error:', errorMessage);

    return ResponseBuilder.error('Failed to delete collection', {
      details: errorMessage,
    });
  }
}

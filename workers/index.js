/**
 * SOLARIA Digital Field Operations - Background Worker
 * Enhanced with vector embedding generation via Transformers.js
 *
 * Jobs:
 * - generate_embedding: Generate embedding for a single memory
 * - backfill_embeddings: Process all memories without embeddings
 * - sync_metrics, generate_report, cleanup: Legacy placeholder jobs
 */

import Redis from 'ioredis';
import mysql from 'mysql2/promise';
import { generateEmbedding, initializeModel, getModelInfo } from './embedding-service.js';
import { startHttpServer, stopHttpServer } from './http-server.js';

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'solaria:jobs';
const EMBEDDING_QUEUE = 'solaria:embeddings';
const MAX_RETRIES = 3;
const BACKFILL_BATCH_SIZE = 50;

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'office',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'solaria_user',
    password: process.env.DB_PASSWORD || 'solaria2024',
    database: process.env.DB_NAME || 'solaria_construction',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
};

let redis;
let db;

/**
 * Connect to Redis
 */
async function connectToRedis() {
    redis = new Redis(REDIS_URL);

    redis.on('connect', () => {
        console.log('[worker] Connected to Redis');
    });

    redis.on('error', (err) => {
        console.error('[worker] Redis error:', err.message);
    });

    await redis.ping();
    console.log('[worker] Redis ping successful');
}

/**
 * Connect to MariaDB
 */
async function connectToDatabase() {
    try {
        db = await mysql.createPool(dbConfig);
        // Test connection
        const [rows] = await db.execute('SELECT 1');
        console.log('[worker] Database connection pool created');
    } catch (error) {
        console.error('[worker] Database connection failed:', error.message);
        throw error;
    }
}

/**
 * Process embedding generation for a single memory
 * @param {number} memoryId
 * @returns {Promise<{success: boolean, memoryId?: number, error?: string}>}
 */
async function processEmbeddingJob(memoryId) {
    console.log(`[worker] Processing embedding for memory #${memoryId}`);

    try {
        // Fetch memory content
        const [memories] = await db.execute(
            'SELECT id, content, summary FROM memories WHERE id = ?',
            [memoryId]
        );

        if (memories.length === 0) {
            console.log(`[worker] Memory #${memoryId} not found, skipping`);
            return { success: true, skipped: true };
        }

        const memory = memories[0];

        // Combine content and summary for better embeddings
        const textToEmbed = `${memory.summary || ''} ${memory.content}`.trim();

        if (!textToEmbed) {
            console.log(`[worker] Memory #${memoryId} has no content, skipping`);
            return { success: true, skipped: true };
        }

        // Generate embedding
        const result = await generateEmbedding(textToEmbed);

        // Store embedding in database
        await db.execute(
            `UPDATE memories
             SET embedding = ?,
                 embedding_model = ?,
                 embedding_version = ?,
                 embedding_generated_at = NOW()
             WHERE id = ?`,
            [
                JSON.stringify(result.embedding),
                result.model,
                result.version,
                memoryId
            ]
        );

        console.log(`[worker] Embedding generated for memory #${memoryId} (${result.dimensions} dims, ${result.processingMs}ms)`);

        return {
            success: true,
            memoryId,
            dimensions: result.dimensions,
            processingMs: result.processingMs
        };

    } catch (error) {
        console.error(`[worker] Embedding failed for memory #${memoryId}:`, error.message);
        return { success: false, memoryId, error: error.message };
    }
}

/**
 * Backfill embeddings for all memories without embeddings
 * @param {number} batchSize
 * @returns {Promise<{processed: number, failed: number, total: number}>}
 */
async function backfillEmbeddings(batchSize = BACKFILL_BATCH_SIZE) {
    console.log(`[worker] Starting embedding backfill (batch size: ${batchSize})`);

    // Find memories without embeddings
    const [memories] = await db.execute(
        `SELECT id FROM memories WHERE embedding IS NULL ORDER BY created_at DESC LIMIT ?`,
        [batchSize]
    );

    console.log(`[worker] Found ${memories.length} memories to process`);

    if (memories.length === 0) {
        console.log('[worker] No memories need embedding generation');
        return { processed: 0, failed: 0, total: 0 };
    }

    let processed = 0;
    let failed = 0;

    for (const memory of memories) {
        const result = await processEmbeddingJob(memory.id);

        if (result.success && !result.skipped) {
            processed++;
        } else if (!result.success) {
            failed++;
        }

        // Small delay between embeddings to avoid overwhelming resources
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`[worker] Backfill complete: ${processed} processed, ${failed} failed, ${memories.length - processed - failed} skipped`);

    // If there are more memories to process, queue another backfill job
    const [remaining] = await db.execute(
        'SELECT COUNT(*) as count FROM memories WHERE embedding IS NULL'
    );

    if (remaining[0].count > 0) {
        console.log(`[worker] ${remaining[0].count} memories still need embeddings, queuing next batch`);
        await queueBackfillJob(batchSize);
    }

    return { processed, failed, total: memories.length };
}

/**
 * Queue a backfill job
 * @param {number} batchSize
 */
async function queueBackfillJob(batchSize) {
    const job = {
        id: `backfill_${Date.now()}`,
        type: 'backfill_embeddings',
        payload: { batch_size: batchSize },
        created_at: new Date().toISOString()
    };

    await redis.rpush(EMBEDDING_QUEUE, JSON.stringify(job));
}

/**
 * Process a job from the queue
 * @param {Object} job
 * @returns {Promise<{success: boolean}>}
 */
async function processJob(job) {
    const { type, payload, id } = job;
    console.log(`[worker] Processing job ${id}: ${type}`);

    try {
        switch (type) {
            case 'generate_embedding':
                return await processEmbeddingJob(payload.memory_id);

            case 'backfill_embeddings':
                return await backfillEmbeddings(payload.batch_size || BACKFILL_BATCH_SIZE);

            case 'sync_metrics':
                console.log('[worker] Syncing metrics...');
                // Placeholder for metrics sync
                break;

            case 'generate_report':
                console.log('[worker] Generating report...');
                // Placeholder for report generation
                break;

            case 'cleanup':
                console.log('[worker] Running cleanup...');
                // Placeholder for cleanup tasks
                break;

            default:
                console.log(`[worker] Unknown job type: ${type}`);
        }

        return { success: true };
    } catch (error) {
        console.error(`[worker] Job ${id} failed:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Main worker loop
 */
async function runWorker() {
    console.log('[worker] =========================================');
    console.log('[worker] SOLARIA DFO - Background Worker');
    console.log('[worker] Enhanced with Vector Embeddings');
    console.log('[worker] =========================================');
    console.log(`[worker] Redis URL: ${REDIS_URL}`);
    console.log(`[worker] Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

    // Connect to services
    await connectToRedis();
    await connectToDatabase();

    // Pre-load the embedding model on startup
    console.log('[worker] Pre-loading embedding model...');
    try {
        await initializeModel();
        const modelInfo = getModelInfo();
        console.log(`[worker] Model ready: ${modelInfo.name} (${modelInfo.dimensions} dims)`);
    } catch (error) {
        console.error('[worker] Failed to load embedding model:', error.message);
        console.error('[worker] Embedding jobs will fail until model is loaded');
    }

    // Start HTTP server for real-time embedding requests
    await startHttpServer();

    console.log(`[worker] Listening for jobs on queues: ${EMBEDDING_QUEUE}, ${QUEUE_NAME}`);
    console.log('[worker] Worker is ready');

    // Main loop: process jobs from queue
    while (true) {
        try {
            // Listen to both queues with priority to embeddings
            const result = await redis.blpop(EMBEDDING_QUEUE, QUEUE_NAME, 30);

            if (result) {
                const [queue, jobData] = result;
                const job = JSON.parse(jobData);
                await processJob(job);
            }
        } catch (error) {
            if (error.message !== 'Connection is closed') {
                console.error('[worker] Error processing queue:', error.message);
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Graceful shutdown
async function shutdown(signal) {
    console.log(`[worker] Received ${signal}, shutting down...`);

    try {
        await stopHttpServer();
    } catch (e) {
        console.error('[worker] Error stopping HTTP server:', e.message);
    }

    if (redis) {
        try {
            await redis.quit();
        } catch (e) {
            console.error('[worker] Error closing Redis:', e.message);
        }
    }

    if (db) {
        try {
            await db.end();
        } catch (e) {
            console.error('[worker] Error closing database:', e.message);
        }
    }

    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the worker
runWorker().catch((error) => {
    console.error('[worker] Fatal error:', error);
    process.exit(1);
});

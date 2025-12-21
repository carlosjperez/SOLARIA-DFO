#!/usr/bin/env node
/**
 * SOLARIA DFO - Embedding Backfill Script
 *
 * Queues embedding generation jobs for all memories without embeddings.
 * Run this after deploying the embedding service to process existing memories.
 *
 * Usage:
 *   node scripts/backfill-embeddings.js
 *   node scripts/backfill-embeddings.js --batch-size=100
 *   node scripts/backfill-embeddings.js --dry-run
 */

import Redis from 'ioredis';

// Configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const EMBEDDING_QUEUE = 'solaria:embeddings';

// Parse command line arguments
const args = process.argv.slice(2);
const batchSize = parseInt(args.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '50', 10);
const dryRun = args.includes('--dry-run');

async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     SOLARIA DFO - Embedding Backfill Script                ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Redis URL: ${REDIS_URL.padEnd(45)}║`);
    console.log(`║  Batch Size: ${String(batchSize).padEnd(44)}║`);
    console.log(`║  Dry Run: ${String(dryRun).padEnd(47)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    if (dryRun) {
        console.log('[DRY RUN] Would queue backfill job with batch_size:', batchSize);
        console.log('[DRY RUN] No actual job queued.');
        process.exit(0);
    }

    // Connect to Redis
    const redis = new Redis(REDIS_URL);

    redis.on('error', (err) => {
        console.error('[ERROR] Redis connection failed:', err.message);
        process.exit(1);
    });

    try {
        // Test connection
        await redis.ping();
        console.log('[OK] Connected to Redis');

        // Create backfill job
        const job = {
            id: `backfill_manual_${Date.now()}`,
            type: 'backfill_embeddings',
            payload: {
                batch_size: batchSize,
                triggered_by: 'manual_script'
            },
            created_at: new Date().toISOString()
        };

        // Queue the job
        await redis.rpush(EMBEDDING_QUEUE, JSON.stringify(job));
        console.log('[OK] Backfill job queued successfully');
        console.log('');
        console.log('Job Details:');
        console.log('  ID:', job.id);
        console.log('  Type:', job.type);
        console.log('  Batch Size:', batchSize);
        console.log('  Queue:', EMBEDDING_QUEUE);
        console.log('');
        console.log('The worker will process memories without embeddings in batches.');
        console.log('Monitor worker logs for progress: docker compose logs -f worker');

    } catch (error) {
        console.error('[ERROR] Failed to queue backfill job:', error.message);
        process.exit(1);
    } finally {
        await redis.quit();
    }
}

main().catch(console.error);

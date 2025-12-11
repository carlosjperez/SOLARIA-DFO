/**
 * SOLARIA Digital Field Operations - Background Worker
 *
 * Processes background jobs from the Redis queue.
 */

const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'solaria:jobs';

let redis;

async function connectToRedis() {
  redis = new Redis(REDIS_URL);

  redis.on('connect', () => {
    console.log('[worker] Connected to Redis');
  });

  redis.on('error', (err) => {
    console.error('[worker] Redis error:', err.message);
  });

  // Test connection
  await redis.ping();
  console.log('[worker] Redis ping successful');
}

async function processJob(job) {
  const { type, payload, id } = job;
  console.log(`[worker] Processing job ${id}: ${type}`);

  try {
    switch (type) {
      case 'sync_metrics':
        // Placeholder for metrics sync
        console.log('[worker] Syncing metrics...');
        break;

      case 'generate_report':
        // Placeholder for report generation
        console.log('[worker] Generating report...');
        break;

      case 'cleanup':
        // Placeholder for cleanup tasks
        console.log('[worker] Running cleanup...');
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

async function runWorker() {
  console.log('[worker] Starting worker...');
  console.log(`[worker] Redis URL: ${REDIS_URL}`);

  await connectToRedis();

  console.log(`[worker] Listening for jobs on queue: ${QUEUE_NAME}`);

  // Simple blocking pop loop
  while (true) {
    try {
      // BLPOP blocks until a job is available (30 second timeout)
      const result = await redis.blpop(QUEUE_NAME, 30);

      if (result) {
        const [, jobData] = result;
        const job = JSON.parse(jobData);
        await processJob(job);
      }
    } catch (error) {
      if (error.message !== 'Connection is closed') {
        console.error('[worker] Error processing queue:', error.message);
      }

      // Wait before retrying on error
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[worker] Received SIGTERM, shutting down...');
  if (redis) {
    await redis.quit();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[worker] Received SIGINT, shutting down...');
  if (redis) {
    await redis.quit();
  }
  process.exit(0);
});

// Start the worker
runWorker().catch((error) => {
  console.error('[worker] Fatal error:', error);
  process.exit(1);
});

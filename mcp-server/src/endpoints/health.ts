/**
 * Health Check Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-003
 *
 * Comprehensive system health monitoring for database, cache, disk, memory, and CPU
 */

import { z } from 'zod';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ResponseBuilder } from '../utils/response-builder';
import { db } from '../database';
import type { Tool } from '../types/mcp';

const execAsync = promisify(exec);

// ============================================================================
// Constants
// ============================================================================

const VERSION = '2.0.0';
const startTime = Date.now();

// Thresholds for health status
const THRESHOLDS = {
  database: { healthy: 100, degraded: 500 }, // ms
  redis: { healthy: 50, degraded: 200 }, // ms
  disk: { healthy: 70, degraded: 85 }, // percentage
  memory: { healthy: 70, degraded: 85 }, // percentage
  cpu: { healthy: 70, degraded: 90 }, // percentage of cores
};

// ============================================================================
// Types
// ============================================================================

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

interface HealthCheckResult {
  status: HealthStatus;
  message: string;
  latency_ms?: number;
  details?: Record<string, any>;
}

interface HealthData {
  status: HealthStatus;
  timestamp: string;
  uptime_seconds: number;
  version: string;
  checks: {
    database: HealthCheckResult;
    redis: HealthCheckResult;
    disk: HealthCheckResult;
    memory: HealthCheckResult;
    cpu: HealthCheckResult;
  };
  summary: {
    total_checks: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

// ============================================================================
// Validation Schema
// ============================================================================

const GetHealthInputSchema = z.object({
  format: z.enum(['json', 'human']).default('json'),
  include_details: z.boolean().default(true),
});

// ============================================================================
// Health Check Functions
// ============================================================================

/**
 * Check database connectivity and latency
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();

  try {
    await db.query('SELECT 1');
    const latency = Date.now() - start;

    let status: HealthStatus = 'healthy';
    let message = 'Database connection successful';

    if (latency > THRESHOLDS.database.degraded) {
      status = 'unhealthy';
      message = `Database response slow: ${latency}ms`;
    } else if (latency > THRESHOLDS.database.healthy) {
      status = 'degraded';
      message = `Database response elevated: ${latency}ms`;
    }

    return {
      status,
      message,
      latency_ms: latency,
      details: { threshold_healthy_ms: THRESHOLDS.database.healthy },
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error.message}`,
      latency_ms: Date.now() - start,
      details: { error: error.code || 'CONNECTION_FAILED' },
    };
  }
}

/**
 * Check Redis connectivity (if available)
 */
async function checkRedis(): Promise<HealthCheckResult> {
  // Redis check is optional - if not configured, return healthy with note
  try {
    // Check if redis module is available
    const redis = await import('../redis').catch(() => null);

    if (!redis || !redis.client) {
      return {
        status: 'healthy',
        message: 'Redis not configured (optional)',
        details: { configured: false },
      };
    }

    const start = Date.now();
    await redis.client.ping();
    const latency = Date.now() - start;

    let status: HealthStatus = 'healthy';
    let message = 'Redis connection successful';

    if (latency > THRESHOLDS.redis.degraded) {
      status = 'unhealthy';
      message = `Redis response slow: ${latency}ms`;
    } else if (latency > THRESHOLDS.redis.healthy) {
      status = 'degraded';
      message = `Redis response elevated: ${latency}ms`;
    }

    return {
      status,
      message,
      latency_ms: latency,
      details: { threshold_healthy_ms: THRESHOLDS.redis.healthy },
    };
  } catch (error: any) {
    // Redis not available is not critical
    return {
      status: 'healthy',
      message: 'Redis not configured (optional)',
      details: { configured: false },
    };
  }
}

/**
 * Check disk usage
 */
async function checkDisk(): Promise<HealthCheckResult> {
  try {
    // Use df command to get disk usage
    const { stdout } = await execAsync('df -h / | tail -1');
    const parts = stdout.trim().split(/\s+/);

    // parts: [filesystem, size, used, avail, use%, mount]
    const usePercent = parseInt(parts[4]?.replace('%', '') || '0', 10);
    const totalSize = parts[1] || 'unknown';
    const availSize = parts[3] || 'unknown';

    let status: HealthStatus = 'healthy';
    let message = `Disk usage: ${usePercent}%`;

    if (usePercent > THRESHOLDS.disk.degraded) {
      status = 'unhealthy';
      message = `Disk usage critical: ${usePercent}%`;
    } else if (usePercent > THRESHOLDS.disk.healthy) {
      status = 'degraded';
      message = `Disk usage elevated: ${usePercent}%`;
    }

    return {
      status,
      message,
      details: {
        use_percent: usePercent,
        total_size: totalSize,
        available_size: availSize,
        threshold_healthy: THRESHOLDS.disk.healthy,
      },
    };
  } catch (error: any) {
    return {
      status: 'degraded',
      message: `Disk check failed: ${error.message}`,
      details: { error: error.code || 'CHECK_FAILED' },
    };
  }
}

/**
 * Check memory usage
 */
async function checkMemory(): Promise<HealthCheckResult> {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usePercent = Math.round((usedMem / totalMem) * 100);

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)}GB`;
  };

  let status: HealthStatus = 'healthy';
  let message = `Memory usage: ${usePercent}%`;

  if (usePercent > THRESHOLDS.memory.degraded) {
    status = 'unhealthy';
    message = `Memory usage critical: ${usePercent}%`;
  } else if (usePercent > THRESHOLDS.memory.healthy) {
    status = 'degraded';
    message = `Memory usage elevated: ${usePercent}%`;
  }

  return {
    status,
    message,
    details: {
      use_percent: usePercent,
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem),
      threshold_healthy: THRESHOLDS.memory.healthy,
    },
  };
}

/**
 * Check CPU load
 */
async function checkCpu(): Promise<HealthCheckResult> {
  const loadAvg = os.loadavg()[0]; // 1-minute average
  const cpuCount = os.cpus().length;
  const loadPercent = Math.round((loadAvg / cpuCount) * 100);

  let status: HealthStatus = 'healthy';
  let message = `CPU load: ${loadPercent}%`;

  if (loadPercent > THRESHOLDS.cpu.degraded) {
    status = 'unhealthy';
    message = `CPU load critical: ${loadPercent}%`;
  } else if (loadPercent > THRESHOLDS.cpu.healthy) {
    status = 'degraded';
    message = `CPU load elevated: ${loadPercent}%`;
  }

  return {
    status,
    message,
    details: {
      load_1m: loadAvg.toFixed(2),
      load_5m: os.loadavg()[1].toFixed(2),
      load_15m: os.loadavg()[2].toFixed(2),
      cpu_count: cpuCount,
      load_percent: loadPercent,
      threshold_healthy: THRESHOLDS.cpu.healthy,
    },
  };
}

/**
 * Calculate overall health status
 */
function calculateOverallStatus(checks: HealthData['checks']): HealthStatus {
  const statuses = Object.values(checks).map(c => c.status);

  if (statuses.includes('unhealthy')) {
    return 'unhealthy';
  }
  if (statuses.includes('degraded')) {
    return 'degraded';
  }
  return 'healthy';
}

/**
 * Calculate summary counts
 */
function calculateSummary(checks: HealthData['checks']): HealthData['summary'] {
  const statuses = Object.values(checks).map(c => c.status);

  return {
    total_checks: statuses.length,
    passed: statuses.filter(s => s === 'healthy').length,
    warnings: statuses.filter(s => s === 'degraded').length,
    failed: statuses.filter(s => s === 'unhealthy').length,
  };
}

/**
 * Format uptime in human readable form
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);

  return parts.join(' ');
}

/**
 * Format health data for human output
 */
function formatHealth(data: HealthData): string {
  const statusIcon = {
    healthy: '✅',
    degraded: '⚠️',
    unhealthy: '❌',
  };

  const lines = [
    'System Health Report',
    '====================',
    `Status: ${data.status.toUpperCase()} ${statusIcon[data.status]}`,
    `Uptime: ${formatUptime(data.uptime_seconds)}`,
    `Version: ${data.version}`,
    '',
    'Checks:',
  ];

  const checkOrder: (keyof typeof data.checks)[] = ['database', 'redis', 'disk', 'memory', 'cpu'];

  for (const checkName of checkOrder) {
    const check = data.checks[checkName];
    const icon = statusIcon[check.status];
    const name = checkName.charAt(0).toUpperCase() + checkName.slice(1).padEnd(7);

    let detail = '';
    if (check.latency_ms !== undefined) {
      detail = `(${check.latency_ms}ms)`;
    } else if (check.details?.use_percent !== undefined) {
      const total = check.details.total || check.details.total_size || '';
      detail = `(${check.details.use_percent}% of ${total})`;
    } else if (check.details?.load_1m !== undefined) {
      detail = `(load: ${check.details.load_1m}/${check.details.cpu_count})`;
    } else if (check.details?.configured === false) {
      detail = '(not configured)';
    }

    lines.push(`  ${name} ${icon} ${check.status} ${detail}`);
  }

  lines.push('');
  lines.push(`Summary: ${data.summary.passed} passed, ${data.summary.warnings} warning, ${data.summary.failed} failed`);

  return lines.join('\n');
}

// ============================================================================
// Endpoint Implementation
// ============================================================================

export const getHealth: Tool = {
  name: 'get_health',
  description: 'Check system health status including database, cache, disk, memory, and CPU',
  inputSchema: GetHealthInputSchema,

  async execute(params: z.infer<typeof GetHealthInputSchema>) {
    const builder = new ResponseBuilder({ version: VERSION });

    try {
      // Run all health checks in parallel
      const [database, redis, disk, memory, cpu] = await Promise.all([
        checkDatabase(),
        checkRedis(),
        checkDisk(),
        checkMemory(),
        checkCpu(),
      ]);

      const checks = { database, redis, disk, memory, cpu };

      // Remove details if not requested
      if (!params.include_details) {
        for (const check of Object.values(checks)) {
          delete check.details;
        }
      }

      const healthData: HealthData = {
        status: calculateOverallStatus(checks),
        timestamp: new Date().toISOString(),
        uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
        version: VERSION,
        checks,
        summary: calculateSummary(checks),
      };

      const formatted = params.format === 'human' ? formatHealth(healthData) : undefined;

      return builder.success(healthData, {
        format: params.format,
        formatted,
      });
    } catch (error: any) {
      return builder.errorFromException(error);
    }
  },
};

// ============================================================================
// Export
// ============================================================================

export const healthTools = [getHealth];

// Export formatter for use in formatters.ts
export { formatHealth };

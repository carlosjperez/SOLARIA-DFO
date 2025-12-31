/**
 * Health Check Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-003
 *
 * Comprehensive system health monitoring for database, cache, disk, memory, and CPU
 */
import type { Tool } from '../types/mcp.js';
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
/**
 * Format health data for human output
 */
declare function formatHealth(data: HealthData): string;
export declare const getHealth: Tool;
export declare const healthTools: Tool[];
export { formatHealth };

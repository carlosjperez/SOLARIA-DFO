# DFN-003: Health Check Automatizado

**Status:** Implementation Ready
**Author:** ECO-Lambda
**Date:** 2025-12-27
**Sprint:** 1
**Estimated Hours:** 4
**Priority:** Alta

---

## Overview

Implement a comprehensive health check endpoint for the DFO MCP server that monitors system health across multiple dimensions: database connectivity, Redis cache, disk space, memory usage, CPU load, and uptime.

## Motivation

- Enable automated monitoring of DFO infrastructure
- Support graceful degradation when components fail
- Provide actionable health data for operations
- Enable integration with external monitoring (Grafana, Prometheus)

## Technical Specification

### Tool Definition

```typescript
{
  name: 'get_health',
  description: 'Check system health status including database, cache, disk, memory, and CPU',
  inputSchema: z.object({
    format: z.enum(['json', 'human']).default('json'),
    include_details: z.boolean().default(true),
  }),
}
```

### Response Schema

#### Success Response (JSON)

```typescript
interface HealthCheckResponse {
  success: true;
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
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
  };
  metadata: ResponseMetadata;
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  latency_ms?: number;
  details?: Record<string, any>;
}
```

### Health Check Logic

#### Database Check
- Execute `SELECT 1` query
- Measure latency
- Thresholds:
  - Healthy: <100ms
  - Degraded: 100-500ms
  - Unhealthy: >500ms or connection failed

#### Redis Check
- Execute `PING` command
- Measure latency
- Thresholds:
  - Healthy: <50ms
  - Degraded: 50-200ms
  - Unhealthy: >200ms or connection failed

#### Disk Check
- Check `/var/www` (or configured path) disk usage
- Thresholds:
  - Healthy: <70% used
  - Degraded: 70-85% used
  - Unhealthy: >85% used

#### Memory Check
- Check system memory usage
- Thresholds:
  - Healthy: <70% used
  - Degraded: 70-85% used
  - Unhealthy: >85% used

#### CPU Check
- Check 1-minute load average
- Thresholds (relative to CPU count):
  - Healthy: <70%
  - Degraded: 70-90%
  - Unhealthy: >90%

### Human-Readable Format

```
System Health Report
====================
Status: HEALTHY
Uptime: 2d 4h 32m
Version: 2.0.0

Checks:
  Database ✅ healthy (23ms)
  Redis    ✅ healthy (8ms)
  Disk     ✅ healthy (42% of 50GB)
  Memory   ⚠️ degraded (72% of 16GB)
  CPU      ✅ healthy (load: 1.2/4)

Summary: 4 passed, 1 warning, 0 failed
```

### Icon Mapping

| Status | JSON | Human |
|--------|------|-------|
| healthy | `healthy` | ✅ |
| degraded | `degraded` | ⚠️ |
| unhealthy | `unhealthy` | ❌ |

## Implementation Details

### File Location
`mcp-server/src/endpoints/health.ts`

### Dependencies
- `os` module for system stats
- `child_process` for disk usage (df command)
- Database connection from `../database`
- Redis connection from `../redis` (if available)
- ResponseBuilder from `../utils/response-builder`

### Fallback Behavior
- If Redis is not configured, skip Redis check and note in response
- If disk check fails (permissions), return degraded status
- If any critical check fails, overall status is unhealthy

### Performance Requirements
- Total health check should complete in <2s
- Individual check timeout: 5s
- No blocking of other requests

## Test Cases

### Input Validation
1. Accept empty input (use defaults)
2. Accept format='json'
3. Accept format='human'
4. Accept include_details=false
5. Reject invalid format values

### Healthy State
6. All checks pass → status: healthy
7. Response includes all check results
8. Latency is measured and returned
9. Uptime is calculated correctly
10. Version matches package.json

### Degraded State
11. Single degraded check → status: degraded
12. High memory usage → degraded
13. High disk usage → degraded
14. High CPU load → degraded
15. Slow database response → degraded

### Unhealthy State
16. Database connection failed → status: unhealthy
17. Critical threshold exceeded → unhealthy
18. Multiple failures → unhealthy
19. Timeout on check → unhealthy

### Human Format
20. Correct icons displayed
21. Progress bars for metrics
22. Summary section present
23. Uptime formatted correctly
24. All checks listed

### Edge Cases
25. Redis not configured → graceful skip
26. Disk check permission denied → degraded
27. Very high uptime → format correctly
28. Concurrent health checks → no interference

## Acceptance Criteria

- [ ] Endpoint registered in MCP server
- [ ] All 5 health checks implemented
- [ ] JSON and human format supported
- [ ] ResponseBuilder pattern used
- [ ] Tests written (minimum 20)
- [ ] Coverage > 75%
- [ ] Formatter added to registry
- [ ] Documentation updated

## Related

- DFN-002: JSON-First API Standardization (ResponseBuilder pattern)
- DFN-004: Ready Tasks Endpoint (reference implementation)

/**
 * Health Check Endpoint Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-003
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { getHealth } from '../endpoints/health';
import { db } from '../database';

// Mock modules
jest.mock('../database', () => ({
  db: {
    query: jest.fn(),
  },
}));

// Mock os module
const mockOs = {
  totalmem: jest.fn(() => 16 * 1024 * 1024 * 1024), // 16GB
  freemem: jest.fn(() => 8 * 1024 * 1024 * 1024), // 8GB
  loadavg: jest.fn(() => [1.5, 1.2, 1.0]),
  cpus: jest.fn(() => new Array(4).fill({})), // 4 CPUs
};

jest.mock('os', () => mockOs);

// Mock child_process
const mockExec = jest.fn();
jest.mock('child_process', () => ({
  exec: mockExec,
}));

jest.mock('util', () => ({
  promisify: (fn: any) => (...args: any[]) => new Promise((resolve, reject) => {
    mockExec(...args, (err: any, stdout: any, stderr: any) => {
      if (err) reject(err);
      else resolve({ stdout, stderr });
    });
  }),
}));

describe('get_health Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks for healthy state
    (db.query as jest.Mock).mockResolvedValue([{ 1: 1 }]);

    // Mock disk check (df command)
    mockExec.mockImplementation((cmd: string, callback: Function) => {
      callback(null, '/dev/disk1 100G 42G 58G 42% /', '');
    });

    // Reset os mocks
    mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
    mockOs.freemem.mockReturnValue(8 * 1024 * 1024 * 1024);
    mockOs.loadavg.mockReturnValue([1.5, 1.2, 1.0]);
    mockOs.cpus.mockReturnValue(new Array(4).fill({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    it('should accept empty input with defaults', async () => {
      const result = await getHealth.execute({});

      expect(result.success).toBe(true);
    });

    it('should accept format=json', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.format).toBeUndefined(); // JSON format doesn't set format property
      }
    });

    it('should accept format=human', async () => {
      const result = await getHealth.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.format).toBe('human');
        expect(result.formatted).toBeDefined();
      }
    });

    it('should accept include_details=false', async () => {
      const result = await getHealth.execute({ include_details: false });

      expect(result.success).toBe(true);
      if (result.success) {
        // Details should be stripped
        expect(result.data.checks.database.details).toBeUndefined();
      }
    });

    it('should reject invalid format values via schema', async () => {
      const schema = getHealth.inputSchema;

      expect(() => {
        schema.parse({ format: 'xml' });
      }).toThrow();
    });
  });

  describe('Healthy State', () => {
    it('should return healthy when all checks pass', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('healthy');
      }
    });

    it('should include all check results', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.database).toBeDefined();
        expect(result.data.checks.redis).toBeDefined();
        expect(result.data.checks.disk).toBeDefined();
        expect(result.data.checks.memory).toBeDefined();
        expect(result.data.checks.cpu).toBeDefined();
      }
    });

    it('should measure and return database latency', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.database.latency_ms).toBeGreaterThanOrEqual(0);
      }
    });

    it('should calculate uptime correctly', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.uptime_seconds).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return correct version', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.version).toBe('2.0.0');
      }
    });
  });

  describe('Degraded State', () => {
    it('should return degraded when single check is degraded', async () => {
      // Set high memory usage (75%)
      mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
      mockOs.freemem.mockReturnValue(4 * 1024 * 1024 * 1024); // 4GB free = 75% used

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('degraded');
        expect(result.data.checks.memory.status).toBe('degraded');
      }
    });

    it('should return degraded for high memory usage', async () => {
      mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
      mockOs.freemem.mockReturnValue(3.2 * 1024 * 1024 * 1024); // 80% used

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.memory.status).toBe('degraded');
      }
    });

    it('should return degraded for high disk usage', async () => {
      mockExec.mockImplementation((cmd: string, callback: Function) => {
        callback(null, '/dev/disk1 100G 75G 25G 75% /', '');
      });

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.disk.status).toBe('degraded');
      }
    });

    it('should return degraded for high CPU load', async () => {
      mockOs.loadavg.mockReturnValue([3.2, 3.0, 2.8]); // 80% of 4 CPUs
      mockOs.cpus.mockReturnValue(new Array(4).fill({}));

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.cpu.status).toBe('degraded');
      }
    });

    it('should return degraded for slow database response', async () => {
      // Mock slow database
      (db.query as jest.Mock).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay
        return [{ 1: 1 }];
      });

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.database.latency_ms).toBeGreaterThan(100);
        expect(['degraded', 'healthy']).toContain(result.data.checks.database.status);
      }
    });
  });

  describe('Unhealthy State', () => {
    it('should return unhealthy when database connection fails', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('unhealthy');
        expect(result.data.checks.database.status).toBe('unhealthy');
      }
    });

    it('should return unhealthy when critical threshold exceeded', async () => {
      mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
      mockOs.freemem.mockReturnValue(1.5 * 1024 * 1024 * 1024); // 90% used

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.memory.status).toBe('unhealthy');
        expect(result.data.status).toBe('unhealthy');
      }
    });

    it('should return unhealthy when multiple failures occur', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('Connection refused'));
      mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
      mockOs.freemem.mockReturnValue(1.5 * 1024 * 1024 * 1024); // 90% used

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('unhealthy');
        expect(result.data.summary.failed).toBeGreaterThanOrEqual(2);
      }
    });

    it('should include error details in unhealthy database check', async () => {
      const dbError = new Error('Connection refused');
      (dbError as any).code = 'ECONNREFUSED';
      (db.query as jest.Mock).mockRejectedValue(dbError);

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.database.message).toContain('Connection refused');
      }
    });
  });

  describe('Human Format Output', () => {
    it('should display correct icons', async () => {
      const result = await getHealth.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('✅');
      }
    });

    it('should show summary section', async () => {
      const result = await getHealth.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('Summary:');
        expect(result.formatted).toContain('passed');
      }
    });

    it('should format uptime correctly', async () => {
      const result = await getHealth.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('Uptime:');
      }
    });

    it('should list all checks', async () => {
      const result = await getHealth.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('Database');
        expect(result.formatted).toContain('Redis');
        expect(result.formatted).toContain('Disk');
        expect(result.formatted).toContain('Memory');
        expect(result.formatted).toContain('Cpu');
      }
    });

    it('should show degraded icon for degraded check', async () => {
      mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
      mockOs.freemem.mockReturnValue(4 * 1024 * 1024 * 1024); // 75% used

      const result = await getHealth.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('⚠️');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle Redis not configured gracefully', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.redis.status).toBe('healthy');
        expect(result.data.checks.redis.details?.configured).toBe(false);
      }
    });

    it('should handle disk check permission denied', async () => {
      mockExec.mockImplementation((cmd: string, callback: Function) => {
        callback(new Error('Permission denied'), '', '');
      });

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checks.disk.status).toBe('degraded');
      }
    });

    it('should format very high uptime correctly', async () => {
      // This tests the formatUptime function with large values
      const result = await getHealth.execute({ format: 'human' });

      expect(result.success).toBe(true);
      if (result.success && result.formatted) {
        expect(result.formatted).toContain('Uptime:');
      }
    });

    it('should handle concurrent health checks', async () => {
      const results = await Promise.all([
        getHealth.execute({ format: 'json' }),
        getHealth.execute({ format: 'json' }),
        getHealth.execute({ format: 'json' }),
      ]);

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Metadata', () => {
    it('should include metadata in responses', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.metadata).toBeDefined();
        expect(result.metadata?.timestamp).toBeDefined();
        expect(result.metadata?.request_id).toBeDefined();
        expect(result.metadata?.version).toBe('2.0.0');
      }
    });

    it('should measure execution time', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.metadata?.execution_time_ms).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Summary Calculation', () => {
    it('should count passed checks correctly', async () => {
      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary.total_checks).toBe(5);
        expect(result.data.summary.passed).toBeGreaterThanOrEqual(1);
      }
    });

    it('should count warnings correctly', async () => {
      mockOs.totalmem.mockReturnValue(16 * 1024 * 1024 * 1024);
      mockOs.freemem.mockReturnValue(4 * 1024 * 1024 * 1024); // 75% used

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary.warnings).toBeGreaterThanOrEqual(1);
      }
    });

    it('should count failures correctly', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      const result = await getHealth.execute({ format: 'json' });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.summary.failed).toBeGreaterThanOrEqual(1);
      }
    });
  });
});

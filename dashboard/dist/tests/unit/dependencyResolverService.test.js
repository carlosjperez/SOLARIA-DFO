"use strict";
/**
 * SOLARIA DFO - DependencyResolverService Tests
 * DFO 4.0 - Parallel Agent Execution Engine
 *
 * Comprehensive unit tests for DependencyResolverService
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const promise_1 = __importDefault(require("mysql2/promise"));
const dependencyResolverService_js_1 = __importDefault(require("../../services/dependencyResolverService.js"));
(0, globals_1.describe)('DependencyResolverService', () => {
    let db;
    let service;
    (0, globals_1.beforeAll)(async () => {
        // Connect to test database
        db = await promise_1.default.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'solaria_construction_test',
        });
        // Create service instance
        service = new dependencyResolverService_js_1.default(db);
        // Wait for connection
        await new Promise((resolve) => setTimeout(resolve, 100));
    });
    (0, globals_1.afterAll)(async () => {
        await service.close();
        await db.end();
    });
    (0, globals_1.beforeEach)(async () => {
        // Clean up test data
        await db.execute('DELETE FROM task_dependencies WHERE task_id >= 9000');
        await db.execute('DELETE FROM tasks WHERE id >= 9000');
    });
    // ========================================================================
    // Helper Functions
    // ========================================================================
    async function createTestTask(id, projectId = 1) {
        await db.execute(`INSERT INTO tasks (id, project_id, task_number, title, status, priority, estimated_hours)
             VALUES (?, ?, ?, ?, 'pending', 'medium', 2)`, [id, projectId, id, `Test Task ${id}`]);
    }
    async function createDependency(taskId, dependsOnId, type = 'blocks') {
        await db.execute(`INSERT INTO task_dependencies (task_id, depends_on_task_id, dependency_type)
             VALUES (?, ?, ?)`, [taskId, dependsOnId, type]);
    }
    // ========================================================================
    // resolveDependencyOrder() Tests
    // ========================================================================
    (0, globals_1.describe)('resolveDependencyOrder()', () => {
        (0, globals_1.it)('should return empty array for empty input', async () => {
            const result = await service.resolveDependencyOrder([]);
            (0, globals_1.expect)(result).toEqual([]);
        });
        (0, globals_1.it)('should return single task when no dependencies', async () => {
            await createTestTask(9001);
            const result = await service.resolveDependencyOrder([9001]);
            (0, globals_1.expect)(result).toEqual([9001]);
        });
        (0, globals_1.it)('should order tasks with simple chain (A -> B -> C)', async () => {
            // Create tasks: 9001 -> 9002 -> 9003
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createDependency(9001, 9002); // 9001 depends on 9002
            await createDependency(9002, 9003); // 9002 depends on 9003
            const result = await service.resolveDependencyOrder([9001, 9002, 9003]);
            // Expected order: 9003, 9002, 9001 (dependencies first)
            (0, globals_1.expect)(result).toEqual([9003, 9002, 9001]);
        });
        (0, globals_1.it)('should handle parallel branches correctly', async () => {
            /**
             * Dependency structure:
             *       9001
             *       /  \
             *    9002  9003
             *       \  /
             *       9004
             */
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createTestTask(9004);
            await createDependency(9001, 9002);
            await createDependency(9001, 9003);
            await createDependency(9002, 9004);
            await createDependency(9003, 9004);
            const result = await service.resolveDependencyOrder([9001, 9002, 9003, 9004]);
            // 9004 must be first, 9001 must be last
            (0, globals_1.expect)(result[0]).toBe(9004);
            (0, globals_1.expect)(result[3]).toBe(9001);
            // 9002 and 9003 can be in any order (both depend on 9004)
            (0, globals_1.expect)(result.slice(1, 3).sort()).toEqual([9002, 9003]);
        });
        (0, globals_1.it)('should throw error when cycle detected', async () => {
            // Create cycle: 9001 -> 9002 -> 9003 -> 9001
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createDependency(9001, 9002);
            await createDependency(9002, 9003);
            await createDependency(9003, 9001); // Creates cycle
            await (0, globals_1.expect)(service.resolveDependencyOrder([9001, 9002, 9003])).rejects.toThrow('Cycle detected');
        });
        (0, globals_1.it)('should handle tasks with no dependencies at all', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            const result = await service.resolveDependencyOrder([9001, 9002, 9003]);
            // All tasks have in-degree 0, any order is valid
            (0, globals_1.expect)(result.length).toBe(3);
            (0, globals_1.expect)(result.sort()).toEqual([9001, 9002, 9003]);
        });
        (0, globals_1.it)('should ignore dependencies outside the provided task set', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createDependency(9001, 9002);
            await createDependency(9002, 9003);
            // Only resolve order for 9001 and 9002
            const result = await service.resolveDependencyOrder([9001, 9002]);
            // 9003 is ignored, so 9002 should appear first
            (0, globals_1.expect)(result).toEqual([9002, 9001]);
        });
    });
    // ========================================================================
    // detectCycles() Tests
    // ========================================================================
    (0, globals_1.describe)('detectCycles()', () => {
        (0, globals_1.it)('should return no cycles for empty input', async () => {
            const result = await service.detectCycles([]);
            (0, globals_1.expect)(result.hasCycle).toBe(false);
            (0, globals_1.expect)(result.cycles).toEqual([]);
            (0, globals_1.expect)(result.cyclePaths).toEqual([]);
        });
        (0, globals_1.it)('should return no cycles for tasks without dependencies', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            const result = await service.detectCycles([9001, 9002]);
            (0, globals_1.expect)(result.hasCycle).toBe(false);
            (0, globals_1.expect)(result.cycles).toEqual([]);
        });
        (0, globals_1.it)('should return no cycles for valid DAG', async () => {
            // DAG: 9001 -> 9002 -> 9003
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createDependency(9001, 9002);
            await createDependency(9002, 9003);
            const result = await service.detectCycles([9001, 9002, 9003]);
            (0, globals_1.expect)(result.hasCycle).toBe(false);
        });
        (0, globals_1.it)('should detect simple cycle (A -> B -> A)', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createDependency(9001, 9002);
            await createDependency(9002, 9001); // Creates cycle
            const result = await service.detectCycles([9001, 9002]);
            (0, globals_1.expect)(result.hasCycle).toBe(true);
            (0, globals_1.expect)(result.cycles.length).toBeGreaterThan(0);
            (0, globals_1.expect)(result.cyclePaths.length).toBeGreaterThan(0);
        });
        (0, globals_1.it)('should detect complex cycle (A -> B -> C -> A)', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createDependency(9001, 9002);
            await createDependency(9002, 9003);
            await createDependency(9003, 9001); // Creates cycle
            const result = await service.detectCycles([9001, 9002, 9003]);
            (0, globals_1.expect)(result.hasCycle).toBe(true);
            (0, globals_1.expect)(result.cycles.length).toBeGreaterThan(0);
            // Verify cycle path contains all three tasks
            const cyclePath = result.cyclePaths[0];
            (0, globals_1.expect)(cyclePath.length).toBeGreaterThanOrEqual(3);
        });
        (0, globals_1.it)('should detect self-loop (A -> A)', async () => {
            await createTestTask(9001);
            await createDependency(9001, 9001); // Self-loop
            const result = await service.detectCycles([9001]);
            (0, globals_1.expect)(result.hasCycle).toBe(true);
        });
        (0, globals_1.it)('should detect multiple independent cycles', async () => {
            // Cycle 1: 9001 <-> 9002
            await createTestTask(9001);
            await createTestTask(9002);
            await createDependency(9001, 9002);
            await createDependency(9002, 9001);
            // Cycle 2: 9003 <-> 9004
            await createTestTask(9003);
            await createTestTask(9004);
            await createDependency(9003, 9004);
            await createDependency(9004, 9003);
            const result = await service.detectCycles([9001, 9002, 9003, 9004]);
            (0, globals_1.expect)(result.hasCycle).toBe(true);
            // Should detect at least 2 cycles
            (0, globals_1.expect)(result.cycles.length).toBeGreaterThanOrEqual(2);
        });
        (0, globals_1.it)('should format cycle paths with task codes', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createDependency(9001, 9002);
            await createDependency(9002, 9001);
            const result = await service.detectCycles([9001, 9002]);
            (0, globals_1.expect)(result.hasCycle).toBe(true);
            (0, globals_1.expect)(result.cyclePaths.length).toBeGreaterThan(0);
            // Cycle paths should contain task codes (strings), not just IDs
            const cyclePath = result.cyclePaths[0];
            (0, globals_1.expect)(typeof cyclePath[0]).toBe('string');
            (0, globals_1.expect)(cyclePath[0]).toMatch(/^\w+-\d+$/); // Format: CODE-NUMBER
        });
    });
    // ========================================================================
    // getParallelExecutionGroups() Tests
    // ========================================================================
    (0, globals_1.describe)('getParallelExecutionGroups()', () => {
        (0, globals_1.it)('should return empty plan for empty input', async () => {
            const result = await service.getParallelExecutionGroups([]);
            (0, globals_1.expect)(result.groups).toEqual([]);
            (0, globals_1.expect)(result.totalGroups).toBe(0);
            (0, globals_1.expect)(result.estimatedSequentialTime).toBe(0);
            (0, globals_1.expect)(result.estimatedParallelTime).toBe(0);
        });
        (0, globals_1.it)('should create single group for independent tasks', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            const result = await service.getParallelExecutionGroups([9001, 9002, 9003]);
            // All tasks can run in parallel
            (0, globals_1.expect)(result.totalGroups).toBe(1);
            (0, globals_1.expect)(result.groups[0].sort()).toEqual([9001, 9002, 9003]);
            // Sequential: 2 + 2 + 2 = 6 hours
            (0, globals_1.expect)(result.estimatedSequentialTime).toBe(6);
            // Parallel: max(2, 2, 2) = 2 hours
            (0, globals_1.expect)(result.estimatedParallelTime).toBe(2);
        });
        (0, globals_1.it)('should create multiple groups for chained dependencies', async () => {
            // Chain: 9003 -> 9002 -> 9001
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createDependency(9001, 9002);
            await createDependency(9002, 9003);
            const result = await service.getParallelExecutionGroups([9001, 9002, 9003]);
            // Should create 3 groups (one per level)
            (0, globals_1.expect)(result.totalGroups).toBe(3);
            (0, globals_1.expect)(result.groups[0]).toEqual([9003]); // No dependencies
            (0, globals_1.expect)(result.groups[1]).toEqual([9002]); // Depends on 9003
            (0, globals_1.expect)(result.groups[2]).toEqual([9001]); // Depends on 9002
            // Both sequential and parallel should be 6 hours (no parallelism)
            (0, globals_1.expect)(result.estimatedSequentialTime).toBe(6);
            (0, globals_1.expect)(result.estimatedParallelTime).toBe(6);
        });
        (0, globals_1.it)('should optimize parallel execution for diamond structure', async () => {
            /**
             *       9004
             *       /  \
             *    9002  9003
             *       \  /
             *       9001
             */
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createTestTask(9004);
            await createDependency(9001, 9002);
            await createDependency(9001, 9003);
            await createDependency(9002, 9004);
            await createDependency(9003, 9004);
            const result = await service.getParallelExecutionGroups([9001, 9002, 9003, 9004]);
            (0, globals_1.expect)(result.totalGroups).toBe(3);
            // Group 1: 9004 (no deps)
            (0, globals_1.expect)(result.groups[0]).toEqual([9004]);
            // Group 2: 9002 and 9003 (both depend only on 9004)
            (0, globals_1.expect)(result.groups[1].sort()).toEqual([9002, 9003]);
            // Group 3: 9001 (depends on both)
            (0, globals_1.expect)(result.groups[2]).toEqual([9001]);
            // Sequential: 2 + 2 + 2 + 2 = 8 hours
            (0, globals_1.expect)(result.estimatedSequentialTime).toBe(8);
            // Parallel: Group1(2) + Group2(max(2,2)=2) + Group3(2) = 6 hours
            (0, globals_1.expect)(result.estimatedParallelTime).toBe(6);
        });
        (0, globals_1.it)('should throw error when cycle prevents grouping', async () => {
            // Create cycle
            await createTestTask(9001);
            await createTestTask(9002);
            await createDependency(9001, 9002);
            await createDependency(9002, 9001);
            await (0, globals_1.expect)(service.getParallelExecutionGroups([9001, 9002])).rejects.toThrow('cycle detected');
        });
        (0, globals_1.it)('should use task estimated_hours for time calculations', async () => {
            // Create tasks with different estimates
            await db.execute(`INSERT INTO tasks (id, project_id, task_number, title, status, priority, estimated_hours)
                 VALUES (9001, 1, 9001, 'Fast Task', 'pending', 'medium', 1)`, []);
            await db.execute(`INSERT INTO tasks (id, project_id, task_number, title, status, priority, estimated_hours)
                 VALUES (9002, 1, 9002, 'Slow Task', 'pending', 'medium', 5)`, []);
            const result = await service.getParallelExecutionGroups([9001, 9002]);
            // Sequential: 1 + 5 = 6
            (0, globals_1.expect)(result.estimatedSequentialTime).toBe(6);
            // Parallel: max(1, 5) = 5
            (0, globals_1.expect)(result.estimatedParallelTime).toBe(5);
        });
        (0, globals_1.it)('should handle complex graph with multiple levels', async () => {
            /**
             * Level 1: 9006 (no deps)
             * Level 2: 9004, 9005 (depend on 9006)
             * Level 3: 9002, 9003 (depend on 9004/9005)
             * Level 4: 9001 (depends on 9002/9003)
             */
            for (let i = 9001; i <= 9006; i++) {
                await createTestTask(i);
            }
            await createDependency(9004, 9006);
            await createDependency(9005, 9006);
            await createDependency(9002, 9004);
            await createDependency(9003, 9005);
            await createDependency(9001, 9002);
            await createDependency(9001, 9003);
            const result = await service.getParallelExecutionGroups([
                9001, 9002, 9003, 9004, 9005, 9006,
            ]);
            (0, globals_1.expect)(result.totalGroups).toBe(4);
            // Verify each level
            (0, globals_1.expect)(result.groups[0]).toEqual([9006]);
            (0, globals_1.expect)(result.groups[1].sort()).toEqual([9004, 9005]);
            (0, globals_1.expect)(result.groups[2].sort()).toEqual([9002, 9003]);
            (0, globals_1.expect)(result.groups[3]).toEqual([9001]);
            // Sequential: 6 tasks * 2 hours = 12
            (0, globals_1.expect)(result.estimatedSequentialTime).toBe(12);
            // Parallel: 4 levels * 2 hours = 8
            (0, globals_1.expect)(result.estimatedParallelTime).toBe(8);
        });
    });
    // ========================================================================
    // Edge Cases and Error Handling
    // ========================================================================
    (0, globals_1.describe)('Edge Cases', () => {
        (0, globals_1.it)('should handle tasks with missing estimates (default to 1 hour)', async () => {
            await db.execute(`INSERT INTO tasks (id, project_id, task_number, title, status, priority, estimated_hours)
                 VALUES (9001, 1, 9001, 'No Estimate', 'pending', 'medium', NULL)`, []);
            const result = await service.getParallelExecutionGroups([9001]);
            // Should default to 1 hour
            (0, globals_1.expect)(result.estimatedSequentialTime).toBe(1);
        });
        (0, globals_1.it)('should handle mixed dependency types (blocks and depends_on)', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createTestTask(9003);
            await createDependency(9001, 9002, 'blocks');
            await createDependency(9002, 9003, 'depends_on');
            const result = await service.resolveDependencyOrder([9001, 9002, 9003]);
            (0, globals_1.expect)(result).toEqual([9003, 9002, 9001]);
        });
        (0, globals_1.it)('should ignore non-blocking dependency types (related, child_of)', async () => {
            await createTestTask(9001);
            await createTestTask(9002);
            await createDependency(9001, 9002, 'related'); // Non-blocking
            const result = await service.resolveDependencyOrder([9001, 9002]);
            // Both should have in-degree 0 (related dependencies ignored)
            (0, globals_1.expect)(result.length).toBe(2);
        });
    });
});
//# sourceMappingURL=dependencyResolverService.test.js.map
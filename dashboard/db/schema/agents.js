"use strict";
/**
 * SOLARIA DFO - Agents Schema (Drizzle ORM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentStatesRelations = exports.aiAgentsRelations = exports.agentMetrics = exports.agentStates = exports.aiAgents = exports.agentStatusEnum = exports.agentRoleEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
// Agent role enum
exports.agentRoleEnum = (0, mysql_core_1.mysqlEnum)('role', [
    'project_manager',
    'architect',
    'developer',
    'tester',
    'analyst',
    'designer',
    'devops',
    'technical_writer',
    'security_auditor',
    'deployment_specialist',
]);
// Agent status enum
exports.agentStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'active',
    'busy',
    'inactive',
    'error',
    'maintenance',
]);
// AI Agents table
exports.aiAgents = (0, mysql_core_1.mysqlTable)('ai_agents', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    role: exports.agentRoleEnum.notNull(),
    status: exports.agentStatusEnum.default('inactive'),
    capabilities: (0, mysql_core_1.json)('capabilities'),
    configuration: (0, mysql_core_1.json)('configuration'),
    lastActivity: (0, mysql_core_1.timestamp)('last_activity'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Agent states table
exports.agentStates = (0, mysql_core_1.mysqlTable)('agent_states', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    agentId: (0, mysql_core_1.int)('agent_id')
        .notNull()
        .references(() => exports.aiAgents.id, { onDelete: 'cascade' }),
    status: (0, mysql_core_1.varchar)('status', { length: 50 }).notNull(),
    currentTask: (0, mysql_core_1.text)('current_task'),
    lastHeartbeat: (0, mysql_core_1.timestamp)('last_heartbeat').defaultNow(),
    performanceMetrics: (0, mysql_core_1.json)('performance_metrics'),
});
// Agent metrics table
exports.agentMetrics = (0, mysql_core_1.mysqlTable)('agent_metrics', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    agentId: (0, mysql_core_1.int)('agent_id')
        .notNull()
        .references(() => exports.aiAgents.id, { onDelete: 'cascade' }),
    metricType: (0, mysql_core_1.varchar)('metric_type', { length: 50 }).notNull(),
    metricValue: (0, mysql_core_1.decimal)('metric_value', { precision: 10, scale: 4 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Relations
exports.aiAgentsRelations = (0, drizzle_orm_1.relations)(exports.aiAgents, ({ one, many }) => ({
    state: one(exports.agentStates, {
        fields: [exports.aiAgents.id],
        references: [exports.agentStates.agentId],
    }),
    metrics: many(exports.agentMetrics),
}));
exports.agentStatesRelations = (0, drizzle_orm_1.relations)(exports.agentStates, ({ one }) => ({
    agent: one(exports.aiAgents, {
        fields: [exports.agentStates.agentId],
        references: [exports.aiAgents.id],
    }),
}));
//# sourceMappingURL=agents.js.map
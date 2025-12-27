"use strict";
/**
 * SOLARIA DFO - Alerts & Activity Logs Schema (Drizzle ORM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityLogsRelations = exports.alertsRelations = exports.activityLogs = exports.logLevelEnum = exports.logCategoryEnum = exports.alerts = exports.alertStatusEnum = exports.alertSeverityEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_js_1 = require("./projects.js");
const agents_js_1 = require("./agents.js");
const tasks_js_1 = require("./tasks.js");
const users_js_1 = require("./users.js");
// Alert severity enum
exports.alertSeverityEnum = (0, mysql_core_1.mysqlEnum)('severity', ['low', 'medium', 'high', 'critical']);
// Alert status enum
exports.alertStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'active',
    'acknowledged',
    'resolved',
    'dismissed',
]);
// Alerts table
exports.alerts = (0, mysql_core_1.mysqlTable)('alerts', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)('title', { length: 200 }).notNull(),
    message: (0, mysql_core_1.text)('message'),
    severity: exports.alertSeverityEnum.default('medium'),
    status: exports.alertStatusEnum.default('active'),
    projectId: (0, mysql_core_1.int)('project_id').references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    agentId: (0, mysql_core_1.int)('agent_id').references(() => agents_js_1.aiAgents.id, { onDelete: 'set null' }),
    taskId: (0, mysql_core_1.int)('task_id').references(() => tasks_js_1.tasks.id, { onDelete: 'set null' }),
    acknowledgedBy: (0, mysql_core_1.int)('acknowledged_by').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    acknowledgedAt: (0, mysql_core_1.timestamp)('acknowledged_at'),
    resolvedAt: (0, mysql_core_1.timestamp)('resolved_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Activity log category enum
exports.logCategoryEnum = (0, mysql_core_1.mysqlEnum)('category', [
    'development',
    'testing',
    'deployment',
    'management',
    'security',
    'system',
]);
// Activity log level enum
exports.logLevelEnum = (0, mysql_core_1.mysqlEnum)('level', ['debug', 'info', 'warning', 'error', 'critical']);
// Activity logs table
exports.activityLogs = (0, mysql_core_1.mysqlTable)('activity_logs', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id').references(() => projects_js_1.projects.id, { onDelete: 'set null' }),
    agentId: (0, mysql_core_1.int)('agent_id').references(() => agents_js_1.aiAgents.id, { onDelete: 'set null' }),
    taskId: (0, mysql_core_1.int)('task_id').references(() => tasks_js_1.tasks.id, { onDelete: 'set null' }),
    userId: (0, mysql_core_1.int)('user_id').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    action: (0, mysql_core_1.varchar)('action', { length: 100 }).notNull(),
    details: (0, mysql_core_1.text)('details'),
    category: exports.logCategoryEnum.default('system'),
    level: exports.logLevelEnum.default('info'),
    timestamp: (0, mysql_core_1.timestamp)('timestamp').defaultNow(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Relations
exports.alertsRelations = (0, drizzle_orm_1.relations)(exports.alerts, ({ one }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.alerts.projectId],
        references: [projects_js_1.projects.id],
    }),
    agent: one(agents_js_1.aiAgents, {
        fields: [exports.alerts.agentId],
        references: [agents_js_1.aiAgents.id],
    }),
    task: one(tasks_js_1.tasks, {
        fields: [exports.alerts.taskId],
        references: [tasks_js_1.tasks.id],
    }),
    acknowledgedByUser: one(users_js_1.users, {
        fields: [exports.alerts.acknowledgedBy],
        references: [users_js_1.users.id],
    }),
}));
exports.activityLogsRelations = (0, drizzle_orm_1.relations)(exports.activityLogs, ({ one }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.activityLogs.projectId],
        references: [projects_js_1.projects.id],
    }),
    agent: one(agents_js_1.aiAgents, {
        fields: [exports.activityLogs.agentId],
        references: [agents_js_1.aiAgents.id],
    }),
    task: one(tasks_js_1.tasks, {
        fields: [exports.activityLogs.taskId],
        references: [tasks_js_1.tasks.id],
    }),
    user: one(users_js_1.users, {
        fields: [exports.activityLogs.userId],
        references: [users_js_1.users.id],
    }),
}));
//# sourceMappingURL=alerts.js.map
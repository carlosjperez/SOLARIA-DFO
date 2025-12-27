"use strict";
/**
 * SOLARIA DFO - Webhooks Schema (Drizzle ORM)
 *
 * Manages webhook subscriptions for n8n and external integrations.
 * Supports event-driven architecture for task/project notifications.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookDeliveriesRelations = exports.webhooksRelations = exports.webhookDeliveries = exports.webhooks = exports.httpMethodEnum = exports.webhookEventEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_js_1 = require("./projects.js");
// Webhook event types
exports.webhookEventEnum = (0, mysql_core_1.mysqlEnum)('event_type', [
    // Task events
    'task.created',
    'task.updated',
    'task.completed',
    'task.deleted',
    'task.status_changed',
    'task.assigned',
    // Project events
    'project.created',
    'project.updated',
    'project.status_changed',
    'project.completed',
    // Agent events
    'agent.status_changed',
    'agent.task_assigned',
    // Memory events
    'memory.created',
    'memory.updated',
    // Alert events
    'alert.created',
    'alert.resolved',
    // Catch-all
    'all',
]);
// HTTP method enum
exports.httpMethodEnum = (0, mysql_core_1.mysqlEnum)('http_method', ['POST', 'GET', 'PUT']);
// Webhooks table
exports.webhooks = (0, mysql_core_1.mysqlTable)('webhooks', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    // Name for identification
    name: (0, mysql_core_1.varchar)('name', { length: 200 }).notNull(),
    // Optional project filter (null = global webhook)
    projectId: (0, mysql_core_1.int)('project_id').references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    // Webhook URL (n8n webhook URL)
    url: (0, mysql_core_1.varchar)('url', { length: 500 }).notNull(),
    // Event type to trigger on
    eventType: exports.webhookEventEnum.notNull(),
    // HTTP method (default POST)
    httpMethod: exports.httpMethodEnum.default('POST'),
    // Secret for HMAC signature verification
    secret: (0, mysql_core_1.varchar)('secret', { length: 64 }),
    // Custom headers (JSON object)
    headers: (0, mysql_core_1.json)('headers').$type(),
    // Active flag
    active: (0, mysql_core_1.tinyint)('active').default(1),
    // Retry settings
    maxRetries: (0, mysql_core_1.int)('max_retries').default(3),
    retryDelayMs: (0, mysql_core_1.int)('retry_delay_ms').default(1000),
    // Stats
    triggerCount: (0, mysql_core_1.int)('trigger_count').default(0),
    successCount: (0, mysql_core_1.int)('success_count').default(0),
    failureCount: (0, mysql_core_1.int)('failure_count').default(0),
    lastTriggeredAt: (0, mysql_core_1.timestamp)('last_triggered_at'),
    lastStatusCode: (0, mysql_core_1.int)('last_status_code'),
    lastError: (0, mysql_core_1.text)('last_error'),
    // Timestamps
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Webhook delivery log for debugging
exports.webhookDeliveries = (0, mysql_core_1.mysqlTable)('webhook_deliveries', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    webhookId: (0, mysql_core_1.int)('webhook_id')
        .notNull()
        .references(() => exports.webhooks.id, { onDelete: 'cascade' }),
    // Event details
    eventType: (0, mysql_core_1.varchar)('event_type', { length: 50 }).notNull(),
    eventPayload: (0, mysql_core_1.json)('event_payload').$type(),
    // Request details
    requestUrl: (0, mysql_core_1.varchar)('request_url', { length: 500 }).notNull(),
    requestHeaders: (0, mysql_core_1.json)('request_headers').$type(),
    requestBody: (0, mysql_core_1.text)('request_body'),
    // Response details
    responseStatusCode: (0, mysql_core_1.int)('response_status_code'),
    responseBody: (0, mysql_core_1.text)('response_body'),
    responseTimeMs: (0, mysql_core_1.int)('response_time_ms'),
    // Status
    success: (0, mysql_core_1.tinyint)('success').default(0),
    errorMessage: (0, mysql_core_1.text)('error_message'),
    retryCount: (0, mysql_core_1.int)('retry_count').default(0),
    // Timestamps
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Relations
exports.webhooksRelations = (0, drizzle_orm_1.relations)(exports.webhooks, ({ one, many }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.webhooks.projectId],
        references: [projects_js_1.projects.id],
    }),
    deliveries: many(exports.webhookDeliveries),
}));
exports.webhookDeliveriesRelations = (0, drizzle_orm_1.relations)(exports.webhookDeliveries, ({ one }) => ({
    webhook: one(exports.webhooks, {
        fields: [exports.webhookDeliveries.webhookId],
        references: [exports.webhooks.id],
    }),
}));
//# sourceMappingURL=webhooks.js.map
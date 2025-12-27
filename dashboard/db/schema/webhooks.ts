/**
 * SOLARIA DFO - Webhooks Schema (Drizzle ORM)
 *
 * Manages webhook subscriptions for n8n and external integrations.
 * Supports event-driven architecture for task/project notifications.
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    timestamp,
    mysqlEnum,
    tinyint,
    json,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects } from './projects.js';

// Webhook event types
export const webhookEventEnum = mysqlEnum('event_type', [
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
export const httpMethodEnum = mysqlEnum('http_method', ['POST', 'GET', 'PUT']);

// Webhooks table
export const webhooks = mysqlTable('webhooks', {
    id: int('id').primaryKey().autoincrement(),
    // Name for identification
    name: varchar('name', { length: 200 }).notNull(),
    // Optional project filter (null = global webhook)
    projectId: int('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    // Webhook URL (n8n webhook URL)
    url: varchar('url', { length: 500 }).notNull(),
    // Event type to trigger on
    eventType: webhookEventEnum.notNull(),
    // HTTP method (default POST)
    httpMethod: httpMethodEnum.default('POST'),
    // Secret for HMAC signature verification
    secret: varchar('secret', { length: 64 }),
    // Custom headers (JSON object)
    headers: json('headers').$type<Record<string, string>>(),
    // Active flag
    active: tinyint('active').default(1),
    // Retry settings
    maxRetries: int('max_retries').default(3),
    retryDelayMs: int('retry_delay_ms').default(1000),
    // Stats
    triggerCount: int('trigger_count').default(0),
    successCount: int('success_count').default(0),
    failureCount: int('failure_count').default(0),
    lastTriggeredAt: timestamp('last_triggered_at'),
    lastStatusCode: int('last_status_code'),
    lastError: text('last_error'),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Webhook delivery log for debugging
export const webhookDeliveries = mysqlTable('webhook_deliveries', {
    id: int('id').primaryKey().autoincrement(),
    webhookId: int('webhook_id')
        .notNull()
        .references(() => webhooks.id, { onDelete: 'cascade' }),
    // Event details
    eventType: varchar('event_type', { length: 50 }).notNull(),
    eventPayload: json('event_payload').$type<Record<string, unknown>>(),
    // Request details
    requestUrl: varchar('request_url', { length: 500 }).notNull(),
    requestHeaders: json('request_headers').$type<Record<string, string>>(),
    requestBody: text('request_body'),
    // Response details
    responseStatusCode: int('response_status_code'),
    responseBody: text('response_body'),
    responseTimeMs: int('response_time_ms'),
    // Status
    success: tinyint('success').default(0),
    errorMessage: text('error_message'),
    retryCount: int('retry_count').default(0),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
    project: one(projects, {
        fields: [webhooks.projectId],
        references: [projects.id],
    }),
    deliveries: many(webhookDeliveries),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({ one }) => ({
    webhook: one(webhooks, {
        fields: [webhookDeliveries.webhookId],
        references: [webhooks.id],
    }),
}));

// Type exports
export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type WebhookDelivery = typeof webhookDeliveries.$inferSelect;
export type NewWebhookDelivery = typeof webhookDeliveries.$inferInsert;
export type WebhookEventType =
    | 'task.created' | 'task.updated' | 'task.completed' | 'task.deleted'
    | 'task.status_changed' | 'task.assigned'
    | 'project.created' | 'project.updated' | 'project.status_changed' | 'project.completed'
    | 'agent.status_changed' | 'agent.task_assigned'
    | 'memory.created' | 'memory.updated'
    | 'alert.created' | 'alert.resolved'
    | 'all';

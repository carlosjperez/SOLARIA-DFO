/**
 * SOLARIA DFO - Projects Schema (Drizzle ORM)
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    json,
    decimal,
    date,
    timestamp,
    mysqlEnum,
    tinyint,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';

// Project status enum
export const projectStatusEnum = mysqlEnum('status', [
    'planning',
    'development',
    'testing',
    'deployment',
    'completed',
    'on_hold',
    'cancelled',
]);

// Priority enum
export const priorityEnum = mysqlEnum('priority', ['low', 'medium', 'high', 'critical']);

// Office origin enum
export const officeOriginEnum = mysqlEnum('office_origin', ['dfo', 'office']);

// Projects table
export const projects = mysqlTable('projects', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 200 }).notNull(),
    code: varchar('code', { length: 10 }).notNull().default('PRJ'),
    client: varchar('client', { length: 200 }),
    officeOrigin: officeOriginEnum.default('dfo'),
    officeVisible: tinyint('office_visible').default(0),
    description: text('description'),
    status: projectStatusEnum.default('planning'),
    priority: priorityEnum.default('medium'),
    budget: decimal('budget', { precision: 15, scale: 2 }).default('0'),
    actualCost: decimal('actual_cost', { precision: 15, scale: 2 }).default('0'),
    completionPercentage: int('completion_percentage').default(0),
    startDate: date('start_date'),
    deadline: date('deadline'),
    // Project URLs
    productionUrl: varchar('production_url', { length: 500 }),
    stagingUrl: varchar('staging_url', { length: 500 }),
    localUrl: varchar('local_url', { length: 500 }),
    repoUrl: varchar('repo_url', { length: 500 }),
    // Tags (JSON array of strings)
    tags: json('tags').$type<string[]>(), // ["SAAS", "REACT", "B2B"]
    // Stack (JSON array of tech names)
    stack: json('stack').$type<string[]>(), // ["React", "Node.js", "MariaDB"]
    createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
    // Office CRM link
    officeClientId: int('office_client_id'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Document type enum
export const documentTypeEnum = mysqlEnum('type', [
    'spec',
    'contract',
    'manual',
    'design',
    'report',
    'other',
]);

// Project clients table
export const projectClients = mysqlTable('project_clients', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id')
        .notNull()
        .unique()
        .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 200 }).notNull(),
    fiscalName: varchar('fiscal_name', { length: 300 }),
    rfc: varchar('rfc', { length: 20 }),
    website: varchar('website', { length: 255 }),
    address: text('address'),
    fiscalAddress: text('fiscal_address'),
    contactName: varchar('contact_name', { length: 200 }),
    contactEmail: varchar('contact_email', { length: 100 }),
    contactPhone: varchar('contact_phone', { length: 50 }),
    logoUrl: varchar('logo_url', { length: 500 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Project documents table
export const projectDocuments = mysqlTable('project_documents', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 300 }).notNull(),
    type: documentTypeEnum.default('other'),
    url: varchar('url', { length: 500 }).notNull(),
    description: text('description'),
    fileSize: int('file_size'),
    uploadedBy: int('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Request status enum
export const requestStatusEnum = mysqlEnum('status', [
    'pending',
    'approved',
    'in_review',
    'in_progress',
    'completed',
    'rejected',
]);

// Project requests table
export const projectRequests = mysqlTable('project_requests', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    status: requestStatusEnum.default('pending'),
    priority: priorityEnum.default('medium'),
    requestedBy: varchar('requested_by', { length: 200 }),
    assignedTo: int('assigned_to'),
    notes: text('notes'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Project metrics table
export const projectMetrics = mysqlTable('project_metrics', {
    id: int('id').primaryKey().autoincrement(),
    projectId: int('project_id')
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
    metricDate: date('metric_date').notNull(),
    completionPercentage: decimal('completion_percentage', { precision: 5, scale: 2 }).default('0'),
    agentEfficiency: decimal('agent_efficiency', { precision: 5, scale: 2 }).default('0'),
    codeQualityScore: decimal('code_quality_score', { precision: 5, scale: 2 }).default('0'),
    testCoverage: decimal('test_coverage', { precision: 5, scale: 2 }).default('0'),
    totalHoursWorked: decimal('total_hours_worked', { precision: 8, scale: 2 }).default('0'),
    tasksCompleted: int('tasks_completed').default(0),
    tasksPending: int('tasks_pending').default(0),
    tasksBlocked: int('tasks_blocked').default(0),
    budgetUsed: decimal('budget_used', { precision: 15, scale: 2 }).default('0'),
    performanceScore: decimal('performance_score', { precision: 5, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ one, many }) => ({
    createdByUser: one(users, {
        fields: [projects.createdBy],
        references: [users.id],
    }),
    client: one(projectClients, {
        fields: [projects.id],
        references: [projectClients.projectId],
    }),
    documents: many(projectDocuments),
    requests: many(projectRequests),
    metrics: many(projectMetrics),
}));

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectClient = typeof projectClients.$inferSelect;
export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type ProjectRequest = typeof projectRequests.$inferSelect;
export type ProjectMetric = typeof projectMetrics.$inferSelect;

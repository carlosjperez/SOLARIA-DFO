"use strict";
/**
 * SOLARIA DFO - Projects Schema (Drizzle ORM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsRelations = exports.projectMetrics = exports.projectRequests = exports.requestStatusEnum = exports.projectDocuments = exports.projectClients = exports.documentTypeEnum = exports.projects = exports.officeOriginEnum = exports.priorityEnum = exports.projectStatusEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_js_1 = require("./users.js");
// Project status enum
exports.projectStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'planning',
    'development',
    'testing',
    'deployment',
    'completed',
    'on_hold',
    'cancelled',
]);
// Priority enum
exports.priorityEnum = (0, mysql_core_1.mysqlEnum)('priority', ['low', 'medium', 'high', 'critical']);
// Office origin enum
exports.officeOriginEnum = (0, mysql_core_1.mysqlEnum)('office_origin', ['dfo', 'office']);
// Projects table
exports.projects = (0, mysql_core_1.mysqlTable)('projects', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 200 }).notNull(),
    code: (0, mysql_core_1.varchar)('code', { length: 10 }).notNull().default('PRJ'),
    client: (0, mysql_core_1.varchar)('client', { length: 200 }),
    officeOrigin: exports.officeOriginEnum.default('dfo'),
    officeVisible: (0, mysql_core_1.tinyint)('office_visible').default(0),
    description: (0, mysql_core_1.text)('description'),
    status: exports.projectStatusEnum.default('planning'),
    priority: exports.priorityEnum.default('medium'),
    budget: (0, mysql_core_1.decimal)('budget', { precision: 15, scale: 2 }).default('0'),
    actualCost: (0, mysql_core_1.decimal)('actual_cost', { precision: 15, scale: 2 }).default('0'),
    completionPercentage: (0, mysql_core_1.int)('completion_percentage').default(0),
    startDate: (0, mysql_core_1.date)('start_date'),
    deadline: (0, mysql_core_1.date)('deadline'),
    // Project URLs
    productionUrl: (0, mysql_core_1.varchar)('production_url', { length: 500 }),
    stagingUrl: (0, mysql_core_1.varchar)('staging_url', { length: 500 }),
    localUrl: (0, mysql_core_1.varchar)('local_url', { length: 500 }),
    repoUrl: (0, mysql_core_1.varchar)('repo_url', { length: 500 }),
    // Tags (JSON array of strings)
    tags: (0, mysql_core_1.text)('tags'), // JSON array: ["SAAS", "REACT", "B2B"]
    // Stack (JSON array of tech names)
    stack: (0, mysql_core_1.text)('stack'), // JSON array: ["React", "Node.js", "MariaDB"]
    createdBy: (0, mysql_core_1.int)('created_by').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Document type enum
exports.documentTypeEnum = (0, mysql_core_1.mysqlEnum)('type', [
    'spec',
    'contract',
    'manual',
    'design',
    'report',
    'other',
]);
// Project clients table
exports.projectClients = (0, mysql_core_1.mysqlTable)('project_clients', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .unique()
        .references(() => exports.projects.id, { onDelete: 'cascade' }),
    name: (0, mysql_core_1.varchar)('name', { length: 200 }).notNull(),
    fiscalName: (0, mysql_core_1.varchar)('fiscal_name', { length: 300 }),
    rfc: (0, mysql_core_1.varchar)('rfc', { length: 20 }),
    website: (0, mysql_core_1.varchar)('website', { length: 255 }),
    address: (0, mysql_core_1.text)('address'),
    fiscalAddress: (0, mysql_core_1.text)('fiscal_address'),
    contactName: (0, mysql_core_1.varchar)('contact_name', { length: 200 }),
    contactEmail: (0, mysql_core_1.varchar)('contact_email', { length: 100 }),
    contactPhone: (0, mysql_core_1.varchar)('contact_phone', { length: 50 }),
    logoUrl: (0, mysql_core_1.varchar)('logo_url', { length: 500 }),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Project documents table
exports.projectDocuments = (0, mysql_core_1.mysqlTable)('project_documents', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => exports.projects.id, { onDelete: 'cascade' }),
    name: (0, mysql_core_1.varchar)('name', { length: 300 }).notNull(),
    type: exports.documentTypeEnum.default('other'),
    url: (0, mysql_core_1.varchar)('url', { length: 500 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    fileSize: (0, mysql_core_1.int)('file_size'),
    uploadedBy: (0, mysql_core_1.int)('uploaded_by').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Request status enum
exports.requestStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'pending',
    'approved',
    'in_review',
    'in_progress',
    'completed',
    'rejected',
]);
// Project requests table
exports.projectRequests = (0, mysql_core_1.mysqlTable)('project_requests', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => exports.projects.id, { onDelete: 'cascade' }),
    text: (0, mysql_core_1.text)('text').notNull(),
    status: exports.requestStatusEnum.default('pending'),
    priority: exports.priorityEnum.default('medium'),
    requestedBy: (0, mysql_core_1.varchar)('requested_by', { length: 200 }),
    assignedTo: (0, mysql_core_1.int)('assigned_to'),
    notes: (0, mysql_core_1.text)('notes'),
    resolvedAt: (0, mysql_core_1.timestamp)('resolved_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Project metrics table
exports.projectMetrics = (0, mysql_core_1.mysqlTable)('project_metrics', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => exports.projects.id, { onDelete: 'cascade' }),
    metricDate: (0, mysql_core_1.date)('metric_date').notNull(),
    completionPercentage: (0, mysql_core_1.decimal)('completion_percentage', { precision: 5, scale: 2 }).default('0'),
    agentEfficiency: (0, mysql_core_1.decimal)('agent_efficiency', { precision: 5, scale: 2 }).default('0'),
    codeQualityScore: (0, mysql_core_1.decimal)('code_quality_score', { precision: 5, scale: 2 }).default('0'),
    testCoverage: (0, mysql_core_1.decimal)('test_coverage', { precision: 5, scale: 2 }).default('0'),
    totalHoursWorked: (0, mysql_core_1.decimal)('total_hours_worked', { precision: 8, scale: 2 }).default('0'),
    tasksCompleted: (0, mysql_core_1.int)('tasks_completed').default(0),
    tasksPending: (0, mysql_core_1.int)('tasks_pending').default(0),
    tasksBlocked: (0, mysql_core_1.int)('tasks_blocked').default(0),
    budgetUsed: (0, mysql_core_1.decimal)('budget_used', { precision: 15, scale: 2 }).default('0'),
    performanceScore: (0, mysql_core_1.decimal)('performance_score', { precision: 5, scale: 2 }).default('0'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Relations
exports.projectsRelations = (0, drizzle_orm_1.relations)(exports.projects, ({ one, many }) => ({
    createdByUser: one(users_js_1.users, {
        fields: [exports.projects.createdBy],
        references: [users_js_1.users.id],
    }),
    client: one(exports.projectClients, {
        fields: [exports.projects.id],
        references: [exports.projectClients.projectId],
    }),
    documents: many(exports.projectDocuments),
    requests: many(exports.projectRequests),
    metrics: many(exports.projectMetrics),
}));
//# sourceMappingURL=projects.js.map
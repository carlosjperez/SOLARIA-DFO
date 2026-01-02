"use strict";
/**
 * SOLARIA DFO - Tasks Schema (Drizzle ORM)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskTagAssignmentsRelations = exports.taskItemsRelations = exports.tasksRelations = exports.taskTagAssignments = exports.taskTags = exports.taskItems = exports.tasks = exports.taskStatusEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_js_1 = require("./projects.js");
const agents_js_1 = require("./agents.js");
const users_js_1 = require("./users.js");
const epics_js_1 = require("./epics.js");
const sprints_js_1 = require("./sprints.js");
// Task status enum
exports.taskStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'pending',
    'in_progress',
    'review',
    'completed',
    'blocked',
    'cancelled',
]);
// Tasks table
exports.tasks = (0, mysql_core_1.mysqlTable)('tasks', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    taskNumber: (0, mysql_core_1.int)('task_number').default(0),
    title: (0, mysql_core_1.varchar)('title', { length: 300 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    projectId: (0, mysql_core_1.int)('project_id').references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    epicId: (0, mysql_core_1.int)('epic_id').references(() => epics_js_1.epics.id, { onDelete: 'set null' }),
    sprintId: (0, mysql_core_1.int)('sprint_id').references(() => sprints_js_1.sprints.id, { onDelete: 'set null' }),
    agentId: (0, mysql_core_1.int)('agent_id').references(() => agents_js_1.aiAgents.id, { onDelete: 'set null' }),
    assignedAgentId: (0, mysql_core_1.int)('assigned_agent_id').references(() => agents_js_1.aiAgents.id, { onDelete: 'set null' }),
    assignedBy: (0, mysql_core_1.int)('assigned_by').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    status: exports.taskStatusEnum.default('pending'),
    priority: projects_js_1.priorityEnum.default('medium'),
    estimatedHours: (0, mysql_core_1.decimal)('estimated_hours', { precision: 6, scale: 2 }),
    actualHours: (0, mysql_core_1.decimal)('actual_hours', { precision: 6, scale: 2 }),
    progress: (0, mysql_core_1.int)('progress').default(0),
    deadline: (0, mysql_core_1.datetime)('deadline'),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
    completedAt: (0, mysql_core_1.timestamp)('completed_at'),
});
// Task items (subtasks/checklist)
exports.taskItems = (0, mysql_core_1.mysqlTable)('task_items', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    taskId: (0, mysql_core_1.int)('task_id')
        .notNull()
        .references(() => exports.tasks.id, { onDelete: 'cascade' }),
    title: (0, mysql_core_1.varchar)('title', { length: 500 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    sortOrder: (0, mysql_core_1.int)('sort_order').default(0),
    isCompleted: (0, mysql_core_1.boolean)('is_completed').default(false),
    completedAt: (0, mysql_core_1.timestamp)('completed_at'),
    completedByAgentId: (0, mysql_core_1.int)('completed_by_agent_id').references(() => agents_js_1.aiAgents.id, {
        onDelete: 'set null',
    }),
    estimatedMinutes: (0, mysql_core_1.int)('estimated_minutes').default(0),
    actualMinutes: (0, mysql_core_1.int)('actual_minutes').default(0),
    notes: (0, mysql_core_1.text)('notes'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Task tags definition
exports.taskTags = (0, mysql_core_1.mysqlTable)('task_tags', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)('name', { length: 50 }).notNull().unique(),
    description: (0, mysql_core_1.varchar)('description', { length: 200 }),
    color: (0, mysql_core_1.varchar)('color', { length: 7 }).default('#6b7280'),
    icon: (0, mysql_core_1.varchar)('icon', { length: 50 }).default('tag'),
    usageCount: (0, mysql_core_1.int)('usage_count').default(0),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
});
// Task-Tag assignments (many-to-many)
exports.taskTagAssignments = (0, mysql_core_1.mysqlTable)('task_tag_assignments', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    taskId: (0, mysql_core_1.int)('task_id')
        .notNull()
        .references(() => exports.tasks.id, { onDelete: 'cascade' }),
    tagId: (0, mysql_core_1.int)('tag_id')
        .notNull()
        .references(() => exports.taskTags.id, { onDelete: 'cascade' }),
    assignedBy: (0, mysql_core_1.int)('assigned_by').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    assignedAt: (0, mysql_core_1.timestamp)('assigned_at').defaultNow(),
});
// Relations
exports.tasksRelations = (0, drizzle_orm_1.relations)(exports.tasks, ({ one, many }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.tasks.projectId],
        references: [projects_js_1.projects.id],
    }),
    epic: one(epics_js_1.epics, {
        fields: [exports.tasks.epicId],
        references: [epics_js_1.epics.id],
    }),
    sprint: one(sprints_js_1.sprints, {
        fields: [exports.tasks.sprintId],
        references: [sprints_js_1.sprints.id],
    }),
    agent: one(agents_js_1.aiAgents, {
        fields: [exports.tasks.agentId],
        references: [agents_js_1.aiAgents.id],
    }),
    assignedAgent: one(agents_js_1.aiAgents, {
        fields: [exports.tasks.assignedAgentId],
        references: [agents_js_1.aiAgents.id],
    }),
    assignedByUser: one(users_js_1.users, {
        fields: [exports.tasks.assignedBy],
        references: [users_js_1.users.id],
    }),
    items: many(exports.taskItems),
    tagAssignments: many(exports.taskTagAssignments),
}));
exports.taskItemsRelations = (0, drizzle_orm_1.relations)(exports.taskItems, ({ one }) => ({
    task: one(exports.tasks, {
        fields: [exports.taskItems.taskId],
        references: [exports.tasks.id],
    }),
    completedByAgent: one(agents_js_1.aiAgents, {
        fields: [exports.taskItems.completedByAgentId],
        references: [agents_js_1.aiAgents.id],
    }),
}));
exports.taskTagAssignmentsRelations = (0, drizzle_orm_1.relations)(exports.taskTagAssignments, ({ one }) => ({
    task: one(exports.tasks, {
        fields: [exports.taskTagAssignments.taskId],
        references: [exports.tasks.id],
    }),
    tag: one(exports.taskTags, {
        fields: [exports.taskTagAssignments.tagId],
        references: [exports.taskTags.id],
    }),
}));
//# sourceMappingURL=tasks.js.map
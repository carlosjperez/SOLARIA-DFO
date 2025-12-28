/**
 * SOLARIA DFO - Tasks Schema (Drizzle ORM)
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    decimal,
    datetime,
    timestamp,
    boolean,
    mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { projects, priorityEnum } from './projects.js';
import { aiAgents } from './agents.js';
import { users } from './users.js';
import { epics } from './epics.js';
import { sprints } from './sprints.js';

// Task status enum
export const taskStatusEnum = mysqlEnum('status', [
    'pending',
    'in_progress',
    'review',
    'completed',
    'blocked',
    'cancelled',
]);

// Tasks table
export const tasks = mysqlTable('tasks', {
    id: int('id').primaryKey().autoincrement(),
    taskNumber: int('task_number').default(0),
    title: varchar('title', { length: 300 }).notNull(),
    description: text('description'),
    projectId: int('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    epicId: int('epic_id').references(() => epics.id, { onDelete: 'set null' }),
    sprintId: int('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
    agentId: int('agent_id').references(() => aiAgents.id, { onDelete: 'set null' }),
    assignedAgentId: int('assigned_agent_id').references(() => aiAgents.id, { onDelete: 'set null' }),
    assignedBy: int('assigned_by').references(() => users.id, { onDelete: 'set null' }),
    status: taskStatusEnum.default('pending'),
    priority: priorityEnum.default('medium'),
    estimatedHours: decimal('estimated_hours', { precision: 6, scale: 2 }),
    actualHours: decimal('actual_hours', { precision: 6, scale: 2 }),
    progress: int('progress').default(0),
    deadline: datetime('deadline'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
    completedAt: timestamp('completed_at'),
});

// Task items (subtasks/checklist)
export const taskItems = mysqlTable('task_items', {
    id: int('id').primaryKey().autoincrement(),
    taskId: int('task_id')
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    sortOrder: int('sort_order').default(0),
    isCompleted: boolean('is_completed').default(false),
    completedAt: timestamp('completed_at'),
    completedByAgentId: int('completed_by_agent_id').references(() => aiAgents.id, {
        onDelete: 'set null',
    }),
    estimatedMinutes: int('estimated_minutes').default(0),
    actualMinutes: int('actual_minutes').default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Task tags definition
export const taskTags = mysqlTable('task_tags', {
    id: int('id').primaryKey().autoincrement(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    description: varchar('description', { length: 200 }),
    color: varchar('color', { length: 7 }).default('#6b7280'),
    icon: varchar('icon', { length: 50 }).default('tag'),
    usageCount: int('usage_count').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

// Task-Tag assignments (many-to-many)
export const taskTagAssignments = mysqlTable('task_tag_assignments', {
    id: int('id').primaryKey().autoincrement(),
    taskId: int('task_id')
        .notNull()
        .references(() => tasks.id, { onDelete: 'cascade' }),
    tagId: int('tag_id')
        .notNull()
        .references(() => taskTags.id, { onDelete: 'cascade' }),
    assignedBy: int('assigned_by').references(() => users.id, { onDelete: 'set null' }),
    assignedAt: timestamp('assigned_at').defaultNow(),
});

// Relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
    project: one(projects, {
        fields: [tasks.projectId],
        references: [projects.id],
    }),
    epic: one(epics, {
        fields: [tasks.epicId],
        references: [epics.id],
    }),
    sprint: one(sprints, {
        fields: [tasks.sprintId],
        references: [sprints.id],
    }),
    agent: one(aiAgents, {
        fields: [tasks.agentId],
        references: [aiAgents.id],
    }),
    assignedAgent: one(aiAgents, {
        fields: [tasks.assignedAgentId],
        references: [aiAgents.id],
    }),
    assignedByUser: one(users, {
        fields: [tasks.assignedBy],
        references: [users.id],
    }),
    items: many(taskItems),
    tagAssignments: many(taskTagAssignments),
}));

export const taskItemsRelations = relations(taskItems, ({ one }) => ({
    task: one(tasks, {
        fields: [taskItems.taskId],
        references: [tasks.id],
    }),
    completedByAgent: one(aiAgents, {
        fields: [taskItems.completedByAgentId],
        references: [aiAgents.id],
    }),
}));

export const taskTagAssignmentsRelations = relations(taskTagAssignments, ({ one }) => ({
    task: one(tasks, {
        fields: [taskTagAssignments.taskId],
        references: [tasks.id],
    }),
    tag: one(taskTags, {
        fields: [taskTagAssignments.tagId],
        references: [taskTags.id],
    }),
}));

// Type exports
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type TaskItem = typeof taskItems.$inferSelect;
export type NewTaskItem = typeof taskItems.$inferInsert;
export type TaskTag = typeof taskTags.$inferSelect;
export type TaskTagAssignment = typeof taskTagAssignments.$inferSelect;

"use strict";
/**
 * SOLARIA DFO - Epics Schema (Drizzle ORM)
 *
 * Represents high-level features or workstreams within a sprint.
 * Epics group related tasks and belong to a specific sprint.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.epicsRelations = exports.epics = exports.epicStatusEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_js_1 = require("./projects.js");
const users_js_1 = require("./users.js");
const sprints_js_1 = require("./sprints.js");
const tasks_js_1 = require("./tasks.js");
// Epic status enum
exports.epicStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'open',
    'in_progress',
    'completed',
    'cancelled',
]);
// Epics table definition
exports.epics = (0, mysql_core_1.mysqlTable)('epics', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    sprintId: (0, mysql_core_1.int)('sprint_id').references(() => sprints_js_1.sprints.id, { onDelete: 'set null' }),
    epicNumber: (0, mysql_core_1.int)('epic_number').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 200 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    color: (0, mysql_core_1.varchar)('color', { length: 7 }).default('#6366f1'),
    status: exports.epicStatusEnum.default('open'),
    startDate: (0, mysql_core_1.date)('start_date'),
    targetDate: (0, mysql_core_1.date)('target_date'),
    createdBy: (0, mysql_core_1.int)('created_by').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Relations definition
exports.epicsRelations = (0, drizzle_orm_1.relations)(exports.epics, ({ one, many }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.epics.projectId],
        references: [projects_js_1.projects.id],
    }),
    sprint: one(sprints_js_1.sprints, {
        fields: [exports.epics.sprintId],
        references: [sprints_js_1.sprints.id],
    }),
    createdByUser: one(users_js_1.users, {
        fields: [exports.epics.createdBy],
        references: [users_js_1.users.id],
    }),
    tasks: many(tasks_js_1.tasks),
}));
//# sourceMappingURL=epics.js.map
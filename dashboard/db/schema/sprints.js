"use strict";
/**
 * SOLARIA DFO - Sprints Schema (Drizzle ORM)
 *
 * Represents project phases/sprints with phase ordering and type classification.
 * Supports multiple phase types: planning, development, testing, deployment, maintenance, custom
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sprintsRelations = exports.sprints = exports.phaseTypeEnum = exports.sprintStatusEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const projects_js_1 = require("./projects.js");
const users_js_1 = require("./users.js");
const epics_js_1 = require("./epics.js");
const tasks_js_1 = require("./tasks.js");
// Sprint status enum
exports.sprintStatusEnum = (0, mysql_core_1.mysqlEnum)('status', [
    'planned',
    'active',
    'completed',
    'cancelled',
]);
// Sprint phase type enum
exports.phaseTypeEnum = (0, mysql_core_1.mysqlEnum)('phase_type', [
    'planning',
    'development',
    'testing',
    'deployment',
    'maintenance',
    'custom',
]);
// Sprints table definition
exports.sprints = (0, mysql_core_1.mysqlTable)('sprints', {
    id: (0, mysql_core_1.int)('id').primaryKey().autoincrement(),
    projectId: (0, mysql_core_1.int)('project_id')
        .notNull()
        .references(() => projects_js_1.projects.id, { onDelete: 'cascade' }),
    sprintNumber: (0, mysql_core_1.int)('sprint_number').notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 200 }).notNull(),
    goal: (0, mysql_core_1.text)('goal'),
    status: exports.sprintStatusEnum.default('planned'),
    startDate: (0, mysql_core_1.date)('start_date'),
    endDate: (0, mysql_core_1.date)('end_date'),
    velocity: (0, mysql_core_1.int)('velocity').default(0),
    capacity: (0, mysql_core_1.int)('capacity').default(0),
    phaseOrder: (0, mysql_core_1.int)('phase_order').default(0),
    phaseType: exports.phaseTypeEnum.default('custom'),
    createdBy: (0, mysql_core_1.int)('created_by').references(() => users_js_1.users.id, { onDelete: 'set null' }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').defaultNow().onUpdateNow(),
});
// Relations definition
exports.sprintsRelations = (0, drizzle_orm_1.relations)(exports.sprints, ({ one, many }) => ({
    project: one(projects_js_1.projects, {
        fields: [exports.sprints.projectId],
        references: [projects_js_1.projects.id],
    }),
    createdByUser: one(users_js_1.users, {
        fields: [exports.sprints.createdBy],
        references: [users_js_1.users.id],
    }),
    epics: many(epics_js_1.epics),
    tasks: many(tasks_js_1.tasks), // Direct task assignments (standalone tasks)
}));
//# sourceMappingURL=sprints.js.map
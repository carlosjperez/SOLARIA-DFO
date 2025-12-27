/**
 * SOLARIA DFO - Permissions Schema (Drizzle ORM)
 * RBAC permission system for Office portal
 */

import {
    mysqlTable,
    int,
    varchar,
    text,
    json,
    timestamp,
    mysqlEnum,
    tinyint,
    primaryKey,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './users.js';

// Default view enum
export const defaultViewEnum = mysqlEnum('default_view', ['list', 'cards', 'kanban']);

// Permissions table
export const permissions = mysqlTable('permissions', {
    id: int('id').primaryKey().autoincrement(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    category: varchar('category', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow(),
});

// Role Permissions table (many-to-many)
export const rolePermissions = mysqlTable('role_permissions', {
    role: varchar('role', { length: 20 }).notNull(),
    permissionId: int('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.role, table.permissionId] }),
}));

// User Preferences table
export const userPreferences = mysqlTable('user_preferences', {
    userId: int('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    defaultView: defaultViewEnum.default('cards'),
    sidebarCollapsed: tinyint('sidebar_collapsed').default(0),
    theme: varchar('theme', { length: 20 }).default('light'),
    notificationsEnabled: tinyint('notifications_enabled').default(1),
    emailNotifications: tinyint('email_notifications').default(1),
    dashboardWidgets: json('dashboard_widgets').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
    rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
    user: one(users, {
        fields: [userPreferences.userId],
        references: [users.id],
    }),
}));

// Type exports
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;

// Permission code constants for type safety
export const PERMISSION_CODES = {
    // Projects
    PROJECTS_VIEW: 'projects.view',
    PROJECTS_CREATE: 'projects.create',
    PROJECTS_EDIT: 'projects.edit',
    PROJECTS_DELETE: 'projects.delete',
    PROJECTS_MANAGE_TEAM: 'projects.manage_team',

    // Clients
    CLIENTS_VIEW: 'clients.view',
    CLIENTS_CREATE: 'clients.create',
    CLIENTS_EDIT: 'clients.edit',
    CLIENTS_DELETE: 'clients.delete',

    // Tasks
    TASKS_VIEW: 'tasks.view',
    TASKS_CREATE: 'tasks.create',
    TASKS_EDIT: 'tasks.edit',
    TASKS_DELETE: 'tasks.delete',
    TASKS_ASSIGN: 'tasks.assign',

    // Agents
    AGENTS_VIEW: 'agents.view',
    AGENTS_MANAGE: 'agents.manage',

    // Analytics
    ANALYTICS_VIEW: 'analytics.view',
    ANALYTICS_EXPORT: 'analytics.export',

    // Reports
    REPORTS_VIEW: 'reports.view',
    REPORTS_CREATE: 'reports.create',
    REPORTS_EXPORT: 'reports.export',

    // Payments
    PAYMENTS_VIEW: 'payments.view',
    PAYMENTS_CREATE: 'payments.create',
    PAYMENTS_EDIT: 'payments.edit',

    // Settings
    SETTINGS_VIEW: 'settings.view',
    SETTINGS_EDIT: 'settings.edit',

    // Admin
    ADMIN_USERS: 'admin.users',
    ADMIN_ROLES: 'admin.roles',
    ADMIN_SYSTEM: 'admin.system',
} as const;

export type PermissionCode = typeof PERMISSION_CODES[keyof typeof PERMISSION_CODES];

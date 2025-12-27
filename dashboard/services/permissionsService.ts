/**
 * SOLARIA DFO - Permissions Service
 * RBAC permission management for Office portal
 */

import type { Connection, RowDataPacket } from 'mysql2/promise';

// Permission codes constant
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

export interface Permission {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: string | null;
}

export interface RolePermission {
    role: string;
    permission_id: number;
    permission_code?: string;
}

export interface UserPreference {
    user_id: number;
    default_view: 'list' | 'cards' | 'kanban';
    sidebar_collapsed: boolean;
    theme: string;
    notifications_enabled: boolean;
    email_notifications: boolean;
    dashboard_widgets: Record<string, unknown> | null;
}

// Cache for role permissions (refresh every 5 minutes)
let permissionsCache: Map<string, Set<string>> = new Map();
let cacheExpiry: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class PermissionsService {
    private db: Connection;

    constructor(db: Connection) {
        this.db = db;
    }

    /**
     * Check if a role has a specific permission
     */
    async hasPermission(role: string, permissionCode: string): Promise<boolean> {
        const permissions = await this.getRolePermissions(role);
        return permissions.has(permissionCode);
    }

    /**
     * Check if a role has any of the specified permissions
     */
    async hasAnyPermission(role: string, permissionCodes: string[]): Promise<boolean> {
        const permissions = await this.getRolePermissions(role);
        return permissionCodes.some(code => permissions.has(code));
    }

    /**
     * Check if a role has all of the specified permissions
     */
    async hasAllPermissions(role: string, permissionCodes: string[]): Promise<boolean> {
        const permissions = await this.getRolePermissions(role);
        return permissionCodes.every(code => permissions.has(code));
    }

    /**
     * Get all permissions for a role (cached)
     */
    async getRolePermissions(role: string): Promise<Set<string>> {
        // Check cache
        if (Date.now() < cacheExpiry && permissionsCache.has(role)) {
            return permissionsCache.get(role)!;
        }

        // Refresh cache if expired
        if (Date.now() >= cacheExpiry) {
            await this.refreshCache();
        }

        return permissionsCache.get(role) || new Set();
    }

    /**
     * Refresh the permissions cache
     */
    async refreshCache(): Promise<void> {
        try {
            const [rows] = await this.db.execute<RowDataPacket[]>(`
                SELECT rp.role, p.code
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
            `);

            permissionsCache = new Map();
            for (const row of rows) {
                if (!permissionsCache.has(row.role)) {
                    permissionsCache.set(row.role, new Set());
                }
                permissionsCache.get(row.role)!.add(row.code);
            }

            cacheExpiry = Date.now() + CACHE_TTL;
        } catch (error) {
            console.error('Failed to refresh permissions cache:', error);
            // Keep existing cache on error
        }
    }

    /**
     * Get all permissions
     */
    async getAllPermissions(): Promise<Permission[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(
            'SELECT * FROM permissions ORDER BY category, code'
        );
        return rows as Permission[];
    }

    /**
     * Get permissions by category
     */
    async getPermissionsByCategory(category: string): Promise<Permission[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(
            'SELECT * FROM permissions WHERE category = ? ORDER BY code',
            [category]
        );
        return rows as Permission[];
    }

    /**
     * Get all role-permission mappings for a role
     */
    async getRolePermissionMappings(role: string): Promise<RolePermission[]> {
        const [rows] = await this.db.execute<RowDataPacket[]>(`
            SELECT rp.role, rp.permission_id, p.code as permission_code
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role = ?
        `, [role]);
        return rows as RolePermission[];
    }

    /**
     * Update role permissions (replace all)
     */
    async updateRolePermissions(role: string, permissionIds: number[]): Promise<void> {
        // Delete existing
        await this.db.execute('DELETE FROM role_permissions WHERE role = ?', [role]);

        // Insert new
        if (permissionIds.length > 0) {
            const values = permissionIds.map(id => `('${role}', ${id})`).join(', ');
            await this.db.execute(`INSERT INTO role_permissions (role, permission_id) VALUES ${values}`);
        }

        // Invalidate cache
        cacheExpiry = 0;
    }

    /**
     * Add a permission to a role
     */
    async addRolePermission(role: string, permissionId: number): Promise<void> {
        await this.db.execute(
            'INSERT IGNORE INTO role_permissions (role, permission_id) VALUES (?, ?)',
            [role, permissionId]
        );
        cacheExpiry = 0;
    }

    /**
     * Remove a permission from a role
     */
    async removeRolePermission(role: string, permissionId: number): Promise<void> {
        await this.db.execute(
            'DELETE FROM role_permissions WHERE role = ? AND permission_id = ?',
            [role, permissionId]
        );
        cacheExpiry = 0;
    }

    // ========================================================================
    // User Preferences
    // ========================================================================

    /**
     * Get user preferences
     */
    async getUserPreferences(userId: number): Promise<UserPreference | null> {
        const [rows] = await this.db.execute<RowDataPacket[]>(
            'SELECT * FROM user_preferences WHERE user_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return {
            user_id: row.user_id,
            default_view: row.default_view,
            sidebar_collapsed: Boolean(row.sidebar_collapsed),
            theme: row.theme,
            notifications_enabled: Boolean(row.notifications_enabled),
            email_notifications: Boolean(row.email_notifications),
            dashboard_widgets: row.dashboard_widgets ? JSON.parse(row.dashboard_widgets) : null,
        };
    }

    /**
     * Update or create user preferences
     */
    async updateUserPreferences(userId: number, preferences: Partial<UserPreference>): Promise<void> {
        const existing = await this.getUserPreferences(userId);

        if (existing) {
            const updates: string[] = [];
            const values: unknown[] = [];

            if (preferences.default_view !== undefined) {
                updates.push('default_view = ?');
                values.push(preferences.default_view);
            }
            if (preferences.sidebar_collapsed !== undefined) {
                updates.push('sidebar_collapsed = ?');
                values.push(preferences.sidebar_collapsed ? 1 : 0);
            }
            if (preferences.theme !== undefined) {
                updates.push('theme = ?');
                values.push(preferences.theme);
            }
            if (preferences.notifications_enabled !== undefined) {
                updates.push('notifications_enabled = ?');
                values.push(preferences.notifications_enabled ? 1 : 0);
            }
            if (preferences.email_notifications !== undefined) {
                updates.push('email_notifications = ?');
                values.push(preferences.email_notifications ? 1 : 0);
            }
            if (preferences.dashboard_widgets !== undefined) {
                updates.push('dashboard_widgets = ?');
                values.push(JSON.stringify(preferences.dashboard_widgets));
            }

            if (updates.length > 0) {
                values.push(userId);
                await this.db.execute(
                    `UPDATE user_preferences SET ${updates.join(', ')} WHERE user_id = ?`,
                    values
                );
            }
        } else {
            await this.db.execute(
                `INSERT INTO user_preferences (user_id, default_view, sidebar_collapsed, theme, notifications_enabled, email_notifications, dashboard_widgets)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    preferences.default_view || 'cards',
                    preferences.sidebar_collapsed ? 1 : 0,
                    preferences.theme || 'light',
                    preferences.notifications_enabled !== false ? 1 : 0,
                    preferences.email_notifications !== false ? 1 : 0,
                    preferences.dashboard_widgets ? JSON.stringify(preferences.dashboard_widgets) : null,
                ]
            );
        }
    }
}

/**
 * Express middleware factory for requiring permissions
 */
export function createRequirePermission(db: Connection) {
    const service = new PermissionsService(db);

    return function requirePermission(...permissions: string[]) {
        return async (req: any, res: any, next: any) => {
            const userRole = req.user?.role;

            if (!userRole) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const hasAccess = permissions.length === 1
                ? await service.hasPermission(userRole, permissions[0])
                : await service.hasAnyPermission(userRole, permissions);

            if (!hasAccess) {
                return res.status(403).json({
                    error: 'Permission denied',
                    required: permissions,
                    role: userRole,
                });
            }

            next();
        };
    };
}

export default PermissionsService;

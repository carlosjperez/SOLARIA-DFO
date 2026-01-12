/**
 * SOLARIA DFO - Users Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 *
 * Updated: 2026-01-12 - Phase 2.4: BaseRepository pattern migration
 */

import { db } from '../index.js';
import { eq, or } from 'drizzle-orm';
import {
    users,
    type User,
    type NewUser,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Users Repository Class
// ============================================================================

class UsersRepository extends BaseRepository<User, NewUser, typeof users> {
    constructor() {
        super(users, 'User');
    }

    /**
     * Find user by username
     */
    async findByUsername(username: string): Promise<User | null> {
        return this.findOne(eq(users.username, username));
    }

    /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.findOne(eq(users.email, email));
    }

    /**
     * Find user by username OR ID
     * Useful for flexible lookup (CLI, API, etc.)
     */
    async findByUsernameOrId(usernameOrId: string | number): Promise<User | null> {
        if (typeof usernameOrId === 'number') {
            return this.findById(usernameOrId);
        }

        // Try to parse as number first
        const asNumber = parseInt(usernameOrId);
        if (!isNaN(asNumber)) {
            const result = await db
                .select()
                .from(users)
                .where(
                    or(
                        eq(users.username, usernameOrId),
                        eq(users.id, asNumber)
                    )
                )
                .limit(1);
            return result[0] || null;
        }

        // Username only
        return this.findByUsername(usernameOrId);
    }

    /**
     * Find all active users
     */
    async findAllActive(): Promise<User[]> {
        return this.findMany([eq(users.isActive, true)]);
    }

    /**
     * Update user's last login timestamp
     */
    async updateLastLogin(id: number): Promise<void> {
        await db
            .update(users)
            .set({ lastLogin: new Date() })
            .where(eq(users.id, id));
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const usersRepo = new UsersRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Find user by ID
 * @deprecated Use usersRepo.findById() directly
 */
export async function findUserById(id: number) {
    return usersRepo.findById(id);
}

/**
 * Find user by username
 * @deprecated Use usersRepo.findByUsername() directly
 */
export async function findUserByUsername(username: string) {
    return usersRepo.findByUsername(username);
}

/**
 * Find user by username OR ID
 * @deprecated Use usersRepo.findByUsernameOrId() directly
 */
export async function findUserByUsernameOrId(usernameOrId: string | number) {
    return usersRepo.findByUsernameOrId(usernameOrId);
}

/**
 * Find user by email
 * @deprecated Use usersRepo.findByEmail() directly
 */
export async function findUserByEmail(email: string) {
    return usersRepo.findByEmail(email);
}

/**
 * Find all active users
 * @deprecated Use usersRepo.findAllActive() directly
 */
export async function findAllUsers() {
    return usersRepo.findAllActive();
}

/**
 * Create new user
 * @deprecated Use usersRepo.create() directly
 */
export async function createUser(data: NewUser): Promise<User> {
    return usersRepo.create(data);
}

/**
 * Update user by ID
 * @deprecated Use usersRepo.update() directly
 */
export async function updateUser(id: number, data: Partial<NewUser>) {
    return usersRepo.update(id, data);
}

/**
 * Delete user by ID
 * @deprecated Use usersRepo.delete() directly
 */
export async function deleteUser(id: number) {
    return usersRepo.delete(id);
}

/**
 * Update user's last login timestamp
 * @deprecated Use usersRepo.updateLastLogin() directly
 */
export async function updateLastLogin(id: number) {
    return usersRepo.updateLastLogin(id);
}

// Export repository instance for direct usage
export { usersRepo };

/**
 * SOLARIA DFO - Users Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq, or } from 'drizzle-orm';
import {
    users,
    type User,
    type NewUser,
} from '../schema/index.js';

// ============================================================================
// Users CRUD
// ============================================================================

export async function findUserById(id: number) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
    return result[0] || null;
}

export async function findUserByUsername(username: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);
    return result[0] || null;
}

export async function findUserByUsernameOrId(usernameOrId: string | number) {
    if (typeof usernameOrId === 'number') {
        return findUserById(usernameOrId);
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
    return findUserByUsername(usernameOrId);
}

export async function findUserByEmail(email: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    return result[0] || null;
}

export async function findAllUsers() {
    return db
        .select()
        .from(users)
        .where(eq(users.isActive, true));
}

export async function createUser(data: NewUser): Promise<User> {
    const insertResult = await db.insert(users).values(data);
    return findUserById(insertResult[0].insertId) as Promise<User>;
}

export async function updateUser(id: number, data: Partial<NewUser>) {
    await db.update(users).set(data).where(eq(users.id, id));
    return findUserById(id);
}

export async function deleteUser(id: number) {
    return db.delete(users).where(eq(users.id, id));
}

export async function updateLastLogin(id: number) {
    await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, id));
}

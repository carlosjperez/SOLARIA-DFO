/**
 * SOLARIA DFO - Businesses Repository (Drizzle ORM)
 * Replaces raw SQL queries with type-safe Drizzle queries
 */

import { db } from '../index.js';
import { eq, desc, sql, and } from 'drizzle-orm';
import {
    businesses,
    type Business,
    type NewBusiness,
} from '../schema/index.js';

// ============================================================================
// Businesses CRUD
// ============================================================================

export async function findAllBusinesses(filters?: {
    status?: string;
    limit?: number;
    offset?: number;
}) {
    const conditions = [];

    if (filters?.status) {
        conditions.push(sql`${businesses.status} = ${filters.status}`);
    }

    let query = db.select().from(businesses);

    if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
    }

    // Order by name ascending (default for listings)
    query = query.orderBy(businesses.name) as any;

    // Apply limit and offset
    if (filters?.limit) {
        query = query.limit(filters.limit) as any;
    }
    if (filters?.offset) {
        query = query.offset(filters.offset) as any;
    }

    return query;
}

export async function findBusinessById(id: number) {
    const result = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, id))
        .limit(1);
    return result[0] || null;
}

export async function createBusiness(data: NewBusiness): Promise<Business> {
    const insertResult = await db.insert(businesses).values(data);
    return findBusinessById(insertResult[0].insertId) as Promise<Business>;
}

export async function updateBusiness(id: number, data: Partial<NewBusiness>) {
    await db.update(businesses).set(data).where(eq(businesses.id, id));
    return findBusinessById(id);
}

export async function deleteBusiness(id: number) {
    return db.delete(businesses).where(eq(businesses.id, id));
}

export async function findBusinessWithStats(id: number) {
    return db.execute(sql`
        SELECT
            b.*,
            (SELECT COUNT(*) FROM projects WHERE business_id = b.id) as projects_count,
            (SELECT COUNT(*) FROM projects WHERE business_id = b.id AND status = 'active') as active_projects_count
        FROM businesses b
        WHERE b.id = ${id}
    `);
}

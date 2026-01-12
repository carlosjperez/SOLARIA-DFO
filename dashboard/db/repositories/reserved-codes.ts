/**
 * SOLARIA DFO - Reserved Project Codes Repository (Drizzle ORM)
 * Validates project codes against reserved list
 *
 * Updated: 2026-01-12 - Phase 2.4: Migrated to Drizzle with BaseRepository
 */

import { db } from '../index.js';
import { eq } from 'drizzle-orm';
import {
    reservedProjectCodes,
    type ReservedProjectCode,
    type NewReservedProjectCode,
} from '../schema/index.js';
import { BaseRepository } from './base/BaseRepository.js';

// ============================================================================
// Reserved Project Codes Repository Class
// ============================================================================

class ReservedProjectCodesRepository extends BaseRepository<
    ReservedProjectCode,
    NewReservedProjectCode,
    typeof reservedProjectCodes
> {
    constructor() {
        super(reservedProjectCodes, 'ReservedProjectCode');
    }

    /**
     * Find reserved code by code value
     * Note: code is the primary key in this table
     */
    async findByCode(code: string): Promise<ReservedProjectCode | null> {
        const result = await db
            .select()
            .from(reservedProjectCodes)
            .where(eq(reservedProjectCodes.code, code))
            .limit(1);
        return result[0] || null;
    }

    /**
     * Check if a code is reserved
     */
    async isReserved(code: string): Promise<boolean> {
        const reserved = await this.findByCode(code);
        return reserved !== null;
    }

    /**
     * Get all reserved codes
     */
    async findAll(): Promise<ReservedProjectCode[]> {
        return db.select().from(reservedProjectCodes);
    }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const reservedProjectCodesRepo = new ReservedProjectCodesRepository();

// ============================================================================
// Exported Functions (Backward Compatibility)
// ============================================================================

/**
 * Find reserved project code by code
 * @deprecated Use reservedProjectCodesRepo.findByCode() directly
 */
export async function findReservedProjectCode(code: string) {
    const result = await reservedProjectCodesRepo.findByCode(code);
    // Return in same format as previous pool.execute for backward compatibility
    return result ? [[result], []] : [[], []];
}

// Export repository instance for direct usage
export { reservedProjectCodesRepo };

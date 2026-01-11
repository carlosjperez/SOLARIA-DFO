/**
 * SOLARIA DFO - Reserved Project Codes Repository (Drizzle ORM)
 * Validates project codes against reserved list
 */

import { pool } from '../index.js';

export async function findReservedProjectCode(code: string) {
    return pool.execute(
        'SELECT code, reason FROM reserved_project_codes WHERE code = ?',
        [code]
    );
}

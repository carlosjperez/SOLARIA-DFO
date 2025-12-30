/**
 * Task Identifier Resolution Utility (SOL-2)
 *
 * @author ECO-Lambda | DFO Audit Fix
 * @date 2025-12-28
 *
 * Resolves any type of task identifier (task_id, task_number, task_code)
 * to the canonical task_id for database operations.
 *
 * This eliminates confusion between:
 * - task_id: Database primary key (e.g., 491)
 * - task_number: Public sequential identifier (e.g., 158)
 * - task_code: Display format (e.g., DFO-158-EPIC15)
 */

import { db } from '../database';

/**
 * Resolved task identifier with full metadata
 */
export interface TaskIdentifier {
    /** Database primary key */
    task_id: number;
    /** Public sequential number */
    task_number: number;
    /** Display code (PROJECT-NUMBER-EPICN) */
    task_code: string;
    /** Project database ID */
    project_id: number;
    /** Project code (e.g., DFO) */
    project_code: string;
    /** Epic database ID (nullable) */
    epic_id: number | null;
}

/**
 * Resolves any type of task identifier to canonical task_id
 *
 * @param identifier - Can be:
 *   - number: task_id (491) or task_number (158)
 *   - string: task_code (DFO-158-EPIC15) or task_number as string ("158")
 * @param project_id - Optional project context (helps disambiguate task_number)
 *
 * @throws {TaskNotFoundError} If task doesn't exist
 * @throws {InvalidIdentifierError} If format is invalid
 * @throws {AmbiguousIdentifierError} If task_number matches multiple projects
 *
 * @example
 * // By task_id
 * const task = await resolveTaskIdentifier(491);
 * // → { task_id: 491, task_number: 158, task_code: "DFO-158-EPIC15", ... }
 *
 * @example
 * // By task_number (with project context)
 * const task = await resolveTaskIdentifier(158, 1);
 * // → { task_id: 491, task_number: 158, task_code: "DFO-158-EPIC15", ... }
 *
 * @example
 * // By task_code
 * const task = await resolveTaskIdentifier("DFO-158-EPIC15");
 * // → { task_id: 491, task_number: 158, task_code: "DFO-158-EPIC15", ... }
 */
export async function resolveTaskIdentifier(
    identifier: string | number,
    project_id?: number
): Promise<TaskIdentifier> {

    // Case 1: Numeric identifier (task_id or task_number)
    if (typeof identifier === 'number') {
        return await resolveNumericIdentifier(identifier, project_id);
    }

    // Case 2: String identifier
    if (typeof identifier === 'string') {
        // Try parsing as task_code (DFO-158-EPIC15 or DFO-158)
        const codeMatch = identifier.match(/^([A-Z]{2,4})-(\d+)(?:-EPIC(\d+))?$/);
        if (codeMatch) {
            return await resolveTaskCode(identifier);
        }

        // Try parsing as task_number string ("158")
        const numberMatch = identifier.match(/^\d+$/);
        if (numberMatch) {
            return await resolveNumericIdentifier(parseInt(identifier, 10), project_id);
        }

        throw new InvalidIdentifierError(
            identifier,
            'Expected format: task_id (number), task_number (number), or task_code (DFO-158-EPIC15)'
        );
    }

    throw new InvalidIdentifierError(identifier, 'Identifier must be string or number');
}

/**
 * Resolves numeric identifier (task_id or task_number)
 * @internal
 */
async function resolveNumericIdentifier(
    num: number,
    project_id?: number
): Promise<TaskIdentifier> {

    // Strategy 1: Try as task_id first (most common case)
    const byId = await db.query(`
        SELECT
            t.id as task_id,
            t.task_number,
            CONCAT(p.code, '-', t.task_number,
                   CASE WHEN t.epic_id IS NOT NULL
                   THEN CONCAT('-EPIC', e.epic_number)
                   ELSE '' END) as task_code,
            t.project_id,
            p.code as project_code,
            t.epic_id
        FROM tasks t
        JOIN projects p ON p.id = t.project_id
        LEFT JOIN epics e ON e.id = t.epic_id
        WHERE t.id = ?
    `, [num]);

    if (byId.length > 0) {
        return byId[0] as TaskIdentifier;
    }

    // Strategy 2: Try as task_number
    const query = project_id
        ? `SELECT t.id as task_id, t.task_number,
                  CONCAT(p.code, '-', t.task_number,
                         CASE WHEN t.epic_id IS NOT NULL
                         THEN CONCAT('-EPIC', e.epic_number)
                         ELSE '' END) as task_code,
                  t.project_id, p.code as project_code, t.epic_id
           FROM tasks t
           JOIN projects p ON p.id = t.project_id
           LEFT JOIN epics e ON e.id = t.epic_id
           WHERE t.task_number = ? AND t.project_id = ?`
        : `SELECT t.id as task_id, t.task_number,
                  CONCAT(p.code, '-', t.task_number,
                         CASE WHEN t.epic_id IS NOT NULL
                         THEN CONCAT('-EPIC', e.epic_number)
                         ELSE '' END) as task_code,
                  t.project_id, p.code as project_code, t.epic_id
           FROM tasks t
           JOIN projects p ON p.id = t.project_id
           LEFT JOIN epics e ON e.id = t.epic_id
           WHERE t.task_number = ?`;

    const params = project_id ? [num, project_id] : [num];
    const byNumber = await db.query(query, params);

    if (byNumber.length > 0) {
        if (byNumber.length > 1) {
            throw new AmbiguousIdentifierError(
                num,
                byNumber.length,
                'Multiple tasks found with this task_number across projects. Provide project_id to disambiguate.'
            );
        }
        return byNumber[0] as TaskIdentifier;
    }

    // Not found
    throw new TaskNotFoundError(
        num,
        'task_id or task_number',
        project_id
            ? `No task found with ID ${num} or task_number ${num} in project ${project_id}`
            : `No task found with ID ${num} or task_number ${num}. Provide project_id if using task_number.`
    );
}

/**
 * Resolves task_code (DFO-158-EPIC15 or DFO-158)
 * @internal
 */
async function resolveTaskCode(code: string): Promise<TaskIdentifier> {
    const match = code.match(/^([A-Z]{2,4})-(\d+)(?:-EPIC(\d+))?$/);
    if (!match) {
        throw new InvalidIdentifierError(
            code,
            'Invalid task_code format. Expected: PROJECT-NUMBER or PROJECT-NUMBER-EPICN'
        );
    }

    const [, projectCode, taskNumber, epicNumber] = match;

    const query = epicNumber
        ? `SELECT t.id as task_id, t.task_number, ? as task_code,
                  t.project_id, p.code as project_code, t.epic_id
           FROM tasks t
           JOIN projects p ON p.id = t.project_id
           JOIN epics e ON e.id = t.epic_id
           WHERE p.code = ? AND t.task_number = ? AND e.epic_number = ?`
        : `SELECT t.id as task_id, t.task_number, ? as task_code,
                  t.project_id, p.code as project_code, t.epic_id
           FROM tasks t
           JOIN projects p ON p.id = t.project_id
           WHERE p.code = ? AND t.task_number = ?`;

    const params = epicNumber
        ? [code, projectCode, parseInt(taskNumber, 10), parseInt(epicNumber, 10)]
        : [code, projectCode, parseInt(taskNumber, 10)];

    const result = await db.query(query, params);

    if (result.length === 0) {
        throw new TaskNotFoundError(
            code,
            'task_code',
            `Task not found: ${code}. Verify project code and task number.`
        );
    }

    return result[0] as TaskIdentifier;
}

/**
 * Error: Task not found
 */
export class TaskNotFoundError extends Error {
    constructor(
        public identifier: string | number,
        public attemptedAs: string,
        message: string
    ) {
        super(message);
        this.name = 'TaskNotFoundError';
        // Maintain proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TaskNotFoundError);
        }
    }
}

/**
 * Error: Invalid identifier format
 */
export class InvalidIdentifierError extends Error {
    constructor(
        public identifier: any,
        message: string
    ) {
        super(message);
        this.name = 'InvalidIdentifierError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidIdentifierError);
        }
    }
}

/**
 * Error: Ambiguous identifier (multiple matches)
 */
export class AmbiguousIdentifierError extends Error {
    constructor(
        public identifier: number,
        public matchCount: number,
        message: string
    ) {
        super(message);
        this.name = 'AmbiguousIdentifierError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AmbiguousIdentifierError);
        }
    }
}

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
export declare function resolveTaskIdentifier(identifier: string | number, project_id?: number): Promise<TaskIdentifier>;
/**
 * Error: Task not found
 */
export declare class TaskNotFoundError extends Error {
    identifier: string | number;
    attemptedAs: string;
    constructor(identifier: string | number, attemptedAs: string, message: string);
}
/**
 * Error: Invalid identifier format
 */
export declare class InvalidIdentifierError extends Error {
    identifier: any;
    constructor(identifier: any, message: string);
}
/**
 * Error: Ambiguous identifier (multiple matches)
 */
export declare class AmbiguousIdentifierError extends Error {
    identifier: number;
    matchCount: number;
    constructor(identifier: number, matchCount: number, message: string);
}

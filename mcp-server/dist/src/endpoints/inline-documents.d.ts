/**
 * Inline Documents Endpoint Implementation
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-006
 *
 * CRUD operations for inline documents with versioning and full-text search
 */
import type { Tool } from '../types/mcp.js';
/**
 * Create a new inline document
 */
export declare const createInlineDocument: Tool;
/**
 * Get a specific inline document by ID
 */
export declare const getInlineDocument: Tool;
/**
 * List all inline documents for a project
 */
export declare const listInlineDocuments: Tool;
/**
 * Update an inline document (creates new version)
 */
export declare const updateInlineDocument: Tool;
/**
 * Delete an inline document (soft delete)
 */
export declare const deleteInlineDocument: Tool;
/**
 * Search across all inline documents using full-text search
 */
export declare const searchDocuments: Tool;
export declare const inlineDocumentTools: Tool[];

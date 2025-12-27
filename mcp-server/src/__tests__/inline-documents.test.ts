/**
 * Inline Documents Endpoint Tests
 *
 * @author ECO-Lambda | DFO Enhancement Plan
 * @date 2025-12-27
 * @task DFN-006
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  createInlineDocument,
  getInlineDocument,
  listInlineDocuments,
  updateInlineDocument,
  deleteInlineDocument,
  searchDocuments,
} from '../endpoints/inline-documents';
import { db } from '../database';

// Mock the database module
jest.mock('../database', () => ({
  db: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

const mockedDb = db as jest.Mocked<typeof db>;

describe('Inline Documents Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Create Document Tests
  // ============================================================================

  describe('createInlineDocument', () => {
    it('should create document with valid data', async () => {
      // Mock no duplicate
      mockedDb.query.mockResolvedValueOnce([{ count: 0 }]);
      // Mock insert
      mockedDb.execute.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 });
      // Mock get created document
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        project_id: 1,
        name: 'Test Document',
        type: 'spec',
        content_md: '# Test',
        version: 1,
        is_active: true,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
        project_name: 'Test Project',
      }]);

      const result = await createInlineDocument.execute({
        project_id: 1,
        name: 'Test Document',
        type: 'spec',
        content_md: '# Test',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.document.name).toBe('Test Document');
      expect(result.data.message).toContain('created successfully');
    });

    it('should create document with minimum required fields', async () => {
      mockedDb.query.mockResolvedValueOnce([{ count: 0 }]);
      mockedDb.execute.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 });
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Min Doc',
        type: 'plan',
        content_md: 'Content',
        version: 1,
        is_active: true,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
      }]);

      const result = await createInlineDocument.execute({
        name: 'Min Doc',
        content_md: 'Content',
      });

      expect(result.success).toBe(true);
      expect(result.data.document.type).toBe('plan'); // default
    });

    it('should reject duplicate document name', async () => {
      mockedDb.query.mockResolvedValueOnce([{ count: 1 }]); // duplicate exists

      const result = await createInlineDocument.execute({
        name: 'Duplicate Name',
        content_md: 'Content',
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DUPLICATE_DOCUMENT');
    });

    it('should reject name too short', async () => {
      const result = await createInlineDocument.execute({
        name: 'AB', // less than 3 chars
        content_md: 'Content',
      } as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should reject empty content', async () => {
      const result = await createInlineDocument.execute({
        name: 'Test Doc',
        content_md: '', // empty
      } as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid type', async () => {
      const result = await createInlineDocument.execute({
        name: 'Test Doc',
        content_md: 'Content',
        type: 'invalid_type' as any,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should return human format when requested', async () => {
      mockedDb.query.mockResolvedValueOnce([{ count: 0 }]);
      mockedDb.execute.mockResolvedValueOnce({ insertId: 1, affectedRows: 1 });
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Test Document',
        type: 'spec',
        content_md: '# Test',
        version: 1,
        is_active: true,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
      }]);

      const result = await createInlineDocument.execute({
        name: 'Test Document',
        content_md: '# Test',
        format: 'human',
      });

      expect(result.success).toBe(true);
      expect(result.formatted).toContain('Test Document');
    });
  });

  // ============================================================================
  // Get Document Tests
  // ============================================================================

  describe('getInlineDocument', () => {
    it('should get existing document with content', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        project_id: 1,
        name: 'Test Doc',
        type: 'spec',
        content_md: '# Content here',
        version: 1,
        is_active: true,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
        project_name: 'Test Project',
      }]);

      const result = await getInlineDocument.execute({
        document_id: 1,
        include_content: true,
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.document.id).toBe(1);
      expect(result.data.document.content_md).toBe('# Content here');
    });

    it('should get document without content when requested', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Test Doc',
        type: 'spec',
        version: 1,
        is_active: true,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
      }]);

      const result = await getInlineDocument.execute({
        document_id: 1,
        include_content: false,
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.document.content_md).toBeUndefined();
    });

    it('should return 404 for non-existent document', async () => {
      mockedDb.query.mockResolvedValueOnce([]); // no document found

      const result = await getInlineDocument.execute({
        document_id: 999,
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DOCUMENT_NOT_FOUND');
    });

    it('should return 404 for deleted document', async () => {
      mockedDb.query.mockResolvedValueOnce([]); // is_active = 0 means not found

      const result = await getInlineDocument.execute({
        document_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DOCUMENT_NOT_FOUND');
    });

    it('should enforce project isolation', async () => {
      mockedDb.query.mockResolvedValueOnce([]); // project_id mismatch

      const result = await getInlineDocument.execute({
        document_id: 1,
        project_id: 999, // different project
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DOCUMENT_NOT_FOUND');
    });

    it('should return human format when requested', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Test Doc',
        type: 'spec',
        content_md: '# Content',
        version: 2,
        is_active: true,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
        project_name: 'Test Project',
      }]);

      const result = await getInlineDocument.execute({
        document_id: 1,
        format: 'human',
      });

      expect(result.success).toBe(true);
      expect(result.formatted).toContain('Test Doc');
      expect(result.formatted).toContain('Version: 2');
    });
  });

  // ============================================================================
  // List Documents Tests
  // ============================================================================

  describe('listInlineDocuments', () => {
    it('should list all documents', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc 1', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
        { id: 2, name: 'Doc 2', type: 'plan', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.documents).toHaveLength(2);
      expect(result.data.total).toBe(2);
    });

    it('should filter by project_id', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc 1', project_id: 1, type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        project_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.filters.project_id).toBe(1);
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([1, 1])
      );
    });

    it('should filter by type', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Spec Doc', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        type: 'spec',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.filters.type).toBe('spec');
    });

    it('should respect limit', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc 1', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
        { id: 2, name: 'Doc 2', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
        { id: 3, name: 'Doc 3', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        limit: 3,
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.documents).toHaveLength(3);
    });

    it('should return empty array when none found', async () => {
      mockedDb.query.mockResolvedValueOnce([]);

      const result = await listInlineDocuments.execute({
        project_id: 999,
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.documents).toHaveLength(0);
      expect(result.data.total).toBe(0);
    });

    it('should return human format when requested', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc 1', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        format: 'human',
      });

      expect(result.success).toBe(true);
      expect(result.formatted).toContain('Found 1 document');
    });
  });

  // ============================================================================
  // Update Document Tests
  // ============================================================================

  describe('updateInlineDocument', () => {
    it('should update content and create new version', async () => {
      // Get existing
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        project_id: 1,
        name: 'Original Name',
        type: 'spec',
        content_md: '# Original',
        version: 1,
        is_active: true,
      }]);
      // Archive old
      mockedDb.execute.mockResolvedValueOnce({ affectedRows: 1 });
      // Insert new
      mockedDb.execute.mockResolvedValueOnce({ insertId: 2, affectedRows: 1 });
      // Get updated
      mockedDb.query.mockResolvedValueOnce([{
        id: 2,
        project_id: 1,
        name: 'Original Name',
        type: 'spec',
        content_md: '# Updated',
        version: 2,
        is_active: true,
        parent_version_id: 1,
      }]);

      const result = await updateInlineDocument.execute({
        document_id: 1,
        content_md: '# Updated',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.document.version).toBe(2);
      expect(result.data.previous_version).toBe(1);
    });

    it('should update name only', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Old Name',
        type: 'spec',
        content_md: '# Content',
        version: 1,
      }]);
      // Check no duplicate
      mockedDb.query.mockResolvedValueOnce([{ count: 0 }]);
      mockedDb.execute.mockResolvedValueOnce({ affectedRows: 1 });
      mockedDb.execute.mockResolvedValueOnce({ insertId: 2, affectedRows: 1 });
      mockedDb.query.mockResolvedValueOnce([{
        id: 2,
        name: 'New Name',
        type: 'spec',
        content_md: '# Content',
        version: 2,
      }]);

      const result = await updateInlineDocument.execute({
        document_id: 1,
        name: 'New Name',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.document.name).toBe('New Name');
    });

    it('should update type only', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Doc',
        type: 'spec',
        content_md: '# Content',
        version: 1,
      }]);
      mockedDb.execute.mockResolvedValueOnce({ affectedRows: 1 });
      mockedDb.execute.mockResolvedValueOnce({ insertId: 2, affectedRows: 1 });
      mockedDb.query.mockResolvedValueOnce([{
        id: 2,
        name: 'Doc',
        type: 'report',
        content_md: '# Content',
        version: 2,
      }]);

      const result = await updateInlineDocument.execute({
        document_id: 1,
        type: 'report',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.document.type).toBe('report');
    });

    it('should include change_summary', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Doc',
        type: 'spec',
        content_md: '# Content',
        version: 1,
      }]);
      mockedDb.execute.mockResolvedValueOnce({ affectedRows: 1 });
      mockedDb.execute.mockResolvedValueOnce({ insertId: 2, affectedRows: 1 });
      mockedDb.query.mockResolvedValueOnce([{
        id: 2,
        name: 'Doc',
        type: 'spec',
        content_md: '# Updated',
        version: 2,
        change_summary: 'Updated content',
      }]);

      const result = await updateInlineDocument.execute({
        document_id: 1,
        content_md: '# Updated',
        change_summary: 'Updated content',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(mockedDb.execute).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['Updated content'])
      );
    });

    it('should reject update on non-existent document', async () => {
      mockedDb.query.mockResolvedValueOnce([]);

      const result = await updateInlineDocument.execute({
        document_id: 999,
        content_md: '# Updated',
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DOCUMENT_NOT_FOUND');
    });

    it('should reject duplicate name on update', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Old Name',
        type: 'spec',
        content_md: '# Content',
        version: 1,
      }]);
      mockedDb.query.mockResolvedValueOnce([{ count: 1 }]); // duplicate exists

      const result = await updateInlineDocument.execute({
        document_id: 1,
        name: 'Duplicate Name',
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DUPLICATE_DOCUMENT');
    });
  });

  // ============================================================================
  // Delete Document Tests
  // ============================================================================

  describe('deleteInlineDocument', () => {
    it('should soft delete marks inactive', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Doc to Delete',
        type: 'spec',
        version: 1,
        is_active: true,
      }]);
      mockedDb.execute.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await deleteInlineDocument.execute({
        document_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(result.data.name).toBe('Doc to Delete');
      expect(mockedDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('is_active = 0'),
        [1]
      );
    });

    it('should return 404 for non-existent document', async () => {
      mockedDb.query.mockResolvedValueOnce([]);

      const result = await deleteInlineDocument.execute({
        document_id: 999,
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DOCUMENT_NOT_FOUND');
    });

    it('should return 404 for already deleted document', async () => {
      mockedDb.query.mockResolvedValueOnce([]); // is_active = 0 means not found

      const result = await deleteInlineDocument.execute({
        document_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('DOCUMENT_NOT_FOUND');
    });

    it('should return human format when requested', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Doc to Delete',
        type: 'spec',
        version: 1,
      }]);
      mockedDb.execute.mockResolvedValueOnce({ affectedRows: 1 });

      const result = await deleteInlineDocument.execute({
        document_id: 1,
        format: 'human',
      });

      expect(result.success).toBe(true);
      expect(result.formatted).toContain('Doc to Delete');
      expect(result.formatted).toContain('deleted');
    });
  });

  // ============================================================================
  // Search Documents Tests
  // ============================================================================

  describe('searchDocuments', () => {
    it('should find by exact name', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'API Specification', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await searchDocuments.execute({
        query: 'API Specification',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.documents).toHaveLength(1);
      expect(result.data.query).toBe('API Specification');
    });

    it('should find by content keyword', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc 1', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
        { id: 2, name: 'Doc 2', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await searchDocuments.execute({
        query: 'authentication',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.documents).toHaveLength(2);
    });

    it('should perform case insensitive search', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'API Doc', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await searchDocuments.execute({
        query: 'api',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(mockedDb.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['%api%', '%api%'])
      );
    });

    it('should respect project filter', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc', project_id: 1, type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await searchDocuments.execute({
        query: 'test',
        project_id: 1,
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.filters.project_id).toBe(1);
    });

    it('should respect type filter', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Report', type: 'report', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await searchDocuments.execute({
        query: 'monthly',
        type: 'report',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.filters.type).toBe('report');
    });

    it('should return empty for no matches', async () => {
      mockedDb.query.mockResolvedValueOnce([]);

      const result = await searchDocuments.execute({
        query: 'nonexistent',
        format: 'json',
      });

      expect(result.success).toBe(true);
      expect(result.data.documents).toHaveLength(0);
    });

    it('should reject query too short', async () => {
      const result = await searchDocuments.execute({
        query: 'a', // less than 2 chars
      } as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should return human format when requested', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Found Doc', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await searchDocuments.execute({
        query: 'test',
        format: 'human',
      });

      expect(result.success).toBe(true);
      expect(result.formatted).toContain('Found 1 document');
    });
  });

  // ============================================================================
  // Human Format Tests
  // ============================================================================

  describe('Human Format Output', () => {
    it('should include correct icons in output', async () => {
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Test Doc',
        type: 'spec',
        content_md: '# Test Content',
        version: 1,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
      }]);

      const result = await getInlineDocument.execute({
        document_id: 1,
        format: 'human',
      });

      expect(result.formatted).toContain('Test Doc');
    });

    it('should truncate long content in preview', async () => {
      const longContent = 'A'.repeat(1000);
      mockedDb.query.mockResolvedValueOnce([{
        id: 1,
        name: 'Long Doc',
        type: 'spec',
        content_md: longContent,
        version: 1,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z',
      }]);

      const result = await getInlineDocument.execute({
        document_id: 1,
        format: 'human',
      });

      expect(result.formatted).toContain('...');
    });
  });

  // ============================================================================
  // Metadata Tests
  // ============================================================================

  describe('Response Metadata', () => {
    it('should include version in metadata', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        format: 'json',
      });

      expect(result.metadata.version).toBe('2.0.0');
    });

    it('should include timestamp in metadata', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        format: 'json',
      });

      expect(result.metadata.timestamp).toBeDefined();
    });

    it('should include request_id in metadata', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        format: 'json',
      });

      expect(result.metadata.request_id).toBeDefined();
    });

    it('should include execution_time_ms in metadata', async () => {
      mockedDb.query.mockResolvedValueOnce([
        { id: 1, name: 'Doc', type: 'spec', version: 1, updated_at: '2025-12-27T00:00:00Z' },
      ]);

      const result = await listInlineDocuments.execute({
        format: 'json',
      });

      expect(result.metadata.execution_time_ms).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle database error gracefully', async () => {
      mockedDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const result = await listInlineDocuments.execute({
        format: 'json',
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
    });

    it('should handle validation error with details', async () => {
      const result = await createInlineDocument.execute({
        name: 'AB', // too short
        content_md: 'Content',
      } as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });
  });
});

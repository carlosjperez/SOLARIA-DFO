-- ============================================================================
-- Migration 011: Auto-set completed_at Timestamp (SOL-3)
-- Date: 2025-12-28
-- Purpose: Automatically set/unset completed_at when task status changes to/from 'completed'
-- Author: SOLARIA DFO Audit Fix
-- ============================================================================

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS set_completed_timestamp;

DELIMITER //

CREATE TRIGGER set_completed_timestamp
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    -- Case 1: Task is being marked as completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SET NEW.completed_at = NOW();
    END IF;

    -- Case 2: Task is being reopened (unmarked from completed)
    IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
        SET NEW.completed_at = NULL;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- Data Correction: Fix existing completed tasks with NULL completed_at
-- ============================================================================

-- Strategy 1: Use updated_at as completed_at (most likely completion time)
UPDATE tasks
SET completed_at = updated_at
WHERE status = 'completed'
  AND completed_at IS NULL
  AND updated_at IS NOT NULL;

-- Strategy 2: For tasks where updated_at is also NULL, use created_at as fallback
-- (This is rare but handles edge cases)
UPDATE tasks
SET completed_at = created_at
WHERE status = 'completed'
  AND completed_at IS NULL
  AND updated_at IS NULL;

-- ============================================================================
-- Validation Queries
-- ============================================================================
-- Run these after migration to verify data integrity:
--
-- Query 1: Verify NO completed tasks have NULL completed_at
-- SELECT COUNT(*) as broken_tasks
-- FROM tasks
-- WHERE status = 'completed'
--   AND completed_at IS NULL;
-- Expected: 0
--
-- Query 2: Verify completed_at is never BEFORE created_at (logical impossibility)
-- SELECT
--     id,
--     task_number,
--     created_at,
--     completed_at,
--     TIMESTAMPDIFF(SECOND, created_at, completed_at) as seconds_diff
-- FROM tasks
-- WHERE status = 'completed'
--   AND completed_at < created_at;
-- Expected: 0 rows
--
-- Query 3: Statistics on fixed tasks
-- SELECT
--     'Total completed tasks' as metric,
--     COUNT(*) as value
-- FROM tasks
-- WHERE status = 'completed'
-- UNION ALL
-- SELECT
--     'Tasks with completed_at set' as metric,
--     COUNT(*) as value
-- FROM tasks
-- WHERE status = 'completed' AND completed_at IS NOT NULL
-- UNION ALL
-- SELECT
--     'Tasks fixed by this migration' as metric,
--     COUNT(*) as value
-- FROM tasks
-- WHERE status = 'completed'
--   AND completed_at IS NOT NULL
--   AND completed_at = updated_at;
-- ============================================================================

-- ============================================================================
-- Migration 010: Prevent Incomplete Task Completion Trigger (SOL-1)
-- Date: 2025-12-28
-- Purpose: Prevent tasks from being marked as 'completed' when they have pending subtasks
-- Author: SOLARIA DFO Audit Fix
-- ============================================================================

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS prevent_incomplete_completion;

DELIMITER //

CREATE TRIGGER prevent_incomplete_completion
BEFORE UPDATE ON tasks
FOR EACH ROW
BEGIN
    -- Only validate when status is changing TO 'completed'
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Check if there are any incomplete task_items
        IF EXISTS (
            SELECT 1
            FROM task_items
            WHERE task_id = NEW.id
            AND is_completed = 0
        ) THEN
            -- Raise error with descriptive message
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot complete task: pending subtasks exist. Complete all subtasks first.';
        END IF;
    END IF;
END//

DELIMITER ;

-- ============================================================================
-- Validation Query
-- ============================================================================
-- Run this after migration to verify no existing completed tasks have pending subtasks:
--
-- SELECT
--     t.id,
--     t.task_number,
--     CONCAT(p.code, '-', t.task_number,
--            CASE WHEN t.epic_id IS NOT NULL
--            THEN CONCAT('-EPIC', e.epic_number)
--            ELSE '' END) as task_code,
--     t.status,
--     t.progress,
--     COUNT(ti.id) as total_items,
--     SUM(CASE WHEN ti.is_completed = 1 THEN 1 ELSE 0 END) as completed_items,
--     SUM(CASE WHEN ti.is_completed = 0 THEN 1 ELSE 0 END) as pending_items
-- FROM tasks t
-- JOIN projects p ON p.id = t.project_id
-- LEFT JOIN epics e ON e.id = t.epic_id
-- LEFT JOIN task_items ti ON ti.task_id = t.id
-- WHERE t.status = 'completed'
-- GROUP BY t.id
-- HAVING pending_items > 0;
--
-- Expected result: 0 rows
-- ============================================================================

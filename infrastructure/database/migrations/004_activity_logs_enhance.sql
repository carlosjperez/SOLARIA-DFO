-- ============================================================================
-- Migration 004: Enhance activity_logs table for Socket.IO real-time updates
-- Idempotent migration - safe to run multiple times
-- ============================================================================

-- Add message column for human-readable activity descriptions
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS message TEXT AFTER action;

-- Add metadata column for structured JSON data
ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS metadata JSON DEFAULT NULL AFTER details;

-- Update category enum to include new categories
-- Note: This preserves existing values and adds new ones
-- Original values: development, testing, deployment, management, security, system
-- Added values: epic, sprint, task, memory
SET @current_enum = (
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'activity_logs'
    AND COLUMN_NAME = 'category'
);

-- Only modify if new values are missing
SET @sql = IF(
    @current_enum NOT LIKE '%epic%',
    'ALTER TABLE activity_logs MODIFY COLUMN category ENUM(
        ''development'',
        ''testing'',
        ''deployment'',
        ''management'',
        ''security'',
        ''system'',
        ''epic'',
        ''sprint'',
        ''task'',
        ''memory''
    ) DEFAULT ''system''',
    'SELECT ''ENUM already up to date'' AS status'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill existing records with message from action (idempotent)
UPDATE activity_logs SET message = action WHERE message IS NULL;

-- Migration 005: Fix archived column NULL handling
-- Date: 2025-12-24
-- Purpose: Ensure archived column is NOT NULL to prevent 3-state logic

-- First, update any existing NULL values to FALSE
UPDATE projects SET archived = FALSE WHERE archived IS NULL;

-- Then alter column to be NOT NULL with DEFAULT FALSE
ALTER TABLE projects
    MODIFY COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Verify: archived can only be TRUE or FALSE, never NULL

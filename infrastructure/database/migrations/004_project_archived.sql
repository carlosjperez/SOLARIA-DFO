-- Migration 004: Add archived column to projects
-- Date: 2025-12-22
-- Purpose: Allow archiving projects (excluded from stats, accessible via archive section)

-- Add archived column with default false
ALTER TABLE projects
    ADD COLUMN archived BOOLEAN DEFAULT FALSE AFTER status,
    ADD COLUMN archived_at DATETIME DEFAULT NULL AFTER archived;

-- Create index for filtering active/archived projects
CREATE INDEX idx_projects_archived ON projects(archived);

-- Update dashboard queries to exclude archived by default
-- Note: All SELECT queries for projects should add WHERE archived = 0 (or include explicitly)

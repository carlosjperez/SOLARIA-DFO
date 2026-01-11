-- ============================================================================
-- SOLARIA DFO - Performance Index Migration
-- Migration: 007_performance_indexes.sql
-- Created: 2026-01-11
-- Phase: Architecture Optimization Phase 1
-- Purpose: Add composite indexes based on query analysis from Ralph migration
-- ============================================================================

-- Based on analysis from ARCHITECTURE-REVIEW-POST-DRIZZLE.md
-- These indexes target the most frequent query patterns identified

-- ============================================================================
-- Tasks Table Indexes
-- ============================================================================

-- Frequent filter: project_id + status (used in findTasksWithDetails, dashboard queries)
-- Benefits: Speeds up task lists filtered by project and status
-- Usage: SELECT * FROM tasks WHERE project_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_tasks_project_status
ON tasks(project_id, status);

-- Frequent filter: assigned_agent_id + status (agent workload queries)
-- Benefits: Fast agent task assignment queries
-- Usage: SELECT * FROM tasks WHERE assigned_agent_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_tasks_agent_status
ON tasks(assigned_agent_id, status);

-- Frequent sort: priority + created_at (ready tasks, priority queue)
-- Benefits: Optimizes task priority sorting
-- Usage: SELECT * FROM tasks ORDER BY priority DESC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_tasks_priority_created
ON tasks(priority DESC, created_at DESC);

-- Epic-scoped tasks (used in epic statistics)
-- Benefits: Speeds up epic progress calculations
-- Usage: SELECT * FROM tasks WHERE epic_id = ?
CREATE INDEX IF NOT EXISTS idx_tasks_epic_id
ON tasks(epic_id);

-- Sprint-scoped tasks (used in sprint statistics)
-- Benefits: Speeds up sprint progress calculations
-- Usage: SELECT * FROM tasks WHERE sprint_id = ?
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id
ON tasks(sprint_id);

-- ============================================================================
-- Memories Table Indexes
-- ============================================================================

-- Frequent filter: project_id + importance (searchMemoriesFulltext)
-- Benefits: Speeds up memory search with importance threshold
-- Usage: SELECT * FROM memories WHERE project_id = ? AND importance >= ?
CREATE INDEX IF NOT EXISTS idx_memories_project_importance
ON memories(project_id, importance DESC);

-- Frequent filter: agent_id (agent memory context)
-- Benefits: Fast agent-specific memory retrieval
-- Usage: SELECT * FROM memories WHERE agent_id = ?
CREATE INDEX IF NOT EXISTS idx_memories_agent_id
ON memories(agent_id);

-- Frequent sort: importance + created_at (memory ranking)
-- Benefits: Optimizes memory list sorting by relevance
-- Usage: SELECT * FROM memories ORDER BY importance DESC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_memories_importance_created
ON memories(importance DESC, created_at DESC);

-- Access tracking (frequently accessed memories)
-- Benefits: Speeds up "hot memory" queries
-- Usage: SELECT * FROM memories ORDER BY access_count DESC, last_accessed DESC
CREATE INDEX IF NOT EXISTS idx_memories_access_tracking
ON memories(access_count DESC, last_accessed DESC);

-- ============================================================================
-- Activity Logs Table Indexes
-- ============================================================================

-- Frequent filter: project_id + created_at (findActivityLogsWithFilters)
-- Benefits: Speeds up project activity timeline queries
-- Usage: SELECT * FROM activity_logs WHERE project_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_activity_logs_project_date
ON activity_logs(project_id, created_at DESC);

-- Frequent filter: agent_id + created_at (agent activity tracking)
-- Benefits: Fast agent activity history queries
-- Usage: SELECT * FROM activity_logs WHERE agent_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_activity_logs_agent_date
ON activity_logs(agent_id, created_at DESC);

-- Security audit queries: category + level (findAuditLogs)
-- Benefits: Optimizes security log filtering
-- Usage: SELECT * FROM activity_logs WHERE category = 'security' AND level = ?
CREATE INDEX IF NOT EXISTS idx_activity_logs_category_level
ON activity_logs(category, level);

-- ============================================================================
-- Alerts Table Indexes
-- ============================================================================

-- Frequent filter: project_id + status (active alerts dashboard)
-- Benefits: Speeds up active alerts queries
-- Usage: SELECT * FROM alerts WHERE project_id = ? AND status = 'active'
CREATE INDEX IF NOT EXISTS idx_alerts_project_status
ON alerts(project_id, status);

-- Frequent filter: severity + status (critical alert monitoring)
-- Benefits: Fast critical alert detection
-- Usage: SELECT * FROM alerts WHERE severity = 'critical' AND status = 'active'
CREATE INDEX IF NOT EXISTS idx_alerts_severity_status
ON alerts(severity, status);

-- ============================================================================
-- Task Items (Subtasks) Indexes
-- ============================================================================

-- Frequent query: task_id + is_completed (progress calculation)
-- Benefits: Optimizes subtask completion percentage queries
-- Usage: SELECT COUNT(*) FROM task_items WHERE task_id = ? AND is_completed = 1
CREATE INDEX IF NOT EXISTS idx_task_items_task_completion
ON task_items(task_id, is_completed);

-- ============================================================================
-- Projects Table Indexes
-- ============================================================================

-- Frequent filter: status + priority (dashboard project lists)
-- Benefits: Speeds up filtered project queries
-- Usage: SELECT * FROM projects WHERE status = ? AND priority = ?
CREATE INDEX IF NOT EXISTS idx_projects_status_priority
ON projects(status, priority DESC);

-- Business relationship (office_client_id for CRM queries)
-- Benefits: Fast client project lookups
-- Usage: SELECT * FROM projects WHERE office_client_id = ?
CREATE INDEX IF NOT EXISTS idx_projects_client_id
ON projects(office_client_id);

-- ============================================================================
-- Sprints Table Indexes
-- ============================================================================

-- Frequent filter: project_id + status (sprint planning queries)
-- Benefits: Speeds up project sprint lists
-- Usage: SELECT * FROM sprints WHERE project_id = ? AND status = ?
CREATE INDEX IF NOT EXISTS idx_sprints_project_status
ON sprints(project_id, status);

-- Phase ordering (sprint sequencing)
-- Benefits: Optimizes sprint order queries
-- Usage: SELECT * FROM sprints WHERE project_id = ? ORDER BY phase_order
CREATE INDEX IF NOT EXISTS idx_sprints_project_order
ON sprints(project_id, phase_order);

-- ============================================================================
-- Epics Table Indexes
-- ============================================================================

-- Frequent filter: project_id + sprint_id (epic organization)
-- Benefits: Speeds up sprint epic queries
-- Usage: SELECT * FROM epics WHERE project_id = ? AND sprint_id = ?
CREATE INDEX IF NOT EXISTS idx_epics_project_sprint
ON epics(project_id, sprint_id);

-- ============================================================================
-- Task Dependencies Indexes
-- ============================================================================

-- Dependency lookups (both directions)
-- Benefits: Optimizes dependency tree queries
-- Usage: SELECT * FROM task_dependencies WHERE source_task_id = ?
CREATE INDEX IF NOT EXISTS idx_task_deps_source
ON task_dependencies(source_task_id);

CREATE INDEX IF NOT EXISTS idx_task_deps_target
ON task_dependencies(target_task_id);

-- Dependency type filtering
-- Benefits: Speeds up "blocks" relationship queries
-- Usage: SELECT * FROM task_dependencies WHERE relationship_type = 'blocks'
CREATE INDEX IF NOT EXISTS idx_task_deps_type
ON task_dependencies(relationship_type);

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Run these queries to verify index creation:
-- SHOW INDEX FROM tasks;
-- SHOW INDEX FROM memories;
-- SHOW INDEX FROM activity_logs;
-- SHOW INDEX FROM alerts;

-- Check index usage with EXPLAIN:
-- EXPLAIN SELECT * FROM tasks WHERE project_id = 1 AND status = 'pending';
-- EXPLAIN SELECT * FROM memories WHERE project_id = 1 AND importance >= 0.5;
-- EXPLAIN SELECT * FROM activity_logs WHERE project_id = 1 ORDER BY created_at DESC;

-- ============================================================================
-- Rollback
-- ============================================================================

-- To remove these indexes if needed:
/*
DROP INDEX IF EXISTS idx_tasks_project_status ON tasks;
DROP INDEX IF EXISTS idx_tasks_agent_status ON tasks;
DROP INDEX IF EXISTS idx_tasks_priority_created ON tasks;
DROP INDEX IF EXISTS idx_tasks_epic_id ON tasks;
DROP INDEX IF EXISTS idx_tasks_sprint_id ON tasks;
DROP INDEX IF EXISTS idx_memories_project_importance ON memories;
DROP INDEX IF EXISTS idx_memories_agent_id ON memories;
DROP INDEX IF EXISTS idx_memories_importance_created ON memories;
DROP INDEX IF EXISTS idx_memories_access_tracking ON memories;
DROP INDEX IF EXISTS idx_activity_logs_project_date ON activity_logs;
DROP INDEX IF EXISTS idx_activity_logs_agent_date ON activity_logs;
DROP INDEX IF EXISTS idx_activity_logs_category_level ON activity_logs;
DROP INDEX IF EXISTS idx_alerts_project_status ON alerts;
DROP INDEX IF EXISTS idx_alerts_severity_status ON alerts;
DROP INDEX IF EXISTS idx_task_items_task_completion ON task_items;
DROP INDEX IF EXISTS idx_projects_status_priority ON projects;
DROP INDEX IF EXISTS idx_projects_client_id ON projects;
DROP INDEX IF EXISTS idx_sprints_project_status ON sprints;
DROP INDEX IF EXISTS idx_sprints_project_order ON sprints;
DROP INDEX IF EXISTS idx_epics_project_sprint ON epics;
DROP INDEX IF EXISTS idx_task_deps_source ON task_dependencies;
DROP INDEX IF EXISTS idx_task_deps_target ON task_dependencies;
DROP INDEX IF EXISTS idx_task_deps_type ON task_dependencies;
*/

-- ============================================================================
-- Expected Performance Improvements
-- ============================================================================

-- Based on query analysis:
-- - Task queries: ~30-40% faster (most frequent pattern)
-- - Memory search: ~25-35% faster (FULLTEXT + filtering)
-- - Activity logs: ~20-30% faster (date range queries)
-- - Dashboard queries: ~35-45% faster (aggregate queries)
-- - Dependency lookups: ~50-60% faster (tree traversal)

-- Overall expected improvement: 15-25% reduction in average API latency

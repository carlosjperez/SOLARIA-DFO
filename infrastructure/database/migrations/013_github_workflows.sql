-- Migration: 013_github_workflows.sql
-- Epic: EPIC003 - GitHub Actions Integration
-- Task: DFO-3001 - Create GitHub Tables
-- Author: ECO-Lambda | DFO 4.0 Epic 3 Implementation
-- Date: 2025-12-31
--
-- Creates tables for GitHub Actions integration:
-- - github_workflows: Workflow definitions and configurations
-- - github_workflow_runs: Individual workflow execution tracking
-- - github_task_links: Links between DFO tasks and GitHub resources (PRs, issues, branches)

-- =============================================================================
-- Table: github_workflows
-- =============================================================================
-- Stores GitHub Actions workflow definitions and trigger configurations
-- Links workflows to projects and optional tasks

CREATE TABLE IF NOT EXISTS github_workflows (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Project and Task Context
  project_id INT NOT NULL COMMENT 'Project this workflow belongs to',
  task_id INT NULL COMMENT 'Optional task that triggered workflow creation',

  -- Workflow Identification
  workflow_name VARCHAR(255) NOT NULL COMMENT 'GitHub workflow name (e.g., deploy-production)',
  workflow_path VARCHAR(500) NOT NULL COMMENT 'Path to workflow file in repo (e.g., .github/workflows/deploy.yml)',
  repository VARCHAR(255) NOT NULL COMMENT 'GitHub repository (owner/repo format)',

  -- Configuration
  description TEXT COMMENT 'Workflow purpose and description',
  trigger_type ENUM('manual', 'push', 'pull_request', 'schedule', 'workflow_dispatch') NOT NULL DEFAULT 'manual'
    COMMENT 'How this workflow is triggered',
  trigger_config JSON COMMENT 'Trigger configuration (branches, paths, schedule, etc.)',

  -- Status and Metadata
  enabled BOOLEAN DEFAULT true COMMENT 'Whether workflow is active',
  auto_trigger BOOLEAN DEFAULT false COMMENT 'Auto-trigger on task completion',
  last_run_id INT NULL COMMENT 'Most recent workflow run ID',
  last_run_status ENUM('success', 'failure', 'in_progress', 'cancelled', 'skipped', 'pending') NULL
    COMMENT 'Status of last run',
  last_run_at TIMESTAMP NULL COMMENT 'When workflow last ran',

  -- Statistics
  total_runs INT DEFAULT 0 COMMENT 'Total number of runs',
  successful_runs INT DEFAULT 0 COMMENT 'Number of successful runs',
  failed_runs INT DEFAULT 0 COMMENT 'Number of failed runs',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by_agent_id INT NULL COMMENT 'Agent that created this workflow config',

  -- Foreign Keys
  CONSTRAINT fk_github_workflows_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_github_workflows_task
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  CONSTRAINT fk_github_workflows_creator
    FOREIGN KEY (created_by_agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL,

  -- Prevent duplicate workflow paths per repository
  CONSTRAINT uq_workflow_repo_path UNIQUE (repository, workflow_path)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='GitHub Actions workflow definitions and configurations';

-- =============================================================================
-- Indexes for github_workflows
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX idx_github_workflows_project_id ON github_workflows(project_id);
CREATE INDEX idx_github_workflows_task_id ON github_workflows(task_id);
CREATE INDEX idx_github_workflows_repository ON github_workflows(repository);
CREATE INDEX idx_github_workflows_workflow_name ON github_workflows(workflow_name);

-- Status and filtering
CREATE INDEX idx_github_workflows_enabled ON github_workflows(enabled);
CREATE INDEX idx_github_workflows_auto_trigger ON github_workflows(auto_trigger);
CREATE INDEX idx_github_workflows_last_run_status ON github_workflows(last_run_status);

-- Combined indexes for common queries
CREATE INDEX idx_github_workflows_project_enabled ON github_workflows(project_id, enabled);
CREATE INDEX idx_github_workflows_repo_enabled ON github_workflows(repository, enabled);

-- Monitoring queries
CREATE INDEX idx_github_workflows_last_run ON github_workflows(last_run_status, last_run_at);

-- =============================================================================
-- Table: github_workflow_runs
-- =============================================================================
-- Tracks individual GitHub Actions workflow executions
-- Links to workflow definitions and stores run status and results

CREATE TABLE IF NOT EXISTS github_workflow_runs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Workflow Association
  workflow_id INT NOT NULL COMMENT 'Associated workflow definition',
  project_id INT NOT NULL COMMENT 'Project context',
  task_id INT NULL COMMENT 'Task that triggered this run (if any)',

  -- GitHub Run Information
  github_run_id BIGINT NOT NULL COMMENT 'GitHub Actions run ID',
  github_run_number INT NOT NULL COMMENT 'GitHub run number (sequential per workflow)',
  workflow_name VARCHAR(255) NOT NULL COMMENT 'Workflow name snapshot',
  repository VARCHAR(255) NOT NULL COMMENT 'Repository snapshot',

  -- Run Context
  trigger_event VARCHAR(100) COMMENT 'Event that triggered run (push, pull_request, etc.)',
  triggered_by VARCHAR(100) COMMENT 'GitHub user who triggered the run',
  branch VARCHAR(255) COMMENT 'Git branch for this run',
  commit_sha VARCHAR(40) COMMENT 'Git commit SHA',
  commit_message TEXT COMMENT 'Commit message',

  -- Status and Timing
  status ENUM('queued', 'in_progress', 'completed') NOT NULL DEFAULT 'queued'
    COMMENT 'Current run status',
  conclusion ENUM('success', 'failure', 'cancelled', 'skipped', 'timed_out', 'action_required', 'neutral') NULL
    COMMENT 'Run conclusion (only set when completed)',

  started_at TIMESTAMP NULL COMMENT 'When run started',
  completed_at TIMESTAMP NULL COMMENT 'When run finished',
  duration_seconds INT NULL COMMENT 'Total run duration in seconds',

  -- Results and Logs
  run_url VARCHAR(500) COMMENT 'GitHub URL to view run',
  logs_url VARCHAR(500) COMMENT 'GitHub URL to download logs',
  error_message TEXT COMMENT 'Error message if failed',

  -- Webhook Integration
  webhook_received_at TIMESTAMP NULL COMMENT 'When webhook notification was received',
  webhook_event_type VARCHAR(100) COMMENT 'GitHub webhook event type',
  webhook_delivery_id VARCHAR(255) COMMENT 'GitHub webhook delivery ID for deduplication',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_github_workflow_runs_workflow
    FOREIGN KEY (workflow_id) REFERENCES github_workflows(id) ON DELETE CASCADE,
  CONSTRAINT fk_github_workflow_runs_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_github_workflow_runs_task
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,

  -- Prevent duplicate webhook deliveries
  CONSTRAINT uq_webhook_delivery UNIQUE (webhook_delivery_id),

  -- Prevent duplicate GitHub run IDs
  CONSTRAINT uq_github_run_id UNIQUE (github_run_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='GitHub Actions workflow execution tracking';

-- =============================================================================
-- Indexes for github_workflow_runs
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX idx_github_workflow_runs_workflow_id ON github_workflow_runs(workflow_id);
CREATE INDEX idx_github_workflow_runs_project_id ON github_workflow_runs(project_id);
CREATE INDEX idx_github_workflow_runs_task_id ON github_workflow_runs(task_id);
CREATE INDEX idx_github_workflow_runs_repository ON github_workflow_runs(repository);

-- Status tracking
CREATE INDEX idx_github_workflow_runs_status ON github_workflow_runs(status);
CREATE INDEX idx_github_workflow_runs_conclusion ON github_workflow_runs(conclusion);

-- Timing indexes
CREATE INDEX idx_github_workflow_runs_started_at ON github_workflow_runs(started_at);
CREATE INDEX idx_github_workflow_runs_completed_at ON github_workflow_runs(completed_at);

-- Combined indexes for common queries
CREATE INDEX idx_github_workflow_runs_workflow_status ON github_workflow_runs(workflow_id, status);
CREATE INDEX idx_github_workflow_runs_project_status ON github_workflow_runs(project_id, status);
CREATE INDEX idx_github_workflow_runs_status_conclusion ON github_workflow_runs(status, conclusion);

-- Recent runs query
CREATE INDEX idx_github_workflow_runs_recent ON github_workflow_runs(workflow_id, started_at);

-- Failed runs query
CREATE INDEX idx_github_workflow_runs_failed ON github_workflow_runs(conclusion, completed_at);

-- =============================================================================
-- Table: github_task_links
-- =============================================================================
-- Links DFO tasks to GitHub resources (Pull Requests, Issues, Branches)
-- Enables bidirectional sync between DFO and GitHub

CREATE TABLE IF NOT EXISTS github_task_links (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Task Association
  task_id INT NOT NULL COMMENT 'DFO task linked to GitHub resource',
  project_id INT NOT NULL COMMENT 'Project context',

  -- GitHub Resource Identification
  resource_type ENUM('pull_request', 'issue', 'branch', 'commit', 'release') NOT NULL
    COMMENT 'Type of GitHub resource',
  repository VARCHAR(255) NOT NULL COMMENT 'GitHub repository (owner/repo)',

  -- Resource Identifiers
  github_pr_number INT NULL COMMENT 'Pull request number (if type=pull_request)',
  github_issue_number INT NULL COMMENT 'Issue number (if type=issue)',
  branch_name VARCHAR(255) NULL COMMENT 'Branch name (if type=branch)',
  commit_sha VARCHAR(40) NULL COMMENT 'Commit SHA (if type=commit)',
  release_tag VARCHAR(255) NULL COMMENT 'Release tag (if type=release)',

  -- Resource Details
  title VARCHAR(500) COMMENT 'PR/issue/release title',
  description TEXT COMMENT 'PR/issue/release description',
  github_url VARCHAR(500) NOT NULL COMMENT 'GitHub URL to resource',

  -- Status and Sync
  resource_status VARCHAR(100) COMMENT 'GitHub resource status (open, closed, merged, etc.)',
  sync_status ENUM('pending', 'synced', 'error') DEFAULT 'pending'
    COMMENT 'Sync status with GitHub',
  last_synced_at TIMESTAMP NULL COMMENT 'Last successful sync with GitHub',
  sync_error TEXT COMMENT 'Last sync error message',

  -- Auto-Creation Tracking
  auto_created BOOLEAN DEFAULT false COMMENT 'Whether resource was auto-created by DFO',
  created_by_agent_id INT NULL COMMENT 'Agent that created this link',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_github_task_links_task
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_github_task_links_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_github_task_links_creator
    FOREIGN KEY (created_by_agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Links DFO tasks to GitHub resources (PRs, issues, branches)';

-- =============================================================================
-- Indexes for github_task_links
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX idx_github_task_links_task_id ON github_task_links(task_id);
CREATE INDEX idx_github_task_links_project_id ON github_task_links(project_id);
CREATE INDEX idx_github_task_links_repository ON github_task_links(repository);
CREATE INDEX idx_github_task_links_resource_type ON github_task_links(resource_type);

-- Resource identifier indexes
CREATE INDEX idx_github_task_links_pr_number ON github_task_links(repository, github_pr_number);
CREATE INDEX idx_github_task_links_issue_number ON github_task_links(repository, github_issue_number);
CREATE INDEX idx_github_task_links_branch ON github_task_links(repository, branch_name);
CREATE INDEX idx_github_task_links_commit ON github_task_links(commit_sha);

-- Status and sync
CREATE INDEX idx_github_task_links_sync_status ON github_task_links(sync_status);
CREATE INDEX idx_github_task_links_resource_status ON github_task_links(resource_status);

-- Combined indexes for common queries
CREATE INDEX idx_github_task_links_task_type ON github_task_links(task_id, resource_type);
CREATE INDEX idx_github_task_links_repo_type ON github_task_links(repository, resource_type);
CREATE INDEX idx_github_task_links_sync_error ON github_task_links(sync_status, last_synced_at);

-- Auto-created resources
CREATE INDEX idx_github_task_links_auto_created ON github_task_links(auto_created, created_at);

-- =============================================================================
-- Migration Verification
-- =============================================================================

-- Verify tables were created
SELECT
  'github_workflows' AS table_name,
  COUNT(*) AS column_count
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
  AND table_name = 'github_workflows'
UNION ALL
SELECT
  'github_workflow_runs',
  COUNT(*)
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
  AND table_name = 'github_workflow_runs'
UNION ALL
SELECT
  'github_task_links',
  COUNT(*)
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
  AND table_name = 'github_task_links';

-- Expected output:
-- github_workflows: 20 columns
-- github_workflow_runs: 25 columns
-- github_task_links: 21 columns

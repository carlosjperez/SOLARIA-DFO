-- Migration: 012_agent_execution_tables.sql
-- Epic: EPIC019 - Parallel Agent Execution Engine
-- Task: DFO-183 - Create Database Schema for Agent Execution
-- Author: ECO-Lambda | DFO 4.0 Implementation
-- Date: 2025-12-30
--
-- Creates tables for BullMQ-based parallel agent execution system:
-- - agent_jobs: Tracks execution jobs and their lifecycle
-- - agent_mcp_configs: Stores MCP server configurations per agent

-- =============================================================================
-- Table: agent_jobs
-- =============================================================================
-- Stores metadata about agent execution jobs processed by BullMQ workers
-- Links to BullMQ job IDs for correlation with queue system

CREATE TABLE IF NOT EXISTS agent_jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- BullMQ Job Reference
  bullmq_job_id VARCHAR(255) NOT NULL COMMENT 'BullMQ job ID from queue',
  queue_name VARCHAR(100) NOT NULL DEFAULT 'agent-execution' COMMENT 'Queue name (agent-execution, embedding-generation, etc.)',

  -- Task and Agent Context
  task_id INT NOT NULL COMMENT 'DFO task being executed',
  task_code VARCHAR(50) NOT NULL COMMENT 'Task code (e.g., DFO-123) for logging',
  agent_id INT NOT NULL COMMENT 'Agent assigned to execute this job',
  project_id INT NOT NULL COMMENT 'Project context for the job',

  -- Job State
  status ENUM('waiting', 'active', 'completed', 'failed', 'delayed', 'cancelled') NOT NULL DEFAULT 'waiting'
    COMMENT 'Current state of the job',
  progress INT DEFAULT 0 COMMENT 'Progress percentage (0-100)',

  -- Execution Context
  job_data JSON COMMENT 'Full AgentJobData payload (mcpConfigs, context, metadata)',
  job_result JSON COMMENT 'JobResult when completed (success, itemsCompleted, executionTimeMs, etc.)',

  -- Timing
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When job was queued',
  started_at TIMESTAMP NULL COMMENT 'When worker picked up the job',
  completed_at TIMESTAMP NULL COMMENT 'When job finished (success or failure)',

  -- Retry and Error Handling
  attempts_made INT DEFAULT 0 COMMENT 'Number of retry attempts',
  max_attempts INT DEFAULT 3 COMMENT 'Maximum retry attempts',
  last_error TEXT COMMENT 'Last error message if failed',
  error_stack TEXT COMMENT 'Full error stack trace',

  -- Metadata
  priority INT DEFAULT 3 COMMENT 'Job priority (1=critical, 2=high, 3=medium, 4=low)',
  execution_time_ms INT COMMENT 'Total execution time in milliseconds',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Foreign Keys
  CONSTRAINT fk_agent_jobs_task
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_jobs_agent
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_jobs_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

  -- Unique constraint on BullMQ job ID
  CONSTRAINT uq_bullmq_job_id UNIQUE (bullmq_job_id)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks BullMQ agent execution jobs and their lifecycle';

-- =============================================================================
-- Indexes for agent_jobs
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX idx_agent_jobs_status ON agent_jobs(status);
CREATE INDEX idx_agent_jobs_task_id ON agent_jobs(task_id);
CREATE INDEX idx_agent_jobs_agent_id ON agent_jobs(agent_id);
CREATE INDEX idx_agent_jobs_project_id ON agent_jobs(project_id);
CREATE INDEX idx_agent_jobs_queue_name ON agent_jobs(queue_name);

-- Timing indexes for monitoring
CREATE INDEX idx_agent_jobs_queued_at ON agent_jobs(queued_at);
CREATE INDEX idx_agent_jobs_completed_at ON agent_jobs(completed_at);

-- Combined indexes for common queries
CREATE INDEX idx_agent_jobs_status_priority ON agent_jobs(status, priority);
CREATE INDEX idx_agent_jobs_agent_status ON agent_jobs(agent_id, status);
CREATE INDEX idx_agent_jobs_task_status ON agent_jobs(task_id, status);

-- Active jobs query optimization
CREATE INDEX idx_agent_jobs_active ON agent_jobs(status, started_at)
  WHERE status IN ('waiting', 'active', 'delayed');

-- Failed jobs for retry analysis
CREATE INDEX idx_agent_jobs_failed ON agent_jobs(status, attempts_made)
  WHERE status = 'failed';

-- =============================================================================
-- Table: agent_mcp_configs
-- =============================================================================
-- Stores MCP server configurations for each agent
-- Enables Dual MCP Mode: agents can connect to external MCP servers as clients

CREATE TABLE IF NOT EXISTS agent_mcp_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Agent Association
  agent_id INT NOT NULL COMMENT 'Agent this configuration belongs to',

  -- MCP Server Details
  server_name VARCHAR(100) NOT NULL COMMENT 'MCP server identifier (e.g., context7, playwright, coderabbit)',
  server_url VARCHAR(500) NOT NULL COMMENT 'MCP server endpoint URL',

  -- Authentication
  auth_type ENUM('bearer', 'basic', 'api_key', 'none') NOT NULL DEFAULT 'none'
    COMMENT 'Authentication method',
  auth_credentials JSON COMMENT 'Encrypted credentials {token, username, password, api_key}',

  -- Configuration
  enabled BOOLEAN DEFAULT true COMMENT 'Whether this MCP connection is active',
  transport_type ENUM('http', 'stdio', 'sse') DEFAULT 'http' COMMENT 'MCP transport protocol',
  config_options JSON COMMENT 'Additional configuration options (timeout, retry, etc.)',

  -- Health and Monitoring
  last_connected_at TIMESTAMP NULL COMMENT 'Last successful connection timestamp',
  connection_status ENUM('connected', 'disconnected', 'error') DEFAULT 'disconnected',
  last_error TEXT COMMENT 'Last connection error message',

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by_agent_id INT NULL COMMENT 'Agent that created this config',

  -- Foreign Keys
  CONSTRAINT fk_agent_mcp_configs_agent
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  CONSTRAINT fk_agent_mcp_configs_creator
    FOREIGN KEY (created_by_agent_id) REFERENCES agents(id) ON DELETE SET NULL,

  -- Prevent duplicate server configs per agent
  CONSTRAINT uq_agent_server UNIQUE (agent_id, server_name)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='MCP server configurations for agent external connections';

-- =============================================================================
-- Indexes for agent_mcp_configs
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX idx_agent_mcp_configs_agent_id ON agent_mcp_configs(agent_id);
CREATE INDEX idx_agent_mcp_configs_server_name ON agent_mcp_configs(server_name);
CREATE INDEX idx_agent_mcp_configs_enabled ON agent_mcp_configs(enabled);

-- Status monitoring
CREATE INDEX idx_agent_mcp_configs_status ON agent_mcp_configs(connection_status);

-- Active configs query
CREATE INDEX idx_agent_mcp_configs_active ON agent_mcp_configs(agent_id, enabled)
  WHERE enabled = true;

-- Health check queries
CREATE INDEX idx_agent_mcp_configs_health ON agent_mcp_configs(connection_status, last_connected_at);

-- =============================================================================
-- Migration Verification
-- =============================================================================

-- Verify tables were created
SELECT
  'agent_jobs' AS table_name,
  COUNT(*) AS column_count
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
  AND table_name = 'agent_jobs'
UNION ALL
SELECT
  'agent_mcp_configs',
  COUNT(*)
FROM information_schema.COLUMNS
WHERE table_schema = DATABASE()
  AND table_name = 'agent_mcp_configs';

-- Expected output:
-- agent_jobs: 23 columns
-- agent_mcp_configs: 14 columns

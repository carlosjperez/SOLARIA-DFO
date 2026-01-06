-- Migration 015: Agent Local Memory Status
-- Adds tracking table for local memory installation detection
--
-- Task: MEM-005
-- Author: ECO-Lambda | SOLARIA DFO
-- Date: 2026-01-06

CREATE TABLE IF NOT EXISTS agent_local_memory_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  agent_id VARCHAR(255) NOT NULL,
  has_local_memory BOOLEAN NOT NULL DEFAULT false,
  installed_version VARCHAR(20) NULL,
  installed_at TIMESTAMP NULL,
  last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  os_type VARCHAR(50) NULL,
  node_version VARCHAR(20) NULL,
  claude_code_version VARCHAR(20) NULL,
  installation_method VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_agent (agent_id),
  INDEX idx_agent_id (agent_id),
  INDEX idx_last_checked (last_checked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

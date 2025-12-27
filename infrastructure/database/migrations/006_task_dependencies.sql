-- Migration: 006_task_dependencies.sql
-- Task: DFN-007 - Sistema de Dependencias Explicitas
-- Author: ECO-Lambda | DFO Enhancement Plan
-- Date: 2025-12-27
--
-- Creates the task_dependencies table for explicit dependency tracking between tasks

-- Create task_dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL COMMENT 'The task that has a dependency',
  depends_on_task_id INT NOT NULL COMMENT 'The task that must complete first',
  dependency_type ENUM('blocks', 'requires', 'related', 'child_of') NOT NULL DEFAULT 'blocks'
    COMMENT 'blocks=hard blocker, requires=soft dependency, related=informational, child_of=subtask relationship',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_agent_id INT NULL COMMENT 'Agent that created this dependency',
  notes VARCHAR(500) NULL COMMENT 'Optional notes about the dependency',

  -- Foreign Keys
  CONSTRAINT fk_task_dependencies_task
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_dependencies_depends_on
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_dependencies_agent
    FOREIGN KEY (created_by_agent_id) REFERENCES agents(id) ON DELETE SET NULL,

  -- Prevent duplicate dependencies
  CONSTRAINT uq_task_dependency UNIQUE (task_id, depends_on_task_id),

  -- Prevent self-dependencies
  CONSTRAINT chk_no_self_dependency CHECK (task_id != depends_on_task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for performance
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);
CREATE INDEX idx_task_dependencies_type ON task_dependencies(dependency_type);
CREATE INDEX idx_task_dependencies_created_at ON task_dependencies(created_at);

-- Combined index for common queries
CREATE INDEX idx_task_dependencies_blocking ON task_dependencies(task_id, dependency_type)
  WHERE dependency_type IN ('blocks', 'requires');

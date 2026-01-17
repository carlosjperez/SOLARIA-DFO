-- Migration 016: Task Tags System
-- Implements flexible tagging system for tasks with multiple tags per task,
-- color-coded categories, filtering, and visual representation
--
-- Task: DFO-036
-- Author: Sisyphus | SOLARIA DFO
-- Date: 2026-01-17

-- Create task_tags table - stores tag definitions
CREATE TABLE IF NOT EXISTS task_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag_name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6' COMMENT 'SOLARIA primary color',
  icon VARCHAR(50) DEFAULT 'tag',
  description TEXT,
  tag_type ENUM('bug', 'feature', 'improvement', 'refactor', 'docs', 'test', 'other', 'system', 'priority-critical', 'priority-high', 'priority-medium', 'priority-low') DEFAULT 'feature',
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tag_type (tag_type),
  INDEX idx_is_active (is_active),
  INDEX idx_tag_name (tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create task_tag_assignments table - stores tag-to-task relationships
CREATE TABLE IF NOT EXISTS task_tag_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  tag_id INT NOT NULL,
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id),
  INDEX idx_tag_id (tag_id),
  INDEX idx_assigned_by (assigned_by),
  UNIQUE KEY uk_task_tag (task_id, tag_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES task_tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create task_tag_assignments_history table - audit trail for tag changes
CREATE TABLE IF NOT EXISTS task_tag_assignments_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  old_value JSON COMMENT 'JSON array of old tags',
  new_value JSON COMMENT 'JSON array of new tags',
  changed_by INT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_id (task_id),
  INDEX idx_changed_by (changed_by),
  INDEX idx_changed_at (changed_at),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert predefined tags
INSERT INTO task_tags (tag_name, display_name, color, icon, description, tag_type, is_system) VALUES
('bug', 'Bug Fix', '#ef4444', 'alert-circle', 'Reports issues', 'bug', FALSE),
('feature', 'Feature', '#3b82f6', 'plus-circle', 'New functionality', 'feature', FALSE),
('improvement', 'Improvement', '#10b981', 'trending-up', 'Code enhancements', 'improvement', FALSE),
('refactor', 'Refactor', '#a855f7', 'git-branch', 'Code restructuring', 'refactor', FALSE),
('docs', 'Documentation', '#6b7280', 'book', 'Technical documentation', 'docs', FALSE),
('test', 'Test', '#22c55e', 'flask-check', 'Test coverage', 'test', FALSE),
('other', 'Other', '#8b8980', 'hashtag', 'Miscellaneous', 'other', TRUE),
('system', 'System', '#9ca3af', 'settings', 'Internal operations', 'system', TRUE),
('priority-critical', 'Critical', '#dc2626', 'flag', 'Highest priority tasks', 'priority-critical', FALSE),
('priority-high', 'High', '#eab308', 'arrow-up', 'High priority tasks', 'priority-high', FALSE),
('priority-medium', 'Medium', '#f59e0b', 'minus', 'Medium priority tasks', 'priority-medium', FALSE),
('priority-low', 'Low', '#64748b', 'arrow-down', 'Low priority tasks', 'priority-low', FALSE);

-- ============================================================================
-- Migration 001: Task Coding System - SOLARIA DFO
-- Date: 2025-12-21
-- Purpose: Implement robust task coding with 3-letter project codes, epics, and sprints
-- ============================================================================

-- Step 1: Add UNIQUE constraint on project codes (already 3-letter in demo data)
-- Note: Existing codes (DFO, AKD, VDR, ADP) are already 3 letters
ALTER TABLE projects
    ADD CONSTRAINT uk_project_code UNIQUE (code);

-- Step 2: Create reserved project codes table (prevents conflicts)
CREATE TABLE IF NOT EXISTS reserved_project_codes (
    code VARCHAR(3) PRIMARY KEY,
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reserve system/common codes
INSERT INTO reserved_project_codes (code, reason) VALUES
    ('API', 'Reserved system keyword'),
    ('SQL', 'Reserved system keyword'),
    ('GET', 'Reserved HTTP method'),
    ('PUT', 'Reserved HTTP method'),
    ('DEL', 'Reserved HTTP method'),
    ('SET', 'Reserved system keyword'),
    ('ALL', 'Reserved system keyword'),
    ('NEW', 'Reserved system keyword'),
    ('OLD', 'Reserved system keyword'),
    ('ADD', 'Reserved system keyword'),
    ('PRJ', 'Legacy default code'),
    ('TSK', 'Legacy task prefix'),
    ('SYS', 'System reserved'),
    ('ADM', 'Admin reserved'),
    ('TMP', 'Temporary reserved'),
    ('XXX', 'Placeholder reserved'),
    ('ZZZ', 'Placeholder reserved')
ON DUPLICATE KEY UPDATE reason = VALUES(reason);

-- Step 3: Create Epics table
CREATE TABLE IF NOT EXISTS epics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    epic_number INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    start_date DATE,
    target_date DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_status (status),
    UNIQUE KEY uk_epic_project (project_id, epic_number),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Create Sprints table
CREATE TABLE IF NOT EXISTS sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    sprint_number INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    goal TEXT,
    status ENUM('planned', 'active', 'completed', 'cancelled') DEFAULT 'planned',
    start_date DATE,
    end_date DATE,
    velocity INT DEFAULT 0,
    capacity INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    UNIQUE KEY uk_sprint_project (project_id, sprint_number),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Add epic_id and sprint_id columns to tasks
ALTER TABLE tasks
    ADD COLUMN epic_id INT DEFAULT NULL AFTER project_id,
    ADD COLUMN sprint_id INT DEFAULT NULL AFTER epic_id,
    ADD INDEX idx_epic (epic_id),
    ADD INDEX idx_sprint (sprint_id),
    ADD CONSTRAINT fk_task_epic FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_task_sprint FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;

-- Step 6: Add hotfix tag if not exists
INSERT INTO task_tags (name, description, color, icon) VALUES
    ('hotfix', 'Urgent production fix', '#dc2626', 'flame')
ON DUPLICATE KEY UPDATE description=VALUES(description), color=VALUES(color), icon=VALUES(icon);

-- Step 7: Demo data - Create sample epics for DFO project
INSERT INTO epics (project_id, epic_number, name, description, color, status) VALUES
    (1, 1, 'Core Infrastructure', 'Base infrastructure setup including Docker, database, and authentication', '#6366f1', 'completed'),
    (1, 2, 'Dashboard MVP', 'Minimum viable dashboard with project/task management', '#22c55e', 'in_progress'),
    (1, 3, 'Advanced Features', 'Memory system, real-time updates, PWA support', '#f59e0b', 'open');

-- Step 8: Demo data - Create sample sprints for DFO project
INSERT INTO sprints (project_id, sprint_number, name, goal, status, start_date, end_date, velocity, capacity) VALUES
    (1, 1, 'Sprint 1 - Foundation', 'Setup core infrastructure and basic API', 'completed', '2025-12-01', '2025-12-14', 42, 40),
    (1, 2, 'Sprint 2 - Dashboard', 'Complete dashboard UI and task management', 'active', '2025-12-15', '2025-12-28', 0, 50),
    (1, 3, 'Sprint 3 - Polish', 'Testing, performance optimization, and deployment', 'planned', '2025-12-29', '2026-01-11', 0, 45);

-- Step 9: Assign some existing tasks to epics/sprints
UPDATE tasks SET epic_id = 1, sprint_id = 1 WHERE id IN (1, 3);  -- Completed infrastructure tasks
UPDATE tasks SET epic_id = 2, sprint_id = 2 WHERE id IN (2, 4);  -- Dashboard tasks

-- ============================================================================
-- Verification queries (run manually to verify)
-- ============================================================================
-- SELECT * FROM epics WHERE project_id = 1;
-- SELECT * FROM sprints WHERE project_id = 1;
-- SELECT t.id, t.title, t.epic_id, t.sprint_id, e.name as epic_name, s.name as sprint_name
-- FROM tasks t
-- LEFT JOIN epics e ON t.epic_id = e.id
-- LEFT JOIN sprints s ON t.sprint_id = s.id
-- WHERE t.project_id = 1;

-- Migration 003: Add project links, tags, and stack columns
-- Date: 2025-12-22
-- Task: DFO-007, DFO-008, DFO-009

-- Add URL columns for project links
ALTER TABLE projects
    ADD COLUMN production_url VARCHAR(500) DEFAULT NULL AFTER deadline,
    ADD COLUMN staging_url VARCHAR(500) DEFAULT NULL AFTER production_url,
    ADD COLUMN local_url VARCHAR(500) DEFAULT NULL AFTER staging_url,
    ADD COLUMN repo_url VARCHAR(500) DEFAULT NULL AFTER local_url;

-- Add tags column (JSON array of strings)
ALTER TABLE projects
    ADD COLUMN tags TEXT DEFAULT NULL AFTER repo_url;

-- Add stack column (JSON array of tech names)
ALTER TABLE projects
    ADD COLUMN stack TEXT DEFAULT NULL AFTER tags;

-- Set initial values for SOLARIA DFO project (only if exists)
-- Using a procedure to safely update with existence check
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS update_solaria_dfo_project()
BEGIN
    DECLARE project_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO project_exists FROM projects WHERE id = 1;

    IF project_exists = 1 THEN
        UPDATE projects
        SET
            tags = '["SAAS", "REACT", "B2B"]',
            stack = '["React", "TypeScript", "Node.js", "Express", "MariaDB", "Docker", "Drizzle ORM"]',
            repo_url = 'https://github.com/SOLARIA-AGENCY/solaria-digital-field-operations',
            production_url = 'https://dfo.solaria.agency'
        WHERE id = 1;
        SELECT 'SOLARIA DFO project updated successfully' AS status;
    ELSE
        SELECT 'Project id=1 not found, skipping update' AS status;
    END IF;
END //
DELIMITER ;

CALL update_solaria_dfo_project();
DROP PROCEDURE IF EXISTS update_solaria_dfo_project;

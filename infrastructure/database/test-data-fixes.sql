-- SOLARIA DFO - Test Data Fixes
-- Fixes data issues identified in integration tests
-- Applied AFTER mysql-init-test.sql during test container initialization

USE solaria_test;

-- Fix 1: Update agent names with SOLARIA prefix (SLR-019)
UPDATE ai_agents
SET name = CONCAT('SOLARIA-', name)
WHERE name NOT LIKE 'SOLARIA-%';

-- Fix 2: Update Akademate project status to 'development' (Expected by test)
UPDATE projects
SET status = 'development'
WHERE name LIKE '%Akademate%'
  AND status != 'development';

-- Verify fixes
SELECT 'Agent names updated:' AS message, COUNT(*) AS count FROM ai_agents WHERE name LIKE 'SOLARIA-%';
SELECT 'Akademate status:' AS message, status FROM projects WHERE name LIKE '%Akademate%';

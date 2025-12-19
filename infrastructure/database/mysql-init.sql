-- SOLARIA Digital Field Operations - Database Initialization
-- Version: 2.0.0
-- Purpose: C-Suite Dashboard with CEO/CTO/COO/CFO views

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Users table for C-Suite access
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(64) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('ceo', 'cto', 'coo', 'cfo', 'admin', 'viewer') NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(10) NOT NULL DEFAULT 'PRJ',
    client VARCHAR(200),
    office_origin ENUM('dfo', 'office') DEFAULT 'dfo',
    office_visible TINYINT(1) DEFAULT 0,
    description TEXT,
    status ENUM('planning', 'development', 'testing', 'deployment', 'completed', 'on_hold', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    budget DECIMAL(15, 2) DEFAULT 0,
    actual_cost DECIMAL(15, 2) DEFAULT 0,
    completion_percentage INT DEFAULT 0,
    start_date DATE,
    deadline DATE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_code (code),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opt-in flags for Office visibility (safe for idempotent re-runs)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS office_origin ENUM('dfo', 'office') DEFAULT 'dfo';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS office_visible TINYINT(1) DEFAULT 0;

-- AI Agents table
CREATE TABLE IF NOT EXISTS ai_agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('project_manager', 'architect', 'developer', 'tester', 'analyst', 'designer', 'devops', 'technical_writer', 'security_auditor', 'deployment_specialist') NOT NULL,
    status ENUM('active', 'busy', 'inactive', 'error', 'maintenance') DEFAULT 'inactive',
    capabilities JSON,
    configuration JSON,
    last_activity TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agent States table (real-time status)
CREATE TABLE IF NOT EXISTS agent_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    current_task TEXT,
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performance_metrics JSON,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_number INT DEFAULT 0,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    project_id INT,
    agent_id INT,
    assigned_agent_id INT,
    assigned_by INT,
    status ENUM('pending', 'in_progress', 'review', 'completed', 'blocked', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    estimated_hours DECIMAL(6, 2),
    actual_hours DECIMAL(6, 2),
    progress INT DEFAULT 0,
    deadline DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_project (project_id),
    INDEX idx_agent (agent_id),
    INDEX idx_status (status),
    INDEX idx_task_number (project_id, task_number),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('active', 'acknowledged', 'resolved', 'dismissed') DEFAULT 'active',
    project_id INT,
    agent_id INT,
    task_id INT,
    acknowledged_by INT,
    acknowledged_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Metrics table
CREATE TABLE IF NOT EXISTS project_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    metric_date DATE NOT NULL,
    completion_percentage DECIMAL(5, 2) DEFAULT 0,
    agent_efficiency DECIMAL(5, 2) DEFAULT 0,
    code_quality_score DECIMAL(5, 2) DEFAULT 0,
    test_coverage DECIMAL(5, 2) DEFAULT 0,
    total_hours_worked DECIMAL(8, 2) DEFAULT 0,
    tasks_completed INT DEFAULT 0,
    tasks_pending INT DEFAULT 0,
    tasks_blocked INT DEFAULT 0,
    budget_used DECIMAL(15, 2) DEFAULT 0,
    performance_score DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_project_date (project_id, metric_date),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agent Metrics table
CREATE TABLE IF NOT EXISTS agent_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10, 4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_agent (agent_id),
    INDEX idx_type (metric_type),
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    agent_id INT,
    task_id INT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    category ENUM('development', 'testing', 'deployment', 'management', 'security', 'system') DEFAULT 'system',
    level ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_agent (agent_id),
    INDEX idx_category (category),
    INDEX idx_level (level),
    INDEX idx_timestamp (timestamp),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default C-Suite users
-- Password: bypass -> SHA256 hash: f271a122bf4230c7c217b4cb8a66f8b4325b9c1821627dca16924fff32d6aa71
-- Note: entrypoint normalizes passwords to 'bypass' on each startup
INSERT INTO users (username, email, password_hash, name, role, is_active) VALUES
('carlosjperez', 'carlos@solaria.agency', 'f271a122bf4230c7c217b4cb8a66f8b4325b9c1821627dca16924fff32d6aa71', 'Carlos J. Perez', 'ceo', TRUE),
('cto_solaria', 'cto@solaria.agency', 'f271a122bf4230c7c217b4cb8a66f8b4325b9c1821627dca16924fff32d6aa71', 'CTO SOLARIA', 'cto', TRUE),
('coo_solaria', 'coo@solaria.agency', 'f271a122bf4230c7c217b4cb8a66f8b4325b9c1821627dca16924fff32d6aa71', 'COO SOLARIA', 'coo', TRUE),
('cfo_solaria', 'cfo@solaria.agency', 'f271a122bf4230c7c217b4cb8a66f8b4325b9c1821627dca16924fff32d6aa71', 'CFO SOLARIA', 'cfo', TRUE),
('admin', 'admin@solaria.agency', 'f271a122bf4230c7c217b4cb8a66f8b4325b9c1821627dca16924fff32d6aa71', 'System Admin', 'admin', TRUE);

-- Insert AI Agents
INSERT INTO ai_agents (name, role, status, capabilities, last_activity) VALUES
('NEMESIS-PM', 'project_manager', 'active', '{"planning": true, "coordination": true, "reporting": true}', NOW()),
('NEMESIS-ARCH', 'architect', 'active', '{"system_design": true, "tech_decisions": true, "documentation": true}', NOW()),
('NEMESIS-DEV-01', 'developer', 'active', '{"frontend": true, "backend": true, "database": true}', NOW()),
('NEMESIS-DEV-02', 'developer', 'active', '{"frontend": true, "backend": true, "api": true}', NOW()),
('NEMESIS-TST', 'tester', 'active', '{"unit_testing": true, "integration_testing": true, "e2e_testing": true}', NOW()),
('NEMESIS-ANL', 'analyst', 'active', '{"requirements": true, "business_logic": true, "data_analysis": true}', NOW()),
('NEMESIS-DSN', 'designer', 'active', '{"ui_design": true, "ux_design": true, "prototyping": true}', NOW()),
('NEMESIS-OPS', 'devops', 'active', '{"ci_cd": true, "infrastructure": true, "monitoring": true}', NOW()),
('NEMESIS-DOC', 'technical_writer', 'active', '{"documentation": true, "api_docs": true, "user_guides": true}', NOW()),
('NEMESIS-SEC', 'security_auditor', 'active', '{"code_review": true, "vulnerability_scan": true, "compliance": true}', NOW()),
('Claude Code', 'developer', 'active', '{"ai_assistant": true, "code_generation": true, "refactoring": true, "debugging": true}', NOW());

-- Insert Agent States
INSERT INTO agent_states (agent_id, status, current_task, last_heartbeat) VALUES
(1, 'active', 'Monitoring project progress', NOW()),
(2, 'active', 'Reviewing system architecture', NOW()),
(3, 'busy', 'Implementing dashboard features', NOW()),
(4, 'active', 'Code review pending', NOW()),
(5, 'active', 'Running automated tests', NOW()),
(6, 'active', 'Analyzing requirements', NOW()),
(7, 'active', 'Updating UI components', NOW()),
(8, 'busy', 'Deploying to staging', NOW()),
(9, 'active', 'Updating documentation', NOW()),
(10, 'active', 'Security audit in progress', NOW());

-- ============================================================================
-- TASK ITEMS - Subtasks/Checklist items per task
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by_agent_id INT,
    estimated_minutes INT DEFAULT 0,
    actual_minutes INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_items_task (task_id),
    INDEX idx_task_items_completed (is_completed),
    INDEX idx_task_items_sort (task_id, sort_order),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by_agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert demo projects
INSERT INTO projects (name, code, client, description, status, priority, budget, actual_cost, completion_percentage, start_date, deadline, created_by) VALUES
('SOLARIA Digital Field Operations', 'DFO', 'SOLARIA AGENCY', 'Digital Construction Field Office - Oficina de construccion autocontenida y desmantelable', 'development', 'high', 250000.00, 45000.00, 45, '2025-12-01', '2026-03-31', 1),
('Akademate.com', 'AKD', 'Akademate SaaS', 'Plataforma SaaS multitenant para academias y centros de formacion', 'planning', 'critical', 250000.00, 0.00, 0, NULL, '2025-06-30', 1),
('INMOBILIARIA VIRGEN DEL ROCIO', 'VDR', 'Virgen del Rocio', 'Sistema de gestion inmobiliaria', 'planning', 'high', 75000.00, 0.00, 0, NULL, NULL, 1),
('ADEPAC CANARIAS', 'ADP', 'ADEPAC', 'Proyecto ADEPAC Canarias', 'planning', 'high', 50000.00, 0.00, 0, NULL, NULL, 1);

-- Insert demo tasks
INSERT INTO tasks (title, description, project_id, agent_id, assigned_agent_id, status, priority, estimated_hours, actual_hours, progress) VALUES
-- Project 1: SOLARIA DFO
('Setup Docker infrastructure', 'Configure Docker containers for all services', 1, 8, 8, 'completed', 'high', 8, 6, 100),
('Implement C-Suite Dashboard', 'Create CEO/CTO/COO/CFO dashboard views', 1, 3, 3, 'in_progress', 'critical', 40, 25, 75),
('Design database schema', 'Create MySQL schema for construction office', 1, 2, 2, 'completed', 'high', 16, 12, 100),
('Implement Quick Access', 'Add bypass authentication for development', 1, 3, 3, 'completed', 'medium', 4, 3, 100),
('Write Playwright tests', 'Create exhaustive E2E tests', 1, 5, 5, 'pending', 'high', 16, 0, 0),
('Security audit', 'Review authentication and authorization', 1, 10, 10, 'pending', 'high', 8, 0, 0),
-- Project 2: Akademate.com - Milestones
('P0 Multitenancy Core', 'Dominio→tenant, claims JWT, RLS/hooks en Payload/SDK, theming por tenant, seeds superadmin', 2, NULL, NULL, 'pending', 'critical', 80, 0, 0),
('P0 API + Logica', 'Endpoints REST/GraphQL (tenants, users, memberships, courses, course_runs, leads), rate limiting por tenant, webhooks, API keys con scopes', 2, NULL, NULL, 'pending', 'critical', 160, 0, 0),
('P0 Auth & Security', 'Login staff/alumno con cookies httpOnly, MFA para ops, RBAC por tenant, auditoria completa', 2, NULL, NULL, 'pending', 'critical', 80, 0, 0),
('P1 Billing & Usage', 'Stripe (planes/checkout/portal), metering basico, suspension por impago', 2, NULL, NULL, 'pending', 'high', 80, 0, 0),
('P1 Jobs/Infra logica', 'BullMQ+Redis, colas tenant-aware, reintentos (webhooks/email/search), observabilidad OTEL', 2, NULL, NULL, 'pending', 'high', 80, 0, 0),
('P1 Dashboard Ops', 'Metricas globales, health checks, flags, billing overview, gestion tenants/domains', 2, NULL, NULL, 'pending', 'high', 80, 0, 0),
('P1 Dashboard Cliente', 'CRUD catalogo/convocatorias/sedes, paginas seccionables, blog/FAQ, leads CRM simple, branding/domains, media manager', 2, NULL, NULL, 'pending', 'high', 160, 0, 0),
('P1 Front Publica Tenant', 'Home/cursos/convocatorias/blog/paginas, SEO+sitemaps/OG/JSON-LD, formularios leads con UTM+captcha, custom domain', 2, NULL, NULL, 'pending', 'high', 120, 0, 0),
('P1 Campus Virtual', 'Matriculas, modulos/lecciones, materiales, evaluaciones simples, progreso, certificados', 2, NULL, NULL, 'pending', 'high', 160, 0, 0),
('P2 Storage & Media', 'R2/MinIO, uploads presignados por tenant, thumbs opcional', 2, NULL, NULL, 'pending', 'medium', 40, 0, 0),
('P2 Feature Flags', 'Rollout % y kill switches tenant-aware', 2, NULL, NULL, 'pending', 'medium', 40, 0, 0),
('P2 CI/CD & Runbooks', 'GH Actions lint/typecheck/test/build/migrate, pipelines preview, runbooks backup/restore, IaC scaffold', 2, NULL, NULL, 'pending', 'medium', 40, 0, 0);

-- Insert sample metrics
INSERT INTO project_metrics (project_id, metric_date, completion_percentage, agent_efficiency, code_quality_score, test_coverage, total_hours_worked, tasks_completed, tasks_pending, budget_used) VALUES
(1, CURDATE() - INTERVAL 7 DAY, 20, 85.5, 78.0, 45.0, 40, 2, 8, 15000),
(1, CURDATE() - INTERVAL 6 DAY, 25, 87.0, 80.0, 50.0, 48, 3, 7, 18000),
(1, CURDATE() - INTERVAL 5 DAY, 30, 88.5, 82.0, 55.0, 56, 4, 6, 22000),
(1, CURDATE() - INTERVAL 4 DAY, 35, 89.0, 83.0, 60.0, 64, 5, 5, 28000),
(1, CURDATE() - INTERVAL 3 DAY, 38, 90.0, 84.0, 62.0, 72, 5, 5, 32000),
(1, CURDATE() - INTERVAL 2 DAY, 42, 91.0, 85.0, 65.0, 80, 6, 4, 38000),
(1, CURDATE() - INTERVAL 1 DAY, 44, 91.5, 86.0, 68.0, 88, 6, 4, 42000),
(1, CURDATE(), 45, 92.0, 87.0, 70.0, 96, 7, 3, 45000);

-- Insert sample alerts
INSERT INTO alerts (title, message, severity, status, project_id, agent_id) VALUES
('High memory usage', 'Agent NEMESIS-DEV-01 memory usage exceeds 80%', 'medium', 'active', 1, 3),
('Deployment successful', 'Staging environment updated successfully', 'low', 'resolved', 1, 8);

-- Insert activity logs
INSERT INTO activity_logs (project_id, agent_id, action, details, category, level) VALUES
(1, 1, 'project_started', 'Project SOLARIA Digital Field Operations initialized', 'management', 'info'),
(1, 3, 'code_committed', 'Dashboard UI implementation committed', 'development', 'info'),
(1, 8, 'deployment_started', 'Initiating deployment to staging', 'deployment', 'info'),
(1, 5, 'tests_passed', 'All unit tests passed (45/45)', 'testing', 'info'),
(1, 10, 'security_scan', 'Security scan completed - no critical issues', 'security', 'info');

-- ============================================================================
-- BUSINESSES - Negocios operativos (independiente de proyectos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    status ENUM('inactive', 'planning', 'active', 'paused') DEFAULT 'inactive',
    revenue DECIMAL(15, 2) DEFAULT 0,
    expenses DECIMAL(15, 2) DEFAULT 0,
    profit DECIMAL(15, 2) DEFAULT 0,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial businesses data
INSERT INTO businesses (name, description, website, status, revenue, expenses, profit) VALUES
('SOLARIA AGENCY', 'Agencia de desarrollo digital', 'https://solaria.agency', 'inactive', 0, 0, 0),
('AKADEMATE.COM', 'Plataforma SaaS educativa', 'https://akademate.com', 'inactive', 0, 0, 0),
('INSCOUTER.COM', 'Plataforma de scouting', 'https://inscouter.com', 'inactive', 0, 0, 0),
('NAZCATRADE', 'Plataforma de trading', NULL, 'inactive', 0, 0, 0);

-- ============================================================================
-- PROJECT EXTENDED DATA (PWA Dashboard v2.0)
-- Client info, documents, and client requests per project
-- ============================================================================

-- Project Clients table - Extended client information per project
CREATE TABLE IF NOT EXISTS project_clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    fiscal_name VARCHAR(300),
    rfc VARCHAR(20),
    website VARCHAR(255),
    address TEXT,
    fiscal_address TEXT,
    contact_name VARCHAR(200),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(50),
    logo_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Documents table - Files and documents per project
CREATE TABLE IF NOT EXISTS project_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(300) NOT NULL,
    type ENUM('spec', 'contract', 'manual', 'design', 'report', 'other') DEFAULT 'other',
    url VARCHAR(500) NOT NULL,
    description TEXT,
    file_size INT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_type (type),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Requests table - Client requests/petitions per project
CREATE TABLE IF NOT EXISTS project_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    text TEXT NOT NULL,
    status ENUM('pending', 'approved', 'in_review', 'in_progress', 'completed', 'rejected') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    requested_by VARCHAR(200),
    assigned_to INT,
    notes TEXT,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES ai_agents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert demo client data for all projects
INSERT INTO project_clients (project_id, name, fiscal_name, rfc, website, address, contact_name, contact_email, contact_phone) VALUES
(1, 'SOLARIA AGENCY', 'SOLARIA AGENCY S.A. de C.V.', 'SOL240101XXX', 'https://solaria.agency', 'Av. Reforma 123, Col. Centro, CDMX, Mexico', 'Carlos J. Perez', 'carlos@solaria.agency', '+52 55 1234 5678'),
(2, 'Akademate SaaS', 'Akademate Technologies S.L.', 'B12345678', 'https://akademate.com', 'Madrid, Spain', 'Carlos J. Perez', 'carlos@akademate.com', '+34 600 000 000'),
(3, 'Inmobiliaria Virgen del Rocio', 'Inmobiliaria Virgen del Rocio S.L.', 'B87654321', 'https://virgendelrocio.com', 'Sevilla, Spain', 'Cliente VDR', 'contacto@virgendelrocio.com', '+34 955 000 000'),
(4, 'ADEPAC Canarias', 'ADEPAC Canarias S.L.', 'B11223344', 'https://adepac.es', 'Las Palmas, Canarias, Spain', 'Cliente ADEPAC', 'info@adepac.es', '+34 928 000 000');

-- Insert demo documents
INSERT INTO project_documents (project_id, name, type, url, description, uploaded_by) VALUES
(1, 'Arquitectura v3.0', 'spec', '#', 'Documento de arquitectura del sistema DFO', 1),
(1, 'CLAUDE.md', 'manual', '#', 'Instrucciones para agentes IA', 1),
(1, 'Contrato de Desarrollo', 'contract', '#', 'Contrato interno SOLARIA', 1);

-- Insert demo requests
INSERT INTO project_requests (project_id, text, status, priority, requested_by) VALUES
(1, 'Vista Kanban fullscreen para iPad', 'in_progress', 'high', 'Carlos J. Perez'),
(1, 'Integracion MCP remota', 'completed', 'high', 'Carlos J. Perez'),
(1, 'PWA Dashboard responsive con pagina de ficha', 'in_progress', 'critical', 'Carlos J. Perez');

-- ============================================================================
-- MEMORY SYSTEM (Integrated from Memora)
-- Persistent agent memory with full-text search and cross-references
-- ============================================================================

-- Memories table - main memory storage
CREATE TABLE IF NOT EXISTS memories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT,
    agent_id INT,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    metadata JSON,
    tags JSON,
    importance DECIMAL(3, 2) DEFAULT 0.50,
    access_count INT DEFAULT 0,
    last_accessed TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project (project_id),
    INDEX idx_agent (agent_id),
    INDEX idx_importance (importance),
    INDEX idx_created (created_at),
    FULLTEXT INDEX ft_content (content, summary),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memory tags allowlist
CREATE TABLE IF NOT EXISTS memory_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    parent_tag_id INT,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_parent (parent_tag_id),
    FOREIGN KEY (parent_tag_id) REFERENCES memory_tags(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memory cross-references (relationships between memories)
CREATE TABLE IF NOT EXISTS memory_crossrefs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_memory_id INT NOT NULL,
    target_memory_id INT NOT NULL,
    relationship_type ENUM('related', 'depends_on', 'contradicts', 'supersedes', 'child_of') DEFAULT 'related',
    strength DECIMAL(3, 2) DEFAULT 0.50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_crossref (source_memory_id, target_memory_id),
    INDEX idx_source (source_memory_id),
    INDEX idx_target (target_memory_id),
    FOREIGN KEY (source_memory_id) REFERENCES memories(id) ON DELETE CASCADE,
    FOREIGN KEY (target_memory_id) REFERENCES memories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memory events (for multi-agent coordination)
CREATE TABLE IF NOT EXISTS memory_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    memory_id INT NOT NULL,
    event_type ENUM('created', 'updated', 'deleted', 'accessed', 'shared') NOT NULL,
    agent_id INT,
    project_id INT,
    details JSON,
    consumed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_memory (memory_id),
    INDEX idx_consumed (consumed),
    INDEX idx_created (created_at),
    FOREIGN KEY (memory_id) REFERENCES memories(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES ai_agents(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default memory tags
INSERT INTO memory_tags (name, description) VALUES
('decision', 'Architectural or technical decisions'),
('learning', 'Learned information or insights'),
('context', 'Project or task context'),
('requirement', 'User or system requirements'),
('bug', 'Bug reports or fixes'),
('solution', 'Solutions to problems'),
('pattern', 'Code patterns or best practices'),
('config', 'Configuration information'),
('credential', 'Credentials or access info (encrypted)'),
('todo', 'Tasks to remember'),
('meeting', 'Meeting notes'),
('feedback', 'User or stakeholder feedback');

-- ============================================================================

-- Grant permissions
GRANT ALL PRIVILEGES ON solaria_construction.* TO 'solaria_user'@'%';
FLUSH PRIVILEGES;

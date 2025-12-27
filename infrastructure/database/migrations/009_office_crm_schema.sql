-- SOLARIA DFO - Office CRM Schema Extensions
-- Migration: 009_office_crm_schema.sql
-- Date: 2025-12-27
-- Purpose: Add CRM tables for Office portal

-- ============================================
-- OFFICE CLIENTS (CRM Client Records)
-- ============================================
CREATE TABLE IF NOT EXISTS office_clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    commercial_name VARCHAR(200),
    industry VARCHAR(100),
    company_size ENUM('startup', 'small', 'medium', 'enterprise') DEFAULT 'small',
    status ENUM('lead', 'prospect', 'active', 'inactive', 'churned') DEFAULT 'lead',

    -- Contact Info
    primary_email VARCHAR(255),
    primary_phone VARCHAR(50),
    website VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Mexico',

    -- Business Info
    tax_id VARCHAR(50),
    fiscal_name VARCHAR(255),

    -- Metrics
    lifetime_value DECIMAL(15,2) DEFAULT 0,
    total_projects INT DEFAULT 0,

    -- Logo
    logo_url VARCHAR(500),

    -- Notes
    notes TEXT,

    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    assigned_to INT,

    -- Indexes
    INDEX idx_office_clients_status (status),
    INDEX idx_office_clients_industry (industry),
    INDEX idx_office_clients_assigned (assigned_to),

    -- Foreign keys
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- OFFICE CLIENT CONTACTS
-- ============================================
CREATE TABLE IF NOT EXISTS office_client_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    is_primary TINYINT(1) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_client_contacts_client (client_id),
    INDEX idx_client_contacts_primary (is_primary),

    -- Foreign keys
    FOREIGN KEY (client_id) REFERENCES office_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PERMISSIONS (RBAC)
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index
    INDEX idx_permissions_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ROLE PERMISSIONS (RBAC Mapping)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role VARCHAR(20) NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (role, permission_id),

    -- Foreign key
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INT PRIMARY KEY,
    default_view ENUM('list', 'cards', 'kanban') DEFAULT 'cards',
    sidebar_collapsed TINYINT(1) DEFAULT 0,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_enabled TINYINT(1) DEFAULT 1,
    email_notifications TINYINT(1) DEFAULT 1,
    dashboard_widgets JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- OFFICE PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS office_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT,
    project_id INT,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MXN',
    status ENUM('pending', 'received', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_type ENUM('deposit', 'milestone', 'final', 'recurring', 'other') DEFAULT 'milestone',
    payment_date DATE,
    due_date DATE,
    reference VARCHAR(100),
    invoice_number VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,

    -- Indexes
    INDEX idx_payments_client (client_id),
    INDEX idx_payments_project (project_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_date (payment_date),

    -- Foreign keys
    FOREIGN KEY (client_id) REFERENCES office_clients(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADD OFFICE_CLIENT_ID TO PROJECTS
-- ============================================
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS office_client_id INT,
    ADD INDEX IF NOT EXISTS idx_projects_office_client (office_client_id),
    ADD CONSTRAINT fk_projects_office_client
        FOREIGN KEY (office_client_id) REFERENCES office_clients(id) ON DELETE SET NULL;

-- ============================================
-- SEED DEFAULT PERMISSIONS
-- ============================================
INSERT IGNORE INTO permissions (code, name, description, category) VALUES
-- Projects
('projects.view', 'View Projects', 'Can view project list and details', 'projects'),
('projects.create', 'Create Projects', 'Can create new projects', 'projects'),
('projects.edit', 'Edit Projects', 'Can edit project details', 'projects'),
('projects.delete', 'Delete Projects', 'Can delete projects', 'projects'),
('projects.manage_team', 'Manage Project Team', 'Can assign/remove team members', 'projects'),

-- Clients
('clients.view', 'View Clients', 'Can view client list and details', 'clients'),
('clients.create', 'Create Clients', 'Can create new clients', 'clients'),
('clients.edit', 'Edit Clients', 'Can edit client details', 'clients'),
('clients.delete', 'Delete Clients', 'Can delete clients', 'clients'),

-- Tasks
('tasks.view', 'View Tasks', 'Can view task list and details', 'tasks'),
('tasks.create', 'Create Tasks', 'Can create new tasks', 'tasks'),
('tasks.edit', 'Edit Tasks', 'Can edit task details', 'tasks'),
('tasks.delete', 'Delete Tasks', 'Can delete tasks', 'tasks'),
('tasks.assign', 'Assign Tasks', 'Can assign tasks to agents', 'tasks'),

-- Agents
('agents.view', 'View Agents', 'Can view agent list and details', 'agents'),
('agents.manage', 'Manage Agents', 'Can create/edit/delete agents', 'agents'),

-- Analytics
('analytics.view', 'View Analytics', 'Can view analytics dashboard', 'analytics'),
('analytics.export', 'Export Analytics', 'Can export analytics data', 'analytics'),

-- Reports
('reports.view', 'View Reports', 'Can view reports', 'reports'),
('reports.create', 'Create Reports', 'Can create custom reports', 'reports'),
('reports.export', 'Export Reports', 'Can export reports', 'reports'),

-- Payments
('payments.view', 'View Payments', 'Can view payment records', 'payments'),
('payments.create', 'Create Payments', 'Can record new payments', 'payments'),
('payments.edit', 'Edit Payments', 'Can edit payment records', 'payments'),

-- Settings
('settings.view', 'View Settings', 'Can view settings', 'settings'),
('settings.edit', 'Edit Settings', 'Can edit own settings', 'settings'),

-- Admin
('admin.users', 'Manage Users', 'Can manage user accounts', 'admin'),
('admin.roles', 'Manage Roles', 'Can manage role permissions', 'admin'),
('admin.system', 'System Administration', 'Full system access', 'admin');

-- ============================================
-- SEED DEFAULT ROLE PERMISSIONS
-- ============================================

-- CEO: Full access
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'ceo', id FROM permissions;

-- CTO: Full access except admin.system
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'cto', id FROM permissions WHERE code != 'admin.system';

-- COO: Operations focused
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'coo', id FROM permissions
WHERE category IN ('projects', 'clients', 'tasks', 'agents', 'analytics', 'reports', 'settings');

-- CFO: Finance focused
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'cfo', id FROM permissions
WHERE category IN ('projects', 'clients', 'payments', 'analytics', 'reports', 'settings')
   OR code LIKE '%.view';

-- Admin: Full access
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions;

-- Manager: Team management
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'manager', id FROM permissions
WHERE category IN ('projects', 'clients', 'tasks', 'agents', 'analytics', 'reports', 'settings')
  AND code NOT LIKE '%.delete';

-- Agent: Own work only
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'agent', id FROM permissions
WHERE code IN (
    'projects.view',
    'clients.view',
    'tasks.view', 'tasks.edit',
    'agents.view',
    'settings.view', 'settings.edit'
);

-- Viewer: Read only
INSERT IGNORE INTO role_permissions (role, permission_id)
SELECT 'viewer', id FROM permissions
WHERE code LIKE '%.view';

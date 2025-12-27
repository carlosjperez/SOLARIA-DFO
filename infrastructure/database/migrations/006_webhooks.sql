-- Migration 006: Webhooks for n8n Integration
-- SOLARIA DFO - Webhook System
-- Date: 2025-12-24

-- Webhooks table for storing webhook subscriptions
CREATE TABLE IF NOT EXISTS webhooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    project_id INT NULL,
    url VARCHAR(500) NOT NULL,
    event_type ENUM(
        'task.created', 'task.updated', 'task.completed', 'task.deleted',
        'task.status_changed', 'task.assigned',
        'project.created', 'project.updated', 'project.status_changed', 'project.completed',
        'agent.status_changed', 'agent.task_assigned',
        'memory.created', 'memory.updated',
        'alert.created', 'alert.resolved',
        'all'
    ) NOT NULL,
    http_method ENUM('POST', 'GET', 'PUT') DEFAULT 'POST',
    secret VARCHAR(64) NULL,
    headers JSON NULL,
    active TINYINT(1) DEFAULT 1,
    max_retries INT DEFAULT 3,
    retry_delay_ms INT DEFAULT 1000,
    trigger_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    failure_count INT DEFAULT 0,
    last_triggered_at TIMESTAMP NULL,
    last_status_code INT NULL,
    last_error TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_webhooks_event_type (event_type),
    INDEX idx_webhooks_project (project_id),
    INDEX idx_webhooks_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Webhook deliveries log for debugging and monitoring
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    webhook_id INT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_payload JSON NULL,
    request_url VARCHAR(500) NOT NULL,
    request_headers JSON NULL,
    request_body TEXT NULL,
    response_status_code INT NULL,
    response_body TEXT NULL,
    response_time_ms INT NULL,
    success TINYINT(1) DEFAULT 0,
    error_message TEXT NULL,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    INDEX idx_deliveries_webhook (webhook_id),
    INDEX idx_deliveries_success (success),
    INDEX idx_deliveries_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default n8n webhook for all events (to be configured)
-- INSERT INTO webhooks (name, url, event_type, secret) VALUES
-- ('n8n-main', 'https://n8n.solaria.agency/webhook/dfo-events', 'all', 'your-secret-here');

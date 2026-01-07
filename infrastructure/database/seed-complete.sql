-- SOLARIA DFO - Complete Seed Data
-- Version: 1.0.0
-- Proyectos reales: ADEPAC, VibeSDK, Akademate, Prilabsa, etc.

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Usuarios
INSERT INTO users (id, username, email, password_hash, name, role, is_active) VALUES
(1, 'carlosjperez', 'carlos@solaria.agency', '$2a$10$abcdefghijklmnopqrstuvwx', 'Carlos Perez', 'admin', TRUE)
ON DUPLICATE KEY UPDATE
    username=VALUES(username),
    email=VALUES(email),
    name=VALUES(name),
    role=VALUES(role);

-- Proyectos reales SOLARIA
INSERT INTO projects (id, name, code, client, description, status, priority, budget, completion_percentage, start_date, created_by) VALUES
(1, 'ADEPAC', 'ADE', 'ADEPAC', 'Sistema de gestion para academias de educacion fisica', 'development', 'high', 85000.00, 25, '2024-11-01', 1),
(2, 'Akademate.com', 'AKA', 'Akademate', 'Plataforma SaaS Multi-tenant para Academias de Formacion Profesional', 'development', 'high', 150000.00, 40, '2024-09-01', 1),
(3, 'VibeSDK', 'VIB', 'VibeSDK', 'SDK para integracion de pagos y suscripciones', 'development', 'critical', 200000.00, 60, '2024-10-01', 1),
(4, 'Prilabsa', 'PRI', 'Prilabsa', 'Laboratorios clinicos y equipamiento medico - Dashboard de gestion', 'active', 'high', 120000.00, 75, '2024-08-01', 1),
(5, 'Solaria Internal Tools', 'SIT', 'SOLARIA', 'Herramientas internas para gestion de proyectos y desarrollo', 'active', 'medium', 50000.00, 90, '2024-01-01', 1),
(6, 'NEMESIS Network Ops', 'NEM', 'SOLARIA', 'Gestion de red VPN y despliegue remoto', 'active', 'high', 35000.00, 95, '2024-03-01', 1)
ON DUPLICATE KEY UPDATE
    name=VALUES(name),
    description=VALUES(description),
    status=VALUES(status),
    priority=VALUES(priority),
    budget=VALUES(budget),
    completion_percentage=VALUES(completion_percentage),
    updated_at=CURRENT_TIMESTAMP;

-- Agentes IA
INSERT INTO ai_agents (id, name, role, status, capabilities) VALUES
(1, 'SOLARIA-PM', 'project_manager', 'active', '{"planning": true, "coordination": true, "reporting": true}'),
(2, 'SOLARIA-ARCH', 'architect', 'active', '{"design": true, "documentation": true, "review": true}'),
(3, 'SOLARIA-DEV-01', 'developer', 'active', '{"frontend": true, "react": true, "typescript": true}'),
(4, 'SOLARIA-DEV-02', 'developer', 'active', '{"backend": true, "nodejs": true, "database": true}'),
(5, 'SOLARIA-QA', 'tester', 'active', '{"testing": true, "automation": true, "qa": true}'),
(6, 'SOLARIA-DEVOPS', 'devops', 'active', '{"docker": true, "ci_cd": true, "infrastructure": true}'),
(7, 'SOLARIA-SEC', 'security_auditor', 'inactive', '{"security": true, "audit": true, "compliance": true}'),
(8, 'SOLARIA-DOC', 'technical_writer', 'inactive', '{"documentation": true, "api_docs": true}')
ON DUPLICATE KEY UPDATE
    name=VALUES(name),
    role=VALUES(role),
    status=VALUES(status),
    capabilities=VALUES(capabilities);

-- Tareas por proyecto

-- ADEPAC (Project 1)
INSERT INTO tasks (task_number, title, description, status, priority, progress, estimated_hours, project_id, assigned_agent_id) VALUES
(1, 'Diseñar arquitectura multi-tenant', 'Definir estructura de BD y aislamiento por schema', 'completed', 'critical', 100, 16, 1, 2),
(2, 'Implementar autenticacion JWT', 'Sistema de auth con refresh tokens', 'completed', 'critical', 100, 12, 1, 2),
(3, 'Desarrollar modulo de estudiantes', 'CRUD estudiantes con relaciones por tenant', 'in_progress', 'high', 70, 24, 1, 3),
(4, 'Configurar sistema de reservas', 'Gestion de canchas y horarios por academias', 'pending', 'high', 0, 20, 1, 3),
(5, 'Integracion pasarela de pagos', 'Stripe/PayPal para suscripciones', 'pending', 'critical', 0, 32, 1, 4);

-- Akademate (Project 2)
INSERT INTO tasks (task_number, title, description, status, priority, progress, estimated_hours, project_id, assigned_agent_id) VALUES
(6, 'Configurar monorepo con Turborepo', 'Setup inicial del monorepo usando Turborepo para gestionar packages frontend y backend', 'completed', 'critical', 100, 8, 2, 6),
(7, 'Implementar schema multi-tenant', 'Disenar e implementar la arquitectura de base de datos multi-tenant con aislamiento por schema PostgreSQL', 'in_progress', 'critical', 65, 24, 2, 2),
(8, 'Configurar Payload CMS base', 'Instalar y configurar Payload CMS 3.0 como backend headless con soporte multi-tenant', 'in_progress', 'high', 40, 16, 2, 4),
(9, 'Crear coleccion Tenants', 'Implementar coleccion de tenants con campos: name, slug, domain, settings, plan, branding', 'pending', 'high', 0, 8, 2, 4),
(10, 'Crear coleccion Users con roles', 'Implementar sistema de usuarios con roles por tenant: superadmin, admin, instructor, student', 'pending', 'high', 0, 12, 2, 4);

-- VibeSDK (Project 3)
INSERT INTO tasks (task_number, title, description, status, priority, progress, estimated_hours, project_id, assigned_agent_id) VALUES
(11, 'Analizar requisitos SDK', 'Documentacion y analisis de requerimientos para SDK de pagos', 'completed', 'high', 100, 8, 3, 2),
(12, 'Diseñar arquitectura modular', 'Patron de diseño factory para multiples proveedores de pago', 'completed', 'high', 100, 16, 3, 2),
(13, 'Implementar core SDK', 'Clases base e interfaces para integracion', 'in_progress', 'critical', 50, 32, 3, 3),
(14, 'Integracion Stripe', 'SDK wrapper para Stripe API v2', 'pending', 'critical', 0, 20, 3, 4),
(15, 'Integracion PayPal', 'SDK wrapper para PayPal Checkout API', 'pending', 'high', 0, 16, 3, 4),
(16, 'Tests unitarios y E2E', 'Suite completa de tests con coverage 80%+', 'pending', 'high', 0, 24, 3, 5);

-- Prilabsa (Project 4)
INSERT INTO tasks (task_number, title, description, status, priority, progress, estimated_hours, project_id, assigned_agent_id) VALUES
(17, 'Setup dashboard React', 'Configuracion inicial de React + Vite + TypeScript', 'completed', 'high', 100, 6, 4, 3),
(18, 'Integrar Payload CMS', 'Conectar frontend con Payload API para productos y catalogo', 'completed', 'high', 100, 12, 4, 2),
(19, 'Implementar WordPress integration', 'API para sincronizacion con WordPress existente', 'in_progress', 'high', 60, 16, 4, 2),
(20, 'Gestion de inventarios', 'CRUD para gestion de productos y stock', 'completed', 'medium', 100, 20, 4, 3),
(21, 'Sistema de cotizaciones', 'Flujo completo de cotizaciones y aprobaciones', 'completed', 'high', 100, 24, 4, 3),
(22, 'Dashboard ejecutivo', 'Vistas para CEO/CFO con metricas y KPIs', 'pending', 'medium', 0, 32, 4, 2);

-- Solaria Internal Tools (Project 5)
INSERT INTO tasks (task_number, title, description, status, priority, progress, estimated_hours, project_id, assigned_agent_id) VALUES
(23, 'SOLARIA-DFO v1.0', 'Despliegue inicial de dashboard de gestion de proyectos', 'completed', 'high', 100, 40, 5, 1),
(24, 'Integracion MCP v1.0', 'Model Context Protocol para agentes IA', 'completed', 'high', 100, 16, 5, 2),
(25, 'Sistema de memoria persistente', 'Almacenamiento de contexto a largo plazo para agentes', 'completed', 'critical', 100, 24, 5, 4),
(26, 'Coord multi-agentes', 'Sistema para coordinar 10+ agentes especializados', 'in_progress', 'critical', 70, 32, 5, 2),
(27, 'Dashboard ejecutivo web', 'Interface web para CEO/CTO/COO/CFO', 'pending', 'high', 0, 20, 5, 3);

-- NEMESIS Network Ops (Project 6)
INSERT INTO tasks (task_number, title, description, status, priority, progress, estimated_hours, project_id, assigned_agent_id) VALUES
(28, 'Configurar Tailscale VPN', 'Setup de red VPN privada para acceso seguro', 'completed', 'critical', 100, 8, 6, 6),
(29, 'Configurar PM2 clusters', 'Gestion de procesos Node.js en produccion', 'completed', 'high', 100, 12, 6, 6),
(30, 'Implementar NEMESIS protocol', 'Protocolo PPNI-01 para comunicacion agentes', 'completed', 'high', 100, 16, 6, 2),
(31, 'Deploy automatizado', 'CI/CD pipelines para despliegues automaticos', 'in_progress', 'high', 80, 20, 6, 6),
(32, 'Monitoreo y alertas', 'Sistema de monitoring con alertas proactivas', 'pending', 'medium', 0, 16, 6, 5);

-- Actualizar metricas de proyectos
UPDATE projects p SET completion_percentage = (
    SELECT COALESCE(AVG(t.progress), 0)
    FROM tasks t
    WHERE t.project_id = p.id
) WHERE p.id IN (1,2,3,4,5,6);

-- Logs de actividad
INSERT INTO activity_logs (action, message, category, level) VALUES
('seed_complete', 'Base de datos inicializada con 6 proyectos y 32 tareas', 'system', 'info');

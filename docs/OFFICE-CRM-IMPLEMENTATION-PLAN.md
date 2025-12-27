# SOLARIA Office CRM - Implementation Plan

**Version:** 1.0
**Date:** 2025-12-27
**Scope:** Complete CRM functionality for Office portal with RBAC
**DFO Tracking:** Sprint 29 | Epic 36 | Tasks 457-466

---

## Executive Summary

Transform Office app from basic dashboard into full CRM with:
- Client directory with detail pages
- Project management with filtering/views
- Role-based access control
- Human agent dashboards
- Settings & administration

**Estimated Effort:** 8-12 sprints (2-week each)
**Total Estimated Hours:** 228 hours

---

## DFO Task Breakdown

| Task ID | Phase | Description | Priority | Hours |
|---------|-------|-------------|----------|-------|
| 457 | 1 | Database Schema Extensions | Critical | 16h |
| 458 | 2 | Backend API RBAC & Office Endpoints | Critical | 24h |
| 459 | 3 | Frontend Auth & Permission Infrastructure | Critical | 16h |
| 460 | 4 | Clients Module | High | 32h |
| 461 | 5 | Projects Module Enhancement | High | 32h |
| 462 | 6 | Agents & Team Module | Medium | 16h |
| 463 | 7 | Human Agent Dashboard | Medium | 24h |
| 464 | 8 | Analytics & Reports | Medium | 24h |
| 465 | 9 | Settings & Administration | Medium | 20h |
| 466 | 10 | Polish & Integration | Low | 24h |

---

## Phase 1: Database Schema Extensions

### 1.1 Office Visibility Migration
```sql
-- Already exists in schema but needs migration for production
ALTER TABLE projects
  ADD COLUMN office_origin ENUM('dfo', 'office') DEFAULT 'dfo',
  ADD COLUMN office_visible TINYINT(1) DEFAULT 0;
```

### 1.2 New Tables Required

**Clients Table** (separate from project_clients which is fiscal data)
```sql
CREATE TABLE office_clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  commercial_name VARCHAR(200),
  industry VARCHAR(100),
  company_size ENUM('startup', 'small', 'medium', 'enterprise'),
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
  tax_id VARCHAR(50),  -- RFC
  fiscal_name VARCHAR(255),
  -- Metrics
  lifetime_value DECIMAL(15,2) DEFAULT 0,
  total_projects INT DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id),
  assigned_to INT REFERENCES users(id)  -- Account manager
);
```

**Client Contacts Table**
```sql
CREATE TABLE office_client_contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL REFERENCES office_clients(id),
  name VARCHAR(200) NOT NULL,
  title VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary TINYINT(1) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Project-Client Relationship**
```sql
-- Link projects to office_clients
ALTER TABLE projects
  ADD COLUMN office_client_id INT REFERENCES office_clients(id);
```

**Permissions Table**
```sql
CREATE TABLE permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,  -- e.g., 'projects.create', 'clients.delete'
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50)  -- 'projects', 'clients', 'tasks', 'settings'
);

CREATE TABLE role_permissions (
  role VARCHAR(20) NOT NULL,  -- Matches user role enum
  permission_id INT NOT NULL REFERENCES permissions(id),
  PRIMARY KEY (role, permission_id)
);
```

**User Preferences**
```sql
CREATE TABLE user_preferences (
  user_id INT PRIMARY KEY REFERENCES users(id),
  default_view ENUM('list', 'cards') DEFAULT 'cards',
  sidebar_collapsed TINYINT(1) DEFAULT 0,
  theme VARCHAR(20) DEFAULT 'light',
  notifications_enabled TINYINT(1) DEFAULT 1,
  dashboard_widgets JSON  -- Custom widget configuration
);
```

**Payments Table (Basic)**
```sql
CREATE TABLE office_payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT REFERENCES office_clients(id),
  project_id INT REFERENCES projects(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  status ENUM('pending', 'received', 'cancelled') DEFAULT 'pending',
  payment_date DATE,
  due_date DATE,
  reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id)
);
```

### 1.3 Files to Create/Modify
- `infrastructure/database/migrations/009_office_crm_schema.sql` (NEW)
- `dashboard/db/schema/office-clients.ts` (NEW)
- `dashboard/db/schema/permissions.ts` (NEW)
- `dashboard/db/schema/projects.ts` (UPDATE - add office_client_id)

---

## Phase 2: Backend API Extensions

### 2.1 New API Endpoints

**Office Clients**
```
GET    /api/office/clients              - List with filters
GET    /api/office/clients/:id          - Detail with contacts & projects
POST   /api/office/clients              - Create
PUT    /api/office/clients/:id          - Update
DELETE /api/office/clients/:id          - Soft delete

GET    /api/office/clients/:id/contacts - List contacts
POST   /api/office/clients/:id/contacts - Add contact
PUT    /api/office/clients/:id/contacts/:cid - Update contact
DELETE /api/office/clients/:id/contacts/:cid - Delete contact

GET    /api/office/clients/:id/projects - Client's projects
POST   /api/office/clients/:id/projects - Assign project to client
```

**Office Projects (filtered)**
```
GET    /api/office/projects             - Only office_visible=1 projects
GET    /api/office/projects/:id         - Detail with tasks, agents, timeline
PUT    /api/office/projects/:id/visibility - Toggle office visibility
```

**Office Dashboard**
```
GET    /api/office/dashboard            - Office-specific KPIs
GET    /api/office/dashboard/agent/:id  - Human agent personal dashboard
```

**Settings & Admin**
```
GET    /api/office/settings             - Current user settings
PUT    /api/office/settings             - Update settings
GET    /api/office/admin/users          - List users (admin only)
PUT    /api/office/admin/users/:id/role - Change user role
GET    /api/office/admin/permissions    - List all permissions
PUT    /api/office/admin/roles/:role    - Update role permissions
```

### 2.2 RBAC Middleware
```typescript
// New middleware: requirePermission
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const userRole = req.user?.role;
    const hasPermission = await checkRolePermission(userRole, permission);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
}
```

### 2.3 Files to Create/Modify
- `dashboard/server.ts` - Add new routes + RBAC middleware
- `dashboard/services/officeClientsService.ts` (NEW)
- `dashboard/services/permissionsService.ts` (NEW)
- `mcp-server/handlers.ts` - Add Office MCP tools

---

## Phase 3: Frontend - Core Infrastructure

### 3.1 Authentication Integration
- Copy auth system from dashboard app
- Add login page to office-app
- Implement ProtectedRoute with role checks
- Add auth store (Zustand)

### 3.2 Permission-Aware Components
```typescript
// usePermissions hook
const { can, canAny, canAll } = usePermissions();

// PermissionGate component
<PermissionGate permission="clients.create">
  <Button>Nuevo Cliente</Button>
</PermissionGate>
```

### 3.3 View Toggle System
```typescript
// Shared component for list/card views
<ViewToggle
  view={view}
  onChange={setView}
  options={['list', 'cards', 'kanban']}
/>
```

### 3.4 Files to Create
- `office-app/src/store/authStore.ts` (NEW)
- `office-app/src/hooks/usePermissions.ts` (NEW)
- `office-app/src/components/auth/ProtectedRoute.tsx` (NEW)
- `office-app/src/components/auth/PermissionGate.tsx` (NEW)
- `office-app/src/components/ui/ViewToggle.tsx` (NEW)
- `office-app/src/pages/LoginPage.tsx` (NEW)

---

## Phase 4: Clients Module

### 4.1 Client Directory Page (`/clients`)
- **Card View**: Client cards with logo, name, status badge, metrics
- **List View**: Sortable table with all fields
- **Filters**: Status, industry, assigned manager, date range
- **Search**: Full-text across name, email, company
- **Sort**: Name, created date, lifetime value, activity
- **Actions**: Create, edit, view detail

### 4.2 Client Detail Page (`/clients/:id`)
- **Header**: Logo, name, status, quick actions
- **Tabs**:
  - Overview: Contact info, addresses, business info
  - Contacts: People at the company (CRUD)
  - Projects: Linked projects with status
  - Activity: Timeline of interactions
  - Documents: Contracts, proposals
  - Notes: Free-form notes
- **Sidebar**: Quick stats, assigned manager, tags

### 4.3 Files to Create/Modify
- `office-app/src/pages/OfficeClientsPage.tsx` (REWRITE)
- `office-app/src/pages/ClientDetailPage.tsx` (NEW)
- `office-app/src/components/clients/ClientCard.tsx` (NEW)
- `office-app/src/components/clients/ClientTable.tsx` (NEW)
- `office-app/src/components/clients/ClientFilters.tsx` (NEW)
- `office-app/src/components/clients/ContactList.tsx` (NEW)
- `office-app/src/hooks/useClients.ts` (NEW)
- `office-app/src/hooks/useClient.ts` (NEW)

---

## Phase 5: Projects Module Enhancement

### 5.1 Projects Page (`/projects`)
- **View Toggle**: Cards / List / Kanban (by status)
- **Filters**: Status, priority, client, date range, budget range
- **Sort**: Name, deadline, progress, budget
- **Bulk Actions**: Change status, assign agent

### 5.2 Project Detail Page (`/projects/:id`)
- **Header**: Name, code, status badge, progress bar
- **Tabs**:
  - Overview: Description, timeline, budget
  - Tasks: Kanban board or list of tasks
  - Team: Assigned agents (human + AI)
  - Phases: Sprint/Epic timeline view
  - Documents: Project docs
  - Activity: Change log
- **Sidebar**: Client info, quick stats, deadlines

### 5.3 Office Visibility Toggle
- In DFO: Checkbox "Visible en Office"
- In Office: Only see visible projects
- API filters automatically

### 5.4 Files to Create/Modify
- `office-app/src/pages/OfficeProjectsPage.tsx` (ENHANCE)
- `office-app/src/pages/ProjectDetailPage.tsx` (NEW)
- `office-app/src/components/projects/ProjectCard.tsx` (NEW)
- `office-app/src/components/projects/ProjectKanban.tsx` (NEW)
- `office-app/src/components/projects/TaskBoard.tsx` (NEW)
- `office-app/src/components/projects/TeamList.tsx` (NEW)

---

## Phase 6: Agents & Team Module

### 6.1 Agents Page (`/agents`)
- **Sections**: Human Team / AI Agents
- **Card View**: Avatar, name, role, status, current tasks
- **Filters**: Role, status, availability
- **Actions**: View detail, assign task

### 6.2 Agent Detail Page (`/agents/:id`)
- **Header**: Avatar, name, role, status
- **Tabs**:
  - Tasks: Assigned tasks with progress
  - Projects: Active projects
  - Performance: Metrics, completion rate
  - Activity: Recent actions

### 6.3 Files to Create/Modify
- `office-app/src/pages/OfficeAgentsPage.tsx` (ENHANCE)
- `office-app/src/pages/AgentDetailPage.tsx` (NEW)
- `office-app/src/components/agents/AgentCard.tsx` (NEW)

---

## Phase 7: Human Agent Dashboard

### 7.1 Personal Dashboard (`/my-dashboard`)
For logged-in human agents (role: manager, agent):

- **My Tasks**: Assigned tasks with deadlines
- **My Projects**: Projects where assigned
- **My Clients**: Clients where account manager
- **Payments**: (Future) Received payments
- **Calendar**: Deadlines, meetings
- **Quick Actions**: Create task, log activity

### 7.2 Permission-Based Visibility
- `manager`: Sees team + own data
- `agent`: Sees only own data
- `admin`: Sees everything
- `ceo/cto/coo/cfo`: Executive dashboards

### 7.3 Files to Create
- `office-app/src/pages/MyDashboardPage.tsx` (NEW)
- `office-app/src/components/dashboard/MyTasks.tsx` (NEW)
- `office-app/src/components/dashboard/MyProjects.tsx` (NEW)

---

## Phase 8: Analytics & Reports

### 8.1 Analytics Page (`/analytics`)
- **Charts**: Project completion trends, task burndown
- **Metrics**: Revenue pipeline, agent performance
- **Filters**: Date range, project, client

### 8.2 Reports Page (`/reports`)
- **Report Types**:
  - Project status report
  - Client activity report
  - Agent performance report
  - Financial summary
- **Export**: PDF, CSV, Excel

### 8.3 Files to Create
- `office-app/src/pages/AnalyticsPage.tsx` (NEW)
- `office-app/src/pages/ReportsPage.tsx` (NEW)
- `office-app/src/components/charts/` (NEW directory)

---

## Phase 9: Settings & Administration

### 9.1 Settings Page (`/settings`)
- **Profile**: Name, email, avatar, password
- **Preferences**: Default view, theme, notifications
- **Integrations**: (Future) Calendar, email

### 9.2 Admin Page (`/admin`) - Admin only
- **Users**: List, create, edit roles
- **Roles & Permissions**: Configure RBAC
- **System**: Logs, health, config

### 9.3 Files to Create
- `office-app/src/pages/SettingsPage.tsx` (NEW)
- `office-app/src/pages/AdminPage.tsx` (NEW)
- `office-app/src/components/settings/ProfileForm.tsx` (NEW)
- `office-app/src/components/admin/UserManagement.tsx` (NEW)
- `office-app/src/components/admin/RolePermissions.tsx` (NEW)

---

## Phase 10: Polish & Integration

### 10.1 Real-time Updates
- WebSocket for live task updates
- Notification system

### 10.2 Search & Navigation
- Global search (Cmd+K)
- Breadcrumbs
- Recent items

### 10.3 Mobile Optimization
- Responsive tables
- Touch-friendly interactions
- PWA enhancements

---

## Implementation Priority

### Sprint 1-2: Foundation
1. Database migrations
2. Auth integration
3. RBAC middleware
4. Permission system

### Sprint 3-4: Clients
1. Client API endpoints
2. Client directory page
3. Client detail page
4. Contact management

### Sprint 5-6: Projects
1. Project detail page
2. View toggles
3. Office visibility
4. Task integration

### Sprint 7-8: Team & Dashboard
1. Agent pages
2. Human agent dashboard
3. Permission-based views

### Sprint 9-10: Analytics & Reports
1. Charts & metrics
2. Report generation
3. Export functionality

### Sprint 11-12: Admin & Polish
1. Settings page
2. Admin panel
3. Real-time updates
4. Mobile optimization

---

## Key Files Summary

### Database
- `infrastructure/database/migrations/009_office_crm_schema.sql`
- `dashboard/db/schema/office-clients.ts`
- `dashboard/db/schema/permissions.ts`

### Backend
- `dashboard/server.ts` (modify)
- `dashboard/services/officeClientsService.ts`
- `dashboard/services/permissionsService.ts`

### Frontend - New Pages
- `office-app/src/pages/LoginPage.tsx`
- `office-app/src/pages/ClientDetailPage.tsx`
- `office-app/src/pages/ProjectDetailPage.tsx`
- `office-app/src/pages/AgentDetailPage.tsx`
- `office-app/src/pages/MyDashboardPage.tsx`
- `office-app/src/pages/AnalyticsPage.tsx`
- `office-app/src/pages/ReportsPage.tsx`
- `office-app/src/pages/SettingsPage.tsx`
- `office-app/src/pages/AdminPage.tsx`

### Frontend - Components
- `office-app/src/components/auth/*`
- `office-app/src/components/clients/*`
- `office-app/src/components/projects/*`
- `office-app/src/components/agents/*`
- `office-app/src/components/dashboard/*`
- `office-app/src/components/charts/*`
- `office-app/src/components/settings/*`
- `office-app/src/components/admin/*`

---

## User Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Client Model | **New separate table** - `office_clients` for CRM, `project_clients` for fiscal |
| Sprint 1-2 Priority | **Auth + RBAC + DB** - Foundation first |
| AI Agent Visibility | **Both but separated** - Human team + AI agents in separate sections |
| Payment Tracking | **Basic tracking now** - Simple payment records linked to clients/projects |

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | TailwindCSS 4 |
| State | Zustand + React Query |
| Routing | React Router 7 |
| Backend | Node.js + Express |
| Database | MariaDB + Drizzle ORM |
| Auth | JWT (24h expiration) |
| Deployment | Docker + Nginx |

---

**SOLARIA Digital Field Operations**
**Office CRM Implementation Plan v1.0**


# Claude Code Agent Prompt: Office CRM Implementation

**Purpose:** This prompt is designed for a Claude Code agent working in an isolated git worktree to implement the SOLARIA Office CRM system.

---

## Initial Setup

### 1. Create Worktree and Branch
```bash
# From the main SOLARIA-DFO repository
cd /path/to/SOLARIA-DFO
git worktree add ../office-crm-dev feature/office-crm-implementation
cd ../office-crm-dev
```

### 2. Set DFO Context
Before starting work, register with SOLARIA DFO:
```
set_project_context({ project_name: "OFFICE.SOLARIA.AGENCY" })
```

### 3. Locate Current Task
Check DFO for the next pending task:
```
list_tasks({ status: "pending", project_id: 3 })
```

---

## Agent Instructions

You are implementing the **SOLARIA Office CRM** system. Your work is tracked in **DFO Sprint 29** (Office CRM Implementation) under **Epic 36**.

### Key Resources

| Resource | Location |
|----------|----------|
| Implementation Plan | `docs/OFFICE-CRM-IMPLEMENTATION-PLAN.md` |
| Office App Source | `office-app/` |
| Dashboard Backend | `dashboard/server.ts` |
| Database Schema | `dashboard/db/schema/` |
| Migrations | `infrastructure/database/migrations/` |

### DFO Tasks (In Priority Order)

| Task | Phase | Description | Priority |
|------|-------|-------------|----------|
| 457 | 1 | Database Schema Extensions | Critical |
| 458 | 2 | Backend API RBAC & Office Endpoints | Critical |
| 459 | 3 | Frontend Auth & Permission Infrastructure | Critical |
| 460 | 4 | Clients Module | High |
| 461 | 5 | Projects Module Enhancement | High |
| 462 | 6 | Agents & Team Module | Medium |
| 463 | 7 | Human Agent Dashboard | Medium |
| 464 | 8 | Analytics & Reports | Medium |
| 465 | 9 | Settings & Administration | Medium |
| 466 | 10 | Polish & Integration | Low |

---

## Phase 1: Database Schema Extensions (Task 457)

### Objective
Create database schema for Office CRM functionality.

### Actions

1. **Create Migration File**
   ```bash
   # Create: infrastructure/database/migrations/009_office_crm_schema.sql
   ```

2. **Tables to Create:**
   - `office_clients` - CRM client records
   - `office_client_contacts` - Client contact persons
   - `office_payments` - Payment tracking
   - `permissions` - RBAC permissions
   - `role_permissions` - Role-permission mappings
   - `user_preferences` - User settings

3. **Columns to Add:**
   - `projects.office_client_id` - Link to office_clients

4. **Create Drizzle Schema Files:**
   - `dashboard/db/schema/office-clients.ts`
   - `dashboard/db/schema/permissions.ts`

### Completion Criteria
- [ ] Migration file created and tested
- [ ] Drizzle schema files match SQL
- [ ] Run migration on local DB successfully

### DFO Update
```javascript
update_task({ task_id: 457, status: "in_progress" })
create_task_items({
    task_id: 457,
    items: [
        { title: "Create 009_office_crm_schema.sql migration", estimated_minutes: 30 },
        { title: "Create office_clients table", estimated_minutes: 20 },
        { title: "Create office_client_contacts table", estimated_minutes: 15 },
        { title: "Create office_payments table", estimated_minutes: 15 },
        { title: "Create permissions tables", estimated_minutes: 20 },
        { title: "Create user_preferences table", estimated_minutes: 10 },
        { title: "Add office_client_id to projects", estimated_minutes: 10 },
        { title: "Create Drizzle schema files", estimated_minutes: 45 },
        { title: "Test migration locally", estimated_minutes: 30 }
    ]
})
```

---

## Phase 2: Backend API RBAC & Office Endpoints (Task 458)

### Objective
Implement RBAC middleware and Office-specific API endpoints.

### Actions

1. **Create RBAC Middleware** in `dashboard/server.ts`:
   ```typescript
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

2. **Create Service Files:**
   - `dashboard/services/officeClientsService.ts`
   - `dashboard/services/permissionsService.ts`

3. **Add API Endpoints:**
   - `/api/office/clients` (CRUD)
   - `/api/office/clients/:id/contacts` (CRUD)
   - `/api/office/clients/:id/projects`
   - `/api/office/projects` (filtered by office_visible)
   - `/api/office/dashboard`
   - `/api/office/settings`
   - `/api/office/admin/*`

### Completion Criteria
- [ ] RBAC middleware functional
- [ ] All endpoints return proper responses
- [ ] Permission checks enforced
- [ ] Tests pass

---

## Phase 3: Frontend Auth & Permission Infrastructure (Task 459)

### Objective
Add authentication and permission system to office-app.

### Actions

1. **Create Auth Store:**
   - `office-app/src/store/authStore.ts`

2. **Create Auth Components:**
   - `office-app/src/pages/LoginPage.tsx`
   - `office-app/src/components/auth/ProtectedRoute.tsx`
   - `office-app/src/components/auth/PermissionGate.tsx`

3. **Create Permission Hook:**
   - `office-app/src/hooks/usePermissions.ts`

4. **Create UI Components:**
   - `office-app/src/components/ui/ViewToggle.tsx`

5. **Update Router:**
   - Add LoginPage route
   - Wrap routes with ProtectedRoute

### Completion Criteria
- [ ] Login page functional
- [ ] Auth persists across sessions
- [ ] Permission gates work
- [ ] Unauthorized access redirects to login

---

## Phase 4: Clients Module (Task 460)

### Objective
Full CRM-style client management.

### Actions

1. **Rewrite Clients Page:**
   - `office-app/src/pages/OfficeClientsPage.tsx`
   - Card + List view toggle
   - Filters and search
   - Create/Edit modals

2. **Create Client Detail Page:**
   - `office-app/src/pages/ClientDetailPage.tsx`
   - Tabs: Overview, Contacts, Projects, Activity, Documents

3. **Create Components:**
   - `office-app/src/components/clients/ClientCard.tsx`
   - `office-app/src/components/clients/ClientTable.tsx`
   - `office-app/src/components/clients/ClientFilters.tsx`
   - `office-app/src/components/clients/ContactList.tsx`

4. **Create Hooks:**
   - `office-app/src/hooks/useClients.ts`
   - `office-app/src/hooks/useClient.ts`

---

## Technical Stack Reference

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | TailwindCSS 4 |
| State | Zustand + React Query (@tanstack/react-query) |
| Routing | React Router 7 |
| Backend | Node.js + Express |
| Database | MariaDB + Drizzle ORM |
| Auth | JWT (24h expiration, bcrypt hashing) |

### Existing Patterns

**React Query Usage:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '@lib/api';

export function useClients() {
    return useQuery({
        queryKey: ['clients'],
        queryFn: async () => {
            const response = await endpoints.clients.list();
            return response.data.clients;
        },
        staleTime: 1000 * 60 * 5,
    });
}
```

**Zustand Store:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            login: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        { name: 'auth-storage' }
    )
);
```

**API Client Pattern:**
```typescript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

---

## Workflow Protocol

### Before Starting a Task
1. Check DFO for task details: `get_task({ task_id: XXX })`
2. Update task to in_progress: `update_task({ task_id: XXX, status: "in_progress" })`
3. Create subtask breakdown: `create_task_items({ task_id: XXX, items: [...] })`

### While Working
1. Complete subtasks: `complete_task_item({ task_id: XXX, item_id: YYY, notes: "..." })`
2. Save important decisions to memory: `memory_create({ content: "...", tags: ["decision"] })`

### After Completing a Task
1. Mark task complete: `complete_task({ task_id: XXX, completion_notes: "..." })`
2. Commit changes with descriptive message
3. Move to next pending task

### Commit Message Format
```
feat(office-crm): [Phase X] Brief description

- Bullet points of changes
- Another change

DFO: Task #XXX complete

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Testing Commands

```bash
# Frontend
cd office-app
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # ESLint

# Backend
cd dashboard
pnpm dev          # Development server
pnpm test         # Run tests
```

---

## Deployment

After completing phases, deploy to production:

```bash
# Build office-app
cd office-app
pnpm build

# Deploy to server
rsync -avz --delete dist/ root@148.230.118.124:/var/www/office-app/

# Reload nginx
ssh root@148.230.118.124 "docker exec solaria-dfo-nginx nginx -s reload"
```

---

## Environment Variables

### office-app/.env.production
```
VITE_API_URL=/api
```

### Dashboard Backend
Uses the same environment as the main DFO dashboard.

---

## Critical Notes

1. **RBAC First**: Phases 1-3 are critical foundation. Don't skip ahead.
2. **Use Existing Auth**: Copy JWT handling from `dashboard/server.ts` lines 572-588.
3. **Office Visibility**: Projects shown in Office require `office_visible = 1`.
4. **Color Theme**: SOLARIA orange is `#f6921d`.
5. **No Hardcoded URLs**: Always use relative paths or environment variables.
6. **Test Locally First**: Before deploying, verify changes work locally.

---

## Quick Reference: Existing User Roles

```typescript
enum UserRole {
    ceo = 'ceo',
    cto = 'cto',
    coo = 'coo',
    cfo = 'cfo',
    admin = 'admin',
    manager = 'manager',
    agent = 'agent',
    viewer = 'viewer'
}
```

---

## Start Command

To begin implementation, the agent should:

1. Read the full implementation plan: `docs/OFFICE-CRM-IMPLEMENTATION-PLAN.md`
2. Set DFO context: `set_project_context({ project_name: "OFFICE.SOLARIA.AGENCY" })`
3. Get first task: `get_task({ task_id: 457 })`
4. Begin Phase 1: Database Schema Extensions

**Good luck, Agent!**

---

**SOLARIA Digital Field Operations**
**Office CRM Agent Prompt v1.0**
**Generated: 2025-12-27**

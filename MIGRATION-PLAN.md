# SOLARIA DFO - Plan de Migración de Stack

**Fecha:** 2025-12-20
**Versión:** 1.0
**Estado:** Aprobado, listo para ejecución

---

## Resumen Ejecutivo

Migración del stack tecnológico de SOLARIA DFO para mejorar mantenibilidad, type-safety y developer experience.

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Lenguaje** | JavaScript | TypeScript |
| **ORM** | Raw SQL (mysql2) | Drizzle ORM |
| **Frontend** | Vanilla JS (1,414 LOC) | React 18 + shadcn/ui |
| **Build** | Webpack | Vite |
| **Estimación** | - | 164h (~4-5 semanas) |

---

## Stack Final

```
Frontend: React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui
Backend:  Express + TypeScript + Drizzle ORM + Socket.IO
Database: MariaDB (sin cambios)
MCP:      JSON-RPC HTTP (sin cambios en protocolo)
```

---

## EPICs y Tareas

### EPIC 1: TypeScript Migration (36h)

| Código | Tarea | Prioridad | Horas | Estado |
|--------|-------|-----------|-------|--------|
| DFO-054 | Configurar TypeScript en proyecto | high | 4 | pending |
| DFO-055 | Migrar MCP handlers a TypeScript | high | 8 | pending |
| DFO-056 | Migrar server.js a TypeScript | high | 16 | pending |
| DFO-057 | Definir interfaces para entidades DB | high | 6 | pending |
| DFO-058 | Configurar ESLint + Prettier para TS | medium | 2 | pending |

**Dependencias:** Ninguna (primer EPIC)

**Archivos críticos:**
- `/dashboard/server.js` → `/dashboard/server.ts` (3,823 LOC)
- `/mcp-server/handlers.js` → `/mcp-server/handlers.ts` (1,394 LOC)
- `/mcp-server/http-server.js` → `/mcp-server/http-server.ts`

---

### EPIC 2: Drizzle ORM Migration (41h)

| Código | Tarea | Prioridad | Horas | Estado |
|--------|-------|-----------|-------|--------|
| DFO-059 | Instalar y configurar Drizzle ORM | high | 4 | pending |
| DFO-060 | Definir schema Drizzle desde SQL existente | high | 8 | pending |
| DFO-061 | Migrar queries de Projects a Drizzle | high | 6 | pending |
| DFO-062 | Migrar queries de Tasks/TaskItems a Drizzle | high | 8 | pending |
| DFO-063 | Migrar queries de Memories a Drizzle | medium | 4 | pending |
| DFO-064 | Migrar queries restantes (Agents, Logs, Users) | medium | 8 | pending |
| DFO-065 | Configurar drizzle-kit para migraciones | medium | 3 | pending |

**Dependencias:** EPIC 1 completado (requiere TypeScript)

**Archivos a crear:**
- `/dashboard/db/index.ts` - Conexión Drizzle
- `/dashboard/db/schema/projects.ts`
- `/dashboard/db/schema/tasks.ts`
- `/dashboard/db/schema/agents.ts`
- `/dashboard/db/schema/memories.ts`
- `/dashboard/db/schema/users.ts`
- `/dashboard/drizzle.config.ts`

---

### EPIC 3: React Dashboard + shadcn/ui (53h)

| Código | Tarea | Prioridad | Horas | Estado |
|--------|-------|-----------|-------|--------|
| DFO-066 | Setup React + Vite + TypeScript | high | 4 | pending |
| DFO-067 | Instalar y configurar shadcn/ui | high | 3 | pending |
| DFO-068 | Crear layout base (Sidebar, Header, Theme) | high | 6 | pending |
| DFO-069 | Migrar vista Dashboard principal (KPIs) | high | 8 | pending |
| DFO-070 | Migrar vista Projects (list + detail) | high | 6 | pending |
| DFO-071 | Migrar vista Tasks con Kanban board | high | 10 | pending |
| DFO-072 | Migrar vista Agents | medium | 4 | pending |
| DFO-073 | Migrar vista Memories | medium | 4 | pending |
| DFO-074 | Integrar Socket.IO con React Context | high | 4 | pending |
| DFO-075 | Integrar autenticación JWT | high | 4 | pending |

**Dependencias:** EPIC 1 completado (TypeScript base)

**Estructura nueva:**
```
/app/
├── src/
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   ├── layout/      # Sidebar, Header
│   │   └── features/    # TaskCard, ProjectCard, etc.
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts
│   │   └── useApi.ts
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Projects.tsx
│   │   ├── Tasks.tsx
│   │   ├── Agents.tsx
│   │   └── Memories.tsx
│   ├── providers/
│   │   ├── AuthProvider.tsx
│   │   └── SocketProvider.tsx
│   └── App.tsx
├── index.html
├── vite.config.ts
└── tailwind.config.ts
```

---

### EPIC 4: Testing & QA (21h)

| Código | Tarea | Prioridad | Horas | Estado |
|--------|-------|-----------|-------|--------|
| DFO-076 | Configurar Vitest para frontend | medium | 3 | pending |
| DFO-077 | Tests unitarios componentes críticos | medium | 8 | pending |
| DFO-078 | Actualizar tests E2E Playwright | medium | 6 | pending |
| DFO-079 | Verificar paridad funcional con dashboard actual | high | 4 | pending |

**Dependencias:** EPIC 3 completado

---

### EPIC 5: Cleanup & Deploy (13h)

| Código | Tarea | Prioridad | Horas | Estado |
|--------|-------|-----------|-------|--------|
| DFO-080 | Eliminar código Vanilla JS legacy | low | 2 | pending |
| DFO-081 | Actualizar Dockerfiles para nuevo stack | medium | 3 | pending |
| DFO-082 | Actualizar documentación | medium | 4 | pending |
| DFO-083 | Deploy a producción dfo.solaria.agency | high | 4 | pending |

**Dependencias:** EPIC 4 completado

---

## Guía de Implementación

### DFO-054: Configurar TypeScript

```bash
# 1. Instalar dependencias (dashboard)
cd dashboard
npm install --save-dev typescript @types/node @types/express @types/cors \
  @types/compression @types/morgan @types/jsonwebtoken @types/bcryptjs tsx

# 2. Instalar dependencias (mcp-server)
cd ../mcp-server
npm install --save-dev typescript @types/node @types/express @types/cors tsx

# 3. Crear tsconfig.json en ambos directorios (ver abajo)

# 4. Actualizar scripts en package.json
# dashboard:
#   "dev": "tsx watch server.ts"
#   "build": "tsc"
#   "start": "node dist/server.js"

# 5. Verificar compilación
npx tsc --noEmit
```

**tsconfig.json (dashboard):**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "allowJs": true,
    "checkJs": false,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/types/*": ["./types/*"]
    },
    "types": ["node"]
  },
  "include": ["**/*.ts", "**/*.js"],
  "exclude": ["node_modules", "dist", "public", "tests"]
}
```

---

### DFO-055: Migrar MCP Handlers

**Patrón de migración:**

```typescript
// Antes (handlers.js)
export function createProjectHandler(params, session) {
  const { name, description } = params;
  // ...
}

// Después (handlers.ts)
import type { MCPSession, MCPToolParams, MCPToolResult } from './types.js';

interface CreateProjectParams extends MCPToolParams {
  name: string;
  description?: string;
  client?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export async function createProjectHandler(
  params: CreateProjectParams,
  session: MCPSession
): Promise<MCPToolResult> {
  const { name, description } = params;
  // ...
}
```

**Tipos base a crear (`/mcp-server/types.ts`):**
```typescript
export interface MCPSession {
  id: string;
  projectId: number | null;
  projectName: string | null;
  createdAt: Date;
  lastActivity: Date;
}

export interface MCPToolParams {
  [key: string]: unknown;
}

export interface MCPToolResult {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}
```

---

### DFO-057: Interfaces DB

**Crear `/dashboard/types/database.ts`:**

```typescript
export interface Project {
  id: number;
  name: string;
  code: string;
  client: string | null;
  description: string | null;
  status: 'planning' | 'development' | 'review' | 'completed' | 'on_hold';
  priority: 'critical' | 'high' | 'medium' | 'low';
  budget: number | null;
  actual_cost: number;
  completion_percentage: number;
  start_date: Date | null;
  deadline: Date | null;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
  office_origin: string;
  office_visible: number;
}

export interface Task {
  id: number;
  project_id: number;
  task_number: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimated_hours: number | null;
  actual_hours: number;
  progress: number;
  assigned_agent_id: number | null;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export interface TaskItem {
  id: number;
  task_id: number;
  title: string;
  is_completed: boolean;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  notes: string | null;
  completed_at: Date | null;
  created_at: Date;
}

export interface Agent {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  capabilities: string[];
  avatar: string | null;
  created_at: Date;
}

export interface Memory {
  id: number;
  project_id: number | null;
  content: string;
  summary: string | null;
  tags: string[];
  importance: number;
  access_count: number;
  last_accessed: Date | null;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'ceo' | 'cto' | 'coo' | 'cfo' | 'admin';
  avatar: string | null;
  created_at: Date;
}

export interface ActivityLog {
  id: number;
  project_id: number | null;
  agent_id: number | null;
  user_id: number | null;
  action: string;
  category: string;
  level: 'info' | 'warning' | 'error' | 'success';
  details: Record<string, unknown> | null;
  created_at: Date;
}
```

---

## Tracking en DFO Dashboard

Todas las tareas están registradas en:
- **Dashboard:** https://dfo.solaria.agency
- **Proyecto:** SOLARIA Digital Field Operations (ID: 1)
- **Códigos:** DFO-054 a DFO-083

Para filtrar por EPIC, buscar el prefijo:
- `[EPIC-1-TS]` - TypeScript Migration
- `[EPIC-2-ORM]` - Drizzle ORM
- `[EPIC-3-REACT]` - React Dashboard
- `[EPIC-4-TEST]` - Testing & QA
- `[EPIC-5-DEPLOY]` - Cleanup & Deploy

---

## Notas Importantes

1. **Migración incremental:** Usar `allowJs: true` permite migrar archivo por archivo
2. **No romper producción:** El código JS sigue funcionando mientras migramos
3. **Tests primero:** Verificar que tests existentes pasan antes de cada cambio
4. **Commits atómicos:** Un commit por archivo/feature migrado

---

## Credenciales

- **Dashboard:** https://dfo.solaria.agency
  - Usuario: `carlosjperez`
  - Password: `bypass`

- **Servidor VPS:** 148.230.118.124
  - Ver CLAUDE.md para acceso SSH

---

**Última actualización:** 2025-12-20

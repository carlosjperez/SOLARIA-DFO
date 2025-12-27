# OFFICE.SOLARIA.AGENCY - Especificación de Reimplementación

**Versión:** 1.0.0
**Fecha:** 2025-12-26
**Proyecto DFO:** #3 - OFFICE.SOLARIA.AGENCY
**Estimación:** 156 horas (~5 semanas con contingencia)

---

## 1. Resumen Ejecutivo

Migración del dashboard vanilla de Office (`/dashboard/public/office/`) a una aplicación React moderna, manteniendo la identidad visual light mode y la lógica de negocio especializada para Project Managers y Account Managers.

### Objetivos
- Modernizar stack tecnológico (React 18+, TypeScript, TailwindCSS)
- Mantener paridad funcional con dashboard vanilla
- Reusar componentes del DFO Dashboard cuando sea posible
- Despliegue independiente en office.solaria.agency

---

## 2. Análisis de Implementación Vanilla

### 2.1 Ubicación de Archivos

```
/dashboard/public/office/
├── index.html          # App monolítica (2,584 líneas)
├── office-utils.js     # Lógica de negocio (147 líneas)
└── solaria-logo.png    # Logo SOLARIA
```

### 2.2 Características Funcionales

| Página | Descripción | Prioridad |
|--------|-------------|-----------|
| Dashboard | KPIs ejecutivos, budget breakdown | Critical |
| Proyectos | Tabla completa con filtrado | Critical |
| Clientes | Agrupado por cliente | Critical |
| Agentes | Humanos + IA | High |
| Design Hub | Galería de componentes | Medium |
| Design System | Guía de estilos | Medium |
| Reportes | Placeholder | Low |

### 2.3 Paleta de Colores (Light Mode)

```css
--solaria-orange: #f6921d;        /* Color primario */
--solaria-orange-dark: #d97b0d;
--solaria-orange-light: #ffa94d;

--bg-primary: #f5f5f7;            /* Fondo principal */
--bg-secondary: #ffffff;
--bg-tertiary: #e8e8e8;
--bg-card: #ffffff;

--text-primary: #1a1a1a;          /* Texto */
--text-secondary: #666666;
--text-muted: #999999;

--border-color: #e0e0e0;          /* Bordes */
```

### 2.4 Layout

```
┌─────────────────────────────────────────────────────┐
│              SOLARIA OFFICE v3.2.0                  │
├────────────┬────────────────────────────────────────┤
│  SIDEBAR   │          MAIN CONTENT AREA             │
│  (260px)   │                                        │
│            │  ┌──────────────────────────────────┐  │
│ - Dashboard│  │         HEADER (56px)            │  │
│ - Projects │  │  [Search] [Notifications] [User] │  │
│ - Clients  │  ├──────────────────────────────────┤  │
│ - Agents   │  │                                  │  │
│ - Design   │  │    CONTENT AREA                  │  │
│ - Reports  │  │    (Rendered dynamically)        │  │
│            │  │                                  │  │
│            │  ├──────────────────────────────────┤  │
│            │  │  Footer - Status + Version       │  │
└────────────┴────────────────────────────────────────┘
```

---

## 3. Lógica de Negocio (office-utils.js)

### 3.1 statusClass(status)
Normaliza estados de proyectos a clases CSS:

```javascript
'planning', 'development', 'in_progress', 'active' → 'progress'
'blocked', 'risk', 'delayed', 'at_risk'           → 'risk'
'paused', 'on_hold'                               → 'paused'
'completed', 'done', 'closed'                     → 'completed'
```

### 3.2 calculateBudgetSegments(options)
Desglose financiero de presupuesto:

```typescript
interface Options {
  budget: number;           // Presupuesto total
  completion: number;       // % completado
  taxRate: number;          // 16% (IVA México)
  humanShare: number;       // 45% agentes humanos
  aiShare: number;          // 20% APIs/IA
  marginFloor: number;      // 15% margen mínimo
}

// Retorna array de segmentos:
[
  { key: 'total', label: 'Total aprobado', amount: 100000, percentage: 100, color: '#0ea5e9' },
  { key: 'humans', label: 'Agentes humanos', amount: 45000, percentage: 45, color: '#f59e0b' },
  { key: 'ai', label: 'Agentes IA / APIs', amount: 20000, percentage: 20, color: '#22c55e' },
  { key: 'taxes', label: 'Impuestos', amount: 16000, percentage: 16, color: '#facc15' },
  { key: 'operational', label: 'Otros gastos', amount: 4000, percentage: 4, color: '#a855f7' },
  { key: 'margin', label: 'Margen estimado', amount: 15000, percentage: 15, color: '#0ea5e9' }
]
```

### 3.3 filterOfficeProjects(projects, businessName)
Filtra proyectos visibles en Office Dashboard:

**Criterios de Inclusión:**
- `office_visible: true` - Explícitamente visible
- `share_with_office: true` - Compartido con office
- `office_origin: 'office'` - Origen marcado como office
- `code: 'OFFICE-*'` - Código con prefijo OFFICE-
- `tags: ['office', 'solaria-agency']` - Tags específicos

**Criterios de Exclusión:**
- `office_hidden: true` - Explícitamente oculto
- `hide_from_office: true` - Flag de ocultamiento

### 3.4 mergeTasksIntoProjects(projects, tasks)
Fusiona datos de tareas con proyectos:
- Agrupa tareas por `project_id`
- Calcula `total_tasks`, `completed_tasks`
- Calcula `completion_percentage` basado en tareas

### 3.5 summarizeProjectsByClient(projects)
Agrupa proyectos por cliente:

```typescript
interface ClientSummary {
  name: string;           // Nombre del cliente
  projects: Project[];    // Array de proyectos
  active: number;         // Proyectos no completados
  budget: number;         // Presupuesto total
  progress: number;       // Progreso promedio %
}
```

---

## 4. Arquitectura React Propuesta

### 4.1 Estructura de Carpetas

```
/dashboard/office-app/
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── pages/
    │   ├── LoginPage.tsx
    │   ├── OfficeDashboardPage.tsx
    │   ├── OfficeProjectsPage.tsx
    │   ├── OfficeProjectDetailPage.tsx
    │   ├── OfficeClientsPage.tsx
    │   ├── OfficeClientDetailPage.tsx
    │   ├── OfficeAgentsPage.tsx
    │   ├── OfficeAnalyticsPage.tsx
    │   ├── OfficeDesignSystemPage.tsx
    │   └── OfficeReportsPage.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── OfficeSidebar.tsx
    │   │   ├── OfficeHeader.tsx
    │   │   └── OfficeLayout.tsx
    │   ├── dashboard/
    │   │   └── BudgetBreakdown.tsx
    │   ├── clients/
    │   │   └── ClientCard.tsx
    │   ├── agents/
    │   │   └── AgentCard.tsx
    │   └── common/
    │       ├── GlobalSearch.tsx
    │       └── NotificationDropdown.tsx
    ├── lib/
    │   ├── api.ts              # Copiado de DFO
    │   ├── utils.ts            # Copiado de DFO
    │   └── office-utils.ts     # Portado de JS
    ├── types/
    │   └── index.ts            # Copiado de DFO
    ├── hooks/
    │   └── useApi.ts           # Copiado de DFO
    ├── store/
    │   ├── auth.ts             # Copiado de DFO
    │   └── ui.ts               # Adaptado
    └── styles/
        └── globals.css         # Tema light mode
```

### 4.2 Rutas

```typescript
const routes = [
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <OfficeLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" /> },
      { path: 'dashboard', element: <OfficeDashboardPage /> },
      { path: 'projects', element: <OfficeProjectsPage /> },
      { path: 'projects/:id', element: <OfficeProjectDetailPage /> },
      { path: 'clients', element: <OfficeClientsPage /> },
      { path: 'clients/:name', element: <OfficeClientDetailPage /> },
      { path: 'agents', element: <OfficeAgentsPage /> },
      { path: 'analytics', element: <OfficeAnalyticsPage /> },
      { path: 'design-system', element: <OfficeDesignSystemPage /> },
      { path: 'reports', element: <OfficeReportsPage /> },
    ],
  },
];
```

---

## 5. Componentes a Reusar vs Crear

### 5.1 Reusar de DFO (`/dashboard/app/src/`)

| Componente | Ruta | Razón |
|------------|------|-------|
| MiniTrello | `components/common/MiniTrello.tsx` | Visualización idéntica |
| API Hooks | `hooks/useApi.ts` | Mismos endpoints |
| Auth Store | `store/auth.ts` | Sistema JWT compartido |
| API Client | `lib/api.ts` | Configuración Axios |
| Types | `types/index.ts` | Project, Task, Agent |

### 5.2 Crear para Office

| Componente | Propósito | Prioridad |
|------------|-----------|-----------|
| OfficeSidebar | Sidebar light mode | Critical |
| OfficeHeader | Header con search | Critical |
| OfficeLayout | Layout wrapper | Critical |
| BudgetBreakdown | Visualización budget | Critical |
| ClientCard | Resumen cliente | High |
| AgentCard | Tarjeta agente | High |
| GlobalSearch | Modal Cmd+K | Medium |
| NotificationDropdown | Notificaciones | Medium |

---

## 6. Configuración Nginx

Actualizar `/infrastructure/nginx/nginx.prod.conf`:

```nginx
# OFFICE.SOLARIA.AGENCY - React Dashboard
server {
    listen 443 ssl;
    http2 on;
    server_name office.solaria.agency;

    ssl_certificate /etc/letsencrypt/live/office.solaria.agency/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/office.solaria.agency/privkey.pem;

    # Headers seguridad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Static React files
    root /var/www/office-v2;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://dashboard;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 7. Deploy

```bash
# Build
cd dashboard/office-app
pnpm install
pnpm build

# Deploy
rsync -avz --delete dist/ root@148.230.118.124:/var/www/office-v2/

# Nginx reload
ssh root@148.230.118.124 "docker exec solaria-dfo-nginx nginx -s reload"
```

---

## 8. Sprints y Tareas

### Sprint 1: Foundation (40h)
| Tarea | Horas |
|-------|-------|
| Crear estructura proyecto | 4 |
| Portar tipos y API | 3 |
| Portar office-utils.ts | 2 |
| Tema light mode | 4 |
| OfficeSidebar | 6 |
| OfficeHeader | 4 |
| OfficeLayout | 3 |
| Routing | 2 |
| DashboardPage básico | 6 |
| Build/deploy scripts | 2 |
| Nginx config | 2 |

### Sprint 2: Core Pages (48h)
| Tarea | Horas |
|-------|-------|
| BudgetBreakdown | 4 |
| ProjectsPage + CRUD | 8 |
| filterOfficeProjects | 2 |
| ClientsPage | 8 |
| ClientCard | 4 |
| AgentsPage | 6 |
| AgentCard | 3 |
| Modales proyectos | 6 |
| Modales clientes | 5 |

### Sprint 3: UX Enhancements (36h)
| Tarea | Horas |
|-------|-------|
| DesignSystemPage | 8 |
| GlobalSearch | 8 |
| NotificationDropdown | 8 |
| Skeleton loaders | 4 |
| Empty states | 3 |
| Breadcrumbs | 2 |
| PWA manifest | 1 |

### Sprint 4: Analytics (32h)
| Tarea | Horas |
|-------|-------|
| AnalyticsPage layout | 4 |
| Revenue chart | 4 |
| Projects by status | 3 |
| Distribution by client | 3 |
| Budget vs execution | 4 |
| Agent productivity | 3 |
| KPI cards | 3 |
| ReportsPage | 4 |
| Export CSV/PDF | 4 |

---

## 9. Dependencias

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0",
    "@tanstack/react-query": "^5.60.0",
    "axios": "^1.7.9",
    "socket.io-client": "^4.8.1",
    "zustand": "^5.0.2",
    "date-fns": "^4.1.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0",
    "lucide-react": "^0.469.0",
    "recharts": "^2.15.0",
    "zod": "^3.24.1"
  }
}
```

---

## 10. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| API field mismatches | Medium | Medium | Usar transformKeys existente |
| Theme CSS conflicts | Low | Low | globals.css aislado |
| Performance datasets | Low | Medium | Virtualización si necesario |
| PWA caching | Medium | Low | Service worker versioning |

---

## 11. Criterios de Aceptación

- [ ] Login funcional con JWT compartido
- [ ] Dashboard con KPIs y budget breakdown
- [ ] Proyectos filtrados por visibilidad Office
- [ ] Clientes agrupados con resumen
- [ ] Agentes con estado en tiempo real
- [ ] Design System documentado
- [ ] PWA instalable
- [ ] SSL activo en office.solaria.agency
- [ ] Performance: LCP < 2.5s, FID < 100ms

---

**SOLARIA AGENCY - OFFICE.SOLARIA.AGENCY**
**Especificación v1.0.0 - 2025-12-26**

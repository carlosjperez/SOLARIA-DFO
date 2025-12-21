# SOLARIA DFO Dashboard (React)

Frontend moderno del Dashboard SOLARIA DFO construido con React 19, Vite, TypeScript y TailwindCSS.

## Stack Tecnológico

- **React 19** - UI Framework
- **Vite 6** - Build tool
- **TypeScript 5.7** - Type safety
- **TailwindCSS 3.4** - Styling
- **React Query 5** - Data fetching & caching
- **Zustand 5** - State management
- **React Router 7** - Routing
- **Socket.IO Client** - Real-time updates
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Estructura del Proyecto

```
app/
├── src/
│   ├── components/
│   │   ├── common/     # Drawer, modales reutilizables
│   │   ├── layout/     # Layout, Sidebar, Header
│   │   ├── projects/   # ProjectHeader, StatsRow, TeamSection, ActivityFeed
│   │   └── tasks/      # TaskCard, GanttView, GanttRow, TaskDetailDrawer
│   ├── contexts/       # React Contexts (Socket)
│   ├── hooks/          # useApi, useSocket, useAuthVerification
│   ├── lib/            # Utilidades (api, utils)
│   ├── pages/          # Páginas principales
│   ├── store/          # Zustand stores (auth, ui)
│   ├── styles/         # CSS globales (~1100 líneas)
│   ├── test/           # Test utilities
│   └── types/          # TypeScript types
├── e2e/                # Tests E2E Playwright
├── public/             # Assets estáticos
└── package.json
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local (puerto 5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## Testing

```bash
# Tests unitarios (Vitest)
npm test           # Watch mode
npm run test:run   # Single run
npm run test:coverage

# Tests E2E (Playwright)
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
```

## Configuración

### Variables de Entorno

Crear `.env.local`:

```env
VITE_API_URL=/api
VITE_SOCKET_URL=
```

### Proxy API

El servidor de desarrollo proxea `/api` y `/socket.io` al backend (`:3030`).

## Vistas Disponibles

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/login` | LoginPage | Autenticación |
| `/dashboard` | DashboardPage | KPIs y overview |
| `/projects` | ProjectsPage | Lista de proyectos |
| `/projects/:id` | ProjectDetailPage | Detalle con Kanban/Gantt/Lista |
| `/tasks` | TasksPage | Kanban, Lista y Gantt views |
| `/agents` | AgentsPage | Grid de agentes IA |
| `/memories` | MemoriesPage | Sistema de memoria |

### Vistas de Tareas

- **Kanban**: 5 columnas (Pendiente, En Progreso, Revision, Completado, Bloqueado)
- **Lista**: Tabla con filtros y ordenamiento
- **Gantt**: Timeline horizontal con barras de progreso

### TaskDetailDrawer

Panel lateral con:
- Información completa de la tarea
- Lista de subtareas (TaskItems) con checkboxes
- Barra de progreso calculada automáticamente
- Notas editables
- Agente asignado

## Integración con Backend

- **API REST**: Axios con interceptors para JWT
- **WebSocket**: Socket.IO para actualizaciones en tiempo real
- **Auth**: JWT almacenado en localStorage con Zustand persist

### Socket.IO Events (Real-time)

| Evento | Acción |
|--------|--------|
| `task:updated` | Invalidar queries de tareas |
| `task:created` | Invalidar lista de tareas |
| `taskItem:completed` | Actualizar progreso de tarea padre |
| `taskItem:created` | Agregar subtarea a la lista |
| `project:updated` | Invalidar proyecto |
| `agent:status` | Actualizar estado de agente |
| `activity:new` | Agregar entrada al feed |

## Colores SOLARIA

```css
--primary: #f6921d (Naranja SOLARIA)
--primary-dark: #e07d0a
--primary-light: #ffab47
```

---

**SOLARIA Digital Field Operations** - v3.3.0

**Changelog v3.3.0:**
- Kanban, Lista y Gantt views para tareas
- TaskDetailDrawer con subtareas interactivas
- ProjectDetailPage con layout 2 columnas
- Real-time Socket.IO para todos los eventos
- 14 nuevos componentes React

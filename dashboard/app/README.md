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
│   ├── components/     # Componentes reutilizables
│   │   └── layout/     # Layout (Sidebar, Header)
│   ├── contexts/       # React Contexts (Socket)
│   ├── hooks/          # Custom hooks (useApi, useSocket)
│   ├── lib/            # Utilidades (api, utils)
│   ├── pages/          # Páginas principales
│   ├── store/          # Zustand stores (auth, ui)
│   ├── styles/         # CSS globales
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
| `/tasks` | TasksPage | Kanban de tareas |
| `/agents` | AgentsPage | Grid de agentes IA |
| `/memories` | MemoriesPage | Sistema de memoria |

## Integración con Backend

- **API REST**: Axios con interceptors para JWT
- **WebSocket**: Socket.IO para actualizaciones en tiempo real
- **Auth**: JWT almacenado en localStorage con Zustand persist

## Colores SOLARIA

```css
--primary: #f6921d (Naranja SOLARIA)
--primary-dark: #e07d0a
--primary-light: #ffab47
```

---

**SOLARIA Digital Field Operations** - v3.2.0

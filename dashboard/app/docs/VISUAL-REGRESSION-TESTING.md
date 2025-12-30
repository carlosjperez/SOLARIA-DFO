# Visual Regression Testing - Chromatic Setup

**Versión:** 1.0
**Fecha:** 2025-12-29
**Proyecto:** SOLARIA DFO Dashboard

---

## Propósito

Este documento describe el proceso de visual regression testing implementado para validar cambios visuales en los componentes y páginas del dashboard SOLARIA DFO.

**Objetivo:** Detectar cambios visuales no intencionados antes de merge a main.

---

## Tecnologías

- **Storybook 8.6.15** - Component development environment
- **Chromatic 13.3.4** - Visual regression testing service
- **GitHub Actions** - CI/CD automation

---

## 1. Configuración de Chromatic

### 1.1 Crear Cuenta y Proyecto

1. Ir a [chromatic.com](https://www.chromatic.com/)
2. Sign up con GitHub account
3. Click "Add project"
4. Seleccionar repositorio: `carlosjperez/SOLARIA-DFO`
5. Copiar el **Project Token** generado

### 1.2 Configurar Token Localmente

```bash
# Crear archivo .env.local (NO commitear)
echo "CHROMATIC_PROJECT_TOKEN=your-token-here" > .env.local

# Agregar a .gitignore
echo ".env.local" >> .gitignore
```

### 1.3 Configurar Token en GitHub

Para CI/CD:

1. Ir a repositorio → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CHROMATIC_PROJECT_TOKEN`
4. Value: (pegar el token de Chromatic)
5. Click "Add secret"

---

## 2. Stories Creadas

Se crearon Storybook stories para las 3 páginas migradas:

### OfficePage.stories.tsx (5 estados)
- **Default** - Vista con datos, grid view
- **Mobile** - Viewport 320px
- **Tablet** - Viewport 768px
- **Desktop** - Viewport 1280px
- **DarkMode** - Tema oscuro

### BusinessesPage.stories.tsx (5 estados)
- **Default** - Datos fallback (4 negocios)
- **Mobile** - Grid 1 columna
- **Tablet** - Grid 2 columnas
- **WideDesktop** - Viewport 1920px
- **DarkMode** - Health indicators en tema oscuro

### MemoriesPage.stories.tsx (6 estados)
- **Default** - Estado normal (puede mostrar loading/error)
- **Mobile** - Grid 1 columna
- **Tablet** - Grid 2 columnas
- **Desktop** - Grid 3 columnas
- **WideDesktop** - Grid 3 columnas con más espacio
- **DarkMode** - TAG_COLORS en tema oscuro

**Total:** 16 snapshots base

---

## 3. Ejecutar Visual Testing

### 3.1 Localmente (Manual)

```bash
# 1. Build Storybook
pnpm build-storybook

# 2. Run Chromatic
pnpm chromatic

# O en un solo comando:
pnpm chromatic --exit-zero-on-changes
```

**Flags importantes:**
- `--exit-zero-on-changes` - No fallar CI si hay cambios visuales (útil para baseline)
- `--auto-accept-changes` - Auto-aprobar cambios (solo para setup inicial)

### 3.2 Primera Ejecución (Baseline)

```bash
# Crear baseline inicial
pnpm chromatic --auto-accept-changes

# Output esperado:
# ✔ Build 1 published
# ✔ Tested 16 stories across 3 components
# → View on Chromatic: https://chromatic.com/build?...
```

### 3.3 Ejecuciones Posteriores

```bash
# Detectar cambios visuales
pnpm chromatic

# Si hay cambios:
# - Chromatic mostrará diff visual
# - Ir a la URL para revisar y aprobar/rechazar
# - Si apruebas, se convierte en nuevo baseline
```

---

## 4. CI/CD Integration (GitHub Actions)

### 4.1 Crear Workflow

Crear archivo `.github/workflows/chromatic.yml`:

```yaml
name: Chromatic Visual Regression

on:
  push:
    branches:
      - main
      - refactor/**
      - feat/**
  pull_request:
    branches:
      - main

jobs:
  chromatic:
    name: Run Chromatic
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for Chromatic

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: dashboard/app

      - name: Build Storybook and run Chromatic
        uses: chromaui/action@v11
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          workingDir: dashboard/app
          buildScriptName: build-storybook
          exitZeroOnChanges: true  # Don't fail PR on visual changes
          autoAcceptChanges: main  # Auto-accept on main branch only
```

### 4.2 Workflow Behavior

| Branch | Comportamiento |
|--------|----------------|
| `main` | Auto-acepta cambios, actualiza baseline |
| `feat/*`, `refactor/*` | Detecta cambios, requiere aprobación manual |
| Pull Requests | Compara con baseline de `main`, añade comentario con link |

---

## 5. Workflow de Desarrollo

### 5.1 Crear Feature Branch

```bash
git checkout -b feat/new-component
```

### 5.2 Desarrollar y Crear Stories

```typescript
// src/components/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
```

### 5.3 Test Local

```bash
# Ver en Storybook
pnpm storybook

# Run Chromatic
pnpm chromatic
```

### 5.4 Crear Pull Request

```bash
git add .
git commit -m "feat: add MyComponent with visual tests"
git push origin feat/new-component
```

GitHub Actions correrá automáticamente:
1. Build Storybook
2. Run Chromatic
3. Comparar con baseline
4. Añadir comentario en PR con link a Chromatic

### 5.5 Revisar Cambios Visuales

1. Click en link de Chromatic en el PR
2. Revisar cada snapshot con cambios
3. Opciones:
   - ✅ **Accept** - Cambio intencional, actualizar baseline
   - ❌ **Deny** - Cambio no deseado, fix el componente
   - 👁️ **Request changes** - Pedir ajustes al developer

### 5.6 Merge

Una vez aprobados los cambios visuales y code review:

```bash
# GitHub merge button
# O via CLI:
gh pr merge --squash
```

El merge a `main` actualizará el baseline automáticamente.

---

## 6. Estados a Capturar

Para cada componente/página, crear stories que cubran:

### Functional States
- ✅ Default (con datos)
- ✅ Loading (spinner/skeleton)
- ✅ Empty (sin datos)
- ✅ Error (mensaje de error)
- ✅ With interactions (filtros activos, búsquedas, etc.)

### Responsive States
- ✅ Mobile (320px)
- ✅ Tablet (768px)
- ✅ Desktop (1280px)
- ✅ Wide (1920px)

### Theme States
- ✅ Light mode
- ✅ Dark mode

---

## 7. Best Practices

### 7.1 Naming Conventions

```typescript
// ✅ Good
export const LoadingState: Story = {};
export const EmptyState: Story = {};
export const WithFilters: Story = {};

// ❌ Bad
export const Story1: Story = {};
export const Test: Story = {};
```

### 7.2 Isolate Components

```typescript
// ✅ Good - Mock API dependencies
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
  },
});

// ❌ Bad - Real API calls in stories
```

### 7.3 Stable Test Data

```typescript
// ✅ Good - Deterministic data
const MOCK_DATA = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
];

// ❌ Bad - Random data
const MOCK_DATA = Array.from({ length: Math.random() * 10 });
```

### 7.4 Avoid Dynamic Timestamps

```typescript
// ✅ Good - Fixed date
const fixedDate = new Date('2024-01-01');

// ❌ Bad - Current date (causes diffs)
const now = new Date();
```

---

## 8. Troubleshooting

### Build fails: "No stories found"

**Causa:** Storybook no encuentra archivos `.stories.tsx`

**Fix:**
```bash
# Verificar pattern en .storybook/main.ts
stories: ["../src/**/*.stories.tsx"]
```

### Chromatic timeout

**Causa:** Storybook build muy grande o lento

**Fix:**
```yaml
# En chromatic.yml
- name: Run Chromatic
  uses: chromaui/action@v11
  with:
    buildScriptName: build-storybook
    exitZeroOnChanges: true
    onlyChanged: true  # Solo snapshots de stories modificadas
```

### Demasiados snapshots (costo)

**Solución:** Chromatic free tier = 5,000 snapshots/mes

- 16 snapshots actuales × 30 deploys/mes = 480 snapshots
- Amplio margen disponible

Para reducir:
- Usar `onlyChanged: true` en CI
- Combinar stories similares
- Ejecutar solo en PRs, no en cada push

### Falsos positivos

**Causa:** Contenido dinámico (fechas, IDs aleatorios, animaciones)

**Fix:**
1. Usar datos fijos en stories
2. Deshabilitar animaciones:
```typescript
export const MyStory: Story = {
  parameters: {
    chromatic: {
      disableAnimations: true,
      pauseAnimationAtEnd: true,
    },
  },
};
```

---

## 9. Métricas y Reportes

### 9.1 Dashboard de Chromatic

Acceder a: `https://www.chromatic.com/builds?appId=YOUR_APP_ID`

**Métricas disponibles:**
- Build history
- Acceptance rate
- Average review time
- Snapshot count trends
- Component coverage

### 9.2 GitHub PR Integration

Chromatic añade automáticamente:
- ✅ Status check en PR
- 💬 Comentario con link a review
- 📊 Resumen de cambios detectados

---

## 10. Maintenance

### 10.1 Actualizar Baseline

Si diseño cambia intencionalmente:

```bash
# Opción 1: Via Chromatic UI
# - Ir a build
# - Click "Accept all changes"

# Opción 2: Via CLI
pnpm chromatic --auto-accept-changes
```

### 10.2 Limpiar Snapshots Antiguos

Chromatic retiene snapshots por 3 meses. Para limpiar:

1. Ir a Settings → Baselines
2. Click "Archive baseline"
3. Seleccionar baseline antiguo

### 10.3 Upgrade Chromatic

```bash
pnpm update chromatic
```

Verificar breaking changes en: https://www.chromatic.com/docs/changelog

---

## 11. Costs & Limits

**Free Tier (actual):**
- 5,000 snapshots/mes
- Unlimited team members
- Unlimited projects
- 3 months snapshot retention

**Uso estimado:**
- 16 snapshots × 30 builds/mes = 480 snapshots/mes
- **Uso: 9.6%** del free tier

**Upgrade necesario si:**
- Más de 300 builds/mes
- Más de 3 componentes nuevos/semana
- Necesitas retención >3 meses

---

## 12. Referencias

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Visual Testing](https://storybook.js.org/docs/writing-tests/visual-testing)
- [Chromatic GitHub Action](https://github.com/chromaui/action)
- [Best Practices Guide](https://www.chromatic.com/docs/best-practices)

---

**Documentación creada por:** SOLARIA DFO Team
**Última actualización:** 2025-12-29
**Mantenedor:** Claude Code Agent #11

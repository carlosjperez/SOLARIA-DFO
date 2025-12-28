# PLAN COMPLETO: Dashboard Layout Standardization

**Sprint:** SPRINT008 - Dashboard Layout Standardization
**Fecha inicio:** 2025-12-28
**Fecha fin:** 2026-01-24
**Duración:** 4 semanas (20 días hábiles)
**Proyecto:** SOLARIA Digital Field Operations
**Estado:** ✅ SPRINT CREADO EN DFO

---

## 📊 RESUMEN EJECUTIVO

### ✅ Sprint Creado en DFO
- **Sprint ID:** 31 (SPRINT008)
- **Epics creados:** 4 (EPIC015 - EPIC018)
- **Tasks creadas:** 29 (DFO-150 a DFO-178)
- **Subtareas creadas:** ~250 items granulares
- **URL Dashboard:** https://dfo.solaria.agency/projects/1/roadmap

### Problema Identificado
El dashboard SOLARIA DFO presenta **6 inconsistencias visuales críticas**:

1. ❌ Grid/Lista selector falta en algunas páginas
2. ❌ Botones de ordenamiento solo en Projects
3. ❌ Tamaños y spacing no verificados/consistentes
4. ❌ Placeholder de búsqueda diferente en cada página
5. ❌ Contador de items inconsistente
6. ❌ Filtros con estructuras diferentes

### Solución
Crear **sistema de diseño con 15 componentes reutilizables** y migrar 7 páginas.

### Métricas de Éxito
- ✅ **100% consistencia visual** en spacing, sizing, typography
- ✅ **15 componentes** documentados en Storybook
- ✅ **7 páginas** migradas: Office, Businesses, Memories, Projects, Infrastructure, Archived, Dashboard
- ✅ **WCAG 2.1 AA** compliance
- ✅ **Score >90** Lighthouse performance
- ✅ **>80% code coverage** en tests

---

## 🏗️ ESTRUCTURA CREADA EN DFO

### Epic 1: EPIC015 - Componentes Base (14 tasks, 68h)

**DFO-150:** Crear Design Tokens SCSS (4h)
- 8 subtareas: analizar tokens actuales → definir variables → documentar → integrar

**DFO-151:** StatCard component (6h)
- 8 subtareas: interface → layout → estilos → variants → interactividad → tests → stories

**DFO-152:** StatsGrid component (4h)
**DFO-153:** PageHeader component (6h)
**DFO-154:** ViewSelector component (3h)
**DFO-155:** SearchInput component (4h)
**DFO-156:** ItemCounter component (2h)
**DFO-157:** SortBar component (5h)
**DFO-158:** FilterBar + FilterGroup + FilterTag (8h)
**DFO-159:** SearchAndFilterBar composition (6h)
**DFO-160:** ContentGrid + ContentGroup (5h)
**DFO-161:** StandardPageLayout (5h)
**DFO-162:** BackButton (2h)
**DFO-163:** Storybook setup y documentación (8h)

### Epic 2: EPIC016 - Páginas Simples (4 tasks, 20h)

**DFO-164:** Refactorizar Office page (6h) - Página de referencia
**DFO-165:** Refactorizar Businesses page (5h)
**DFO-166:** Refactorizar Memories page (5h)
**DFO-167:** Visual regression tests (4h) - Percy.io/Chromatic

### Epic 3: EPIC017 - Páginas Complejas (5 tasks, 33h)

**DFO-168:** Refactorizar Projects page (8h) - Filtros múltiples, modales
**DFO-169:** Refactorizar Infrastructure page (6h) - Health checks, WebSocket
**DFO-170:** Refactorizar Archived Projects (5h) - Restore functionality
**DFO-171:** Auditoría de accesibilidad (6h) - WCAG 2.1 AA
**DFO-172:** Integration tests (8h) - React Testing Library

### Epic 4: EPIC018 - Dashboard y Final (6 tasks, 38h)

**DFO-173:** Refactorizar Dashboard page (10h) - La más compleja
**DFO-174:** Auditoría de consistencia visual (4h)
**DFO-175:** Suite E2E Playwright (8h)
**DFO-176:** Documentar PATTERNS.md (6h)
**DFO-177:** Guía CONTRIBUTING.md (4h)
**DFO-178:** Performance audit y optimización (6h)

**Total:** 159 horas estimadas (~20 días hábiles)

---

## 🧩 COMPONENTES A IMPLEMENTAR

### Jerarquía de Composición

```
StandardPageLayout
├── PageHeader
│   ├── BackButton (opcional)
│   ├── Breadcrumbs (opcional)
│   └── Actions
├── StatsGrid
│   └── StatCard (×N)
├── SearchAndFilterBar
│   ├── SearchInput
│   ├── ItemCounter
│   ├── ViewSelector
│   ├── SortBar
│   └── FilterBar
│       ├── FilterGroup
│       └── FilterTag
└── ContentGrid
    └── ContentGroup (opcional)
```

### Design Tokens (_design-tokens.scss)

```scss
// SPACING
$spacing-xs: 0.5rem;   // 8px
$spacing-sm: 0.75rem;  // 12px
$spacing-md: 1rem;     // 16px
$spacing-lg: 1.5rem;   // 24px
$spacing-xl: 2rem;     // 32px

// TYPOGRAPHY
$text-xs: 0.75rem;     // 12px
$text-sm: 0.875rem;    // 14px
$text-base: 1rem;      // 16px
$text-lg: 1.125rem;    // 18px
$text-xl: 1.25rem;     // 20px
$text-2xl: 1.5rem;     // 24px

// COLORS
$color-brand: #f6921d;        // SOLARIA
$color-success: #10b981;
$color-warning: #f59e0b;
$color-error: #ef4444;
```

---

## 📝 ESPECIFICACIÓN DE COMPONENTES

### 1. StatCard

```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: number; trend: 'up' | 'down' };
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}
```

**Uso:**
```tsx
<StatCard
  title="Proyectos Activos"
  value={24}
  change={{ value: 12, trend: 'up' }}
  icon={FolderOpen}
  variant="primary"
/>
```

### 2. PageHeader

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: { to: string; label?: string };
  breadcrumbs?: Array<{ label: string; to?: string }>;
  actions?: React.ReactNode;
}
```

**Uso:**
```tsx
<PageHeader
  title="Proyectos"
  subtitle="24 activos"
  breadcrumbs={[
    { label: 'Dashboard', to: '/' },
    { label: 'Proyectos' }
  ]}
  actions={<button className="btn-primary">Nuevo</button>}
/>
```

### 3. SearchAndFilterBar (Composition)

Combina SearchInput, ItemCounter, ViewSelector, SortBar, FilterBar.

**Uso:**
```tsx
<SearchAndFilterBar
  searchValue={query}
  onSearchChange={setQuery}
  itemCount={24}
  itemLabel="proyecto"
  viewValue={view}
  onViewChange={setView}
  sortOptions={[
    { value: 'name', label: 'Nombre' },
    { value: 'date', label: 'Fecha' }
  ]}
  sortValue={sortBy}
  sortDirection={sortDir}
  filters={activeFilters}
  onFilterRemove={removeFilter}
/>
```

### 4. ContentGrid

```typescript
interface ContentGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  gap?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  emptyState?: React.ReactNode;
}
```

**Uso:**
```tsx
<ContentGrid columns={3} loading={isLoading}>
  {projects.map(p => <ProjectCard key={p.id} project={p} />)}
</ContentGrid>
```

### 5. StandardPageLayout

```typescript
interface StandardPageLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'container' | 'lg' | 'xl' | 'full';
}
```

**Uso:**
```tsx
<StandardPageLayout maxWidth="xl">
  <PageHeader {...headerProps} />
  <StatsGrid>{/* stats */}</StatsGrid>
  <SearchAndFilterBar {...filterProps} />
  <ContentGrid>{/* content */}</ContentGrid>
</StandardPageLayout>
```

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### Consistencia Visual ✅
- [ ] Spacing: todas las páginas usan `$spacing-*` variables
- [ ] Typography: todas usan `$text-*` variables
- [ ] Colors: todas usan `$color-*` variables
- [ ] PageHeader: altura y spacing idénticos
- [ ] StatsGrid: gap y columns idénticos
- [ ] SearchAndFilterBar: posición y layout idénticos

### Componentes ✅
- [ ] 15 componentes TypeScript con props typesafe
- [ ] Cada componente: ≥5 tests unitarios
- [ ] Cada componente: ≥3 Storybook stories
- [ ] Code coverage: >80% en `/components/common/`

### Páginas Migradas ✅
- [ ] 7 páginas usando StandardPageLayout
- [ ] 0 código duplicado para headers/stats/filters
- [ ] 100% funcionalidad preservada
- [ ] Visual regression tests pasando

### Accesibilidad ✅
- [ ] Lighthouse a11y score >95
- [ ] axe DevTools: 0 violations
- [ ] Keyboard navigation: Tab, Enter, Escape
- [ ] Screen reader compatible (NVDA/JAWS)

### Performance ✅
- [ ] Lighthouse performance >90
- [ ] Code splitting: React.lazy
- [ ] Bundle size: <500KB gzipped

### Documentación ✅
- [ ] PATTERNS.md con ejemplos
- [ ] CONTRIBUTING.md con guía paso a paso
- [ ] Storybook deployed
- [ ] README actualizado

---

## 📅 TIMELINE

### Semana 1 (28 Dic - 2 Ene)
- **Días 1-2:** Epic 1 - Design tokens + primeros componentes
- **Días 3-4:** Epic 1 - Componentes restantes + Storybook
- **Día 5:** Epic 2 - Office page (referencia)

### Semana 2 (3 Ene - 7 Ene)
- **Días 1-2:** Epic 2 - Businesses + Memories + visual tests
- **Días 3-5:** Epic 3 - Projects + Infrastructure pages

### Semana 3 (8 Ene - 14 Ene)
- **Días 1-2:** Epic 3 - Archived + a11y audit + integration tests
- **Días 3-5:** Epic 4 - Dashboard page (la más compleja)

### Semana 4 (15 Ene - 24 Ene)
- **Días 1-2:** Epic 4 - Consistencia + E2E tests
- **Días 3-4:** Epic 4 - Documentación (PATTERNS, CONTRIBUTING)
- **Día 5:** Epic 4 - Performance audit + optimización

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Regresiones visuales | Media | Alto | Percy/Chromatic en CI/CD |
| Performance degradation | Baja | Alto | Lighthouse antes/después |
| Funcionalidad rota | Media | Crítico | Integration tests exhaustivos |
| Scope creep | Media | Medio | Solo refactor, no features |

---

## 📊 PROGRESO TRACKING

### Dashboard DFO
**URL:** https://dfo.solaria.agency/projects/1/roadmap

**Vista Timeline:**
- Visualizar Sprint SPRINT008 con las 4 fases
- Progress auto-calculado por subtareas completadas

**Vista Jerarquía:**
- Sprint → Epics → Tasks → Subtareas
- Expandir/colapsar para ver detalle

### Métricas Clave
- **Tasks completadas / Total:** 0 / 29
- **Horas consumidas / Estimadas:** 0 / 159
- **Progress general:** 0%

---

## 🔗 RECURSOS

| Recurso | URL |
|---------|-----|
| DFO Dashboard | https://dfo.solaria.agency |
| Sprint Roadmap | https://dfo.solaria.agency/projects/1/roadmap |
| Código fuente | `/dashboard/app/src/` |
| Tests | `/dashboard/app/tests/` |
| Storybook (futuro) | TBD |

---

## 👨‍💻 ROLES

| Rol | Responsable | Fases |
|-----|-------------|-------|
| Arquitecto | ECO-Lambda | Diseño componentes |
| Developer | ECO-Omega | Implementación 1-4 |
| QA | ECO-Omega | Tests y auditorías |
| DevOps | ECO-Sigma | CI/CD, Storybook |
| Tech Writer | ECO-Sigma | Docs |

---

## ⚠️ ANTI-PATTERNS A EVITAR

- ❌ **Hardcoded spacing:** Usar `$spacing-*`
- ❌ **Componentes inline:** Crear reutilizables
- ❌ **Skip tests:** Tests obligatorios
- ❌ **Ignorar a11y:** No opcional
- ❌ **Premature optimization:** Solo con métricas

---

## ✅ BEST PRACTICES

- ✅ **Composition over configuration**
- ✅ **Mobile-first design**
- ✅ **Test-driven cuando posible**
- ✅ **Incremental migration**
- ✅ **Document as you go**

---

## 🎬 PRÓXIMOS PASOS

### Para iniciar Epic 1:

1. **Crear branch:**
```bash
cd /Users/carlosjperez/Documents/GitHub/SOLARIA-DFO/dashboard
git checkout -b refactor/design-system-phase-1
```

2. **Marcar primera tarea como in_progress:**
```bash
# En DFO Dashboard o via MCP
update_task({ task_id: 483, status: "in_progress" })
```

3. **Crear archivo de design tokens:**
```bash
touch app/src/styles/_design-tokens.scss
```

4. **Seguir subtareas granulares:**
- Cada subtarea tiene 5-60 minutos de trabajo
- Completar en orden secuencial
- Marcar completada cuando termine

---

**Plan creado:** 2025-12-28
**Sprint ID:** 31 (SPRINT008)
**Epics:** EPIC015, EPIC016, EPIC017, EPIC018
**Tasks:** DFO-150 a DFO-178
**Estado:** ✅ LISTO PARA COMENZAR

---

*Documento visible en DFO Dashboard → Proyectos → SOLARIA DFO → Documentos*

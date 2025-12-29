# BusinessesPage Migration Analysis

**Tarea:** DFO-165 - Refactorizar Businesses page
**Fecha:** 2025-12-29
**Analista:** ECO-Lambda
**Patrón de referencia:** OfficePage (DFO-164 completado)

---

## 1. Comparación Estructural

### OfficePage (Refactorizado) - Patrón a Seguir

```tsx
StandardPageLayout
├── PageHeader (título, subtítulo)
├── StatsGrid
│   └── StatCard × 4 (valores estáticos)
├── SearchAndFilterBar
│   ├── search input
│   ├── item counter
│   ├── view toggle (grid/list)
│   └── filterChildren (custom tags)
└── ContentGrid | List Table
    └── ExampleCard | ExampleRow × N
```

**Características:**
- Sin API fetch (datos estáticos EXAMPLE_ITEMS)
- Sin loading state
- Filtros simples (tag selection)
- Sin navegación onClick

### BusinessesPage (Actual) - A Migrar

```tsx
<div className="page-container">
├── <div className="section-header"> (custom)
│   ├── title + subtitle + business count
│   └── view toggle buttons (grid/list)
├── <div className="grid grid-cols-4 gap-4"> (custom stats)
│   └── stat-card × 4 (valores calculados dinámicamente)
├── <div className="bg-card..."> (custom search/filter)
│   ├── search input con icon
│   ├── business counter (filtrados)
│   ├── Status filters (tag-style buttons)
│   └── Health filters (tag-style buttons)
└── {viewMode === 'grid' ? ... : ...}
    └── BusinessCard | BusinessRow × N (con navigate)
```

**Características ÚNICAS:**
- ✅ API fetch con useEffect + loading state
- ✅ Auth token (useAuthStore)
- ✅ Fallback data (BUSINESSES_FALLBACK)
- ✅ Valores calculados (totalMRR, avgGrowth, activeCount)
- ✅ Currency formatting (formatCurrency)
- ✅ Health calculation (getHealth)
- ✅ Dos tipos de filtros (Status AND Health)
- ✅ Navigation onClick (navigate to detail)

---

## 2. Component Mapping (Old → New)

| Actual (Custom) | Design System | Notas |
|-----------------|---------------|-------|
| `<div className="section-header">` | `<PageHeader>` | title, subtitle, actions |
| Custom view toggle buttons | PageHeader actions slot | Mismo patrón que Office |
| `<div className="grid grid-cols-4">` | `<StatsGrid>` | Wrapper |
| `<div className="stat-card">` | `<StatCard>` | Children con props individuales |
| Custom search/filter container | `<SearchAndFilterBar>` | search, itemCount, filterChildren |
| Status + Health filter buttons | filterChildren prop | Custom render dentro de SearchAndFilterBar |
| `<div className="grid grid-cols-2">` | `<ContentGrid columns={2}>` | Grid view wrapper |
| Custom list table wrapper | Mantener custom | Same as Office (table manual) |
| `<BusinessCard>` | Preservar | Adaptar estilos memory-card |
| `<BusinessRow>` | Preservar | Adaptar estilos memory-row |

---

## 3. Business Logic a Preservar (CRÍTICO)

### 3.1 API Integration & Loading

```tsx
// MANTENER EXACTO
const [businesses, setBusinesses] = useState<Business[]>([]);
const [loading, setLoading] = useState(true);
const { token } = useAuthStore();

useEffect(() => {
    async function fetchBusinesses() {
        try {
            const res = await fetch('/api/businesses', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setBusinesses(data.businesses || BUSINESSES_FALLBACK);
            } else {
                setBusinesses(BUSINESSES_FALLBACK);
            }
        } catch {
            setBusinesses(BUSINESSES_FALLBACK);
        } finally {
            setLoading(false);
        }
    }
    fetchBusinesses();
}, [token]);
```

**Renderizado condicional:**
```tsx
if (loading) {
    return <LoadingSpinner />; // Mostrar antes de design system components
}
```

### 3.2 Currency Formatting Function

```tsx
// MANTENER EXACTO
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
    }).format(value);
}
```

**Uso:** Para mostrar valores en StatCard (MRR, ARR, ticket promedio)

### 3.3 Health Calculation Function

```tsx
// MANTENER EXACTO
const getHealth = (business: Business): 'healthy' | 'warning' | 'critical' => {
    const { churn, growth } = business.metrics || { churn: 0, growth: 0 };
    if (churn <= 2 && growth > 10) return 'healthy';
    if (churn > 5 || growth < 5) return 'critical';
    return 'warning';
};
```

**Uso:** Para filtros de salud y visual indicators

### 3.4 Calculated Stats (Dynamic)

**DIFERENCIA CLAVE vs Office:** Stats no son estáticos, se calculan de filteredBusinesses

```tsx
// CALCULAR DESPUÉS de filtrar
const totalMRR = filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.mrr || 0), 0);
const totalClients = filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.clients || 0), 0);
const avgGrowth = filteredBusinesses.length > 0
    ? filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.growth || 0), 0) / filteredBusinesses.length
    : 0;
const activeCount = filteredBusinesses.filter(b => b.status === 'active').length;
```

**Stats array dinámico:**
```tsx
const BUSINESS_STATS = [
    { icon: DollarSign, label: 'MRR Total', value: formatCurrency(totalMRR), variant: 'primary' },
    { icon: Users, label: 'Clientes Activos', value: totalClients.toString(), variant: 'success' },
    { icon: TrendingUp, label: 'Crecimiento Promedio', value: `${avgGrowth.toFixed(1)}%`, variant: 'default' },
    { icon: Briefcase, label: 'Negocios Activos', value: activeCount.toString(), variant: 'warning' },
];
```

### 3.5 Complex Filtering Logic

**Tres dimensiones de filtrado:**

```tsx
const filteredBusinesses = businesses.filter((business) => {
    // 1. Search filter (text matching)
    if (search && search.length >= 3) {
        const searchLower = search.toLowerCase();
        const matchesSearch = (
            business.name.toLowerCase().includes(searchLower) ||
            business.description.toLowerCase().includes(searchLower)
        );
        if (!matchesSearch) return false;
    }

    // 2. Status filter (active/growing/paused)
    if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(business.status)) return false;
    }

    // 3. Health filter (healthy/warning/critical)
    if (selectedHealth.length > 0) {
        const health = getHealth(business);
        if (!selectedHealth.includes(health)) return false;
    }

    return true;
});
```

**State necesario:**
```tsx
const [selectedStatuses, setSelectedStatuses] = useState<Business['status'][]>([]);
const [selectedHealth, setSelectedHealth] = useState<('healthy' | 'warning' | 'critical')[]>([]);
```

### 3.6 Navigation Handlers

```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// En BusinessCard/BusinessRow
<BusinessCard
    business={business}
    onClick={() => navigate(`/businesses/${business.id}`)}
/>
```

---

## 4. Design System Components - API Correcta

### 4.1 PageHeader

```tsx
<PageHeader
    title="Negocios"
    subtitle={`${businesses.length} negocios operativos`} // Dinámico!
    actions={
        <div className="flex gap-2">
            <button
                onClick={() => setViewMode('grid')}
                title="Vista Grid"
                className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'grid'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                )}
            >
                <LayoutGrid className="h-5 w-5" />
            </button>
            <button
                onClick={() => setViewMode('list')}
                title="Vista Lista"
                className={cn(
                    'p-2 rounded-lg transition-colors',
                    viewMode === 'list'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                )}
            >
                <List className="h-5 w-5" />
            </button>
        </div>
    }
/>
```

### 4.2 StatsGrid + StatCard

```tsx
<StatsGrid>
    {BUSINESS_STATS.map((stat) => (
        <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value} // Ya formateado con formatCurrency
            icon={stat.icon}
            variant={stat.variant}
        />
    ))}
</StatsGrid>
```

**⚠️ CRÍTICO:** StatCard recibe `value` como string, NO número. Por eso usamos formatCurrency() ANTES de pasar a StatCard.

### 4.3 SearchAndFilterBar

```tsx
<SearchAndFilterBar
    searchValue={search}
    onSearchChange={setSearch}
    searchPlaceholder="Buscar negocios (mínimo 3 caracteres)..."
    itemCount={filteredBusinesses.length} // Cuenta FILTRADOS
    itemSingularLabel="negocio"
    itemPluralLabel="negocios"
    viewValue={viewMode}
    onViewChange={setViewMode}
    showViewSelector={false} // NO mostrar view toggle aquí (está en PageHeader)
    filterChildren={
        <div className="flex flex-col gap-3 w-full">
            {/* Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground mr-2">Estado:</span>
                {STATUS_CONFIG.map((status) => {
                    const isSelected = selectedStatuses.includes(status.value);
                    return (
                        <button
                            key={status.value}
                            onClick={() => toggleStatus(status.value)}
                            className={cn('memory-tag-filter', isSelected && 'selected')}
                            style={
                                isSelected
                                    ? { backgroundColor: status.color, color: '#fff' }
                                    : { backgroundColor: status.bg, color: status.color }
                            }
                        >
                            {status.label} ({countByStatus[status.value] || 0})
                        </button>
                    );
                })}
            </div>

            {/* Health Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground mr-2">Salud:</span>
                {HEALTH_CONFIG.map((health) => {
                    const isSelected = selectedHealth.includes(health.value);
                    return (
                        <button
                            key={health.value}
                            onClick={() => toggleHealth(health.value)}
                            className={cn('memory-tag-filter', isSelected && 'selected')}
                            style={
                                isSelected
                                    ? { backgroundColor: health.color, color: '#fff' }
                                    : { backgroundColor: health.bg, color: health.color }
                            }
                        >
                            {health.label} ({countByHealth[health.value] || 0})
                        </button>
                    );
                })}
            </div>
        </div>
    }
/>
```

**⚠️ IMPORTANTE:** showViewSelector={false} porque el view toggle está en PageHeader.actions

### 4.4 ContentGrid

```tsx
<ContentGrid columns={2} gap="md">
    {filteredBusinesses.map((business) => (
        <BusinessCard
            key={business.id}
            business={business}
            onClick={() => navigate(`/businesses/${business.id}`)}
        />
    ))}
</ContentGrid>
```

**Nota:** ContentGrid con 2 columnas (no 3 como Office) porque BusinessCard es más ancho.

---

## 5. Migration Challenges & Solutions

### Challenge 1: Stats Dinámicos vs Estáticos

**Problema:** Office usa array estático, Businesses calcula stats de filteredBusinesses.

**Solución:**
1. Calcular filteredBusinesses PRIMERO
2. Derivar totalMRR, totalClients, avgGrowth, activeCount
3. Construir BUSINESS_STATS array dinámico
4. Pasar a StatsGrid

```tsx
// Order matters!
const filteredBusinesses = businesses.filter(...);
const totalMRR = filteredBusinesses.reduce(...);
const BUSINESS_STATS = [{ value: formatCurrency(totalMRR), ... }];

return (
    <StatsGrid>
        {BUSINESS_STATS.map(...)}
    </StatsGrid>
);
```

### Challenge 2: Dos Tipos de Filtros (Status + Health)

**Problema:** SearchAndFilterBar solo tiene un filterChildren, necesitamos renderizar DOS grupos.

**Solución:** Wrapper div con flex flex-col gap-3

```tsx
filterChildren={
    <div className="flex flex-col gap-3 w-full">
        {/* Status filters */}
        <div className="flex items-center gap-2 flex-wrap">...</div>
        {/* Health filters */}
        <div className="flex items-center gap-2 flex-wrap">...</div>
    </div>
}
```

### Challenge 3: Loading State

**Problema:** Design system components esperan datos, pero API puede tardar.

**Solución:** Renderizado condicional ANTES de StandardPageLayout

```tsx
if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="text-sm text-muted-foreground">Cargando negocios...</span>
            </div>
        </div>
    );
}

return <StandardPageLayout>...</StandardPageLayout>;
```

### Challenge 4: Currency en StatCard

**Problema:** StatCard.value es string, pero tenemos number.

**Solución:** Formatear ANTES de crear BUSINESS_STATS

```tsx
// ✅ CORRECTO
value: formatCurrency(totalMRR) // "$48,000"

// ❌ INCORRECTO
value: totalMRR.toString() // "48000"
```

### Challenge 5: View Toggle Position

**Problema:** Office tiene view toggle en SearchAndFilterBar, pero Businesses lo tiene en header.

**Solución:**
- PageHeader.actions → view toggle buttons
- SearchAndFilterBar.showViewSelector={false}

### Challenge 6: Filter Count Badges

**Problema:** Necesitamos mostrar (N) en cada filtro con el count actualizado.

**Solución:** Calcular counts dinámicos desde businesses (no filtrados)

```tsx
const countByStatus = {
    active: businesses.filter(b => b.status === 'active').length,
    growing: businesses.filter(b => b.status === 'growing').length,
    paused: businesses.filter(b => b.status === 'paused').length,
};

const countByHealth = {
    healthy: businesses.filter(b => getHealth(b) === 'healthy').length,
    warning: businesses.filter(b => getHealth(b) === 'warning').length,
    critical: businesses.filter(b => getHealth(b) === 'critical').length,
};
```

---

## 6. Step-by-Step Migration Plan

### Phase 1: Preparación (Subtask 620-621)

1. ✅ Crear branch `refactor/businesses-page`
2. ✅ Backup BusinessesPage.tsx actual
3. ✅ Importar design system components

```tsx
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsGrid } from '@/components/common/StatsGrid';
import { StatCard } from '@/components/common/StatCard';
import { SearchAndFilterBar } from '@/components/common/SearchAndFilterBar';
import { ContentGrid } from '@/components/common/ContentGrid';
```

### Phase 2: PageHeader Migration (Subtask 621)

**ANTES:**
```tsx
<div className="section-header">
    <div>
        <h1 className="section-title">Negocios</h1>
        <p className="section-subtitle">{businesses.length} negocios operativos</p>
    </div>
    <div className="section-actions">
        {/* view toggle buttons */}
    </div>
</div>
```

**DESPUÉS:**
```tsx
<PageHeader
    title="Negocios"
    subtitle={`${businesses.length} negocios operativos`}
    actions={
        <div className="flex gap-2">
            <button onClick={() => setViewMode('grid')} title="Vista Grid" className={...}>
                <LayoutGrid className="h-5 w-5" />
            </button>
            <button onClick={() => setViewMode('list')} title="Vista Lista" className={...}>
                <List className="h-5 w-5" />
            </button>
        </div>
    }
/>
```

**Validación:**
- Title muestra "Negocios"
- Subtitle actualiza dinámicamente con total businesses
- View toggle funciona (grid ↔ list)

### Phase 3: StatsGrid Migration (Subtask 622)

**ANTES:**
```tsx
<div className="grid grid-cols-4 gap-4">
    <div className="stat-card">
        <div className="stat-icon orange">
            <DollarSign className="h-5 w-5" />
        </div>
        <div className="stat-content">
            <div className="stat-label">MRR Total</div>
            <div className="stat-value">{formatCurrency(totalMRR)}</div>
        </div>
    </div>
    {/* 3 more stat cards */}
</div>
```

**DESPUÉS:**
```tsx
// 1. Calculate filtered businesses
const filteredBusinesses = businesses.filter(...);

// 2. Calculate dynamic stats
const totalMRR = filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.mrr || 0), 0);
const totalClients = filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.clients || 0), 0);
const avgGrowth = filteredBusinesses.length > 0
    ? filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.growth || 0), 0) / filteredBusinesses.length
    : 0;
const activeCount = filteredBusinesses.filter(b => b.status === 'active').length;

// 3. Build stats array
const BUSINESS_STATS = [
    {
        icon: DollarSign,
        label: 'MRR Total',
        value: formatCurrency(totalMRR),
        variant: 'primary' as const
    },
    {
        icon: Users,
        label: 'Clientes Activos',
        value: totalClients.toString(),
        variant: 'success' as const
    },
    {
        icon: TrendingUp,
        label: 'Crecimiento Promedio',
        value: `${avgGrowth.toFixed(1)}%`,
        variant: 'default' as const
    },
    {
        icon: Briefcase,
        label: 'Negocios Activos',
        value: activeCount.toString(),
        variant: 'warning' as const
    },
];

// 4. Render with design system
<StatsGrid>
    {BUSINESS_STATS.map((stat) => (
        <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
        />
    ))}
</StatsGrid>
```

**Validación:**
- MRR muestra formato moneda ($48,000)
- Stats actualizan cuando filters cambian
- Variantes correctas (primary, success, default, warning)

### Phase 4: SearchAndFilterBar Migration (Subtask 623)

**ANTES:**
```tsx
<div className="bg-card border border-border rounded-xl p-5">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
            <input type="text" placeholder="..." value={search} onChange={...} />
        </div>
        <span className="text-sm">{filteredBusinesses.length} negocios</span>
    </div>
    {/* Status filters */}
    {/* Health filters */}
</div>
```

**DESPUÉS:**
```tsx
// 1. Calculate filter counts
const countByStatus = {
    active: businesses.filter(b => b.status === 'active').length,
    growing: businesses.filter(b => b.status === 'growing').length,
    paused: businesses.filter(b => b.status === 'paused').length,
};

const countByHealth = {
    healthy: businesses.filter(b => getHealth(b) === 'healthy').length,
    warning: businesses.filter(b => getHealth(b) === 'warning').length,
    critical: businesses.filter(b => getHealth(b) === 'critical').length,
};

// 2. Define filter configs
const STATUS_CONFIG = [
    { value: 'active', label: 'Activo', bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    { value: 'growing', label: 'Creciendo', bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    { value: 'paused', label: 'Pausado', bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' },
];

const HEALTH_CONFIG = [
    { value: 'healthy', label: 'Saludable', bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    { value: 'warning', label: 'Atención', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    { value: 'critical', label: 'Crítico', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
];

// 3. Render with design system
<SearchAndFilterBar
    searchValue={search}
    onSearchChange={setSearch}
    searchPlaceholder="Buscar negocios (mínimo 3 caracteres)..."
    itemCount={filteredBusinesses.length}
    itemSingularLabel="negocio"
    itemPluralLabel="negocios"
    viewValue={viewMode}
    onViewChange={setViewMode}
    showViewSelector={false} // View toggle is in PageHeader
    filterChildren={
        <div className="flex flex-col gap-3 w-full">
            {/* Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground mr-2">Estado:</span>
                {STATUS_CONFIG.map((status) => {
                    const isSelected = selectedStatuses.includes(status.value);
                    return (
                        <button
                            key={status.value}
                            onClick={() => toggleStatus(status.value)}
                            className={cn('memory-tag-filter', isSelected && 'selected')}
                            style={
                                isSelected
                                    ? { backgroundColor: status.color, color: '#fff' }
                                    : { backgroundColor: status.bg, color: status.color }
                            }
                        >
                            {status.label} ({countByStatus[status.value] || 0})
                        </button>
                    );
                })}
            </div>

            {/* Health Filters */}
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground mr-2">Salud:</span>
                {HEALTH_CONFIG.map((health) => {
                    const isSelected = selectedHealth.includes(health.value);
                    return (
                        <button
                            key={health.value}
                            onClick={() => toggleHealth(health.value)}
                            className={cn('memory-tag-filter', isSelected && 'selected')}
                            style={
                                isSelected
                                    ? { backgroundColor: health.color, color: '#fff' }
                                    : { backgroundColor: health.bg, color: health.color }
                            }
                        >
                            {health.label} ({countByHealth[health.value] || 0})
                        </button>
                    );
                })}
            </div>
        </div>
    }
/>
```

**Validación:**
- Search input funciona
- Item counter muestra filteredBusinesses.length
- Status filters toggle correctamente
- Health filters toggle correctamente
- Counts actualizan dinámicamente

### Phase 5: ContentGrid Migration (Subtask 624)

**ANTES:**
```tsx
{viewMode === 'grid' ? (
    <div className="grid grid-cols-2 gap-4">
        {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} onClick={...} />
        ))}
    </div>
) : (
    {/* Custom table */}
)}
```

**DESPUÉS:**
```tsx
{viewMode === 'grid' ? (
    <ContentGrid columns={2} gap="md">
        {filteredBusinesses.map((business) => (
            <BusinessCard
                key={business.id}
                business={business}
                onClick={() => navigate(`/businesses/${business.id}`)}
            />
        ))}
    </ContentGrid>
) : (
    <div className="bg-card border border-border rounded-xl" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="list-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
                <tr>
                    <th style={{ width: '30%' }}>Negocio</th>
                    <th style={{ width: '15%', textAlign: 'center' }}>MRR</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Clientes</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Churn</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Growth</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Estado</th>
                    <th style={{ width: '7%', textAlign: 'center' }}>Salud</th>
                </tr>
            </thead>
            <tbody>
                {filteredBusinesses.map((business) => (
                    <BusinessRow
                        key={business.id}
                        business={business}
                        onClick={() => navigate(`/businesses/${business.id}`)}
                    />
                ))}
            </tbody>
        </table>
    </div>
)}
```

**Validación:**
- ContentGrid usa 2 columnas
- Cards responsive
- List view mantiene table structure
- onClick navega a /businesses/:id

### Phase 6: BusinessCard Styling Update

**Actualizar BusinessCard para usar memory-card classes:**

```tsx
function BusinessCard({ business, onClick }: { business: Business; onClick?: () => void }) {
    const health = getHealth(business);
    const healthConfig = HEALTH_CONFIG.find(h => h.value === health);

    return (
        <div onClick={onClick} className="memory-card cursor-pointer">
            <div className="memory-header">
                <div className="memory-icon">
                    <Building2 className="h-4 w-4" />
                </div>
                <div className="memory-title-group">
                    <h3 className="memory-title">{business.name}</h3>
                    <span className="memory-id">#{business.icon}</span>
                </div>
                <div
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: healthConfig?.bg, color: healthConfig?.color }}
                >
                    {healthConfig?.label}
                </div>
            </div>

            <p className="memory-content">{business.description}</p>

            {/* Metrics */}
            <div className="memory-stats">
                <div className="memory-stat">
                    <DollarSign className="h-3 w-3" />
                    <span>{formatCurrency(business.metrics.mrr)}/mes</span>
                </div>
                <div className="memory-stat">
                    <Users className="h-3 w-3" />
                    <span>{business.metrics.clients} clientes</span>
                </div>
                <div className="memory-stat">
                    <TrendingUp className="h-3 w-3" />
                    <span>{business.metrics.growth}% growth</span>
                </div>
            </div>

            {/* Status badge */}
            <div className="mt-3 pt-3 border-t border-border">
                <span
                    className="memory-tag"
                    style={{
                        backgroundColor: STATUS_CONFIG.find(s => s.value === business.status)?.bg,
                        color: STATUS_CONFIG.find(s => s.value === business.status)?.color
                    }}
                >
                    {STATUS_CONFIG.find(s => s.value === business.status)?.label}
                </span>
            </div>
        </div>
    );
}
```

---

## 7. Testing Checklist (Subtask 625)

### Unit Tests Required

- [ ] Loading state renders spinner
- [ ] API fetch success populates businesses
- [ ] API fetch failure uses BUSINESSES_FALLBACK
- [ ] formatCurrency returns correct format
- [ ] getHealth returns correct status
- [ ] Stats calculate correctly from filtered data
- [ ] Search filter works (min 3 chars)
- [ ] Status filter toggles correctly
- [ ] Health filter toggles correctly
- [ ] Multiple filters work together (AND logic)
- [ ] View mode toggle (grid ↔ list)
- [ ] Navigate onClick to /businesses/:id
- [ ] Empty state when no filtered results

### Visual Regression Tests

- [ ] Grid view layout matches design
- [ ] List view table structure correct
- [ ] Stats grid responsive
- [ ] Search bar layout responsive
- [ ] Filter buttons styled correctly
- [ ] Loading spinner centered
- [ ] Currency formatting displays correctly
- [ ] Health badges colored correctly

### Integration Tests

- [ ] Full page renders without errors
- [ ] API integration works with auth token
- [ ] Filtering updates stats dynamically
- [ ] Navigation to detail page works
- [ ] All design system components render

---

## 8. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Stats not updating dynamically | HIGH | Calculate after filteredBusinesses, verify in tests |
| Currency formatting breaks StatCard | MEDIUM | Ensure formatCurrency returns string |
| API fetch fails | MEDIUM | Fallback data + try/catch |
| Two filter groups overlap | LOW | Use flex-col wrapper |
| View toggle conflicts | LOW | Set showViewSelector={false} |
| Loading state flicker | LOW | Min loading duration 500ms |
| Navigate not working | LOW | Verify react-router imports |

---

## 9. Acceptance Criteria

✅ **Functionality:**
- [ ] Page loads with API data or fallback
- [ ] All 4 stats display with correct values and formatting
- [ ] Search filters by name and description (min 3 chars)
- [ ] Status filters work independently
- [ ] Health filters work independently
- [ ] Multiple filters work together (AND)
- [ ] Grid and list views both functional
- [ ] Click navigates to business detail page
- [ ] Stats update when filters change

✅ **Design System Compliance:**
- [ ] Uses StandardPageLayout wrapper
- [ ] Uses PageHeader with title, subtitle, actions
- [ ] Uses StatsGrid + StatCard (4 cards)
- [ ] Uses SearchAndFilterBar with custom filterChildren
- [ ] Uses ContentGrid for grid view
- [ ] Maintains custom table for list view
- [ ] Follows memory-card styling for BusinessCard

✅ **Code Quality:**
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All tests passing
- [ ] Code formatted with Prettier
- [ ] No inline styles (except necessary color overrides)
- [ ] Proper component decomposition
- [ ] Clear comments for complex logic

✅ **Performance:**
- [ ] No unnecessary re-renders
- [ ] Filtering is instant (<100ms)
- [ ] API fetch has loading indicator
- [ ] Stats calculation optimized

---

## 10. Estimated Time Breakdown

| Subtask | Task | Estimated | Notes |
|---------|------|-----------|-------|
| 620 | Crear branch | 5 min | Simple git operation |
| 621 | Migrar PageHeader | 30 min | Title, subtitle, view toggle in actions |
| 622 | Migrar StatsGrid | 45 min | Dynamic stats calculation, currency formatting |
| 623 | Migrar SearchAndFilterBar | 50 min | Two filter groups, counts, styling |
| 624 | Migrar ContentGrid | 40 min | Grid + list views, BusinessCard styling |
| 625 | Testing y validación | 45 min | Unit + visual + integration tests |
| 626 | PR y merge | 20 min | Code review notes, merge to main |
| **TOTAL** | | **4h 15min** | Matches original 5h estimate with buffer |

---

## 11. Key Learnings from OfficePage (Apply Here)

1. **StatCard API:** Use children pattern, NOT stats prop
2. **Variants:** Only use valid variants (primary, success, warning, danger, default)
3. **SearchAndFilterBar:** Use itemCount + filterChildren, not count + filters
4. **ViewSelector:** Can be in PageHeader OR SearchAndFilterBar, not both
5. **Currency in Stats:** Format BEFORE passing to StatCard.value
6. **Dynamic data:** Calculate stats AFTER filtering, not before

---

**Status:** Analysis Complete ✅
**Next Step:** Subtask 620 - Crear branch refactor/businesses-page
**Ready for Implementation:** YES

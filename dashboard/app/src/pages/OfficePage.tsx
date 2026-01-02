import { useState } from 'react';
import {
    Briefcase,
    Target,
    Users,
    TrendingUp,
    Zap,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Design System Components
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsGrid } from '@/components/common/StatsGrid';
import { StatCard, type StatCardProps } from '@/components/common/StatCard';
import { SearchAndFilterBar } from '@/components/common/SearchAndFilterBar';
import { ContentGrid } from '@/components/common/ContentGrid';
import { ContentGroup } from '@/components/common/ContentGroup';

/**
 * PÁGINA PLANTILLA - OFICINA
 *
 * Esta página sirve como referencia visual de todos los elementos estándar
 * del diseño SOLARIA DFO usando el nuevo design system.
 *
 * Elementos incluidos:
 * - PageHeader (título, subtítulo, acciones)
 * - StatsGrid (4 stats con iconos)
 * - SearchAndFilterBar (búsqueda, filtros, view toggle, sort)
 * - ContentGrid (cards responsive)
 * - ContentGroup (agrupación de secciones)
 */

type ViewMode = 'grid' | 'list';

// Datos de ejemplo - Stats
const EXAMPLE_STATS: StatCardProps[] = [
    {
        icon: Briefcase,
        title: 'Total Items',
        value: '127',
        variant: 'default',
    },
    {
        icon: Target,
        title: 'En Progreso',
        value: '45',
        variant: 'warning',
    },
    {
        icon: Users,
        title: 'Asignados',
        value: '12',
        variant: 'primary',
    },
    {
        icon: TrendingUp,
        title: 'Completados',
        value: '82',
        variant: 'success',
    },
];

// Datos de ejemplo - Tags para filtros
const EXAMPLE_TAGS = [
    { name: 'activo', count: 15, bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    { name: 'pendiente', count: 8, bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    { name: 'crítico', count: 3, bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
    { name: 'normal', count: 24, bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    { name: 'bajo', count: 10, bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' },
];

// Datos de ejemplo - Items para cards
const EXAMPLE_ITEMS = [
    {
        id: 1,
        title: 'Ejemplo de Item con Título Largo que Se Trunca en Dos Líneas Máximo',
        subtitle: 'ITEM-001',
        status: 'activo',
        importance: 85,
        description: 'Este es un ejemplo de descripción de contenido que muestra cómo se ve el texto en el card. La descripción se trunca a 3 líneas máximo para mantener un diseño limpio y consistente.',
        tags: ['activo', 'crítico'],
        stats: [
            { icon: Zap, value: '12 accesos' },
            { icon: Clock, value: 'hace 2h' },
        ],
    },
    {
        id: 2,
        title: 'Segundo Ejemplo de Item',
        subtitle: 'ITEM-002',
        status: 'pendiente',
        importance: 60,
        description: 'Otro ejemplo de card con diferente nivel de importancia y tags.',
        tags: ['pendiente', 'normal'],
        stats: [
            { icon: Zap, value: '5 accesos' },
            { icon: Clock, value: 'hace 1d' },
        ],
    },
    {
        id: 3,
        title: 'Tercer Item de Ejemplo',
        subtitle: 'ITEM-003',
        status: 'normal',
        importance: 40,
        description: 'Un ejemplo con importancia baja para mostrar los diferentes estados visuales.',
        tags: ['bajo'],
        stats: [
            { icon: Zap, value: '0 accesos' },
            { icon: Clock, value: 'hace 3d' },
        ],
    },
    {
        id: 4,
        title: 'Cuarto Ejemplo',
        subtitle: 'ITEM-004',
        status: 'activo',
        importance: 95,
        description: 'Item con importancia muy alta para demostrar el indicador verde.',
        tags: ['activo', 'crítico', 'pendiente'],
        stats: [
            { icon: Zap, value: '45 accesos' },
            { icon: Clock, value: 'hace 30m' },
        ],
    },
    {
        id: 5,
        title: 'Quinto Item',
        subtitle: 'ITEM-005',
        status: 'normal',
        importance: 50,
        description: 'Ejemplo con importancia media para mostrar el badge azul.',
        tags: ['normal'],
        stats: [
            { icon: Zap, value: '8 accesos' },
            { icon: Clock, value: 'hace 5h' },
        ],
    },
    {
        id: 6,
        title: 'Sexto Ejemplo de Item',
        subtitle: 'ITEM-006',
        status: 'bajo',
        importance: 25,
        description: 'Card con baja prioridad para completar la demostración de estados.',
        tags: ['bajo', 'normal'],
        stats: [
            { icon: Zap, value: '2 accesos' },
            { icon: Clock, value: 'hace 1w' },
        ],
    },
];

/**
 * ExampleCard - Card component for grid view
 */
function ExampleCard({ item, onClick }: { item: typeof EXAMPLE_ITEMS[0]; onClick?: () => void }) {
    const importancePercent = item.importance;
    const importanceClass = importancePercent >= 70 ? 'high' : importancePercent >= 40 ? 'medium' : 'low';

    return (
        <div onClick={onClick} className="memory-card">
            {/* Header */}
            <div className="memory-header">
                <div className="memory-icon">
                    <Briefcase className="h-4 w-4" />
                </div>
                <div className="memory-title-group">
                    <h3 className="memory-title">{item.title}</h3>
                    <span className="memory-id">#{item.subtitle}</span>
                </div>
                <div className={cn('memory-importance', importanceClass)}>
                    <TrendingUp className="h-3 w-3" />
                    <span>{importancePercent}%</span>
                </div>
            </div>

            {/* Content preview */}
            <p className="memory-content">{item.description}</p>

            {/* Tags */}
            <div className="memory-tags">
                {item.tags.map((tag) => {
                    const config = EXAMPLE_TAGS.find(t => t.name === tag);
                    return (
                        <span
                            key={tag}
                            className="memory-tag"
                            style={{ backgroundColor: config?.bg, color: config?.color }}
                        >
                            {tag}
                        </span>
                    );
                })}
            </div>

            {/* Stats footer */}
            <div className="memory-stats">
                {item.stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="memory-stat">
                            <Icon className="h-3 w-3" />
                            <span>{stat.value}</span>
                        </div>
                    );
                })}
                <div className="memory-stat created">
                    Item de ejemplo
                </div>
            </div>
        </div>
    );
}

/**
 * ExampleRow - Row component for list view
 */
function ExampleRow({ item, onClick }: { item: typeof EXAMPLE_ITEMS[0]; onClick?: () => void }) {
    const importancePercent = item.importance;

    return (
        <tr onClick={onClick} className="memory-row">
            <td>
                <div className="flex items-center gap-3">
                    <div className="memory-icon-sm">
                        <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="memory-title-sm">{item.title}</div>
                        <div className="memory-id-sm">#{item.subtitle}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map((tag) => {
                        const config = EXAMPLE_TAGS.find(t => t.name === tag);
                        return (
                            <span
                                key={tag}
                                className="memory-tag-sm"
                                style={{ backgroundColor: config?.bg, color: config?.color }}
                            >
                                {tag}
                            </span>
                        );
                    })}
                </div>
            </td>
            <td className="text-center">
                <span className="stat-value-sm">{importancePercent}%</span>
            </td>
            <td className="text-center">
                <span className="stat-value-sm">{item.stats[0].value.split(' ')[0]}</span>
            </td>
            <td className="text-center text-muted-foreground text-sm">
                {item.stats[1].value}
            </td>
        </tr>
    );
}

/**
 * OfficePage Component - Refactored with Design System
 */
export function OfficePage() {
    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    return (
        <StandardPageLayout maxWidth="7xl">
            {/* Page Header - Using PageHeader component */}
            <PageHeader
                title="Oficina - Plantilla de Diseño"
                subtitle="Página de referencia con todos los elementos estándar del sistema"
            />

            {/* Stats Grid - Using StatsGrid component */}
            <StatsGrid>
                {EXAMPLE_STATS.map((stat) => (
                    <StatCard
                        key={stat.title}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        variant={stat.variant}
                    />
                ))}
            </StatsGrid>

            {/* Search and Filters - Using SearchAndFilterBar component */}
            <SearchAndFilterBar
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar items (mínimo 3 caracteres)..."
                itemCount={EXAMPLE_ITEMS.length}
                itemSingularLabel="item"
                itemPluralLabel="items"
                viewValue={viewMode}
                onViewChange={setViewMode}
                showViewSelector={true}
                filterChildren={
                    /* Custom tag filters */
                    <div className="flex items-center gap-2 flex-wrap w-full">
                        {EXAMPLE_TAGS.map((tag) => {
                            const isSelected = selectedTags.includes(tag.name);
                            return (
                                <button
                                    key={tag.name}
                                    onClick={() => toggleTag(tag.name)}
                                    className={cn(
                                        'memory-tag-filter',
                                        isSelected && 'selected'
                                    )}
                                    style={
                                        isSelected
                                            ? { backgroundColor: tag.color, color: '#fff' }
                                            : { backgroundColor: tag.bg, color: tag.color }
                                    }
                                >
                                    {tag.name} ({tag.count})
                                </button>
                            );
                        })}
                    </div>
                }
            />

            {/* Content Grid/List - Using ContentGrid component */}
            {viewMode === 'grid' ? (
                <ContentGrid columns={3} gap="md">
                    {EXAMPLE_ITEMS.map((item) => (
                        <ExampleCard key={item.id} item={item} />
                    ))}
                </ContentGrid>
            ) : (
                <div className="bg-card border border-border rounded-xl" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="list-table" style={{ width: '100%', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Item</th>
                                <th style={{ width: '25%' }}>Tags</th>
                                <th style={{ width: '12%', textAlign: 'center' }}>Importancia</th>
                                <th style={{ width: '12%', textAlign: 'center' }}>Accesos</th>
                                <th style={{ width: '16%', textAlign: 'center' }}>Fecha</th>
                            </tr>
                        </thead>
                        <tbody>
                            {EXAMPLE_ITEMS.map((item) => (
                                <ExampleRow key={item.id} item={item} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Info Box - Using ContentGroup component */}
            <ContentGroup>
                <div className="bg-card border border-border rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-solaria flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-2">Página Plantilla de Referencia (Refactorizada)</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                Esta página ha sido refactorizada usando el nuevo design system SOLARIA DFO.
                                Ahora utiliza componentes estandarizados: <strong>PageHeader</strong>, <strong>StatsGrid</strong>,
                                <strong>SearchAndFilterBar</strong> (con ViewSelector integrado), <strong>ContentGrid</strong>,
                                y <strong>ContentGroup</strong> para garantizar consistencia visual y mantenibilidad.
                            </p>
                            <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                                <h4 className="text-xs font-semibold mb-2">Componentes Utilizados:</h4>
                                <ul className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                                    <li>✓ StandardPageLayout (wrapper)</li>
                                    <li>✓ PageHeader (título + subtítulo)</li>
                                    <li>✓ StatsGrid (4 stats cards)</li>
                                    <li>✓ SearchAndFilterBar (búsqueda + view)</li>
                                    <li>✓ ContentGrid (responsive grid)</li>
                                    <li>✓ ContentGroup (agrupación)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </ContentGroup>
        </StandardPageLayout>
    );
}

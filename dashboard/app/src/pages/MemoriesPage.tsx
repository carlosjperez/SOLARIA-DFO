import { useState } from 'react';
import {
    Brain,
    Search,
    Tag,
    TrendingUp,
    Clock,
    Zap,
    Link2,
    Loader2,
    AlertCircle,
    LayoutGrid,
    List,
} from 'lucide-react';
import { useMemories, useMemoryStats, useMemoryTags, useSearchMemories } from '@/hooks/useApi';
import { cn, formatRelativeTime, formatNumber } from '@/lib/utils';
import { MemoryDetailModal } from '@/components/memories/MemoryDetailModal';
import type { Memory } from '@/types';

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
    decision: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' },
    learning: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    context: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    requirement: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
    bug: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
    solution: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
    pattern: { bg: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' },
    config: { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' },
    architecture: { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' },
    session: { bg: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' },
};

type ViewMode = 'grid' | 'list';

function MemoryCard({ memory, onClick }: { memory: Memory; onClick?: () => void }) {
    const importancePercent = Math.round(memory.importance * 100);
    const tags = memory.tags || [];

    // Determine importance level class
    const importanceClass = importancePercent >= 70 ? 'high' : importancePercent >= 40 ? 'medium' : 'low';

    return (
        <div
            onClick={onClick}
            className="memory-card"
        >
            {/* Header */}
            <div className="memory-header">
                <div className="memory-icon">
                    <Brain className="h-4 w-4" />
                </div>
                <div className="memory-title-group">
                    <h3 className="memory-title">{memory.summary || memory.content.substring(0, 60)}</h3>
                    <span className="memory-id">#{memory.id}</span>
                </div>
                <div className={cn('memory-importance', importanceClass)}>
                    <TrendingUp className="h-3 w-3" />
                    <span>{importancePercent}%</span>
                </div>
            </div>

            {/* Content preview */}
            <p className="memory-content">
                {memory.content}
            </p>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="memory-tags">
                    {tags.map((tag: string) => {
                        const colorConfig = TAG_COLORS[tag] || { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };
                        return (
                            <span
                                key={tag}
                                className="memory-tag"
                                style={{ backgroundColor: colorConfig.bg, color: colorConfig.color }}
                            >
                                {tag}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Stats footer */}
            <div className="memory-stats">
                <div className="memory-stat">
                    <Zap className="h-3 w-3" />
                    <span>{memory.accessCount} accesos</span>
                </div>
                {memory.lastAccessed && (
                    <div className="memory-stat">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(memory.lastAccessed)}</span>
                    </div>
                )}
                <div className="memory-stat created">
                    {formatRelativeTime(memory.createdAt)}
                </div>
            </div>
        </div>
    );
}

function MemoryRow({ memory, onClick }: { memory: Memory; onClick?: () => void }) {
    const importancePercent = Math.round(memory.importance * 100);
    const tags = memory.tags || [];

    return (
        <tr onClick={onClick} className="memory-row">
            <td>
                <div className="flex items-center gap-3">
                    <div className="memory-icon-sm">
                        <Brain className="h-4 w-4" />
                    </div>
                    <div>
                        <div className="memory-title-sm">{memory.summary || memory.content.substring(0, 50)}</div>
                        <div className="memory-id-sm">#{memory.id}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag: string) => {
                        const colorConfig = TAG_COLORS[tag] || { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };
                        return (
                            <span
                                key={tag}
                                className="memory-tag-sm"
                                style={{ backgroundColor: colorConfig.bg, color: colorConfig.color }}
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
                <span className="stat-value-sm">{memory.accessCount}</span>
            </td>
            <td className="text-center text-muted-foreground text-sm">
                {formatRelativeTime(memory.createdAt)}
            </td>
        </tr>
    );
}

export function MemoriesPage() {
    const [search, setSearch] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedImportance, setSelectedImportance] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedMemoryId, setSelectedMemoryId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: memories, isLoading, isError, error } = useMemories({ tags: selectedTags });

    const handleMemoryClick = (memoryId: number) => {
        setSelectedMemoryId(memoryId);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedMemoryId(null);
    };

    const handleTagClickFromModal = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    };
    const { data: stats } = useMemoryStats();
    const { data: tags } = useMemoryTags();
    const { data: searchResults } = useSearchMemories(search, selectedTags);

    // Apply all filters
    const baseMemories = search.length > 2 ? searchResults : memories;
    const displayMemories = (baseMemories || []).filter((memory: Memory) => {
        // Importance filter
        if (selectedImportance.length > 0) {
            const level = getImportanceLevel(memory.importance);
            if (!selectedImportance.includes(level)) return false;
        }
        return true;
    });
    const memoryCount = displayMemories?.length || 0;

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const toggleImportance = (level: string) => {
        setSelectedImportance((prev) =>
            prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
        );
    };

    const getImportanceLevel = (importance: number): string => {
        const percent = importance * 100;
        if (percent >= 70) return 'high';
        if (percent >= 40) return 'medium';
        return 'low';
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-muted-foreground">Error al cargar memorias</p>
                <pre className="text-xs text-destructive">{String(error)}</pre>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title">Memorias</h1>
                    <p className="section-subtitle">
                        Sistema de memoria persistente para agentes IA
                    </p>
                </div>
                <div className="section-actions">
                    {/* View Toggle */}
                    <div className="view-toggle">
                        <button
                            className={cn('view-toggle-btn', viewMode === 'grid' && 'active')}
                            onClick={() => setViewMode('grid')}
                            title="Vista Grid"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            className={cn('view-toggle-btn', viewMode === 'list' && 'active')}
                            onClick={() => setViewMode('list')}
                            title="Vista Lista"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="dashboard-stats-row">
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Total Memorias</div>
                        <div className="stat-value">{formatNumber(stats?.totalMemories || 0)}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Importancia Prom.</div>
                        <div className="stat-value">
                            {((stats?.avgImportance || 0) * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon active">
                        <Zap className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Accesos Totales</div>
                        <div className="stat-value">{formatNumber(stats?.totalAccesses || 0)}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon agents">
                        <Link2 className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Proyectos</div>
                        <div className="stat-value">{formatNumber(stats?.projectsWithMemories || 0)}</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters - Responsive Container */}
            <div className="bg-card border border-border rounded-xl p-5 overflow-visible">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar en memorias (min. 3 caracteres)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {memoryCount} memorias
                    </span>
                </div>

                {/* Tags filter - Responsive Wrap */}
                {tags && tags.length > 0 && (
                    <div className="flex items-start gap-2 flex-wrap mb-3">
                        <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1.5" />
                        <div className="flex items-center gap-2 flex-wrap">
                            {tags.map((tag: { name: string; usageCount: number }) => {
                                const colorConfig = TAG_COLORS[tag.name] || { bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b' };
                                const isSelected = selectedTags.includes(tag.name);
                                return (
                                    <button
                                        key={tag.name}
                                        onClick={() => toggleTag(tag.name)}
                                        className={cn(
                                            'memory-tag-filter flex-shrink-0',
                                            isSelected && 'selected'
                                        )}
                                        style={
                                            isSelected
                                                ? { backgroundColor: colorConfig.color, color: '#fff' }
                                                : { backgroundColor: colorConfig.bg, color: colorConfig.color }
                                        }
                                    >
                                        {tag.name} ({tag.usageCount})
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Importance filter - Responsive Wrap */}
                <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0 mt-1.5">Importancia:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(['high', 'medium', 'low'] as const).map((level) => {
                            const isSelected = selectedImportance.includes(level);
                            const count = (baseMemories || []).filter((m: Memory) => getImportanceLevel(m.importance) === level).length;
                            if (count === 0) return null;
                            const config = {
                                high: { label: '🔴 Alta (≥70%)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
                                medium: { label: '🟡 Media (40-69%)', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                                low: { label: '🟢 Baja (<40%)', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                            }[level];
                            return (
                                <button
                                    key={level}
                                    onClick={() => toggleImportance(level)}
                                    className="memory-tag-filter flex-shrink-0"
                                    style={
                                        isSelected
                                            ? { backgroundColor: config.color, color: '#fff' }
                                            : { backgroundColor: config.bg, color: config.color }
                                    }
                                >
                                    {config.label} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Memories Grid/List */}
            {viewMode === 'grid' ? (
                <div className="memories-grid">
                    {displayMemories && displayMemories.length > 0 ? (
                        displayMemories.map((memory: Memory) => (
                            <MemoryCard
                                key={memory.id}
                                memory={memory}
                                onClick={() => handleMemoryClick(memory.id)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>
                                {search.length > 2
                                    ? 'No se encontraron memorias con ese criterio'
                                    : 'No hay memorias registradas'}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="list-table">
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Memoria</th>
                                <th style={{ width: '25%' }}>Tags</th>
                                <th style={{ width: '12%', textAlign: 'center' }}>Importancia</th>
                                <th style={{ width: '12%', textAlign: 'center' }}>Accesos</th>
                                <th style={{ width: '16%', textAlign: 'center' }}>Creada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayMemories && displayMemories.length > 0 ? (
                                displayMemories.map((memory: Memory) => (
                                    <MemoryRow
                                        key={memory.id}
                                        memory={memory}
                                        onClick={() => handleMemoryClick(memory.id)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5}>
                                        <div className="py-12 text-center text-muted-foreground">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p>
                                                {search.length > 2
                                                    ? 'No se encontraron memorias'
                                                    : 'No hay memorias'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Memory Detail Modal */}
            <MemoryDetailModal
                memoryId={selectedMemoryId}
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onTagClick={handleTagClickFromModal}
            />
        </div>
    );
}

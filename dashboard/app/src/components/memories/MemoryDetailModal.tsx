import {
    Brain,
    TrendingUp,
    Clock,
    Zap,
    Link2,
    Loader2,
    Calendar,
    Hash,
    ChevronUp,
    ExternalLink,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogBody,
    DialogFooter,
} from '@/components/ui/dialog';
import { useMemory, useMemoryRelated, useBoostMemory } from '@/hooks/useApi';
import { cn, formatRelativeTime, formatDate } from '@/lib/utils';

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
    decision: { bg: 'hsl(270 60% 50% / 0.1)', color: 'hsl(270 60% 50%)' },
    learning: { bg: 'hsl(217 91% 60% / 0.1)', color: 'hsl(217 91% 60%)' },
    context: { bg: 'hsl(142 71% 45% / 0.1)', color: 'hsl(142 71% 45%)' },
    requirement: { bg: 'hsl(38 92% 50% / 0.1)', color: 'hsl(38 92% 50%)' },
    bug: { bg: 'hsl(0 84% 60% / 0.1)', color: 'hsl(0 84% 60%)' },
    solution: { bg: 'hsl(160 84% 39% / 0.1)', color: 'hsl(160 84% 39%)' },
    pattern: { bg: 'hsl(239 84% 67% / 0.1)', color: 'hsl(239 84% 67%)' },
    config: { bg: 'hsl(25 95% 53% / 0.1)', color: 'hsl(25 95% 53%)' },
    architecture: { bg: 'hsl(263 70% 58% / 0.1)', color: 'hsl(263 70% 58%)' },
    session: { bg: 'hsl(199 89% 48% / 0.1)', color: 'hsl(199 89% 48%)' },
    protocol: { bg: 'hsl(280 65% 60% / 0.1)', color: 'hsl(280 65% 60%)' },
    'agent-instructions': { bg: 'hsl(200 95% 45% / 0.1)', color: 'hsl(200 95% 45%)' },
};

const RELATIONSHIP_LABELS: Record<string, string> = {
    related: 'Relacionada',
    depends_on: 'Depende de',
    contradicts: 'Contradice',
    supersedes: 'Reemplaza',
    child_of: 'Derivada de',
};

interface MemoryDetailModalProps {
    memoryId: number | null;
    isOpen: boolean;
    onClose: () => void;
    onTagClick?: (tag: string) => void;
}

export function MemoryDetailModal({
    memoryId,
    isOpen,
    onClose,
    onTagClick,
}: MemoryDetailModalProps) {
    // Only fetch when we have a valid memoryId and modal is open
    const shouldFetch = isOpen && memoryId !== null && memoryId > 0;
    const { data: memory, isLoading } = useMemory(shouldFetch ? memoryId : 0);
    const { data: related } = useMemoryRelated(shouldFetch ? memoryId : 0);
    const boostMutation = useBoostMemory();

    const handleBoost = () => {
        if (memoryId) {
            boostMutation.mutate({ id: memoryId, amount: 0.1 });
        }
    };

    const importancePercent = memory ? Math.round(memory.importance * 100) : 0;
    const importanceClass =
        importancePercent >= 70 ? 'high' : importancePercent >= 40 ? 'medium' : 'low';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                <DialogClose onClose={onClose} />

                {!shouldFetch ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : memory ? (
                    <>
                        <DialogHeader>
                            <div className="flex items-start gap-3 pr-8">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Brain className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <DialogTitle className="text-base">
                                        {memory.summary || memory.content.substring(0, 80)}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <Hash className="h-3 w-3" />
                                        <span className="font-mono">{memory.id}</span>
                                        <span className="text-border">|</span>
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(memory.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <DialogBody className="flex-1 overflow-y-auto space-y-4">
                            {/* Stats Row */}
                            <div className="flex items-center gap-4 text-sm">
                                <div
                                    className={cn(
                                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                        importanceClass === 'high' &&
                                            'bg-green-500/10 text-green-600',
                                        importanceClass === 'medium' &&
                                            'bg-blue-500/10 text-blue-600',
                                        importanceClass === 'low' && 'bg-muted text-muted-foreground'
                                    )}
                                >
                                    <TrendingUp className="h-3 w-3" />
                                    <span>{importancePercent}% importancia</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Zap className="h-3 w-3" />
                                    <span>{memory.accessCount} accesos</span>
                                </div>
                                {memory.lastAccessed && (
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>Accedida {formatRelativeTime(memory.lastAccessed)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {memory.tags && memory.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {memory.tags.map((tag: string) => {
                                        const colorConfig = TAG_COLORS[tag] || {
                                            bg: 'hsl(var(--muted))',
                                            color: 'hsl(var(--muted-foreground))',
                                        };
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    onTagClick?.(tag);
                                                    onClose();
                                                }}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-opacity hover:opacity-80"
                                                style={{
                                                    backgroundColor: colorConfig.bg,
                                                    color: colorConfig.color,
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Content */}
                            <div className="rounded-lg border border-border bg-muted/30 p-4">
                                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                                    {memory.content}
                                </pre>
                            </div>

                            {/* Related Memories */}
                            {related && related.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Link2 className="h-4 w-4" />
                                        Memorias Relacionadas
                                    </h4>
                                    <div className="space-y-2">
                                        {related.map((rel) => (
                                            <div
                                                key={rel.id}
                                                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">
                                                        {rel.relatedMemory?.summary ||
                                                            rel.relatedMemory?.content?.substring(0, 50)}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {RELATIONSHIP_LABELS[rel.relationshipType] ||
                                                            rel.relationshipType}{' '}
                                                        &middot; #{rel.relatedMemory?.id}
                                                    </div>
                                                </div>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </DialogBody>

                        <DialogFooter>
                            <button
                                onClick={handleBoost}
                                disabled={boostMutation.isPending}
                                className={cn(
                                    'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium',
                                    'bg-primary text-primary-foreground',
                                    'hover:bg-primary/90 transition-colors',
                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                            >
                                {boostMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ChevronUp className="h-4 w-4" />
                                )}
                                Boost +10%
                            </button>
                            <button
                                onClick={onClose}
                                className={cn(
                                    'px-4 py-2 rounded-md text-sm font-medium',
                                    'border border-border bg-background',
                                    'hover:bg-muted transition-colors'
                                )}
                            >
                                Cerrar
                            </button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="py-12 text-center text-muted-foreground">
                        Memoria no encontrada
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

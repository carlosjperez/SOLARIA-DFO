import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Link as LinkIcon,
    Globe,
    Github,
    Server,
    Laptop,
    Plus,
    Trash2,
    ExternalLink,
    Copy,
    Check,
    Loader2,
} from 'lucide-react';
import { useProject, useUpdateProject } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

type LinkType = 'production' | 'staging' | 'local' | 'repository';

interface ProjectLink {
    id: string;
    type: LinkType;
    label: string;
    url: string;
}

const LINK_TYPES: Record<LinkType, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
    production: { label: 'Producción', icon: Globe, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    staging: { label: 'Staging/Dev', icon: Server, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    local: { label: 'Local', icon: Laptop, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    repository: { label: 'Repositorio', icon: Github, color: 'text-violet-400', bgColor: 'bg-violet-500/10' },
};

export function ProjectLinksPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: project, isLoading } = useProject(Number(id));
    const updateProject = useUpdateProject();

    const [showForm, setShowForm] = useState(false);
    const [newLink, setNewLink] = useState({ type: 'production' as LinkType, label: '', url: '' });
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Parse links from project fields
    const links: ProjectLink[] = [
        project?.productionUrl && { id: 'prod', type: 'production' as LinkType, label: 'Produccion', url: project.productionUrl },
        project?.stagingUrl && { id: 'staging', type: 'staging' as LinkType, label: 'Staging', url: project.stagingUrl },
        project?.localUrl && { id: 'local', type: 'local' as LinkType, label: 'Local', url: project.localUrl },
        project?.repoUrl && { id: 'repo', type: 'repository' as LinkType, label: 'GitHub', url: project.repoUrl },
    ].filter(Boolean) as ProjectLink[];

    const handleCopy = async (url: string, id: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleAddLink = async () => {
        if (!newLink.url.trim()) return;

        // Map type to the correct field
        const fieldMap: Record<LinkType, string> = {
            production: 'productionUrl',
            staging: 'stagingUrl',
            local: 'localUrl',
            repository: 'repoUrl',
        };

        await updateProject.mutateAsync({
            id: Number(id),
            data: { [fieldMap[newLink.type]]: newLink.url.trim() },
        });

        setNewLink({ type: 'production', label: '', url: '' });
        setShowForm(false);
    };

    const handleDeleteLink = async (linkId: string) => {
        const fieldMap: Record<string, string> = {
            prod: 'productionUrl',
            staging: 'stagingUrl',
            local: 'localUrl',
            repo: 'repoUrl',
        };

        if (fieldMap[linkId]) {
            await updateProject.mutateAsync({
                id: Number(id),
                data: { [fieldMap[linkId]]: null },
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Proyecto no encontrado
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate(`/projects/${id}`)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Direcciones del Proyecto</h1>
                    <p className="text-muted-foreground">{project.name}</p>
                </div>
            </div>

            {/* Links List */}
            <div className="space-y-3 mb-6">
                {links.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border">
                        <LinkIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground mb-4">No hay direcciones configuradas para este proyecto</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="px-4 py-2 bg-solaria text-white rounded-lg hover:bg-solaria/90 transition-colors"
                        >
                            <Plus className="h-4 w-4 inline mr-2" />
                            Agregar primera dirección
                        </button>
                    </div>
                ) : (
                    links.map((link) => {
                        const typeInfo = LINK_TYPES[link.type];
                        const Icon = typeInfo.icon;

                        return (
                            <div
                                key={link.id}
                                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-border/80 transition-colors"
                            >
                                <div className={cn('p-2.5 rounded-lg', typeInfo.bgColor, typeInfo.color)}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{link.label}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                            {typeInfo.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy(link.url, link.id)}
                                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                                        title="Copiar URL"
                                    >
                                        {copiedId === link.id ? (
                                            <Check className="h-4 w-4 text-emerald-400" />
                                        ) : (
                                            <Copy className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </button>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                                        title="Abrir en nueva pestana"
                                    >
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                    <button
                                        onClick={() => handleDeleteLink(link.id)}
                                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-400" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Link Button / Form */}
            {links.length > 0 && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full p-4 border border-dashed border-border rounded-xl text-muted-foreground hover:border-solaria hover:text-solaria transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Agregar dirección
                </button>
            )}

            {showForm && (
                <div className="p-6 bg-card rounded-xl border border-border">
                    <h3 className="font-medium mb-4">Nueva Dirección</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Tipo</label>
                            <select
                                value={newLink.type}
                                onChange={(e) => setNewLink({ ...newLink, type: e.target.value as LinkType })}
                                className="w-full p-2.5 bg-secondary rounded-lg border border-border text-sm"
                            >
                                {Object.entries(LINK_TYPES).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-muted-foreground mb-2">URL</label>
                            <input
                                type="url"
                                value={newLink.url}
                                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                placeholder="https://..."
                                className="w-full p-2.5 bg-secondary rounded-lg border border-border text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setShowForm(false);
                                setNewLink({ type: 'production', label: '', url: '' });
                            }}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAddLink}
                            disabled={!newLink.url.trim() || updateProject.isPending}
                            className="px-4 py-2 bg-solaria text-white rounded-lg text-sm hover:bg-solaria/90 disabled:opacity-50"
                        >
                            {updateProject.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Guardar'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectLinksPage;

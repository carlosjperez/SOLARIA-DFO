import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Settings,
    Save,
    Loader2,
    Trash2,
    AlertTriangle,
    Tag,
    Layers,
    Building2,
    Plus,
    X,
} from 'lucide-react';
import { useProject, useUpdateProject } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

// Common tech stack options for suggestions
const COMMON_STACK = [
    'React', 'Vue', 'Angular', 'Next.js', 'Nuxt', 'Svelte',
    'Node.js', 'Express', 'Fastify', 'NestJS',
    'Python', 'Django', 'FastAPI', 'Flask',
    'TypeScript', 'JavaScript', 'Go', 'Rust', 'PHP', 'Laravel',
    'PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'SQLite',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Vercel',
    'TailwindCSS', 'Sass', 'styled-components', 'Payload CMS',
    'GraphQL', 'REST API', 'Drizzle ORM', 'Prisma',
];

// Common tag suggestions
const COMMON_TAGS = [
    'SAAS', 'B2B', 'B2C', 'E-COMMERCE', 'LANDING', 'DASHBOARD',
    'REACT', 'VUE', 'MOBILE', 'API', 'CMS', 'INTERNAL',
    'MVP', 'PRODUCTION', 'STAGING', 'LEGACY', 'MAINTENANCE',
];

const STATUS_OPTIONS = [
    { value: 'planning', label: 'Planificacion', color: 'bg-violet-500' },
    { value: 'active', label: 'En Desarrollo', color: 'bg-solaria' },
    { value: 'paused', label: 'Pausado', color: 'bg-amber-500' },
    { value: 'completed', label: 'Completado', color: 'bg-emerald-500' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-500' },
];

const PRIORITY_OPTIONS = [
    { value: 'critical', label: 'Critica', color: 'text-red-400' },
    { value: 'high', label: 'Alta', color: 'text-amber-400' },
    { value: 'medium', label: 'Media', color: 'text-blue-400' },
    { value: 'low', label: 'Baja', color: 'text-gray-400' },
];

export function ProjectSettingsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: project, isLoading } = useProject(Number(id));
    const updateProject = useUpdateProject();

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        budgetAllocated: 0,
        startDate: '',
        endDate: '',
        // New fields
        tags: [] as string[],
        stack: [] as string[],
        clientName: '',
        clientEmail: '',
        clientPhone: '',
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [newStackItem, setNewStackItem] = useState('');

    useEffect(() => {
        if (project) {
            // Parse tags and stack from JSON strings if needed
            let tags: string[] = [];
            let stack: string[] = [];
            try {
                if (typeof (project as any).tags === 'string') {
                    tags = JSON.parse((project as any).tags);
                } else if (Array.isArray((project as any).tags)) {
                    tags = (project as any).tags;
                }
            } catch { /* ignore parse errors */ }
            try {
                if (typeof (project as any).stack === 'string') {
                    stack = JSON.parse((project as any).stack);
                } else if (Array.isArray((project as any).stack)) {
                    stack = (project as any).stack;
                }
            } catch { /* ignore parse errors */ }

            setFormData({
                name: project.name || '',
                code: project.code || '',
                description: project.description || '',
                status: project.status || 'planning',
                priority: project.priority || 'medium',
                budgetAllocated: project.budgetAllocated || 0,
                startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
                endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
                tags,
                stack,
                clientName: project.client?.name || '',
                clientEmail: '',
                clientPhone: '',
            });
        }
    }, [project]);

    const handleChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleAddTag = () => {
        const tag = newTag.trim().toUpperCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
            setNewTag('');
            setHasChanges(true);
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
        setHasChanges(true);
    };

    const handleAddStackItem = () => {
        const item = newStackItem.trim();
        if (item && !formData.stack.includes(item)) {
            setFormData((prev) => ({ ...prev, stack: [...prev.stack, item] }));
            setNewStackItem('');
            setHasChanges(true);
        }
    };

    const handleRemoveStackItem = (item: string) => {
        setFormData((prev) => ({ ...prev, stack: prev.stack.filter(s => s !== item) }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        await updateProject.mutateAsync({
            id: Number(id),
            data: {
                name: formData.name,
                code: formData.code,
                description: formData.description,
                status: formData.status as 'planning' | 'active' | 'paused' | 'completed' | 'cancelled',
                priority: formData.priority as 'critical' | 'high' | 'medium' | 'low',
                budgetAllocated: Number(formData.budgetAllocated),
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
                tags: formData.tags,
                stack: formData.stack,
            } as any,
        });
        setHasChanges(false);
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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/projects/${id}`)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Settings className="h-6 w-6" />
                            Configuracion del Proyecto
                        </h1>
                        <p className="text-muted-foreground">{project.name}</p>
                    </div>
                </div>

                {hasChanges && (
                    <button
                        onClick={handleSave}
                        disabled={updateProject.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-solaria text-white rounded-lg hover:bg-solaria/90 disabled:opacity-50"
                    >
                        {updateProject.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Guardar Cambios
                    </button>
                )}
            </div>

            {/* Form Sections */}
            <div className="space-y-6">
                {/* Basic Info */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4">Informacion Basica</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Nombre del Proyecto
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full p-3 bg-secondary rounded-lg border border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Codigo
                            </label>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                                maxLength={5}
                                className="w-full p-3 bg-secondary rounded-lg border border-border uppercase font-mono"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-muted-foreground mb-2">
                                Descripcion
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                className="w-full p-3 bg-secondary rounded-lg border border-border resize-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Status & Priority */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4">Estado y Prioridad</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Estado
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleChange('status', option.value)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                                            formData.status === option.value
                                                ? `${option.color} text-white`
                                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Prioridad
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PRIORITY_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleChange('priority', option.value)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                                            formData.priority === option.value
                                                ? `${option.color} border-current bg-current/10`
                                                : 'border-border text-muted-foreground hover:text-foreground'
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Budget & Dates */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4">Presupuesto y Fechas</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Presupuesto ($)
                            </label>
                            <input
                                type="number"
                                value={formData.budgetAllocated}
                                onChange={(e) => handleChange('budgetAllocated', Number(e.target.value))}
                                min={0}
                                step={1000}
                                className="w-full p-3 bg-secondary rounded-lg border border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Fecha de Inicio
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="w-full p-3 bg-secondary rounded-lg border border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Fecha Limite
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => handleChange('endDate', e.target.value)}
                                className="w-full p-3 bg-secondary rounded-lg border border-border"
                            />
                        </div>
                    </div>
                </section>

                {/* Tags Section */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-400" />
                        Etiquetas del Proyecto
                    </h2>

                    {/* Current tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            >
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(tag)}
                                    className="p-0.5 hover:bg-blue-500/30 rounded-full transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {formData.tags.length === 0 && (
                            <span className="text-sm text-muted-foreground">Sin etiquetas</span>
                        )}
                    </div>

                    {/* Add new tag */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Nueva etiqueta..."
                            className="flex-1 p-2 bg-secondary rounded-lg border border-border text-sm uppercase"
                        />
                        <button
                            onClick={handleAddTag}
                            disabled={!newTag.trim()}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Tag suggestions */}
                    <div className="flex flex-wrap gap-1.5">
                        {COMMON_TAGS.filter(t => !formData.tags.includes(t)).slice(0, 10).map((tag) => (
                            <button
                                key={tag}
                                onClick={() => {
                                    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
                                    setHasChanges(true);
                                }}
                                className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-purple-400" />
                        Stack Tecnico
                    </h2>

                    {/* Current stack */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {formData.stack.map((item) => (
                            <span
                                key={item}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            >
                                {item}
                                <button
                                    onClick={() => handleRemoveStackItem(item)}
                                    className="p-0.5 hover:bg-purple-500/30 rounded-full transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {formData.stack.length === 0 && (
                            <span className="text-sm text-muted-foreground">Sin tecnologias definidas</span>
                        )}
                    </div>

                    {/* Add new stack item */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newStackItem}
                            onChange={(e) => setNewStackItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStackItem())}
                            placeholder="Nueva tecnologia..."
                            className="flex-1 p-2 bg-secondary rounded-lg border border-border text-sm"
                        />
                        <button
                            onClick={handleAddStackItem}
                            disabled={!newStackItem.trim()}
                            className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Stack suggestions */}
                    <div className="flex flex-wrap gap-1.5">
                        {COMMON_STACK.filter(s => !formData.stack.includes(s)).slice(0, 12).map((item) => (
                            <button
                                key={item}
                                onClick={() => {
                                    setFormData((prev) => ({ ...prev, stack: [...prev.stack, item] }));
                                    setHasChanges(true);
                                }}
                                className="px-2 py-1 text-xs rounded-md bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                            >
                                + {item}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Client Info Section */}
                <section className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-400" />
                        Informacion del Cliente
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Nombre del Cliente/Empresa
                            </label>
                            <input
                                type="text"
                                value={formData.clientName}
                                onChange={(e) => handleChange('clientName', e.target.value)}
                                placeholder="Ej: SOLARIA Agency"
                                className="w-full p-3 bg-secondary rounded-lg border border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Email de Contacto
                            </label>
                            <input
                                type="email"
                                value={formData.clientEmail}
                                onChange={(e) => handleChange('clientEmail', e.target.value)}
                                placeholder="cliente@ejemplo.com"
                                className="w-full p-3 bg-secondary rounded-lg border border-border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                                Telefono
                            </label>
                            <input
                                type="tel"
                                value={formData.clientPhone}
                                onChange={(e) => handleChange('clientPhone', e.target.value)}
                                placeholder="+52 555 123 4567"
                                className="w-full p-3 bg-secondary rounded-lg border border-border"
                            />
                        </div>
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="bg-card rounded-xl border border-red-500/20 p-6">
                    <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Zona de Peligro
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Eliminar Proyecto</p>
                            <p className="text-sm text-muted-foreground">
                                Esta accion no se puede deshacer. Se eliminaran todas las tareas asociadas.
                            </p>
                        </div>

                        {showDeleteConfirm ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Cancelar
                                </button>
                                <button className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                                    Confirmar Eliminacion
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </button>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ProjectSettingsPage;

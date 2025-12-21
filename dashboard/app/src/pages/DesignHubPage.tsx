import {
    Star,
    Type,
    Tags,
    BarChart,
    Columns3,
    Square,
    MousePointer,
    Link,
    CheckSquare,
    Clock,
    FormInput,
    TrendingUp,
    Activity,
    Palette,
    ArrowUp,
    ArrowDown,
    Check,
    Plus,
    Edit,
    ExternalLink,
    Globe,
    FlaskConical,
    Laptop,
    GitBranch,
} from 'lucide-react';

function DesignSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {title}
            </h2>
            {children}
        </div>
    );
}

function DesignCard({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="bg-card border border-border rounded-xl p-5">
            {title && <h3 className="text-sm font-medium mb-4 text-muted-foreground">{title}</h3>}
            {children}
        </div>
    );
}

export function DesignHubPage() {
    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title">Design Hub</h1>
                    <p className="section-subtitle">Componentes UI, tipografias y elementos graficos</p>
                </div>
            </div>

            <div className="space-y-8 overflow-y-auto pr-2">
                {/* Brand Identity */}
                <DesignSection title="Brand Identity" icon={Star}>
                    <div className="grid grid-cols-3 gap-4">
                        <DesignCard title="Logo">
                            <div className="text-center p-5 bg-accent rounded-lg">
                                <img
                                    src="/solaria-logo.png"
                                    alt="SOLARIA Logo"
                                    className="w-20 h-20 mx-auto"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        </DesignCard>
                        <DesignCard title="Brand Colors">
                            <div className="flex gap-2 flex-wrap">
                                <div className="w-12 h-12 rounded-lg bg-[#f6921d]" title="SOLARIA Orange" />
                                <div className="w-12 h-12 rounded-lg bg-[#d97706]" title="Orange Dark" />
                                <div className="w-12 h-12 rounded-lg bg-[#0a0a0a]" title="Background" />
                                <div className="w-12 h-12 rounded-lg bg-[#141414]" title="Secondary BG" />
                            </div>
                        </DesignCard>
                        <DesignCard title="Phase Colors">
                            <div className="flex gap-2 flex-wrap">
                                <div className="w-12 h-12 rounded-lg bg-[#a855f7]" title="Planning" />
                                <div className="w-12 h-12 rounded-lg bg-[#22d3ee]" title="Development" />
                                <div className="w-12 h-12 rounded-lg bg-[#14b8a6]" title="Testing" />
                                <div className="w-12 h-12 rounded-lg bg-[#22c55e]" title="Production" />
                            </div>
                        </DesignCard>
                    </div>
                </DesignSection>

                {/* Typography */}
                <DesignSection title="Typography" icon={Type}>
                    <DesignCard>
                        <div className="mb-4">
                            <span className="text-[10px] text-muted-foreground uppercase">Font Family</span>
                            <div className="text-2xl font-semibold">Inter</div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl font-bold">Heading H1</span>
                                <span className="text-xs text-muted-foreground">32px / 700</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-2xl font-semibold">Heading H2</span>
                                <span className="text-xs text-muted-foreground">24px / 600</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-lg font-semibold">Heading H3</span>
                                <span className="text-xs text-muted-foreground">18px / 600</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-sm font-medium">Body Text</span>
                                <span className="text-xs text-muted-foreground">14px / 500</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-xs text-muted-foreground">Small / Muted</span>
                                <span className="text-xs text-muted-foreground">12px / 400</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-[10px] uppercase font-semibold tracking-wide">LABEL UPPERCASE</span>
                                <span className="text-xs text-muted-foreground">10px / 600 / Uppercase</span>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Tags */}
                <DesignSection title="Tags / Badges" icon={Tags}>
                    <DesignCard>
                        <div className="mb-4">
                            <span className="text-[10px] text-muted-foreground uppercase block mb-2">Project Tags (3 Categories)</span>
                            <div className="flex gap-2 flex-wrap">
                                <span className="project-tag blue">SaaS</span>
                                <span className="project-tag blue">Platform</span>
                                <span className="project-tag green">React</span>
                                <span className="project-tag green">Node.js</span>
                                <span className="project-tag purple">Enterprise</span>
                                <span className="project-tag purple">B2B</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase block mb-2">Phase Badges</span>
                            <div className="flex gap-2 flex-wrap">
                                <span className="progress-phase-badge planning">Planificacion</span>
                                <span className="progress-phase-badge development">Desarrollo</span>
                                <span className="progress-phase-badge testing">Testing</span>
                                <span className="progress-phase-badge production">Produccion</span>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Progress Bars */}
                <DesignSection title="Progress Bars" icon={BarChart}>
                    <DesignCard>
                        <span className="text-[10px] text-muted-foreground uppercase block mb-3">Segmented Phase Progress</span>
                        <div className="progress-segments mb-2">
                            <div className="progress-segment planning" />
                            <div className="progress-segment development" />
                            <div className="progress-segment testing" />
                            <div className="progress-segment inactive" />
                        </div>
                        <div className="progress-labels">
                            <span className="progress-label-item completed">Planificacion</span>
                            <span className="progress-label-item completed">Desarrollo</span>
                            <span className="progress-label-item active">Testing</span>
                            <span className="progress-label-item">Produccion</span>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Mini Trello */}
                <DesignSection title="Mini Trello (Equalizer)" icon={Columns3}>
                    <DesignCard>
                        <div className="mini-trello max-w-md">
                            {/* Backlog */}
                            <div className="trello-column">
                                <span className="trello-label">BL</span>
                                <div className="trello-slots">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`trello-slot ${i < 3 ? 'filled' : ''}`}
                                            style={i < 3 ? { background: '#64748b', borderColor: 'transparent' } : {}}
                                        />
                                    ))}
                                </div>
                                <span className="trello-count">3</span>
                            </div>
                            {/* Todo */}
                            <div className="trello-column">
                                <span className="trello-label">TD</span>
                                <div className="trello-slots">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`trello-slot ${i < 5 ? 'filled' : ''}`}
                                            style={i < 5 ? { background: '#f59e0b', borderColor: 'transparent' } : {}}
                                        />
                                    ))}
                                </div>
                                <span className="trello-count">5</span>
                            </div>
                            {/* Doing */}
                            <div className="trello-column">
                                <span className="trello-label">DO</span>
                                <div className="trello-slots">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`trello-slot ${i < 2 ? 'filled' : ''}`}
                                            style={i < 2 ? { background: '#3b82f6', borderColor: 'transparent' } : {}}
                                        />
                                    ))}
                                </div>
                                <span className="trello-count">2</span>
                            </div>
                            {/* Done */}
                            <div className="trello-column">
                                <span className="trello-label">DN</span>
                                <div className="trello-slots">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`trello-slot ${i < 7 ? 'filled' : ''}`}
                                            style={i < 7 ? { background: '#22c55e', borderColor: 'transparent' } : {}}
                                        />
                                    ))}
                                </div>
                                <span className="trello-count">7</span>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Buttons */}
                <DesignSection title="Buttons" icon={MousePointer}>
                    <DesignCard>
                        <div className="flex gap-3 flex-wrap items-center">
                            <button className="btn-primary">Primary</button>
                            <button className="btn-secondary">Secondary</button>
                            <button className="p-2 rounded-lg bg-accent hover:bg-accent/80 transition-colors">
                                <Edit className="h-4 w-4" />
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors">
                                <Edit className="h-3 w-3" /> Editar
                            </button>
                            <button className="w-7 h-7 rounded bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30 transition-colors">
                                <Plus className="h-4 w-4" />
                            </button>
                            <button className="px-2 py-1 bg-accent rounded text-xs font-medium hover:bg-accent/80 transition-colors">
                                → Task
                            </button>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* URL Items */}
                <DesignSection title="URL Items" icon={Link}>
                    <DesignCard>
                        <div className="space-y-2 max-w-xs">
                            <a href="#" className="url-item" onClick={(e) => e.preventDefault()}>
                                <div className="url-item-icon prod">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <div className="url-item-text">
                                    <div className="url-item-label">Prod</div>
                                    <div className="url-item-url">https://example.com</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                            <a href="#" className="url-item" onClick={(e) => e.preventDefault()}>
                                <div className="url-item-icon staging">
                                    <FlaskConical className="h-4 w-4" />
                                </div>
                                <div className="url-item-text">
                                    <div className="url-item-label">Staging</div>
                                    <div className="url-item-url">https://staging.example.com</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                            <a href="#" className="url-item" onClick={(e) => e.preventDefault()}>
                                <div className="url-item-icon local">
                                    <Laptop className="h-4 w-4" />
                                </div>
                                <div className="url-item-text">
                                    <div className="url-item-label">Local</div>
                                    <div className="url-item-url">http://localhost:3000</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                            <a href="#" className="url-item" onClick={(e) => e.preventDefault()}>
                                <div className="url-item-icon repo">
                                    <GitBranch className="h-4 w-4" />
                                </div>
                                <div className="url-item-text">
                                    <div className="url-item-label">Repo</div>
                                    <div className="url-item-url">github.com/user/repo</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </a>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* TODO Items */}
                <DesignSection title="TODO Items" icon={CheckSquare}>
                    <DesignCard>
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder="Escribe una nota..."
                                    className="flex-1 bg-accent border border-border rounded-lg px-3 py-2 text-sm"
                                />
                                <button className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
                                    <div className="w-4 h-4 rounded border-2 border-primary" />
                                    <span className="flex-1 text-xs">Revisar diseno del dashboard</span>
                                    <span className="text-[9px] text-muted-foreground">12 dic</span>
                                    <button className="text-[10px] px-1.5 py-0.5 bg-accent rounded">→</button>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg opacity-60">
                                    <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                                        <Check className="h-2.5 w-2.5 text-white" />
                                    </div>
                                    <span className="flex-1 text-xs line-through">Aprobar colores del tema</span>
                                    <span className="text-[9px] text-muted-foreground">08 dic</span>
                                </div>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Activity Items */}
                <DesignSection title="Activity Items" icon={Clock}>
                    <DesignCard>
                        <div className="space-y-2 max-w-xs">
                            <div className="flex items-start gap-2 p-2 bg-accent/50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium">Tarea completada</div>
                                    <div className="text-[9px] text-muted-foreground">Hace 2h</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-accent/50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                                    <GitBranch className="h-3 w-3 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium">Nuevo commit</div>
                                    <div className="text-[9px] text-muted-foreground">Hace 5h</div>
                                </div>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Form Elements */}
                <DesignSection title="Form Elements" icon={FormInput}>
                    <DesignCard>
                        <div className="grid grid-cols-2 gap-4 max-w-lg">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1.5">Input Label</label>
                                <input
                                    type="text"
                                    defaultValue="Input value"
                                    className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-muted-foreground mb-1.5">Select</label>
                                <select className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm">
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs text-muted-foreground mb-1.5">Textarea</label>
                                <textarea
                                    defaultValue="Textarea content"
                                    className="w-full bg-accent border border-border rounded-lg px-3 py-2 text-sm h-16 resize-none"
                                />
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* METRICS ROW - Core Component */}
                <div className="p-5 rounded-xl border border-dashed border-primary bg-gradient-to-br from-primary/10 to-transparent">
                    <DesignSection title="METRICS ROW (Core Component)" icon={TrendingUp}>
                        <p className="text-xs text-muted-foreground mb-4">
                            Componente central del sistema. Los cambios en CSS Variables se aplican automaticamente a todo el dashboard.
                        </p>

                        {/* 5 Columns Full Width */}
                        <div className="mb-6">
                            <span className="text-[10px] text-muted-foreground uppercase block mb-2">5 Columns - Full Width</span>
                            <div className="metrics-row">
                                <div className="metric-cell">
                                    <div className="metric-label">Seguidores ✓</div>
                                    <div className="metric-value">1K <span className="secondary">/ 4.2K</span></div>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-label">Impresiones</div>
                                    <div className="metric-value">4.9M</div>
                                    <span className="metric-change positive">
                                        <ArrowUp className="h-3 w-3" /> 334%
                                    </span>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-label">Engagement</div>
                                    <div className="metric-value">4.2%</div>
                                    <span className="metric-change negative">
                                        <ArrowDown className="h-3 w-3" /> 19%
                                    </span>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-label">Engagements</div>
                                    <div className="metric-value">209.2K</div>
                                    <span className="metric-change positive">
                                        <ArrowUp className="h-3 w-3" /> 248%
                                    </span>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-label">Profile Visits</div>
                                    <div className="metric-value">18.2K</div>
                                    <span className="metric-change positive">
                                        <ArrowUp className="h-3 w-3" /> 88%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Compact 3 Columns */}
                        <div>
                            <span className="text-[10px] text-muted-foreground uppercase block mb-2">Compact Variant (3 Columns)</span>
                            <div className="metrics-row compact max-w-md">
                                <div className="metric-cell">
                                    <div className="metric-label">Tareas</div>
                                    <div className="metric-value">24</div>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-label">Completadas</div>
                                    <div className="metric-value">18</div>
                                </div>
                                <div className="metric-cell">
                                    <div className="metric-label">Progreso</div>
                                    <div className="metric-value">75%</div>
                                </div>
                            </div>
                        </div>
                    </DesignSection>
                </div>

                {/* Stat Cards */}
                <DesignSection title="Stat Cards" icon={Activity}>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="stat-card">
                            <div className="stat-icon projects">
                                <Square className="h-5 w-5" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Proyectos Activos</div>
                                <div className="stat-value">5</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon tasks">
                                <Check className="h-5 w-5" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Tareas Completadas</div>
                                <div className="stat-value">127</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon active">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">En Progreso</div>
                                <div className="stat-value">12</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon agents">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Agentes Activos</div>
                                <div className="stat-value">3</div>
                            </div>
                        </div>
                    </div>
                </DesignSection>

                {/* CSS Variables Reference */}
                <DesignSection title="CSS Variables Reference" icon={Palette}>
                    <DesignCard>
                        <div className="grid grid-cols-2 gap-6 text-xs font-mono">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Colors</h4>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#f6921d]" />
                                        <span>--solaria-orange: #f6921d</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#22c55e]" />
                                        <span>--color-positive: #22c55e</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#ef4444]" />
                                        <span>--color-negative: #ef4444</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#3b82f6]" />
                                        <span>--color-info: #3b82f6</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#f59e0b]" />
                                        <span>--color-warning: #f59e0b</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm">Metrics</h4>
                                <div className="space-y-1.5 text-muted-foreground">
                                    <div>--metric-card-radius: 12px</div>
                                    <div>--metric-card-padding: 16px</div>
                                    <div>--metric-label-size: 11px</div>
                                    <div>--metric-value-size: 24px</div>
                                    <div>--metric-value-weight: 700</div>
                                </div>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>
            </div>
        </div>
    );
}

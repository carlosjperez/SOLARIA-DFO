import {
    Star,
    Type,
    Tags,
    BarChart,
    Columns3,
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
    Square,
} from 'lucide-react';

function DesignSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Icon className="h-5 w-5 text-solaria-orange" />
                {title}
            </h2>
            {children}
        </div>
    );
}

function DesignCard({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            {title && <h3 className="text-sm font-medium mb-4 text-gray-500">{title}</h3>}
            {children}
        </div>
    );
}

export function DesignHubPage() {
    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Design Hub</h1>
                    <p className="text-gray-500 mt-1">Componentes UI, tipografias y elementos graficos</p>
                </div>
            </div>

            <div className="space-y-8 overflow-y-auto pr-2">
                {/* Brand Identity */}
                <DesignSection title="Brand Identity" icon={Star}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DesignCard title="Logo">
                            <div className="text-center p-5 bg-gray-50 rounded-lg">
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
                                <div className="w-12 h-12 rounded-lg bg-gray-900" title="Dark" />
                                <div className="w-12 h-12 rounded-lg bg-gray-100 border" title="Light" />
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
                            <span className="text-[10px] text-gray-500 uppercase">Font Family</span>
                            <div className="text-2xl font-semibold text-gray-900">Inter</div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-baseline gap-4">
                                <span className="text-3xl font-bold text-gray-900">Heading H1</span>
                                <span className="text-xs text-gray-500">32px / 700</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-2xl font-semibold text-gray-900">Heading H2</span>
                                <span className="text-xs text-gray-500">24px / 600</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-lg font-semibold text-gray-900">Heading H3</span>
                                <span className="text-xs text-gray-500">18px / 600</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-sm font-medium text-gray-700">Body Text</span>
                                <span className="text-xs text-gray-500">14px / 500</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-xs text-gray-500">Small / Muted</span>
                                <span className="text-xs text-gray-500">12px / 400</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-[10px] uppercase font-semibold tracking-wide text-gray-600">LABEL UPPERCASE</span>
                                <span className="text-xs text-gray-500">10px / 600 / Uppercase</span>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Tags */}
                <DesignSection title="Tags / Badges" icon={Tags}>
                    <DesignCard>
                        <div className="mb-4">
                            <span className="text-[10px] text-gray-500 uppercase block mb-2">Project Tags (3 Categories)</span>
                            <div className="flex gap-2 flex-wrap">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">SaaS</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Platform</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">React</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Node.js</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Enterprise</span>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">B2B</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase block mb-2">Phase Badges</span>
                            <div className="flex gap-2 flex-wrap">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500 text-white">Planificacion</span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500 text-white">Desarrollo</span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-500 text-white">Testing</span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white">Produccion</span>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Progress Bars */}
                <DesignSection title="Progress Bars" icon={BarChart}>
                    <DesignCard>
                        <span className="text-[10px] text-gray-500 uppercase block mb-3">Segmented Phase Progress</span>
                        <div className="flex gap-1 mb-2">
                            <div className="h-2 flex-1 rounded-full bg-purple-500" />
                            <div className="h-2 flex-1 rounded-full bg-cyan-500" />
                            <div className="h-2 flex-1 rounded-full bg-teal-500" />
                            <div className="h-2 flex-1 rounded-full bg-gray-200" />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span className="text-purple-600 font-medium">Planificacion</span>
                            <span className="text-cyan-600 font-medium">Desarrollo</span>
                            <span className="text-teal-600 font-medium">Testing</span>
                            <span>Produccion</span>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Mini Trello */}
                <DesignSection title="Mini Trello (Equalizer)" icon={Columns3}>
                    <DesignCard>
                        <div className="flex gap-4 max-w-md">
                            {/* Backlog */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-medium text-gray-500 mb-2">BL</span>
                                <div className="flex flex-col gap-0.5">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-6 h-1.5 rounded ${i < 3 ? 'bg-gray-500' : 'bg-gray-200'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-gray-700 mt-2">3</span>
                            </div>
                            {/* Todo */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-medium text-gray-500 mb-2">TD</span>
                                <div className="flex flex-col gap-0.5">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-6 h-1.5 rounded ${i < 5 ? 'bg-amber-500' : 'bg-gray-200'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-gray-700 mt-2">5</span>
                            </div>
                            {/* Doing */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-medium text-gray-500 mb-2">DO</span>
                                <div className="flex flex-col gap-0.5">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-6 h-1.5 rounded ${i < 2 ? 'bg-blue-500' : 'bg-gray-200'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-gray-700 mt-2">2</span>
                            </div>
                            {/* Done */}
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] font-medium text-gray-500 mb-2">DN</span>
                                <div className="flex flex-col gap-0.5">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-6 h-1.5 rounded ${i < 7 ? 'bg-green-500' : 'bg-gray-200'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-medium text-gray-700 mt-2">7</span>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Buttons */}
                <DesignSection title="Buttons" icon={MousePointer}>
                    <DesignCard>
                        <div className="flex gap-3 flex-wrap items-center">
                            <button className="px-4 py-2 bg-solaria-orange text-white font-medium rounded-lg hover:bg-solaria-orange/90 transition-colors">Primary</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">Secondary</button>
                            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                                <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200 transition-colors">
                                <Edit className="h-3 w-3" /> Editar
                            </button>
                            <button className="w-7 h-7 rounded bg-solaria-orange/20 text-solaria-orange flex items-center justify-center hover:bg-solaria-orange/30 transition-colors">
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* URL Items */}
                <DesignSection title="URL Items" icon={Link}>
                    <DesignCard>
                        <div className="space-y-2 max-w-xs">
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={(e) => e.preventDefault()}>
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Globe className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900">Prod</div>
                                    <div className="text-[10px] text-gray-500 truncate">https://example.com</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                            </a>
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={(e) => e.preventDefault()}>
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <FlaskConical className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900">Staging</div>
                                    <div className="text-[10px] text-gray-500 truncate">https://staging.example.com</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                            </a>
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={(e) => e.preventDefault()}>
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Laptop className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900">Local</div>
                                    <div className="text-[10px] text-gray-500 truncate">http://localhost:3000</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-gray-400" />
                            </a>
                            <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors" onClick={(e) => e.preventDefault()}>
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <GitBranch className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900">Repo</div>
                                    <div className="text-[10px] text-gray-500 truncate">github.com/user/repo</div>
                                </div>
                                <ExternalLink className="h-3 w-3 text-gray-400" />
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
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-solaria-orange focus:ring-1 focus:ring-solaria-orange outline-none"
                                />
                                <button className="w-8 h-8 rounded-lg bg-solaria-orange/20 text-solaria-orange flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                    <div className="w-4 h-4 rounded border-2 border-solaria-orange" />
                                    <span className="flex-1 text-xs text-gray-700">Revisar diseno del dashboard</span>
                                    <span className="text-[9px] text-gray-400">12 dic</span>
                                    <button className="text-[10px] px-1.5 py-0.5 bg-white rounded border border-gray-200">→</button>
                                </div>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg opacity-60">
                                    <div className="w-4 h-4 rounded bg-solaria-orange flex items-center justify-center">
                                        <Check className="h-2.5 w-2.5 text-white" />
                                    </div>
                                    <span className="flex-1 text-xs line-through text-gray-500">Aprobar colores del tema</span>
                                    <span className="text-[9px] text-gray-400">08 dic</span>
                                </div>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Activity Items */}
                <DesignSection title="Activity Items" icon={Clock}>
                    <DesignCard>
                        <div className="space-y-2 max-w-xs">
                            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900">Tarea completada</div>
                                    <div className="text-[9px] text-gray-400">Hace 2h</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <GitBranch className="h-3 w-3 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-medium text-gray-900">Nuevo commit</div>
                                    <div className="text-[9px] text-gray-400">Hace 5h</div>
                                </div>
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* Form Elements */}
                <DesignSection title="Form Elements" icon={FormInput}>
                    <DesignCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Input Label</label>
                                <input
                                    type="text"
                                    defaultValue="Input value"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-solaria-orange focus:ring-1 focus:ring-solaria-orange outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Select</label>
                                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-solaria-orange focus:ring-1 focus:ring-solaria-orange outline-none">
                                    <option>Option 1</option>
                                    <option>Option 2</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 mb-1.5">Textarea</label>
                                <textarea
                                    defaultValue="Textarea content"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none focus:border-solaria-orange focus:ring-1 focus:ring-solaria-orange outline-none"
                                />
                            </div>
                        </div>
                    </DesignCard>
                </DesignSection>

                {/* METRICS ROW - Core Component */}
                <div className="p-5 rounded-xl border-2 border-dashed border-solaria-orange bg-gradient-to-br from-solaria-orange/10 to-transparent">
                    <DesignSection title="METRICS ROW (Core Component)" icon={TrendingUp}>
                        <p className="text-xs text-gray-500 mb-4">
                            Componente central del sistema. Los cambios en CSS Variables se aplican automaticamente a todo el dashboard.
                        </p>

                        {/* 5 Columns Full Width */}
                        <div className="mb-6">
                            <span className="text-[10px] text-gray-500 uppercase block mb-2">5 Columns - Full Width</span>
                            <div className="grid grid-cols-5 gap-2 bg-white rounded-xl p-4 border border-gray-200">
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Seguidores</div>
                                    <div className="text-xl font-bold text-gray-900">1K <span className="text-sm font-normal text-gray-400">/ 4.2K</span></div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Impresiones</div>
                                    <div className="text-xl font-bold text-gray-900">4.9M</div>
                                    <span className="inline-flex items-center text-xs text-green-600">
                                        <ArrowUp className="h-3 w-3" /> 334%
                                    </span>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Engagement</div>
                                    <div className="text-xl font-bold text-gray-900">4.2%</div>
                                    <span className="inline-flex items-center text-xs text-red-600">
                                        <ArrowDown className="h-3 w-3" /> 19%
                                    </span>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Engagements</div>
                                    <div className="text-xl font-bold text-gray-900">209.2K</div>
                                    <span className="inline-flex items-center text-xs text-green-600">
                                        <ArrowUp className="h-3 w-3" /> 248%
                                    </span>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Profile Visits</div>
                                    <div className="text-xl font-bold text-gray-900">18.2K</div>
                                    <span className="inline-flex items-center text-xs text-green-600">
                                        <ArrowUp className="h-3 w-3" /> 88%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Compact 3 Columns */}
                        <div>
                            <span className="text-[10px] text-gray-500 uppercase block mb-2">Compact Variant (3 Columns)</span>
                            <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-4 border border-gray-200 max-w-md">
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Tareas</div>
                                    <div className="text-xl font-bold text-gray-900">24</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Completadas</div>
                                    <div className="text-xl font-bold text-gray-900">18</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 uppercase mb-1">Progreso</div>
                                    <div className="text-xl font-bold text-gray-900">75%</div>
                                </div>
                            </div>
                        </div>
                    </DesignSection>
                </div>

                {/* Stat Cards */}
                <DesignSection title="Stat Cards" icon={Activity}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                                <Square className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="text-xs text-gray-500">Proyectos Activos</div>
                            <div className="text-2xl font-bold text-gray-900">5</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="text-xs text-gray-500">Tareas Completadas</div>
                            <div className="text-2xl font-bold text-gray-900">127</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
                                <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="text-xs text-gray-500">En Progreso</div>
                            <div className="text-2xl font-bold text-gray-900">12</div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <div className="w-10 h-10 rounded-lg bg-solaria-orange/20 flex items-center justify-center mb-3">
                                <Activity className="h-5 w-5 text-solaria-orange" />
                            </div>
                            <div className="text-xs text-gray-500">Agentes Activos</div>
                            <div className="text-2xl font-bold text-gray-900">3</div>
                        </div>
                    </div>
                </DesignSection>

                {/* CSS Variables Reference */}
                <DesignSection title="CSS Variables Reference" icon={Palette}>
                    <DesignCard>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                            <div>
                                <h4 className="font-semibold mb-2 text-sm text-gray-900">Colors</h4>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#f6921d]" />
                                        <span className="text-gray-600">--solaria-orange: #f6921d</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#22c55e]" />
                                        <span className="text-gray-600">--color-positive: #22c55e</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#ef4444]" />
                                        <span className="text-gray-600">--color-negative: #ef4444</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#3b82f6]" />
                                        <span className="text-gray-600">--color-info: #3b82f6</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-[#f59e0b]" />
                                        <span className="text-gray-600">--color-warning: #f59e0b</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2 text-sm text-gray-900">Metrics</h4>
                                <div className="space-y-1.5 text-gray-500">
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

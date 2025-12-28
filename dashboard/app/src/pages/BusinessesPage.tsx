import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    TrendingUp,
    Users,
    DollarSign,
    ArrowUp,
    ArrowDown,
    LayoutGrid,
    List,
    GraduationCap,
    Search,
    Building2,
    BarChart3,
    CircleDot,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface BusinessMetrics {
    mrr: number;
    arr: number;
    clients: number;
    churn: number;
    growth: number;
    ticketPromedio: number;
}

interface Business {
    id: number;
    name: string;
    description: string;
    icon: string;
    status: 'active' | 'growing' | 'paused';
    metrics: BusinessMetrics;
    billing?: {
        nextInvoice: string;
        pendingAmount: number;
    };
}

// Fallback data matching original dashboard
const BUSINESSES_FALLBACK: Business[] = [
    {
        id: 1,
        name: 'Akademate Platform',
        description: 'Plataforma SaaS para academias con 12 tenants activos pagando suscripcion',
        icon: 'graduation-cap',
        status: 'active',
        metrics: {
            mrr: 48000,
            arr: 576000,
            clients: 12,
            churn: 2.5,
            growth: 15,
            ticketPromedio: 4000,
        },
        billing: {
            nextInvoice: '2024-02-01',
            pendingAmount: 12000,
        },
    },
    {
        id: 2,
        name: 'Inscouter',
        description: 'Plataforma de scouting deportivo con suscripciones activas',
        icon: 'search',
        status: 'growing',
        metrics: {
            mrr: 25000,
            arr: 300000,
            clients: 8,
            churn: 1.5,
            growth: 25,
            ticketPromedio: 3125,
        },
    },
    {
        id: 3,
        name: 'NazcaTrade',
        description: 'Sistema de trading algoritmico con licencias enterprise',
        icon: 'chart',
        status: 'active',
        metrics: {
            mrr: 85000,
            arr: 1020000,
            clients: 5,
            churn: 0,
            growth: 8,
            ticketPromedio: 17000,
        },
    },
    {
        id: 4,
        name: 'SOLARIA Agency',
        description: 'Servicios de consultoria y desarrollo web',
        icon: 'building',
        status: 'active',
        metrics: {
            mrr: 35000,
            arr: 420000,
            clients: 15,
            churn: 5,
            growth: 12,
            ticketPromedio: 2333,
        },
    },
];

const iconMap: Record<string, React.ReactNode> = {
    'graduation-cap': <GraduationCap className="h-6 w-6" />,
    'search': <Search className="h-6 w-6" />,
    'chart': <BarChart3 className="h-6 w-6" />,
    'building': <Building2 className="h-6 w-6" />,
};

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 0,
    }).format(value);
}

function MetricsRow({ metrics }: { metrics?: BusinessMetrics }) {
    const m = metrics || { mrr: 0, arr: 0, clients: 0, churn: 0, growth: 0, ticketPromedio: 0 };
    return (
        <div className="metrics-row">
            <div className="metric-cell">
                <div className="metric-label">MRR</div>
                <div className="metric-value">{formatCurrency(m.mrr)}</div>
                <span className={`metric-change ${m.growth > 0 ? 'positive' : 'negative'}`}>
                    {m.growth > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(m.growth)}%
                </span>
            </div>
            <div className="metric-cell">
                <div className="metric-label">ARR</div>
                <div className="metric-value">{formatCurrency(m.arr)}</div>
            </div>
            <div className="metric-cell">
                <div className="metric-label">Clientes</div>
                <div className="metric-value">{m.clients}</div>
            </div>
            <div className="metric-cell">
                <div className="metric-label">Churn</div>
                <div className="metric-value">{m.churn}%</div>
                <span className={`metric-change ${m.churn <= 2 ? 'positive' : 'negative'}`}>
                    {m.churn <= 2 ? 'Saludable' : 'Atención'}
                </span>
            </div>
        </div>
    );
}

function BusinessCard({ business, onClick }: { business: Business; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary transition-all hover:-translate-y-1"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {iconMap[business.icon] || <Briefcase className="h-6 w-6" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">{business.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{business.description}</p>
                    </div>
                </div>
                <span className={`business-status ${business.status}`}>
                    {business.status === 'active' ? 'Activo' : business.status === 'growing' ? 'Creciendo' : 'Pausado'}
                </span>
            </div>

            {/* Metrics */}
            <MetricsRow metrics={business.metrics} />
        </div>
    );
}

export function BusinessesPage() {
    const { businessId: _businessId } = useParams();
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedHealth, setSelectedHealth] = useState<string[]>([]);

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

    // Health calculation helper
    const getHealth = (business: Business): 'healthy' | 'warning' | 'critical' => {
        const { churn, growth } = business.metrics || { churn: 0, growth: 0 };
        if (churn <= 2 && growth > 10) return 'healthy';
        if (churn > 5 || growth < 5) return 'critical';
        return 'warning';
    };

    // Toggle functions
    const toggleStatus = (status: string) => {
        setSelectedStatuses((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        );
    };

    const toggleHealth = (health: string) => {
        setSelectedHealth((prev) =>
            prev.includes(health) ? prev.filter((h) => h !== health) : [...prev, health]
        );
    };

    // Filter businesses
    const filteredBusinesses = businesses.filter((business) => {
        // Search filter
        if (search && search.length >= 3) {
            const searchLower = search.toLowerCase();
            const matchesSearch = (
                business.name.toLowerCase().includes(searchLower) ||
                business.description.toLowerCase().includes(searchLower)
            );
            if (!matchesSearch) return false;
        }

        // Status filter
        if (selectedStatuses.length > 0) {
            if (!selectedStatuses.includes(business.status)) return false;
        }

        // Health filter
        if (selectedHealth.length > 0) {
            const health = getHealth(business);
            if (!selectedHealth.includes(health)) return false;
        }

        return true;
    });

    // Calculate totals (with null checks for API data)
    const totalMRR = filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.mrr || 0), 0);
    const totalClients = filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.clients || 0), 0);
    const avgGrowth = filteredBusinesses.length
        ? Math.round(filteredBusinesses.reduce((sum, b) => sum + (b.metrics?.growth || 0), 0) / filteredBusinesses.length)
        : 0;
    const activeCount = filteredBusinesses.filter((b) => b.status === 'active').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="section-header">
                <div>
                    <h1 className="section-title">Negocios</h1>
                    <p className="section-subtitle">{businesses.length} negocios operativos</p>
                </div>
                <div className="section-actions">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                    >
                        <List className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
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
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Users className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Clientes Totales</div>
                        <div className="stat-value">{totalClients}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon projects">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Crecimiento Prom</div>
                        <div className="stat-value">{avgGrowth}%</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon agents">
                        <CircleDot className="h-5 w-5" />
                    </div>
                    <div className="stat-content">
                        <div className="stat-label">Negocios Activos</div>
                        <div className="stat-value">{activeCount}</div>
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
                            placeholder="Buscar negocios (mínimo 3 caracteres)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'negocio' : 'negocios'}
                    </span>
                </div>

                {/* Status Filters - Responsive Wrap */}
                <div className="flex items-start gap-2 flex-wrap mb-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0 mt-1.5">Estado:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(['active', 'growing', 'paused'] as const).map((status) => {
                            const isSelected = selectedStatuses.includes(status);
                            const count = businesses.filter((b) => b.status === status).length;
                            if (count === 0) return null;
                            const config = {
                                active: { label: 'Activo', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                                growing: { label: 'Creciendo', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
                                paused: { label: 'Pausado', color: '#64748b', bg: 'rgba(100, 116, 139, 0.15)' },
                            }[status];
                            return (
                                <button
                                    key={status}
                                    onClick={() => toggleStatus(status)}
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

                {/* Health Filters - Responsive Wrap */}
                <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-shrink-0 mt-1.5">Salud:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(['healthy', 'warning', 'critical'] as const).map((health) => {
                            const isSelected = selectedHealth.includes(health);
                            const count = businesses.filter((b) => getHealth(b) === health).length;
                            if (count === 0) return null;
                            const config = {
                                healthy: { label: '🟢 Saludable', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                                warning: { label: '🟡 Advertencia', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                                critical: { label: '🔴 Crítico', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
                            }[health];
                            return (
                                <button
                                    key={health}
                                    onClick={() => toggleHealth(health)}
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

            {/* Business Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                    {filteredBusinesses.map((business) => (
                        <BusinessCard
                            key={business.id}
                            business={business}
                            onClick={() => navigate(`/businesses/${business.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredBusinesses.map((business) => (
                        <div
                            key={business.id}
                            onClick={() => navigate(`/businesses/${business.id}`)}
                            className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary transition-all"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                {iconMap[business.icon] || <Briefcase className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">{business.name}</h3>
                                <p className="text-xs text-muted-foreground">{business.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-bold text-primary">{formatCurrency(business.metrics?.mrr || 0)}</div>
                                <div className="text-xs text-muted-foreground">MRR</div>
                            </div>
                            <span className={`business-status ${business.status}`}>
                                {business.status === 'active' ? 'Activo' : business.status === 'growing' ? 'Creciendo' : 'Pausado'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

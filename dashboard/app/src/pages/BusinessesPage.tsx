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

    // Calculate totals (with null checks for API data)
    const totalMRR = businesses.reduce((sum, b) => sum + (b.metrics?.mrr || 0), 0);
    const totalClients = businesses.reduce((sum, b) => sum + (b.metrics?.clients || 0), 0);
    const avgGrowth = businesses.length
        ? Math.round(businesses.reduce((sum, b) => sum + (b.metrics?.growth || 0), 0) / businesses.length)
        : 0;
    const activeCount = businesses.filter((b) => b.status === 'active').length;

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

            {/* Business Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4">
                    {businesses.map((business) => (
                        <BusinessCard
                            key={business.id}
                            business={business}
                            onClick={() => navigate(`/businesses/${business.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {businesses.map((business) => (
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

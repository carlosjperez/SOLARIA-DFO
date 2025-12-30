import { useState } from 'react';
import {
    Server,
    Network,
    Cloud,
    Key,
    Database,
    Terminal,
    Copy,
    CheckCircle,
    XCircle,
    Clock,
    Globe,
    Shield,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatsGrid } from '@/components/common/StatsGrid';
import { StatCard } from '@/components/common/StatCard';
import { SearchInput } from '@/components/common/SearchInput';
import { ItemCounter } from '@/components/common/ItemCounter';
import { FilterGroup } from '@/components/common/FilterGroup';

interface VPSServer {
    id: number;
    name: string;
    provider: string;
    ip: string;
    specs: string;
    status: 'online' | 'offline' | 'maintenance';
    services: string[];
}

interface NemesisDevice {
    id: number;
    name: string;
    ip: string;
    type: string;
    status: 'active' | 'inactive';
}

interface CloudflareDomain {
    id: number;
    domain: string;
    status: 'active' | 'pending';
    ssl: boolean;
}

interface SSHKey {
    id: number;
    name: string;
    type: string;
    fingerprint: string;
}

interface DatabaseInfo {
    id: number;
    name: string;
    type: string;
    size: string;
}

// Infrastructure data matching original dashboard
const INFRASTRUCTURE_DATA = {
    vps: [
        {
            id: 1,
            name: 'SOLARIA Production',
            provider: 'Hetzner',
            ip: '46.62.222.138',
            specs: '4 vCPU, 8GB RAM, 160GB SSD',
            status: 'online' as const,
            services: ['Apache', 'PHP 8.4', 'MariaDB', 'Node.js'],
        },
        {
            id: 2,
            name: 'NEMESIS Server',
            provider: 'Hostinger',
            ip: '148.230.118.124',
            specs: '2 vCPU, 4GB RAM, 100GB SSD',
            status: 'online' as const,
            services: ['Docker', 'PM2', 'Redis'],
        },
    ] as VPSServer[],
    nemesis: [
        { id: 1, name: 'origin-command01', ip: '100.122.193.83', type: 'macOS', status: 'active' as const },
        { id: 2, name: 'Mac-Mini-DRAKE', ip: '100.79.246.5', type: 'macOS (M2)', status: 'active' as const },
        { id: 3, name: 'DRAKE-COMMAND01', ip: '100.64.226.80', type: 'Linux', status: 'active' as const },
        { id: 4, name: 'iPad-Drake-Command', ip: '100.87.12.24', type: 'iOS', status: 'active' as const },
        { id: 5, name: 'iPhone-400i', ip: '100.112.92.21', type: 'iOS', status: 'active' as const },
    ] as NemesisDevice[],
    cloudflare: [
        { id: 1, domain: 'solaria.agency', status: 'active' as const, ssl: true },
        { id: 2, domain: 'dfo.solaria.agency', status: 'active' as const, ssl: true },
        { id: 3, domain: 'akademate.com', status: 'active' as const, ssl: true },
    ] as CloudflareDomain[],
    sshKeys: [
        { id: 1, name: 'nemesis_cmdr_key', type: 'Ed25519', fingerprint: 'SHA256:Gx7...' },
        { id: 2, name: 'id_ed25519', type: 'Ed25519', fingerprint: 'SHA256:Hy8...' },
        { id: 3, name: 'id_solaria_hetzner_prod', type: 'Ed25519', fingerprint: 'SHA256:Kz9...' },
    ] as SSHKey[],
    databases: [
        { id: 1, name: 'solaria_construction', type: 'MariaDB', size: '156 MB' },
        { id: 2, name: 'akademate_prod', type: 'PostgreSQL', size: '2.4 GB' },
        { id: 3, name: 'cache_redis', type: 'Redis', size: '128 MB' },
    ] as DatabaseInfo[],
};

function StatusBadge({ status }: { status: 'online' | 'offline' | 'maintenance' | 'active' | 'inactive' | 'pending' }) {
    const config = {
        online: { color: 'text-green-400 bg-green-400/20', icon: CheckCircle, label: 'Online' },
        active: { color: 'text-green-400 bg-green-400/20', icon: CheckCircle, label: 'Activo' },
        offline: { color: 'text-red-400 bg-red-400/20', icon: XCircle, label: 'Offline' },
        inactive: { color: 'text-gray-400 bg-gray-400/20', icon: XCircle, label: 'Inactivo' },
        maintenance: { color: 'text-yellow-400 bg-yellow-400/20', icon: Clock, label: 'Mantenimiento' },
        pending: { color: 'text-yellow-400 bg-yellow-400/20', icon: Clock, label: 'Pendiente' },
    };
    const { color, icon: Icon, label } = config[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="Copiar"
        >
            {copied ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
            )}
        </button>
    );
}

export function InfrastructurePage() {
    const { vps, nemesis, cloudflare, sshKeys, databases } = INFRASTRUCTURE_DATA;
    const [search, setSearch] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);

    // Toggle functions
    const toggleType = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const toggleStatus = (status: string) => {
        setSelectedStatus((prev) =>
            prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
        );
    };

    const toggleProvider = (provider: string) => {
        setSelectedProviders((prev) =>
            prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
        );
    };

    // Filter logic
    const filteredVPS = vps.filter((item) => {
        if (search && search.length >= 3) {
            const searchLower = search.toLowerCase();
            const matchesSearch = (
                item.name.toLowerCase().includes(searchLower) ||
                item.ip.toLowerCase().includes(searchLower)
            );
            if (!matchesSearch) return false;
        }
        if (selectedTypes.length > 0 && !selectedTypes.includes('vps')) return false;
        if (selectedStatus.length > 0 && !selectedStatus.includes(item.status)) return false;
        if (selectedProviders.length > 0 && !selectedProviders.includes(item.provider.toLowerCase())) return false;
        return true;
    });

    const filteredNemesis = nemesis.filter((item) => {
        if (search && search.length >= 3) {
            const searchLower = search.toLowerCase();
            const matchesSearch = (
                item.name.toLowerCase().includes(searchLower) ||
                item.ip.toLowerCase().includes(searchLower)
            );
            if (!matchesSearch) return false;
        }
        if (selectedTypes.length > 0 && !selectedTypes.includes('nemesis')) return false;
        if (selectedStatus.length > 0 && !selectedStatus.includes(item.status)) return false;
        return true;
    });

    const filteredCloudflare = cloudflare.filter((item) => {
        if (search && search.length >= 3) {
            const searchLower = search.toLowerCase();
            if (!item.domain.toLowerCase().includes(searchLower)) return false;
        }
        if (selectedTypes.length > 0 && !selectedTypes.includes('cloudflare')) return false;
        if (selectedStatus.length > 0 && !selectedStatus.includes(item.status)) return false;
        return true;
    });

    const totalVPS = filteredVPS.length;
    const totalOnline = filteredVPS.filter((v) => v.status === 'online').length;
    const totalNemesis = filteredNemesis.filter((n) => n.status === 'active').length;
    const totalDomains = filteredCloudflare.filter((c) => c.status === 'active').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <PageHeader
                title="Infraestructura"
                subtitle="VPS, SSH, Cloudflare y accesos de gestión"
            />

            {/* Summary Stats */}
            <StatsGrid columns={4} gap="md">
                <StatCard
                    title="VPS Online"
                    value={`${totalOnline}/${totalVPS}`}
                    icon={Server}
                    variant="success"
                />
                <StatCard
                    title="NEMESIS Activos"
                    value={totalNemesis}
                    icon={Network}
                    variant="primary"
                />
                <StatCard
                    title="Dominios CF"
                    value={totalDomains}
                    icon={Cloud}
                    variant="default"
                />
                <StatCard
                    title="Claves SSH"
                    value={sshKeys.length}
                    icon={Key}
                    variant="warning"
                />
            </StatsGrid>

            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center gap-4 mb-4">
                    <SearchInput
                        value={search}
                        onChange={setSearch}
                        placeholder="Buscar por nombre o IP (mínimo 3 caracteres)..."
                        className="flex-1"
                        ariaLabel="Search infrastructure resources"
                    />
                    <ItemCounter
                        count={totalVPS + totalNemesis + totalDomains}
                        singularLabel="recurso"
                        pluralLabel="recursos"
                    />
                </div>

                {/* Type Filters */}
                <FilterGroup title="Tipo">
                    {(['vps', 'nemesis', 'cloudflare'] as const).map((type) => {
                        const isSelected = selectedTypes.includes(type);
                        const counts = {
                            vps: vps.length,
                            nemesis: nemesis.length,
                            cloudflare: cloudflare.length,
                        };
                        const config = {
                            vps: { label: 'VPS', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                            nemesis: { label: 'NEMESIS', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
                            cloudflare: { label: 'Cloudflare', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
                        }[type];
                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className="memory-tag-filter"
                                style={
                                    isSelected
                                        ? { backgroundColor: config.color, color: '#fff' }
                                        : { backgroundColor: config.bg, color: config.color }
                                }
                                aria-pressed={isSelected}
                                aria-label={`Filter by ${config.label}`}
                            >
                                {config.label} ({counts[type]})
                            </button>
                        );
                    })}
                </FilterGroup>

                {/* Status Filters */}
                <FilterGroup title="Estado">
                    {(['online', 'active', 'offline', 'inactive', 'maintenance', 'pending'] as const).map((status) => {
                        const isSelected = selectedStatus.includes(status);
                        const count = [
                            ...vps.filter(v => v.status === status),
                            ...nemesis.filter(n => n.status === status),
                            ...cloudflare.filter(c => c.status === status),
                        ].length;
                        if (count === 0) return null;
                        const config = {
                            online: { label: '🟢 Online', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                            active: { label: '🟢 Activo', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
                            offline: { label: '🔴 Offline', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
                            inactive: { label: '🔴 Inactivo', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
                            maintenance: { label: '🟡 Mantenimiento', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                            pending: { label: '🟡 Pendiente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
                        }[status];
                        return (
                            <button
                                key={status}
                                onClick={() => toggleStatus(status)}
                                className="memory-tag-filter"
                                style={
                                    isSelected
                                        ? { backgroundColor: config.color, color: '#fff' }
                                        : { backgroundColor: config.bg, color: config.color }
                                }
                                aria-pressed={isSelected}
                                aria-label={`Filter by ${config.label}`}
                            >
                                {config.label} ({count})
                            </button>
                        );
                    })}
                </FilterGroup>

                {/* Provider Filters */}
                <FilterGroup title="Proveedor">
                    {(['hetzner', 'hostinger'] as const).map((provider) => {
                        const isSelected = selectedProviders.includes(provider);
                        const count = vps.filter(v => v.provider.toLowerCase() === provider).length;
                        if (count === 0) return null;
                        const config = {
                            hetzner: { label: 'Hetzner', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
                            hostinger: { label: 'Hostinger', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)' },
                        }[provider];
                        return (
                            <button
                                key={provider}
                                onClick={() => toggleProvider(provider)}
                                className="memory-tag-filter"
                                style={
                                    isSelected
                                        ? { backgroundColor: config.color, color: '#fff' }
                                        : { backgroundColor: config.bg, color: config.color }
                                }
                                aria-pressed={isSelected}
                                aria-label={`Filter by ${config.label}`}
                            >
                                {config.label} ({count})
                            </button>
                        );
                    })}
                </FilterGroup>
            </div>

            {/* VPS Servers */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Server className="h-4 w-4 text-green-400" />
                    SERVIDORES VPS
                </h3>
                <div className="space-y-4">
                    {filteredVPS.map((server) => (
                        <div key={server.id} className="bg-accent/30 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium">{server.name}</h4>
                                        <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                                            {server.provider}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{server.specs}</p>
                                </div>
                                <StatusBadge status={server.status} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <code className="font-mono text-primary">{server.ip}</code>
                                    <CopyButton text={`ssh root@${server.ip}`} />
                                </div>
                                <div className="flex gap-1.5">
                                    {server.services.map((service) => (
                                        <span key={service} className="project-tag blue">
                                            {service}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* NEMESIS Network */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Network className="h-4 w-4 text-purple-400" />
                    RED NEMESIS (Tailscale VPN)
                </h3>
                <div className="grid grid-cols-5 gap-3">
                    {filteredNemesis.map((device) => (
                        <div key={device.id} className="bg-accent/30 rounded-lg p-3 text-center">
                            <div className={`w-2 h-2 rounded-full mx-auto mb-2 ${device.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
                            <div className="text-xs font-medium truncate" title={device.name}>
                                {device.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">{device.type}</div>
                            <code className="text-[10px] text-primary font-mono">{device.ip}</code>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Cloudflare Domains */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Cloud className="h-4 w-4 text-blue-400" />
                        CLOUDFLARE DOMINIOS
                    </h3>
                    <div className="space-y-2">
                        {filteredCloudflare.map((domain) => (
                            <div key={domain.id} className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    {domain.ssl && <Shield className="h-4 w-4 text-green-400" />}
                                    <span className="text-sm font-mono">{domain.domain}</span>
                                </div>
                                <StatusBadge status={domain.status} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* SSH Keys */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Key className="h-4 w-4 text-yellow-400" />
                        CLAVES SSH
                    </h3>
                    <div className="space-y-2">
                        {sshKeys.map((key) => (
                            <div key={key.id} className="flex items-center justify-between p-2 bg-accent/30 rounded-lg">
                                <div>
                                    <div className="text-sm font-medium">{key.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{key.fingerprint}</div>
                                </div>
                                <span className="project-tag green">{key.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Databases */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Database className="h-4 w-4 text-cyan-400" />
                    BASES DE DATOS
                </h3>
                <div className="metrics-row">
                    {databases.map((db) => (
                        <div key={db.id} className="metric-cell">
                            <div className="metric-label">{db.type}</div>
                            <div className="metric-value text-base">{db.name}</div>
                            <span className="metric-change neutral">{db.size}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Commands */}
            <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-green-400" />
                    COMANDOS RAPIDOS
                </h3>
                <div className="grid grid-cols-4 gap-2">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('ssh root@46.62.222.138');
                            alert('Copiado!');
                        }}
                        className="btn-secondary text-sm"
                    >
                        <Copy className="h-4 w-4" />
                        SSH SOLARIA
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('ssh root@148.230.118.124');
                            alert('Copiado!');
                        }}
                        className="btn-secondary text-sm"
                    >
                        <Copy className="h-4 w-4" />
                        SSH NEMESIS
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('tailscale status');
                            alert('Copiado!');
                        }}
                        className="btn-secondary text-sm"
                    >
                        <Copy className="h-4 w-4" />
                        Tailscale Status
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText('pm2 status');
                            alert('Copiado!');
                        }}
                        className="btn-secondary text-sm"
                    >
                        <Copy className="h-4 w-4" />
                        PM2 Status
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Lock,
    Bell,
    Palette,
    Globe,
    Shield,
    Users,
    Key,
    Settings,
    Save,
    Camera,
    Eye,
    EyeOff,
    Check,
    ChevronRight,
    AlertCircle,
    Activity,
    Database,
    Server,
    RefreshCw,
    Trash2,
    Plus,
    Edit,
    Search
} from 'lucide-react';

// ============================================
// MOCK DATA
// ============================================

const MOCK_USER = {
    id: 1,
    name: 'Carlos J. Pérez',
    email: 'charlie@solaria.agency',
    phone: '+52 81 1234 5678',
    role: 'ceo',
    avatar: null,
    timezone: 'America/Mexico_City',
    language: 'es',
    created_at: '2024-01-15T10:00:00Z',
};

const MOCK_PREFERENCES = {
    default_view: 'cards',
    sidebar_collapsed: false,
    theme: 'light',
    notifications_enabled: true,
    email_notifications: true,
    sound_enabled: false,
    auto_refresh: true,
    refresh_interval: 30,
};

const MOCK_USERS = [
    { id: 1, name: 'Carlos J. Pérez', email: 'charlie@solaria.agency', role: 'ceo', status: 'active', last_login: '2025-12-26T15:00:00Z' },
    { id: 2, name: 'María González', email: 'maria@solaria.agency', role: 'manager', status: 'active', last_login: '2025-12-26T10:00:00Z' },
    { id: 3, name: 'Roberto Sánchez', email: 'roberto@solaria.agency', role: 'agent', status: 'active', last_login: '2025-12-25T18:00:00Z' },
    { id: 4, name: 'Ana López', email: 'ana@solaria.agency', role: 'viewer', status: 'inactive', last_login: '2025-12-20T12:00:00Z' },
];

const MOCK_ROLES = [
    { code: 'ceo', name: 'CEO', description: 'Acceso completo al sistema', users_count: 1, permissions_count: 29 },
    { code: 'cto', name: 'CTO', description: 'Acceso técnico completo', users_count: 0, permissions_count: 28 },
    { code: 'coo', name: 'COO', description: 'Operaciones y gestión', users_count: 0, permissions_count: 22 },
    { code: 'cfo', name: 'CFO', description: 'Finanzas y reportes', users_count: 0, permissions_count: 18 },
    { code: 'admin', name: 'Admin', description: 'Administrador del sistema', users_count: 0, permissions_count: 29 },
    { code: 'manager', name: 'Manager', description: 'Gestión de equipos', users_count: 1, permissions_count: 20 },
    { code: 'agent', name: 'Agent', description: 'Trabajo en tareas asignadas', users_count: 1, permissions_count: 8 },
    { code: 'viewer', name: 'Viewer', description: 'Solo lectura', users_count: 1, permissions_count: 10 },
];

const MOCK_PERMISSIONS = [
    { category: 'projects', permissions: ['projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.manage_team'] },
    { category: 'clients', permissions: ['clients.view', 'clients.create', 'clients.edit', 'clients.delete'] },
    { category: 'tasks', permissions: ['tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete', 'tasks.assign'] },
    { category: 'agents', permissions: ['agents.view', 'agents.manage'] },
    { category: 'analytics', permissions: ['analytics.view', 'analytics.export'] },
    { category: 'reports', permissions: ['reports.view', 'reports.create', 'reports.export'] },
    { category: 'payments', permissions: ['payments.view', 'payments.create', 'payments.edit'] },
    { category: 'settings', permissions: ['settings.view', 'settings.edit'] },
    { category: 'admin', permissions: ['admin.users', 'admin.roles', 'admin.system'] },
];

const MOCK_SYSTEM_INFO = {
    version: '3.5.0',
    environment: 'production',
    database: {
        status: 'connected',
        type: 'MariaDB',
        version: '11.4',
        connections: 5,
    },
    api: {
        status: 'healthy',
        uptime: '99.9%',
        requests_today: 12450,
    },
    storage: {
        used: '2.3 GB',
        total: '50 GB',
        percentage: 4.6,
    },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function formatRelativeDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    if (diffDays < 7) return `hace ${diffDays}d`;
    return formatDate(dateStr);
}

// ============================================
// SUB-COMPONENTS
// ============================================

function RoleBadge({ role }: { role: string }) {
    const config: Record<string, { label: string; className: string }> = {
        ceo: { label: 'CEO', className: 'bg-purple-100 text-purple-700' },
        cto: { label: 'CTO', className: 'bg-blue-100 text-blue-700' },
        coo: { label: 'COO', className: 'bg-green-100 text-green-700' },
        cfo: { label: 'CFO', className: 'bg-yellow-100 text-yellow-700' },
        admin: { label: 'Admin', className: 'bg-red-100 text-red-700' },
        manager: { label: 'Manager', className: 'bg-orange-100 text-orange-700' },
        agent: { label: 'Agent', className: 'bg-gray-100 text-gray-700' },
        viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-600' },
    };

    const { label, className } = config[role] || config.viewer;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
            status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
            {status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
    );
}

type SectionType = 'profile' | 'preferences' | 'security' | 'users' | 'roles' | 'system';

interface NavItemProps {
    active: boolean;
    onClick: () => void;
    icon: typeof User;
    label: string;
    description: string;
    adminOnly?: boolean;
}

function NavItem({ active, onClick, icon: Icon, label, description, adminOnly }: NavItemProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                active
                    ? 'bg-solaria-orange/10 border border-solaria-orange/20'
                    : 'hover:bg-gray-50'
            }`}
        >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                active ? 'bg-solaria-orange text-white' : 'bg-gray-100 text-gray-600'
            }`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`font-medium ${active ? 'text-solaria-orange' : 'text-gray-900'}`}>
                    {label}
                    {adminOnly && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">Admin</span>
                    )}
                </p>
                <p className="text-xs text-gray-500 truncate">{description}</p>
            </div>
            <ChevronRight className={`h-4 w-4 ${active ? 'text-solaria-orange' : 'text-gray-400'}`} />
        </button>
    );
}

// ============================================
// SECTION COMPONENTS
// ============================================

function ProfileSection({ user }: { user: typeof MOCK_USER }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Perfil</h2>
                <p className="text-sm text-gray-500">Administra tu información personal</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="relative">
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/10 flex items-center justify-center">
                        <User className="h-12 w-12 text-solaria-orange" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 h-8 w-8 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
                        <Camera className="h-4 w-4 text-gray-600" />
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-500">{user.email}</p>
                    <RoleBadge role={user.role} />
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                defaultValue={user.name}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="email"
                                defaultValue={user.email}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="tel"
                                defaultValue={user.phone}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <select
                                defaultValue={user.timezone}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange appearance-none"
                            >
                                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                                <option value="America/Monterrey">Monterrey (GMT-6)</option>
                                <option value="America/Cancun">Cancún (GMT-5)</option>
                                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                        <Save className="h-4 w-4" />
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-400" />
                    Cambiar Contraseña
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        <Lock className="h-4 w-4" />
                        Actualizar Contraseña
                    </button>
                </div>
            </div>
        </div>
    );
}

function PreferencesSection({ preferences }: { preferences: typeof MOCK_PREFERENCES }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Preferencias</h2>
                <p className="text-sm text-gray-500">Personaliza tu experiencia</p>
            </div>

            {/* Display */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Palette className="h-5 w-5 text-gray-400" />
                    Visualización
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Tema</label>
                        <div className="grid grid-cols-3 gap-4">
                            {['light', 'dark', 'system'].map((theme) => (
                                <button
                                    key={theme}
                                    className={`p-4 rounded-lg border-2 transition-colors ${
                                        preferences.theme === theme
                                            ? 'border-solaria-orange bg-solaria-orange/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className={`h-8 w-full rounded mb-2 ${
                                        theme === 'light' ? 'bg-white border' :
                                        theme === 'dark' ? 'bg-gray-900' :
                                        'bg-gradient-to-r from-white to-gray-900'
                                    }`} />
                                    <p className="text-sm font-medium capitalize">{theme === 'system' ? 'Sistema' : theme === 'light' ? 'Claro' : 'Oscuro'}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Vista Predeterminada</label>
                        <div className="flex gap-4">
                            {[
                                { value: 'cards', label: 'Tarjetas' },
                                { value: 'list', label: 'Lista' },
                                { value: 'kanban', label: 'Kanban' },
                            ].map((view) => (
                                <label key={view.value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="default_view"
                                        value={view.value}
                                        defaultChecked={preferences.default_view === view.value}
                                        className="text-solaria-orange focus:ring-solaria-orange"
                                    />
                                    <span className="text-sm text-gray-700">{view.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Sidebar Colapsado</p>
                            <p className="text-sm text-gray-500">Iniciar con el menú lateral minimizado</p>
                        </div>
                        <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                preferences.sidebar_collapsed ? 'bg-solaria-orange' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    preferences.sidebar_collapsed ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-gray-400" />
                    Notificaciones
                </h3>

                <div className="space-y-4">
                    {[
                        { key: 'notifications_enabled', label: 'Notificaciones Push', desc: 'Recibir notificaciones en el navegador', value: preferences.notifications_enabled },
                        { key: 'email_notifications', label: 'Notificaciones por Email', desc: 'Recibir resúmenes y alertas por email', value: preferences.email_notifications },
                        { key: 'sound_enabled', label: 'Sonidos', desc: 'Reproducir sonido al recibir notificaciones', value: preferences.sound_enabled },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <button
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    item.value ? 'bg-solaria-orange' : 'bg-gray-200'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        item.value ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Auto-refresh */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-gray-400" />
                    Auto-Actualización
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Actualización Automática</p>
                            <p className="text-sm text-gray-500">Actualizar datos automáticamente</p>
                        </div>
                        <button
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                preferences.auto_refresh ? 'bg-solaria-orange' : 'bg-gray-200'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    preferences.auto_refresh ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo de Actualización</label>
                        <select
                            defaultValue={preferences.refresh_interval}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                        >
                            <option value="15">15 segundos</option>
                            <option value="30">30 segundos</option>
                            <option value="60">1 minuto</option>
                            <option value="300">5 minutos</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="pt-4">
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                    <Save className="h-4 w-4" />
                    Guardar Preferencias
                </button>
            </div>
        </div>
    );
}

function SecuritySection() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
                <p className="text-sm text-gray-500">Configura opciones de seguridad de tu cuenta</p>
            </div>

            {/* Two-Factor Auth */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Autenticación de Dos Factores</h3>
                            <p className="text-sm text-gray-500">Añade una capa extra de seguridad</p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                        No configurado
                    </span>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                    <Key className="h-4 w-4" />
                    Configurar 2FA
                </button>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-semibold text-gray-900">Sesiones Activas</h3>
                <div className="space-y-4">
                    {[
                        { device: 'MacBook Pro - Chrome', location: 'Monterrey, MX', current: true, lastActive: 'Ahora' },
                        { device: 'iPhone 15 - Safari', location: 'Monterrey, MX', current: false, lastActive: 'hace 2h' },
                    ].map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900 flex items-center gap-2">
                                    {session.device}
                                    {session.current && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">Actual</span>
                                    )}
                                </p>
                                <p className="text-sm text-gray-500">{session.location} · {session.lastActive}</p>
                            </div>
                            {!session.current && (
                                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                    Cerrar Sesión
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Cerrar Todas las Otras Sesiones
                </button>
            </div>

            {/* Activity Log */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <h3 className="font-semibold text-gray-900">Actividad Reciente</h3>
                <div className="space-y-3">
                    {[
                        { action: 'Inicio de sesión exitoso', time: 'hace 5 min', ip: '192.168.1.1' },
                        { action: 'Cambio de contraseña', time: 'hace 3 días', ip: '192.168.1.1' },
                        { action: 'Inicio de sesión exitoso', time: 'hace 5 días', ip: '192.168.1.100' },
                    ].map((log, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="text-sm text-gray-900">{log.action}</p>
                                <p className="text-xs text-gray-500">IP: {log.ip}</p>
                            </div>
                            <span className="text-xs text-gray-500">{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function UsersSection({ users }: { users: typeof MOCK_USERS }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Usuarios</h2>
                    <p className="text-sm text-gray-500">Gestiona los usuarios del sistema</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                    <Plus className="h-4 w-4" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-solaria-orange/20 focus:border-solaria-orange"
                />
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-solaria-orange/20 to-solaria-orange/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-solaria-orange" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="px-4 py-4">
                                    <StatusBadge status={user.status} />
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-gray-600">{formatRelativeDate(user.last_login)}</span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RolesSection({ roles }: { roles: typeof MOCK_ROLES }) {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Roles y Permisos</h2>
                <p className="text-sm text-gray-500">Configura los permisos de cada rol</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Roles List */}
                <div className="space-y-3">
                    {roles.map((role) => (
                        <button
                            key={role.code}
                            onClick={() => setSelectedRole(role.code)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                                selectedRole === role.code
                                    ? 'border-solaria-orange bg-solaria-orange/5'
                                    : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <RoleBadge role={role.code} />
                                <span className="text-xs text-gray-500">{role.users_count} usuarios</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{role.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{role.permissions_count} permisos</p>
                        </button>
                    ))}
                </div>

                {/* Permissions Panel */}
                <div className="lg:col-span-2">
                    {selectedRole ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{selectedRole}</h3>
                                    <p className="text-sm text-gray-500">
                                        {roles.find(r => r.code === selectedRole)?.description}
                                    </p>
                                </div>
                                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <Edit className="h-4 w-4" />
                                    Editar
                                </button>
                            </div>

                            <div className="space-y-6">
                                {MOCK_PERMISSIONS.map((category) => (
                                    <div key={category.category}>
                                        <h4 className="text-sm font-medium text-gray-700 uppercase mb-3 capitalize">
                                            {category.category}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {category.permissions.map((permission) => (
                                                <label key={permission} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={Math.random() > 0.3}
                                                        className="rounded text-solaria-orange focus:ring-solaria-orange"
                                                    />
                                                    <span className="text-sm text-gray-700">{permission}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 mt-6 border-t border-gray-200">
                                <button className="inline-flex items-center gap-2 px-4 py-2 bg-solaria-orange text-white rounded-lg text-sm font-medium hover:bg-solaria-orange-dark transition-colors">
                                    <Save className="h-4 w-4" />
                                    Guardar Permisos
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <div className="text-center">
                                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Selecciona un rol para ver sus permisos</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SystemSection({ systemInfo }: { systemInfo: typeof MOCK_SYSTEM_INFO }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Sistema</h2>
                <p className="text-sm text-gray-500">Información y estado del sistema</p>
            </div>

            {/* Version Info */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm">SOLARIA Office CRM</p>
                        <p className="text-3xl font-bold mt-1">v{systemInfo.version}</p>
                        <p className="text-gray-400 mt-2 capitalize">{systemInfo.environment}</p>
                    </div>
                    <div className="text-right">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                            <RefreshCw className="h-4 w-4" />
                            Buscar Actualizaciones
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Database */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Database className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Base de Datos</p>
                            <p className="text-xs text-gray-500">{systemInfo.database.type} {systemInfo.database.version}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Estado</span>
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Conectado
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Conexiones</span>
                            <span className="text-sm font-medium text-gray-900">{systemInfo.database.connections}</span>
                        </div>
                    </div>
                </div>

                {/* API */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Server className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">API</p>
                            <p className="text-xs text-gray-500">REST + MCP</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Estado</span>
                            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Saludable
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Uptime</span>
                            <span className="text-sm font-medium text-gray-900">{systemInfo.api.uptime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Requests Hoy</span>
                            <span className="text-sm font-medium text-gray-900">{systemInfo.api.requests_today.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Storage */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Almacenamiento</p>
                            <p className="text-xs text-gray-500">{systemInfo.storage.used} de {systemInfo.storage.total}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-purple-500"
                                style={{ width: `${systemInfo.storage.percentage}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-right">{systemInfo.storage.percentage}% usado</p>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Zona de Peligro
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                        <div>
                            <p className="font-medium text-gray-900">Limpiar Cache</p>
                            <p className="text-sm text-gray-500">Eliminar todos los datos en cache del sistema</p>
                        </div>
                        <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                            Limpiar
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                        <div>
                            <p className="font-medium text-gray-900">Resetear Sistema</p>
                            <p className="text-sm text-gray-500">Restaurar configuración a valores por defecto</p>
                        </div>
                        <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                            Resetear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SettingsPage() {
    const [activeSection, setActiveSection] = useState<SectionType>('profile');

    // Mock current user role for admin visibility
    const currentUserRole = MOCK_USER.role;
    const isAdmin = ['ceo', 'cto', 'admin'].includes(currentUserRole);

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
                    <p className="text-gray-500">Administra tu cuenta y preferencias del sistema</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="space-y-2">
                        <NavItem
                            active={activeSection === 'profile'}
                            onClick={() => setActiveSection('profile')}
                            icon={User}
                            label="Perfil"
                            description="Información personal"
                        />
                        <NavItem
                            active={activeSection === 'preferences'}
                            onClick={() => setActiveSection('preferences')}
                            icon={Settings}
                            label="Preferencias"
                            description="Personalización"
                        />
                        <NavItem
                            active={activeSection === 'security'}
                            onClick={() => setActiveSection('security')}
                            icon={Shield}
                            label="Seguridad"
                            description="Contraseña y 2FA"
                        />

                        {isAdmin && (
                            <>
                                <div className="py-2">
                                    <div className="border-t border-gray-200" />
                                    <p className="text-xs font-medium text-gray-400 uppercase mt-4 mb-2 px-3">Administración</p>
                                </div>
                                <NavItem
                                    active={activeSection === 'users'}
                                    onClick={() => setActiveSection('users')}
                                    icon={Users}
                                    label="Usuarios"
                                    description="Gestión de usuarios"
                                    adminOnly
                                />
                                <NavItem
                                    active={activeSection === 'roles'}
                                    onClick={() => setActiveSection('roles')}
                                    icon={Key}
                                    label="Roles"
                                    description="Permisos y accesos"
                                    adminOnly
                                />
                                <NavItem
                                    active={activeSection === 'system'}
                                    onClick={() => setActiveSection('system')}
                                    icon={Server}
                                    label="Sistema"
                                    description="Estado y configuración"
                                    adminOnly
                                />
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {activeSection === 'profile' && <ProfileSection user={MOCK_USER} />}
                        {activeSection === 'preferences' && <PreferencesSection preferences={MOCK_PREFERENCES} />}
                        {activeSection === 'security' && <SecuritySection />}
                        {activeSection === 'users' && isAdmin && <UsersSection users={MOCK_USERS} />}
                        {activeSection === 'roles' && isAdmin && <RolesSection roles={MOCK_ROLES} />}
                        {activeSection === 'system' && isAdmin && <SystemSection systemInfo={MOCK_SYSTEM_INFO} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;

/**
 * SettingsPage
 * User settings, preferences, and admin management
 */

import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { PermissionGate } from '@components/auth/PermissionGate';
import { cn } from '@lib/utils';
import {
    User,
    Lock,
    Bell,
    Palette,
    Globe,
    Shield,
    Users,
    Database,
    Check,
    Save,
    Key,
    Eye,
    EyeOff,
    ChevronRight,
} from 'lucide-react';

// Settings sections
const SETTINGS_SECTIONS = [
    { id: 'profile', name: 'Perfil', icon: User, description: 'Informacion personal y cuenta' },
    { id: 'security', name: 'Seguridad', icon: Lock, description: 'Contrasena y autenticacion' },
    { id: 'notifications', name: 'Notificaciones', icon: Bell, description: 'Preferencias de alertas' },
    { id: 'appearance', name: 'Apariencia', icon: Palette, description: 'Tema y visualizacion' },
    { id: 'language', name: 'Idioma', icon: Globe, description: 'Idioma y region' },
];

const ADMIN_SECTIONS = [
    { id: 'roles', name: 'Roles y Permisos', icon: Shield, description: 'Gestion de accesos' },
    { id: 'users', name: 'Usuarios', icon: Users, description: 'Administrar usuarios' },
    { id: 'system', name: 'Sistema', icon: Database, description: 'Configuracion avanzada' },
];

// Toggle Switch Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                enabled ? 'bg-solaria-orange' : 'bg-gray-200'
            )}
        >
            <span
                className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    enabled ? 'translate-x-6' : 'translate-x-1'
                )}
            />
        </button>
    );
}

// Setting Row Component
function SettingRow({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div>
                <p className="font-medium text-gray-900">{label}</p>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            <div>{children}</div>
        </div>
    );
}

// Profile Settings Section
function ProfileSettings() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        bio: '',
    });

    const handleSave = () => {
        alert('Perfil actualizado');
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Perfil</h3>
                <p className="text-sm text-gray-500">Actualiza tu informacion personal</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-solaria-orange/10">
                    <User className="h-10 w-10 text-solaria-orange" />
                </div>
                <div>
                    <button className="text-sm font-medium text-solaria-orange hover:underline">
                        Cambiar foto
                    </button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG o GIF. Max 2MB.</p>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+52 555 123 4567"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <input
                        type="text"
                        value={user?.role || 'User'}
                        disabled
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Una breve descripcion sobre ti..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                />
            </div>

            <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white hover:bg-solaria-orange-dark"
            >
                <Save className="h-4 w-4" />
                Guardar Cambios
            </button>
        </div>
    );
}

// Security Settings Section
function SecuritySettings() {
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
                <p className="text-sm text-gray-500">Administra tu contrasena y seguridad</p>
            </div>

            {/* Change Password */}
            <div className="rounded-lg border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Key className="h-4 w-4 text-gray-400" />
                    Cambiar Contrasena
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena actual</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contrasena</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contrasena</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                        />
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
                        Actualizar Contrasena
                    </button>
                </div>
            </div>

            {/* Two Factor */}
            <div className="rounded-lg border border-gray-200 p-5">
                <SettingRow
                    label="Autenticacion de dos factores"
                    description="Agrega una capa extra de seguridad a tu cuenta"
                >
                    <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Configurar
                    </button>
                </SettingRow>
            </div>

            {/* Sessions */}
            <div className="rounded-lg border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">Sesiones Activas</h4>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Este dispositivo</p>
                                <p className="text-xs text-gray-500">macOS • Chrome • Mexico City</p>
                            </div>
                        </div>
                        <span className="text-xs text-green-600">Activo ahora</span>
                    </div>
                </div>
                <button className="mt-4 text-sm text-red-600 hover:underline">
                    Cerrar todas las sesiones
                </button>
            </div>
        </div>
    );
}

// Notifications Settings Section
function NotificationSettings() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        taskAssigned: true,
        taskCompleted: true,
        projectUpdates: true,
        weeklyDigest: false,
        marketingEmails: false,
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                <p className="text-sm text-gray-500">Configura tus preferencias de notificacion</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-5 space-y-1">
                <SettingRow label="Notificaciones por email" description="Recibe alertas en tu correo">
                    <Toggle
                        enabled={settings.emailNotifications}
                        onChange={(v) => setSettings({ ...settings, emailNotifications: v })}
                    />
                </SettingRow>
                <SettingRow label="Tarea asignada" description="Cuando te asignan una nueva tarea">
                    <Toggle
                        enabled={settings.taskAssigned}
                        onChange={(v) => setSettings({ ...settings, taskAssigned: v })}
                    />
                </SettingRow>
                <SettingRow label="Tarea completada" description="Cuando una tarea relacionada se completa">
                    <Toggle
                        enabled={settings.taskCompleted}
                        onChange={(v) => setSettings({ ...settings, taskCompleted: v })}
                    />
                </SettingRow>
                <SettingRow label="Actualizaciones de proyecto" description="Cambios importantes en tus proyectos">
                    <Toggle
                        enabled={settings.projectUpdates}
                        onChange={(v) => setSettings({ ...settings, projectUpdates: v })}
                    />
                </SettingRow>
                <SettingRow label="Resumen semanal" description="Reporte de actividad cada lunes">
                    <Toggle
                        enabled={settings.weeklyDigest}
                        onChange={(v) => setSettings({ ...settings, weeklyDigest: v })}
                    />
                </SettingRow>
            </div>
        </div>
    );
}

// Appearance Settings Section
function AppearanceSettings() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
    const [accentColor, setAccentColor] = useState('#f6921d');

    const themes = [
        { id: 'light', name: 'Claro', color: 'bg-white border-2' },
        { id: 'dark', name: 'Oscuro', color: 'bg-gray-900' },
        { id: 'system', name: 'Sistema', color: 'bg-gradient-to-r from-white to-gray-900' },
    ];

    const colors = [
        '#f6921d', // SOLARIA orange
        '#3b82f6', // Blue
        '#10b981', // Green
        '#8b5cf6', // Purple
        '#ef4444', // Red
        '#f59e0b', // Amber
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Apariencia</h3>
                <p className="text-sm text-gray-500">Personaliza la interfaz</p>
            </div>

            {/* Theme */}
            <div className="rounded-lg border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">Tema</h4>
                <div className="flex gap-4">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id as typeof theme)}
                            className={cn(
                                'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all',
                                theme === t.id ? 'border-solaria-orange' : 'border-gray-200 hover:border-gray-300'
                            )}
                        >
                            <div className={cn('w-16 h-10 rounded', t.color, t.id === 'light' && 'border border-gray-200')} />
                            <span className="text-sm font-medium text-gray-700">{t.name}</span>
                            {theme === t.id && (
                                <Check className="h-4 w-4 text-solaria-orange" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Accent Color */}
            <div className="rounded-lg border border-gray-200 p-5">
                <h4 className="font-medium text-gray-900 mb-4">Color de Acento</h4>
                <div className="flex gap-3">
                    {colors.map((color) => (
                        <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={cn(
                                'h-10 w-10 rounded-full transition-transform hover:scale-110',
                                accentColor === color && 'ring-2 ring-offset-2 ring-gray-400'
                            )}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Language Settings Section
function LanguageSettings() {
    const [language, setLanguage] = useState('es');
    const [timezone, setTimezone] = useState('America/Mexico_City');

    const languages = [
        { id: 'es', name: 'Espanol', flag: '🇲🇽' },
        { id: 'en', name: 'English', flag: '🇺🇸' },
        { id: 'pt', name: 'Portugues', flag: '🇧🇷' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Idioma y Region</h3>
                <p className="text-sm text-gray-500">Configura tu idioma y zona horaria</p>
            </div>

            <div className="rounded-lg border border-gray-200 p-5 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                    <div className="grid grid-cols-3 gap-3">
                        {languages.map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => setLanguage(lang.id)}
                                className={cn(
                                    'flex items-center gap-2 rounded-lg border p-3 transition-all',
                                    language === lang.id
                                        ? 'border-solaria-orange bg-solaria-orange/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                )}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className="text-sm font-medium text-gray-700">{lang.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                    <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-solaria-orange focus:outline-none focus:ring-1 focus:ring-solaria-orange"
                    >
                        <option value="America/Mexico_City">Ciudad de Mexico (UTC-6)</option>
                        <option value="America/New_York">Nueva York (UTC-5)</option>
                        <option value="America/Los_Angeles">Los Angeles (UTC-8)</option>
                        <option value="Europe/Madrid">Madrid (UTC+1)</option>
                        <option value="Europe/London">Londres (UTC+0)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

// Roles & Permissions Section (Admin only)
function RolesSettings() {
    const roles = [
        { id: 'admin', name: 'Administrador', users: 2, permissions: 'Acceso completo' },
        { id: 'manager', name: 'Gestor', users: 5, permissions: 'Proyectos, Clientes, Tareas' },
        { id: 'developer', name: 'Desarrollador', users: 8, permissions: 'Tareas asignadas' },
        { id: 'viewer', name: 'Visor', users: 3, permissions: 'Solo lectura' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Roles y Permisos</h3>
                    <p className="text-sm text-gray-500">Administra los niveles de acceso</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white hover:bg-solaria-orange-dark">
                    Nuevo Rol
                </button>
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rol</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Usuarios</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Permisos</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id} className="border-t border-gray-100">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">{role.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">{role.users} usuarios</td>
                                <td className="px-4 py-3 text-sm text-gray-600">{role.permissions}</td>
                                <td className="px-4 py-3 text-right">
                                    <button className="text-sm text-solaria-orange hover:underline">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SettingsPage() {
    const [activeSection, setActiveSection] = useState('profile');

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return <ProfileSettings />;
            case 'security':
                return <SecuritySettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'appearance':
                return <AppearanceSettings />;
            case 'language':
                return <LanguageSettings />;
            case 'roles':
                return <RolesSettings />;
            case 'users':
                return <div className="text-gray-500">Administracion de usuarios (en desarrollo)</div>;
            case 'system':
                return <div className="text-gray-500">Configuracion del sistema (en desarrollo)</div>;
            default:
                return <ProfileSettings />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
                <p className="text-sm text-gray-500">Administra tu cuenta y preferencias</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="space-y-6">
                    {/* User Settings */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Cuenta
                        </h3>
                        <nav className="space-y-1">
                            {SETTINGS_SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                        activeSection === section.id
                                            ? 'bg-solaria-orange/10 text-solaria-orange'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    )}
                                >
                                    <section.icon className="h-4 w-4" />
                                    <span className="flex-1 text-left">{section.name}</span>
                                    <ChevronRight className={cn(
                                        'h-4 w-4 transition-transform',
                                        activeSection === section.id && 'rotate-90'
                                    )} />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Admin Settings */}
                    <PermissionGate permission="admin:access">
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Administracion
                            </h3>
                            <nav className="space-y-1">
                                {ADMIN_SECTIONS.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={cn(
                                            'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                            activeSection === section.id
                                                ? 'bg-solaria-orange/10 text-solaria-orange'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        )}
                                    >
                                        <section.icon className="h-4 w-4" />
                                        <span className="flex-1 text-left">{section.name}</span>
                                        <ChevronRight className={cn(
                                            'h-4 w-4 transition-transform',
                                            activeSection === section.id && 'rotate-90'
                                        )} />
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </PermissionGate>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white p-6">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;

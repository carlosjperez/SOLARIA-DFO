import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, User, Wifi, WifiOff, Settings, ChevronDown, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useDashboardAlerts } from '@/hooks/useApi';
import { useSocketContext } from '@/contexts/SocketContext';
import { cn, formatRelativeTime } from '@/lib/utils';

interface Alert {
    id: number;
    title: string;
    message: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    status: string;
    createdAt: string;
}

export function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useUIStore();
    const { data: alerts } = useDashboardAlerts();
    const { isConnected } = useSocketContext();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const allAlerts = (alerts || []) as Alert[];
    const criticalAlerts = allAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high');
    const alertCount = allAlerts.length;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'medium':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            default:
                return <CheckCircle className="h-4 w-4 text-green-500" />;
        }
    };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
            {/* Left section */}
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">
                    Digital Field Operations
                </h1>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
                {/* Socket connection status */}
                <div
                    className={cn(
                        'flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs',
                        isConnected
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                    )}
                >
                    {isConnected ? (
                        <>
                            <Wifi className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">En vivo</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Offline</span>
                        </>
                    )}
                </div>

                {/* Notifications Dropdown */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn(
                            'relative rounded-lg p-2 transition-colors hover:bg-accent',
                            criticalAlerts.length > 0 && 'text-red-500'
                        )}
                    >
                        <Bell className="h-5 w-5" />
                        {alertCount > 0 && (
                            <span className={cn(
                                'absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white',
                                criticalAlerts.length > 0 ? 'bg-red-500' : 'bg-primary'
                            )}>
                                {alertCount > 9 ? '9+' : alertCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-lg">
                            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                                <span className="font-semibold text-sm">Notificaciones</span>
                                <span className="text-xs text-muted-foreground">{alertCount} alertas</span>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {allAlerts.length > 0 ? (
                                    allAlerts.slice(0, 10).map((alert) => (
                                        <div
                                            key={alert.id}
                                            className="flex gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b border-border last:border-0"
                                        >
                                            {getSeverityIcon(alert.severity)}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{alert.title}</div>
                                                <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                                                <div className="text-[10px] text-muted-foreground mt-1">
                                                    {formatRelativeTime(alert.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                        No hay notificaciones
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="rounded-lg p-2 transition-colors hover:bg-accent"
                    title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                >
                    {theme === 'dark' ? (
                        <Sun className="h-5 w-5" />
                    ) : (
                        <Moon className="h-5 w-5" />
                    )}
                </button>

                {/* User menu dropdown */}
                <div className="relative" ref={userRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 border-l border-border pl-4 ml-2 hover:bg-accent/50 rounded-lg pr-2 py-1 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="text-sm text-left">
                                <div className="font-medium">{user?.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                    {user?.role}
                                </div>
                            </div>
                        </div>
                        <ChevronDown className={cn(
                            'h-4 w-4 text-muted-foreground transition-transform',
                            showUserMenu && 'rotate-180'
                        )} />
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-border">
                                <div className="font-medium text-sm">{user?.name}</div>
                                <div className="text-xs text-muted-foreground">{user?.email}</div>
                            </div>
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        // Navigate to settings when implemented
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                                >
                                    <Settings className="h-4 w-4 text-muted-foreground" />
                                    Configuración
                                </button>
                                <button
                                    onClick={toggleTheme}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                                >
                                    {theme === 'dark' ? (
                                        <Sun className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Moon className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
                                </button>
                            </div>
                            <div className="border-t border-border py-1">
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Cerrar sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

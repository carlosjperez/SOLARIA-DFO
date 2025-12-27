import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, User, Wifi, WifiOff, Settings, ChevronDown, AlertTriangle, Info, CheckCircle, X, Activity, FolderKanban, ListTodo, Brain, Bot, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useDashboardAlerts } from '@/hooks/useApi';
import { useSocketContext } from '@/contexts/SocketContext';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
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
    const { notifications, unreadCount, markAllAsRead, dismissNotification, clearAll } = useNotifications();

    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<'alerts' | 'activity'>('activity');
    const notifRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);

    const handleDismissAlert = (alertId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setDismissedAlerts(prev => new Set([...prev, alertId]));
    };

    const handleClearAllAlerts = () => {
        const allIds = allAlerts.map(a => a.id);
        setDismissedAlerts(new Set(allIds));
    };

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

    const allAlerts = ((alerts || []) as Alert[]).filter(a => !dismissedAlerts.has(a.id));
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

    const getNotificationIcon = (notification: Notification) => {
        const iconClass = "h-4 w-4";
        const actionColors: Record<string, string> = {
            created: 'text-green-500',
            completed: 'text-green-500',
            updated: 'text-blue-500',
            deleted: 'text-red-500',
            status: 'text-yellow-500',
            info: 'text-muted-foreground',
        };
        const colorClass = actionColors[notification.action] || 'text-muted-foreground';

        switch (notification.type) {
            case 'task':
                return <ListTodo className={cn(iconClass, colorClass)} />;
            case 'project':
                return <FolderKanban className={cn(iconClass, colorClass)} />;
            case 'agent':
                return <Bot className={cn(iconClass, colorClass)} />;
            case 'memory':
                return <Brain className={cn(iconClass, colorClass)} />;
            case 'alert':
                return <AlertTriangle className={cn(iconClass, 'text-red-500')} />;
            default:
                return <Zap className={cn(iconClass, colorClass)} />;
        }
    };

    const totalCount = alertCount + unreadCount;

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
                            (criticalAlerts.length > 0 || unreadCount > 0) && 'text-primary'
                        )}
                    >
                        <Bell className="h-5 w-5" />
                        {totalCount > 0 && (
                            <span className={cn(
                                'absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white',
                                criticalAlerts.length > 0 ? 'bg-red-500' : 'bg-primary'
                            )}>
                                {totalCount > 9 ? '9+' : totalCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-96 rounded-xl border border-border bg-card shadow-lg">
                            {/* Tabs */}
                            <div className="flex border-b border-border">
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                        activeTab === 'activity'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <Activity className="h-4 w-4" />
                                    Actividad
                                    {unreadCount > 0 && (
                                        <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('alerts')}
                                    className={cn(
                                        'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                                        activeTab === 'alerts'
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <AlertTriangle className="h-4 w-4" />
                                    Alertas
                                    {alertCount > 0 && (
                                        <span className={cn(
                                            'text-[10px] px-1.5 py-0.5 rounded-full',
                                            criticalAlerts.length > 0
                                                ? 'bg-red-500 text-white'
                                                : 'bg-muted text-muted-foreground'
                                        )}>
                                            {alertCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="max-h-80 overflow-y-auto">
                                {activeTab === 'activity' ? (
                                    <>
                                        {notifications.length > 0 ? (
                                            <>
                                                <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                                                    <span className="text-xs text-muted-foreground">Eventos en tiempo real</span>
                                                    <div className="flex gap-2">
                                                        {unreadCount > 0 && (
                                                            <button
                                                                onClick={markAllAsRead}
                                                                className="text-xs text-primary hover:underline"
                                                            >
                                                                Marcar leídas
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={clearAll}
                                                            className="text-xs text-muted-foreground hover:text-foreground"
                                                        >
                                                            Limpiar
                                                        </button>
                                                    </div>
                                                </div>
                                                {notifications.slice(0, 15).map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={cn(
                                                            'flex gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b border-border last:border-0 group relative transition-colors',
                                                            !notification.read && 'bg-primary/5'
                                                        )}
                                                    >
                                                        <div className="flex-shrink-0 mt-0.5">
                                                            {getNotificationIcon(notification)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-sm truncate">{notification.title}</span>
                                                                {!notification.read && (
                                                                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate">{notification.message}</div>
                                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                                {formatRelativeTime(notification.timestamp.toISOString())}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                dismissNotification(notification.id);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all absolute right-2 top-2"
                                                            title="Descartar"
                                                        >
                                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                                <div className="text-sm text-muted-foreground">Sin actividad reciente</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Los eventos aparecerán aquí en tiempo real
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {allAlerts.length > 0 ? (
                                            <>
                                                <div className="flex items-center justify-between px-4 py-2 bg-muted/30">
                                                    <span className="text-xs text-muted-foreground">{alertCount} alertas activas</span>
                                                    <button
                                                        onClick={handleClearAllAlerts}
                                                        className="text-xs text-muted-foreground hover:text-foreground"
                                                    >
                                                        Descartar todas
                                                    </button>
                                                </div>
                                                {allAlerts.slice(0, 10).map((alert) => (
                                                    <div
                                                        key={alert.id}
                                                        className="flex gap-3 px-4 py-3 hover:bg-accent/50 cursor-pointer border-b border-border last:border-0 group relative"
                                                    >
                                                        {getSeverityIcon(alert.severity)}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm truncate">{alert.title}</div>
                                                            <div className="text-xs text-muted-foreground truncate">{alert.message}</div>
                                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                                {formatRelativeTime(alert.createdAt)}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={(e) => handleDismissAlert(alert.id, e)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-all absolute right-2 top-2"
                                                            title="Descartar"
                                                        >
                                                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-4 py-8 text-center">
                                                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                                <div className="text-sm text-muted-foreground">Sin alertas activas</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Todo está funcionando correctamente
                                                </div>
                                            </div>
                                        )}
                                    </>
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
                                        navigate('/settings');
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

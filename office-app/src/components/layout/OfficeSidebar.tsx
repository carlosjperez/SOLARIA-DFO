import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    Users,
    Bot,
    BarChart3,
    FileText,
    Settings,
    Palette,
    ChevronLeft,
    X,
    UserCircle,
} from 'lucide-react';
import { cn } from '@lib/utils';
import { useUIStore } from '@store/useUIStore';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Mi Panel', href: '/my-dashboard', icon: UserCircle },
    { name: 'Proyectos', href: '/projects', icon: FolderKanban },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Agentes', href: '/agents', icon: Bot },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Reportes', href: '/reports', icon: FileText },
    { name: 'Design Hub', href: '/design-hub', icon: Palette },
];

const secondaryNavigation = [
    { name: 'Configuracion', href: '/settings', icon: Settings },
];

export function OfficeSidebar() {
    const location = useLocation();
    const { sidebarOpen, sidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore();

    const isActive = (href: string) => {
        if (href === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(href);
    };

    // Close mobile sidebar when clicking a link
    const handleLinkClick = () => {
        if (sidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
                    // Mobile: slide in/out
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    // Desktop: always visible, collapse width
                    'lg:translate-x-0',
                    sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
                    // Mobile width
                    'w-64'
                )}
            >
                <nav className="flex flex-col h-full p-4">
                    {/* Mobile close button */}
                    <div className="flex items-center justify-between mb-4 lg:hidden">
                        <span className="text-sm font-semibold text-gray-900">Menu</span>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-1 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Collapse toggle - desktop only */}
                    <div className="hidden lg:flex justify-end mb-2">
                        <button
                            onClick={toggleSidebarCollapsed}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                            title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
                        >
                            <ChevronLeft
                                className={cn(
                                    'h-4 w-4 transition-transform duration-300',
                                    sidebarCollapsed && 'rotate-180'
                                )}
                            />
                        </button>
                    </div>

                    {/* Main navigation */}
                    <div className="flex-1 space-y-1">
                        {navigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                                        active
                                            ? 'bg-solaria-orange/10 text-solaria-orange'
                                            : 'text-gray-700 hover:bg-gray-100',
                                        sidebarCollapsed && 'lg:justify-center lg:px-2'
                                    )}
                                    title={sidebarCollapsed ? item.name : undefined}
                                >
                                    <item.icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-solaria-orange')} />
                                    <span className={cn(sidebarCollapsed && 'lg:hidden')}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Secondary navigation */}
                    <div className="pt-4 border-t border-gray-200 space-y-1">
                        {secondaryNavigation.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={handleLinkClick}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                                        active
                                            ? 'bg-solaria-orange/10 text-solaria-orange'
                                            : 'text-gray-700 hover:bg-gray-100',
                                        sidebarCollapsed && 'lg:justify-center lg:px-2'
                                    )}
                                    title={sidebarCollapsed ? item.name : undefined}
                                >
                                    <item.icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-solaria-orange')} />
                                    <span className={cn(sidebarCollapsed && 'lg:hidden')}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Branding */}
                    <div className={cn(
                        'pt-4 mt-4 border-t border-gray-200',
                        sidebarCollapsed && 'lg:hidden'
                    )}>
                        <div className="px-3 py-2 text-xs text-gray-500">
                            SOLARIA Office v1.0
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
}

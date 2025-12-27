import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FolderKanban,
    Briefcase,
    Server,
    Palette,
    Brain,
    Archive,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
} from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Proyectos', href: '/projects', icon: FolderKanban },
    { name: 'Negocios', href: '/businesses', icon: Briefcase },
    { name: 'Infraestructura', href: '/infrastructure', icon: Server },
    { name: 'Design Hub', href: '/design-hub', icon: Palette },
    { name: 'Memorias', href: '/memories', icon: Brain },
    { name: 'Archivo', href: '/projects/archived', icon: Archive },
];

const externalLinks = [
    {
        name: 'VibeSDK',
        href: 'https://docs.vibe-sdk.com',
        icon: ExternalLink,
        color: 'text-purple-400'
    },
];

export function Sidebar() {
    const { sidebarOpen, toggleSidebar } = useUIStore();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300 flex flex-col',
                sidebarOpen ? 'w-64' : 'w-16'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
                {sidebarOpen ? (
                    <div className="flex items-center gap-3">
                        <img
                            src="/solaria-logo.png"
                            alt="SOLARIA"
                            className="h-9 w-9"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-lg solaria-text-gradient">SOLARIA</span>
                            <span className="text-[10px] text-muted-foreground -mt-1">Digital Field Operations</span>
                        </div>
                    </div>
                ) : (
                    <img
                        src="/solaria-logo.png"
                        alt="S"
                        className="h-8 w-8 mx-auto"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    aria-label={sidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="h-5 w-5" />
                    ) : (
                        <ChevronRight className="h-5 w-5" />
                    )}
                </button>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col gap-1 p-2 flex-1">
                {/* Section Label */}
                {sidebarOpen && (
                    <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                        Navegacion
                    </div>
                )}

                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && <span>{item.name}</span>}
                    </NavLink>
                ))}

                {/* Divider */}
                {sidebarOpen && (
                    <div className="my-2 border-t border-border" />
                )}

                {/* External Links Section */}
                {sidebarOpen && (
                    <div className="px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                        Enlaces
                    </div>
                )}

                {externalLinks.map((item) => (
                    <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                    >
                        <item.icon className={cn('h-5 w-5 flex-shrink-0', item.color)} />
                        {sidebarOpen && (
                            <>
                                <span>{item.name}</span>
                                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                            </>
                        )}
                    </a>
                ))}
            </nav>

            {/* Footer */}
            {sidebarOpen && (
                <div className="p-4 border-t border-border">
                    <div className="rounded-lg bg-accent/50 p-3 text-center">
                        <div className="text-xs text-muted-foreground">
                            <span className="solaria-text-gradient font-semibold">SOLARIA</span>
                            <span> DFO</span>
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">v3.5.1</div>
                    </div>
                </div>
            )}
        </aside>
    );
}

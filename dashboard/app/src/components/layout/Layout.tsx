import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

// Pages that need full viewport (minimal padding)
const FULL_VIEWPORT_ROUTES = ['/tasks', '/projects'];

export function Layout() {
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);
    const location = useLocation();

    // Check if current route needs full viewport
    const isFullViewport = FULL_VIEWPORT_ROUTES.some(
        route => location.pathname === route || location.pathname.startsWith(`${route}/`)
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div
                className={cn(
                    'flex flex-1 flex-col transition-all duration-300',
                    sidebarOpen ? 'ml-64' : 'ml-16'
                )}
            >
                <Header />
                <main
                    className={cn(
                        'main-content flex-1 overflow-auto',
                        isFullViewport ? 'p-3' : 'p-6'
                    )}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

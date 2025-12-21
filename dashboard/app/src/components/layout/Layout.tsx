import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

export function Layout() {
    const sidebarOpen = useUIStore((state) => state.sidebarOpen);

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
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

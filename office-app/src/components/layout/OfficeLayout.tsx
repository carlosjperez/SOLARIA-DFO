import { Outlet } from 'react-router-dom';
import { OfficeHeader } from './OfficeHeader';
import { OfficeSidebar } from './OfficeSidebar';
import { useUIStore } from '@store/useUIStore';
import { cn } from '@lib/utils';

export function OfficeLayout() {
    const { sidebarCollapsed } = useUIStore();

    return (
        <div className="min-h-screen bg-gray-50">
            <OfficeHeader />
            <div className="flex">
                <OfficeSidebar />
                <main
                    className={cn(
                        'flex-1 p-4 sm:p-6 transition-all duration-300',
                        // No margin on mobile (sidebar is overlay)
                        // Margin on desktop based on sidebar state
                        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                    )}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

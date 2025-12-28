import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import VERSION from '@/version';

export function GlobalFooter() {
    const [lastSync, setLastSync] = useState(new Date());
    const { sidebarOpen } = useUIStore();

    useEffect(() => {
        // Update last sync timestamp every minute
        const interval = setInterval(() => {
            setLastSync(new Date());
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <footer className={cn(
            "fixed bottom-0 right-0 h-10 bg-[#1a1a1a] border-t border-border flex items-center justify-between px-6 text-xs text-muted-foreground z-30 transition-all duration-300",
            sidebarOpen ? "left-64" : "left-16"
        )}>
            {/* Left: Live indicator */}
            <div className="flex items-center gap-2">
                <div className="relative flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-green-400 font-medium">En vivo</span>
                </div>
            </div>

            {/* Center: Last sync */}
            <div className="text-center">
                Última sincronización: {formatTime(lastSync)}
            </div>

            {/* Right: Version + Links */}
            <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">
                    {VERSION.full}
                </span>
                <a
                    href="https://docs.solaria.agency"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                >
                    Documentación
                </a>
            </div>
        </footer>
    );
}

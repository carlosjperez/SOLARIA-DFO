import { Bell, Search, User, Menu } from 'lucide-react';
import { useUIStore } from '@store/useUIStore';

export function OfficeHeader() {
    const { toggleSidebar } = useUIStore();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Mobile menu button + Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                        aria-label="Abrir menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <img
                        src="/solaria-logo.png"
                        alt="SOLARIA"
                        className="h-8 w-8"
                    />
                    <span className="text-xl font-semibold text-gray-900 hidden sm:inline">
                        SOLARIA <span className="text-solaria-orange">Office</span>
                    </span>
                    <span className="text-xl font-semibold text-solaria-orange sm:hidden">
                        Office
                    </span>
                </div>

                {/* Search */}
                <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos, clientes..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border border-transparent rounded-lg focus:bg-white focus:border-solaria-orange focus:ring-1 focus:ring-solaria-orange outline-none transition-colors"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded border">
                            K
                        </kbd>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-solaria-orange rounded-full" />
                    </button>
                    <button className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <div className="h-8 w-8 rounded-full bg-solaria-orange flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}

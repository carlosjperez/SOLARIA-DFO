import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'xl';
    showOverlay?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
}

const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

export function Drawer({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    width = 'lg',
    showOverlay = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
}: DrawerProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
        if (!closeOnEscape) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, closeOnEscape]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Focus trap
    useEffect(() => {
        if (isOpen && panelRef.current) {
            panelRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="drawer-container">
            {/* Overlay */}
            {showOverlay && (
                <div
                    className={cn('drawer-overlay', isOpen && 'active')}
                    onClick={closeOnOverlayClick ? onClose : undefined}
                    aria-hidden="true"
                />
            )}

            {/* Panel */}
            <div
                ref={panelRef}
                className={cn('drawer-panel', widthClasses[width], isOpen && 'active')}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'drawer-title' : undefined}
            >
                {/* Header */}
                {(title || subtitle) && (
                    <div className="drawer-header">
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h2 id="drawer-title" className="drawer-title">
                                    {title}
                                </h2>
                            )}
                            {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="drawer-close"
                            aria-label="Cerrar panel"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="drawer-content">{children}</div>
            </div>
        </div>
    );
}

// Simple drawer without header - for custom content
export function DrawerSimple({
    isOpen,
    onClose,
    children,
    width = 'lg',
    showOverlay = true,
    closeOnOverlayClick = true,
}: Omit<DrawerProps, 'title' | 'subtitle' | 'closeOnEscape'>) {
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="drawer-container">
            {showOverlay && (
                <div
                    className={cn('drawer-overlay', isOpen && 'active')}
                    onClick={closeOnOverlayClick ? onClose : undefined}
                    aria-hidden="true"
                />
            )}

            <div
                ref={panelRef}
                className={cn('drawer-panel', widthClasses[width], isOpen && 'active')}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
            >
                {children}
            </div>
        </div>
    );
}

export default Drawer;

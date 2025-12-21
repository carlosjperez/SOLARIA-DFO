import { useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl' | 'max-w-3xl';
    className?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-xl',
    className,
}: ModalProps) {
    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className={cn(
                    'bg-card rounded-2xl border border-border w-full max-h-[90vh] overflow-y-auto',
                    maxWidth,
                    className
                )}
            >
                {/* Header - Solo si hay título */}
                {title && (
                    <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                        <h2 className="text-xl font-bold text-foreground">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {/* Close button for modals without title */}
                {!title && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    );
}

export default Modal;

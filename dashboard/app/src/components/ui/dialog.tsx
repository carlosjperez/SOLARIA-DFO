import { createContext, useContext, useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Context for sharing dialog ID between components
interface DialogContextType {
    dialogId: string;
}

const DialogContext = createContext<DialogContextType | null>(null);

function useDialogContext() {
    return useContext(DialogContext);
}

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

interface DialogContentProps {
    children: ReactNode;
    className?: string;
}

interface DialogHeaderProps {
    children: ReactNode;
    className?: string;
}

interface DialogTitleProps {
    children: ReactNode;
    className?: string;
}

interface DialogDescriptionProps {
    children: ReactNode;
    className?: string;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dialogId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open) {
            dialog.showModal();
            document.body.style.overflow = 'hidden';
        } else {
            dialog.close();
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === dialogRef.current) {
            onOpenChange(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onOpenChange(false);
        }
    };

    // Don't render content when closed to prevent flash of loading states
    if (!open) {
        return null;
    }

    return (
        <DialogContext.Provider value={{ dialogId }}>
            <dialog
                ref={dialogRef}
                onClick={handleBackdropClick}
                onKeyDown={handleKeyDown}
                aria-labelledby={`${dialogId}-title`}
                aria-describedby={`${dialogId}-description`}
                className={cn(
                    'fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-full',
                    'bg-black/80 backdrop:bg-transparent',
                    'p-4 md:p-6 lg:p-8',
                    'flex items-center justify-center',
                    'open:animate-in open:fade-in-0',
                    'overflow-y-auto'
                )}
            >
                {children}
            </dialog>
        </DialogContext.Provider>
    );
}

export function DialogContent({ children, className }: DialogContentProps) {
    return (
        <div
            role="document"
            className={cn(
                'relative w-full max-w-lg max-h-[90vh]',
                'bg-background border border-border rounded-lg shadow-lg',
                'overflow-hidden',
                'animate-in fade-in-0 zoom-in-95',
                className
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {children}
        </div>
    );
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}>
            {children}
        </div>
    );
}

export function DialogTitle({ children, className }: DialogTitleProps) {
    const context = useDialogContext();
    return (
        <h2
            id={context ? `${context.dialogId}-title` : undefined}
            className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        >
            {children}
        </h2>
    );
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
    const context = useDialogContext();
    return (
        <p
            id={context ? `${context.dialogId}-description` : undefined}
            className={cn('text-sm text-muted-foreground', className)}
        >
            {children}
        </p>
    );
}

interface DialogCloseProps {
    onClose: () => void;
    label?: string;
}

export function DialogClose({ onClose, label = 'Cerrar' }: DialogCloseProps) {
    return (
        <button
            onClick={onClose}
            aria-label={label}
            className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70',
                'ring-offset-background transition-opacity',
                'hover:opacity-100',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:pointer-events-none'
            )}
        >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">{label}</span>
        </button>
    );
}

export function DialogBody({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('px-6 pb-6 overflow-y-auto', className)}>
            {children}
        </div>
    );
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('flex justify-end gap-2 p-6 pt-4 border-t border-border', className)}>
            {children}
        </div>
    );
}

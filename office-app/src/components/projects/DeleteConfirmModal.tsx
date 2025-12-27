/**
 * DeleteConfirmModal
 * Confirmation dialog for destructive actions
 */

import { Modal } from '@components/ui/Modal';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    itemName: string;
    isLoading?: boolean;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    itemName,
    isLoading = false,
}: DeleteConfirmModalProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                {/* Warning Icon */}
                <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                </div>

                {/* Message */}
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Esta accion cancelara el proyecto{' '}
                        <span className="font-semibold text-gray-900">"{itemName}"</span>.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        El proyecto sera marcado como cancelado pero no se eliminara permanentemente.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4" />
                                Cancelar Proyecto
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default DeleteConfirmModal;

/**
 * ProjectFormModal
 * Modal form for creating and editing projects
 */

import { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { cn } from '@lib/utils';
import {
    Save,
    Loader2,
    FolderKanban,
    User,
    Calendar,
    DollarSign,
    AlertCircle,
} from 'lucide-react';
import type { Project, ProjectStatus, Priority } from '../../types';
import type { ProjectFormData } from '@hooks/useProjectMutations';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => Promise<void>;
    project?: Project | null;
    isLoading?: boolean;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
    { value: 'planning', label: 'Planificacion' },
    { value: 'development', label: 'En Desarrollo' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployment', label: 'Despliegue' },
    { value: 'completed', label: 'Completado' },
    { value: 'on_hold', label: 'En Pausa' },
    { value: 'blocked', label: 'Bloqueado' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
    { value: 'critical', label: 'Critica', color: 'text-red-600' },
    { value: 'high', label: 'Alta', color: 'text-orange-600' },
    { value: 'medium', label: 'Media', color: 'text-yellow-600' },
    { value: 'low', label: 'Baja', color: 'text-green-600' },
];

const initialFormData: ProjectFormData = {
    name: '',
    code: '',
    description: '',
    client: '',
    status: 'planning',
    priority: 'medium',
    budget: undefined,
    deadline: '',
};

export function ProjectFormModal({
    isOpen,
    onClose,
    onSubmit,
    project,
    isLoading = false,
}: ProjectFormModalProps) {
    const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
    const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

    const isEditing = !!project;

    // Reset form when modal opens/closes or project changes
    useEffect(() => {
        if (isOpen) {
            if (project) {
                setFormData({
                    name: project.name,
                    code: project.code || '',
                    description: project.description || '',
                    client: project.client || '',
                    status: project.status,
                    priority: project.priority,
                    budget: project.budget,
                    deadline: project.deadline?.split('T')[0] || '',
                });
            } else {
                setFormData(initialFormData);
            }
            setErrors({});
        }
    }, [isOpen, project]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'number' ? (value ? Number(value) : undefined) : value,
        }));
        // Clear error on change
        if (errors[name as keyof ProjectFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }

        if (formData.budget !== undefined && formData.budget < 0) {
            newErrors.budget = 'El presupuesto no puede ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error submitting project:', error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & Code Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <FolderKanban className="h-4 w-4 text-gray-400" />
                            Nombre del Proyecto *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej: Website Corporativo 2025"
                            className={cn(
                                'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2',
                                errors.name
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                            )}
                        />
                        {errors.name && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Codigo
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Ej: PROJ-001"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-solaria-orange focus:outline-none focus:ring-2 focus:ring-solaria-orange/20"
                        />
                    </div>
                </div>

                {/* Client */}
                <div>
                    <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <User className="h-4 w-4 text-gray-400" />
                        Cliente
                    </label>
                    <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        placeholder="Ej: ACME Corporation"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-solaria-orange focus:outline-none focus:ring-2 focus:ring-solaria-orange/20"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Descripcion
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Breve descripcion del proyecto..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-solaria-orange focus:outline-none focus:ring-2 focus:ring-solaria-orange/20"
                    />
                </div>

                {/* Status & Priority Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Estado
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-solaria-orange focus:outline-none focus:ring-2 focus:ring-solaria-orange/20"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Prioridad
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-solaria-orange focus:outline-none focus:ring-2 focus:ring-solaria-orange/20"
                        >
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Budget & Deadline Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            Presupuesto (MXN)
                        </label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget || ''}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            step="1000"
                            className={cn(
                                'w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2',
                                errors.budget
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                            )}
                        />
                        {errors.budget && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                                <AlertCircle className="h-3 w-3" />
                                {errors.budget}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            Fecha Limite
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-solaria-orange focus:outline-none focus:ring-2 focus:ring-solaria-orange/20"
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-solaria-orange-dark disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                {isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default ProjectFormModal;

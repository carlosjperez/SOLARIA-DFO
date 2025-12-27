/**
 * ClientForm Component
 * Form for creating/editing clients with Zod validation
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Mail, Phone, Globe, MapPin, FileText, Loader2 } from 'lucide-react';
import { cn } from '@lib/utils';
import type { OfficeClient } from '@lib/api';
import type { ClientStatus } from '@store/useClientsStore';

// Validation schema
const clientSchema = z.object({
    name: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    fiscalName: z.string().max(150, 'Nombre fiscal no puede exceder 150 caracteres').optional(),
    rfc: z
        .string()
        .regex(/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/, 'RFC invalido')
        .optional()
        .or(z.literal('')),
    email: z.string().email('Email invalido').optional().or(z.literal('')),
    phone: z
        .string()
        .regex(/^[0-9+\-\s()]{8,20}$/, 'Telefono invalido')
        .optional()
        .or(z.literal('')),
    website: z.string().url('URL invalida').optional().or(z.literal('')),
    address: z.string().max(300, 'Direccion no puede exceder 300 caracteres').optional(),
    status: z.enum(['prospect', 'active', 'inactive', 'churned']),
    notes: z.string().max(1000, 'Notas no pueden exceder 1000 caracteres').optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
    client?: OfficeClient | null;
    onSubmit: (data: ClientFormData) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const STATUS_OPTIONS: { value: ClientStatus; label: string; color: string }[] = [
    { value: 'prospect', label: 'Prospecto', color: 'bg-blue-100 text-blue-700' },
    { value: 'active', label: 'Activo', color: 'bg-green-100 text-green-700' },
    { value: 'inactive', label: 'Inactivo', color: 'bg-gray-100 text-gray-700' },
    { value: 'churned', label: 'Perdido', color: 'bg-red-100 text-red-700' },
];

export function ClientForm({ client, onSubmit, onCancel, isSubmitting = false }: ClientFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        watch,
    } = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: client?.name || '',
            fiscalName: client?.fiscalName || '',
            rfc: client?.rfc || '',
            email: client?.email || '',
            phone: client?.phone || '',
            website: client?.website || '',
            address: client?.address || '',
            status: (client?.status as ClientStatus) || 'prospect',
            notes: client?.notes || '',
        },
    });

    const selectedStatus = watch('status');

    const handleFormSubmit = async (data: ClientFormData) => {
        // Clean empty strings to undefined
        const cleanData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                value === '' ? undefined : value,
            ])
        ) as ClientFormData;

        await onSubmit(cleanData);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Name */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Nombre de la Empresa *
                </label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        {...register('name')}
                        className={cn(
                            'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-colors',
                            errors.name
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                        )}
                        placeholder="Nombre comercial"
                    />
                </div>
                {errors.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                )}
            </div>

            {/* Fiscal Name & RFC */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Razon Social
                    </label>
                    <input
                        type="text"
                        {...register('fiscalName')}
                        className={cn(
                            'w-full rounded-lg border py-2.5 px-4 text-sm focus:outline-none focus:ring-2 transition-colors',
                            errors.fiscalName
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                        )}
                        placeholder="Razon social"
                    />
                    {errors.fiscalName && (
                        <p className="mt-1 text-xs text-red-600">{errors.fiscalName.message}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        RFC
                    </label>
                    <input
                        type="text"
                        {...register('rfc')}
                        className={cn(
                            'w-full rounded-lg border py-2.5 px-4 text-sm uppercase focus:outline-none focus:ring-2 transition-colors',
                            errors.rfc
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                        )}
                        placeholder="XAXX010101000"
                    />
                    {errors.rfc && (
                        <p className="mt-1 text-xs text-red-600">{errors.rfc.message}</p>
                    )}
                </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            {...register('email')}
                            className={cn(
                                'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-colors',
                                errors.email
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                            )}
                            placeholder="contacto@empresa.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Telefono
                    </label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="tel"
                            {...register('phone')}
                            className={cn(
                                'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-colors',
                                errors.phone
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                    : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                            )}
                            placeholder="+52 55 1234 5678"
                        />
                    </div>
                    {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                    )}
                </div>
            </div>

            {/* Website */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Sitio Web
                </label>
                <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <input
                        type="url"
                        {...register('website')}
                        className={cn(
                            'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-colors',
                            errors.website
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                        )}
                        placeholder="https://www.empresa.com"
                    />
                </div>
                {errors.website && (
                    <p className="mt-1 text-xs text-red-600">{errors.website.message}</p>
                )}
            </div>

            {/* Address */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Direccion
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                        {...register('address')}
                        rows={2}
                        className={cn(
                            'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-colors resize-none',
                            errors.address
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                        )}
                        placeholder="Calle, numero, colonia, ciudad, estado, CP"
                    />
                </div>
                {errors.address && (
                    <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
                )}
            </div>

            {/* Status */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Estado *
                </label>
                <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className={cn(
                                'flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all border-2',
                                selectedStatus === option.value
                                    ? `${option.color} border-current`
                                    : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                            )}
                        >
                            <input
                                type="radio"
                                {...register('status')}
                                value={option.value}
                                className="sr-only"
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Notas
                </label>
                <div className="relative">
                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                        {...register('notes')}
                        rows={3}
                        className={cn(
                            'w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-colors resize-none',
                            errors.notes
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-solaria-orange focus:ring-solaria-orange/20'
                        )}
                        placeholder="Notas adicionales sobre el cliente..."
                    />
                </div>
                {errors.notes && (
                    <p className="mt-1 text-xs text-red-600">{errors.notes.message}</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="inline-flex items-center gap-2 rounded-lg bg-solaria-orange px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-solaria-orange-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {client ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
            </div>
        </form>
    );
}

export default ClientForm;

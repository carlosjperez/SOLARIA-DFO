/**
 * DataTable Component
 * Reusable table with sorting, pagination, and row actions
 */

import { ReactNode, useMemo, useState } from 'react';
import {
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
} from 'lucide-react';
import { cn } from '@lib/utils';

// Column definition
export interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, row: T, index: number) => ReactNode;
}

// Row action definition
export interface RowAction<T> {
    label: string;
    icon?: ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'danger';
    hidden?: (row: T) => boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    isLoading?: boolean;
    emptyMessage?: string;
    // Sorting
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    onSort?: (field: string) => void;
    // Pagination
    pageSize?: number;
    currentPage?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    // Row selection
    selectable?: boolean;
    selectedRows?: T[];
    onSelectionChange?: (rows: T[]) => void;
    // Actions
    rowActions?: RowAction<T>[];
    onRowClick?: (row: T) => void;
}

export function DataTable<T extends object>({
    columns,
    data,
    keyField,
    isLoading = false,
    emptyMessage = 'No hay datos',
    sortField,
    sortDirection,
    onSort,
    pageSize = 10,
    currentPage = 1,
    totalItems,
    onPageChange,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    rowActions,
    onRowClick,
}: DataTableProps<T>) {
    const [openActionsRow, setOpenActionsRow] = useState<string | null>(null);

    // Calculate pagination
    const total = totalItems ?? data.length;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, total);

    // Get visible data (if client-side pagination)
    const visibleData = useMemo(() => {
        if (totalItems !== undefined) {
            // Server-side pagination
            return data;
        }
        // Client-side pagination
        const start = (currentPage - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, currentPage, pageSize, totalItems]);

    // Check if row is selected
    const isRowSelected = (row: T) => {
        return selectedRows.some(
            (selected) => selected[keyField] === row[keyField]
        );
    };

    // Toggle row selection
    const toggleRowSelection = (row: T) => {
        if (!onSelectionChange) return;
        const isSelected = isRowSelected(row);
        if (isSelected) {
            onSelectionChange(
                selectedRows.filter((r) => r[keyField] !== row[keyField])
            );
        } else {
            onSelectionChange([...selectedRows, row]);
        }
    };

    // Toggle all rows
    const toggleAllRows = () => {
        if (!onSelectionChange) return;
        if (selectedRows.length === visibleData.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange([...visibleData]);
        }
    };

    // Render sort icon
    const renderSortIcon = (columnKey: string) => {
        if (sortField !== columnKey) {
            return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sortDirection === 'asc' ? (
            <ChevronUp className="h-4 w-4 text-solaria-orange" />
        ) : (
            <ChevronDown className="h-4 w-4 text-solaria-orange" />
        );
    };

    // Render cell value
    const renderCell = (column: Column<T>, row: T, index: number) => {
        const value = (row as Record<string, unknown>)[column.key];
        if (column.render) {
            return column.render(value, row, index);
        }
        return String(value ?? '');
    };

    if (isLoading) {
        return (
            <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-t-lg" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 border-t border-gray-200" />
                ))}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {/* Checkbox column */}
                            {selectable && (
                                <th className="w-12 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedRows.length === visibleData.length &&
                                            visibleData.length > 0
                                        }
                                        onChange={toggleAllRows}
                                        className="h-4 w-4 rounded border-gray-300 text-solaria-orange focus:ring-solaria-orange"
                                    />
                                </th>
                            )}

                            {/* Data columns */}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500',
                                        column.align === 'center' && 'text-center',
                                        column.align === 'right' && 'text-right',
                                        column.sortable && 'cursor-pointer select-none hover:text-gray-700'
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && onSort?.(column.key)}
                                >
                                    <div
                                        className={cn(
                                            'flex items-center gap-1',
                                            column.align === 'center' && 'justify-center',
                                            column.align === 'right' && 'justify-end'
                                        )}
                                    >
                                        {column.header}
                                        {column.sortable && renderSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}

                            {/* Actions column */}
                            {rowActions && rowActions.length > 0 && (
                                <th className="w-12 px-4 py-3" />
                            )}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {visibleData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={
                                        columns.length +
                                        (selectable ? 1 : 0) +
                                        (rowActions ? 1 : 0)
                                    }
                                    className="px-4 py-12 text-center text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            visibleData.map((row, index) => {
                                const rowKey = String(row[keyField]);
                                return (
                                    <tr
                                        key={rowKey}
                                        className={cn(
                                            'transition-colors',
                                            isRowSelected(row) && 'bg-solaria-orange/5',
                                            onRowClick && 'cursor-pointer hover:bg-gray-50'
                                        )}
                                        onClick={() => onRowClick?.(row)}
                                    >
                                        {/* Checkbox */}
                                        {selectable && (
                                            <td
                                                className="px-4 py-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isRowSelected(row)}
                                                    onChange={() => toggleRowSelection(row)}
                                                    className="h-4 w-4 rounded border-gray-300 text-solaria-orange focus:ring-solaria-orange"
                                                />
                                            </td>
                                        )}

                                        {/* Data cells */}
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={cn(
                                                    'px-4 py-3 text-sm text-gray-900',
                                                    column.align === 'center' && 'text-center',
                                                    column.align === 'right' && 'text-right'
                                                )}
                                            >
                                                {renderCell(column, row, index)}
                                            </td>
                                        ))}

                                        {/* Actions */}
                                        {rowActions && rowActions.length > 0 && (
                                            <td
                                                className="relative px-4 py-3"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() =>
                                                        setOpenActionsRow(
                                                            openActionsRow === rowKey ? null : rowKey
                                                        )
                                                    }
                                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>

                                                {/* Actions dropdown */}
                                                {openActionsRow === rowKey && (
                                                    <div className="absolute right-4 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                                        {rowActions
                                                            .filter((action) => !action.hidden?.(row))
                                                            .map((action, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => {
                                                                        action.onClick(row);
                                                                        setOpenActionsRow(null);
                                                                    }}
                                                                    className={cn(
                                                                        'flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors',
                                                                        action.variant === 'danger'
                                                                            ? 'text-red-600 hover:bg-red-50'
                                                                            : 'text-gray-700 hover:bg-gray-50'
                                                                    )}
                                                                >
                                                                    {action.icon}
                                                                    {action.label}
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-500">
                        Mostrando {startItem} a {endItem} de {total} resultados
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange?.(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let page: number;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange?.(page)}
                                    className={cn(
                                        'min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        currentPage === page
                                            ? 'bg-solaria-orange text-white'
                                            : 'text-gray-500 hover:bg-gray-200'
                                    )}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => onPageChange?.(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;

import { useState } from 'react';
import { Plus, CheckCircle2, Loader2, ListTodo } from 'lucide-react';
import { useTaskItems, useCreateTaskItems, useCompleteTaskItem } from '@/hooks/useApi';
import { TaskItemRow } from './TaskItemRow';
import { cn } from '@/lib/utils';

interface TaskItemsListProps {
    taskId: number;
    editable?: boolean;
    showAddForm?: boolean;
}

interface NewItemInput {
    title: string;
    estimatedMinutes: number;
}

export function TaskItemsList({
    taskId,
    editable = true,
    showAddForm = true,
}: TaskItemsListProps) {
    const { data: items, isLoading, error } = useTaskItems(taskId);
    const createItems = useCreateTaskItems();
    const completeItem = useCompleteTaskItem();

    const [newItems, setNewItems] = useState<NewItemInput[]>([{ title: '', estimatedMinutes: 30 }]);
    const [isAdding, setIsAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const completedCount = items?.filter((i) => i.isCompleted).length || 0;
    const totalCount = items?.length || 0;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleAddItem = () => {
        setNewItems([...newItems, { title: '', estimatedMinutes: 30 }]);
    };

    const handleRemoveItem = (index: number) => {
        if (newItems.length > 1) {
            setNewItems(newItems.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, field: keyof NewItemInput, value: string | number) => {
        const updated = [...newItems];
        if (field === 'title') {
            updated[index].title = value as string;
        } else {
            updated[index].estimatedMinutes = value as number;
        }
        setNewItems(updated);
    };

    const handleSubmitItems = async () => {
        const validItems = newItems.filter((item) => item.title.trim());
        if (validItems.length === 0) return;

        setIsAdding(true);
        try {
            await createItems.mutateAsync({
                taskId,
                items: validItems.map((item) => ({
                    title: item.title.trim(),
                    estimatedMinutes: item.estimatedMinutes,
                })),
            });
            setNewItems([{ title: '', estimatedMinutes: 30 }]);
            setShowForm(false);
        } finally {
            setIsAdding(false);
        }
    };

    const handleCompleteItem = async (itemId: number, notes?: string, actualMinutes?: number) => {
        await completeItem.mutateAsync({ taskId, itemId, notes, actualMinutes });
    };

    if (isLoading) {
        return (
            <div className="task-items-loading">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Cargando subtareas...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="task-items-error">
                Error al cargar subtareas
            </div>
        );
    }

    return (
        <div className="task-items-list">
            {/* Header with progress */}
            <div className="task-items-header">
                <div className="flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Subtareas</span>
                    <span className="text-xs text-muted-foreground">
                        ({completedCount}/{totalCount})
                    </span>
                </div>
                {totalCount > 0 && (
                    <div className="task-items-progress-bar">
                        <div
                            className={cn(
                                'task-items-progress-fill',
                                progress === 100 && 'complete'
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {/* Items list */}
            <div className="task-items-body">
                {items && items.length > 0 ? (
                    items
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((item) => (
                            <TaskItemRow
                                key={item.id}
                                item={item}
                                onComplete={handleCompleteItem}
                                disabled={!editable}
                            />
                        ))
                ) : (
                    <div className="task-items-empty">
                        <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                        <p>No hay subtareas definidas</p>
                    </div>
                )}
            </div>

            {/* Add items form */}
            {editable && showAddForm && (
                <div className="task-items-add">
                    {showForm ? (
                        <div className="add-items-form">
                            {newItems.map((item, index) => (
                                <div key={index} className="add-item-row">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                        placeholder="Titulo de la subtarea..."
                                        className="add-item-title"
                                        autoFocus={index === newItems.length - 1}
                                    />
                                    <input
                                        type="number"
                                        value={item.estimatedMinutes}
                                        onChange={(e) =>
                                            handleItemChange(index, 'estimatedMinutes', Number(e.target.value))
                                        }
                                        className="add-item-minutes"
                                        min={5}
                                        step={5}
                                    />
                                    <span className="add-item-minutes-label">min</span>
                                    {newItems.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveItem(index)}
                                            className="add-item-remove"
                                        >
                                            &times;
                                        </button>
                                    )}
                                </div>
                            ))}

                            <div className="add-items-actions">
                                <button onClick={handleAddItem} className="add-another-btn">
                                    <Plus className="h-3 w-3" />
                                    Agregar otra
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            setNewItems([{ title: '', estimatedMinutes: 30 }]);
                                        }}
                                        className="cancel-btn"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmitItems}
                                        disabled={isAdding || !newItems.some((i) => i.title.trim())}
                                        className="submit-items-btn"
                                    >
                                        {isAdding ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            'Guardar'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setShowForm(true)} className="add-items-trigger">
                            <Plus className="h-4 w-4" />
                            Agregar subtareas
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TaskItemsList;

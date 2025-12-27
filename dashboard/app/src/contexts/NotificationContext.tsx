import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { useSocketContext } from './SocketContext';

export interface Notification {
    id: string;
    type: 'task' | 'project' | 'agent' | 'memory' | 'alert' | 'system';
    action: 'created' | 'updated' | 'deleted' | 'completed' | 'status' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    data?: Record<string, unknown>;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
    dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const MAX_NOTIFICATIONS = 50;

// Helper to format event data into user-friendly messages
function formatEventMessage(event: string, data: Record<string, unknown>): { title: string; message: string; type: Notification['type']; action: Notification['action'] } {
    const formatters: Record<string, () => { title: string; message: string; type: Notification['type']; action: Notification['action'] }> = {
        'task:created': () => ({
            type: 'task',
            action: 'created',
            title: 'Nueva tarea creada',
            message: data.title ? `Tarea: ${data.title}` : `Proyecto #${data.projectId}`,
        }),
        'task:updated': () => ({
            type: 'task',
            action: 'updated',
            title: 'Tarea actualizada',
            message: data.title ? `${data.title}` : `Tarea #${data.taskId}`,
        }),
        'task:completed': () => ({
            type: 'task',
            action: 'completed',
            title: 'Tarea completada',
            message: data.title ? `${data.title}` : `Tarea #${data.taskId}`,
        }),
        'task:deleted': () => ({
            type: 'task',
            action: 'deleted',
            title: 'Tarea eliminada',
            message: `Tarea removida del proyecto`,
        }),
        'project:created': () => ({
            type: 'project',
            action: 'created',
            title: 'Nuevo proyecto',
            message: data.name ? `${data.name}` : 'Proyecto creado',
        }),
        'project:updated': () => ({
            type: 'project',
            action: 'updated',
            title: 'Proyecto actualizado',
            message: data.name ? `${data.name}` : `Proyecto #${data.projectId}`,
        }),
        'project:deleted': () => ({
            type: 'project',
            action: 'deleted',
            title: 'Proyecto eliminado',
            message: data.name ? `${data.name}` : 'Proyecto removido',
        }),
        'project:progress': () => ({
            type: 'project',
            action: 'updated',
            title: 'Progreso actualizado',
            message: data.progress !== undefined ? `Nuevo progreso: ${data.progress}%` : 'Progreso modificado',
        }),
        'agent:status': () => ({
            type: 'agent',
            action: 'status',
            title: 'Estado de agente',
            message: data.status ? `${data.agentName || 'Agente'}: ${data.status}` : 'Estado actualizado',
        }),
        'memory:created': () => ({
            type: 'memory',
            action: 'created',
            title: 'Nueva memoria',
            message: data.content ? `${String(data.content).substring(0, 50)}...` : 'Memoria registrada',
        }),
        'memory:updated': () => ({
            type: 'memory',
            action: 'updated',
            title: 'Memoria actualizada',
            message: `Memoria #${data.memoryId} modificada`,
        }),
        'alert:critical': () => ({
            type: 'alert',
            action: 'info',
            title: 'Alerta crítica',
            message: typeof data.message === 'string' ? data.message : 'Se requiere atención inmediata',
        }),
        'taskItem:completed': () => ({
            type: 'task',
            action: 'completed',
            title: 'Subtarea completada',
            message: data.title ? `${data.title}` : `En tarea #${data.taskId}`,
        }),
        'taskItem:created': () => ({
            type: 'task',
            action: 'created',
            title: 'Subtarea agregada',
            message: `Nueva subtarea en tarea #${data.taskId}`,
        }),
        'activity:new': () => ({
            type: 'system',
            action: 'info',
            title: 'Nueva actividad',
            message: typeof data.description === 'string' ? data.description : 'Actividad registrada',
        }),
    };

    const formatter = formatters[event];
    if (formatter) {
        return formatter();
    }

    // Default fallback
    return {
        type: 'system',
        action: 'info',
        title: event.replace(':', ' ').replace(/([A-Z])/g, ' $1').trim(),
        message: JSON.stringify(data).substring(0, 100),
    };
}

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { on, isConnected } = useSocketContext();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            read: false,
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS));
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const dismissNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Subscribe to all socket events
    useEffect(() => {
        if (!isConnected) return;

        const events = [
            'task:created',
            'task:updated',
            'task:completed',
            'task:deleted',
            'project:created',
            'project:updated',
            'project:deleted',
            'project:progress',
            'agent:status',
            'memory:created',
            'memory:updated',
            'alert:critical',
            'taskItem:completed',
            'taskItem:created',
            'activity:new',
        ];

        const cleanups: (() => void)[] = [];

        events.forEach(event => {
            const cleanup = on(event, (data: unknown) => {
                const eventData = (data || {}) as Record<string, unknown>;
                const formatted = formatEventMessage(event, eventData);
                addNotification({
                    ...formatted,
                    data: eventData,
                });
            });
            cleanups.push(cleanup);
        });

        return () => {
            cleanups.forEach(cleanup => cleanup());
        };
    }, [on, isConnected, addNotification]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                clearAll,
                dismissNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

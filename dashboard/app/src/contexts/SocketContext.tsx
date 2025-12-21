import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    emit: (event: string, data?: unknown) => void;
    on: (event: string, callback: (...args: unknown[]) => void) => () => void;
    off: (event: string, callback?: (...args: unknown[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('[Socket] Connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            setIsConnected(false);
        });

        // Real-time data events
        socket.on('agent:status', () => {
            // Invalidate agents query to refresh data
            queryClient.invalidateQueries({ queryKey: ['agents'] });
        });

        socket.on('task:updated', () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        });

        socket.on('task:created', () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        });

        socket.on('project:updated', () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        });

        socket.on('memory:created', () => {
            queryClient.invalidateQueries({ queryKey: ['memories'] });
        });

        socket.on('alert:critical', () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard', 'alerts'] });
        });

        // TaskItem events for real-time subtask updates
        socket.on('taskItem:completed', (data: { taskId: number }) => {
            if (data?.taskId) {
                queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId, 'items'] });
                queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
                queryClient.invalidateQueries({ queryKey: ['tasks'] });
            }
        });

        socket.on('taskItem:created', (data: { taskId: number }) => {
            if (data?.taskId) {
                queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId, 'items'] });
                queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
            }
        });

        socket.on('activity:new', () => {
            queryClient.invalidateQueries({ queryKey: ['activity'] });
        });

        // Cleanup
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, token, queryClient]);

    const emit = useCallback((event: string, data?: unknown) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        }
    }, []);

    const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
        socketRef.current?.on(event, callback);
        return () => {
            socketRef.current?.off(event, callback);
        };
    }, []);

    const off = useCallback((event: string, callback?: (...args: unknown[]) => void) => {
        if (callback) {
            socketRef.current?.off(event, callback);
        } else {
            socketRef.current?.removeAllListeners(event);
        }
    }, []);

    return (
        <SocketContext.Provider
            value={{
                socket: socketRef.current,
                isConnected,
                emit,
                on,
                off,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocketContext() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
}

// Hook for real-time notifications
export function useSocketNotifications() {
    const { on, isConnected } = useSocketContext();
    const [notifications, setNotifications] = useState<
        Array<{ id: string; message: string; type: string; timestamp: Date }>
    >([]);

    useEffect(() => {
        if (!isConnected) return;

        const handlers = [
            on('notification', (data: unknown) => {
                const notification = data as { message: string; type: string };
                setNotifications((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        message: notification.message,
                        type: notification.type,
                        timestamp: new Date(),
                    },
                ].slice(-10)); // Keep last 10 notifications
            }),
        ];

        return () => {
            handlers.forEach((cleanup) => cleanup());
        };
    }, [on, isConnected]);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return { notifications, clearNotifications, isConnected };
}

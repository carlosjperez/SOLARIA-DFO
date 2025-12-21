import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '';

interface UseSocketOptions {
    autoConnect?: boolean;
    reconnection?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
    const { autoConnect = true, reconnection = true } = options;
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        if (!autoConnect || !token) return;

        socketRef.current = io(SOCKET_URL, {
            auth: { token },
            reconnection,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('[Socket] Connected');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('[Socket] Disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [autoConnect, reconnection, token]);

    const emit = useCallback((event: string, data?: unknown) => {
        socketRef.current?.emit(event, data);
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

    return {
        socket: socketRef.current,
        isConnected,
        emit,
        on,
        off,
    };
}

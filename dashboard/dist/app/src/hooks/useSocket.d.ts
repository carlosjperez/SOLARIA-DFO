import { Socket } from 'socket.io-client';
interface UseSocketOptions {
    autoConnect?: boolean;
    reconnection?: boolean;
}
export declare function useSocket(options?: UseSocketOptions): {
    socket: Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap> | null;
    isConnected: boolean;
    emit: (event: string, data?: unknown) => void;
    on: (event: string, callback: (...args: unknown[]) => void) => () => void;
    off: (event: string, callback?: (...args: unknown[]) => void) => void;
};
export {};

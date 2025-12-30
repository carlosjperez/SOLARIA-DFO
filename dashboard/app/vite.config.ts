import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@lib': path.resolve(__dirname, './src/lib'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@store': path.resolve(__dirname, './src/store'),
            '@types': path.resolve(__dirname, './src/types'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3030',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:3030',
                ws: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        chunkSizeWarningLimit: 500, // Warn if chunks exceed 500 KB
        rollupOptions: {
            output: {
                manualChunks: {
                    // React core libraries
                    'react-vendor': ['react', 'react-dom'],
                    // React Router
                    'router-vendor': ['react-router-dom'],
                    // State management and data fetching
                    'query-vendor': ['@tanstack/react-query'],
                    'state-vendor': ['zustand'],
                    // UI libraries
                    'ui-vendor': [
                        'lucide-react',
                        'class-variance-authority',
                        'clsx',
                        'tailwind-merge',
                    ],
                    // Charts
                    'charts-vendor': ['recharts'],
                    // Utilities
                    'utils-vendor': ['axios', 'date-fns', 'zod'],
                    // Socket.io (large lib)
                    'socket-vendor': ['socket.io-client'],
                },
            },
        },
    },
});

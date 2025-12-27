import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@types': path.resolve(__dirname, './src/types'),
            '@audio': path.resolve(__dirname, './src/audio'),
            '@ai': path.resolve(__dirname, './src/ai'),
            '@store': path.resolve(__dirname, './src/store'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            '/api/anthropic': {
                target: 'https://api.anthropic.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq) => {
                        proxyReq.setHeader('x-api-key', process.env.VITE_ANTHROPIC_API_KEY || '');
                        proxyReq.setHeader('anthropic-version', '2023-06-01');
                    });
                },
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2020',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
            mangle: true,
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-audio': ['tone'],
                    'vendor-music': ['tonal'],
                    'vendor-ui': ['framer-motion', '@dnd-kit/core', '@dnd-kit/sortable'],
                },
            },
        },
        chunkSizeWarningLimit: 500,
    },
});

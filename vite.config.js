import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        process.env.ANALYZE && visualizer({
            open: true,
            gzipSize: true,
            brotliSize: true,
            filename: 'dist/bundle-analysis.html',
        }),
    ].filter(Boolean),
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
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-audio': ['tone'],
                    'vendor-music': ['tonal'],
                    'vendor-ui': ['framer-motion', '@dnd-kit/core'],
                },
            },
        },
        chunkSizeWarningLimit: 500,
    },
});

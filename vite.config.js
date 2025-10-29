import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Detect environment
const isProduction = process.env.NODE_ENV === 'production';
const backendUrl =
  process.env.VITE_API_BASE_URL && process.env.VITE_API_BASE_URL !== 'auto'
    ? process.env.VITE_API_BASE_URL
    : isProduction
    ? '' // In production, the frontend & backend are usually served from same domain
    : 'http://localhost:4000'; // In local, backend runs on port 4000

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify(backendUrl),
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: isProduction
      ? {}
      : {
          // Proxy API requests only in development
          '^/api(?!/uploads)': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
          '^/(uploads|api/uploads)': {
            target: 'http://localhost:4000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/?/, '/'),
          },
        },
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  css: {
    devSourcemap: true,
  },
});

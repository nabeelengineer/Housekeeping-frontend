import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.PROD': JSON.stringify(isProduction),
    'import.meta.env.DEV': JSON.stringify(!isProduction),
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      isProduction ? '' : 'http://localhost:4000'
    ),
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

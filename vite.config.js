import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Handle API requests - forward to backend
      '^/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        // Remove the duplicate /api prefix if it exists in the request
        rewrite: (path) => path.replace(/^\/api\/api/, '/api'),
      },
      // Handle static file requests (uploads)
      '^/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Set the base URL for static assets
  base: '/',
  // Configure build settings
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
  // Environment variables
  define: {
    'process.env': {}
  },
  // Configure HMR (Hot Module Replacement)
  hmr: {
    overlay: true,
  },
  // Configure static file serving
  preview: {
    port: 5173,
    strictPort: true,
  },
  // Configure CSS
  css: {
    devSourcemap: true,
  },
});

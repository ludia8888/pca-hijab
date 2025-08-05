import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false,
    proxy: {
      // Proxy all API calls to backend
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
    },
  },
  build: {
    outDir: 'dist',
    // Disable source maps in production for security
    sourcemap: mode !== 'production',
    // Minify for production
    minify: mode === 'production' ? 'esbuild' : false,
    // Browser compatibility
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['zustand', '@tanstack/react-query'],
        },
        // Obfuscate chunk names in production
        chunkFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        entryFileNames: mode === 'production' ? 'assets/[hash].js' : 'assets/[name]-[hash].js',
        assetFileNames: mode === 'production' ? 'assets/[hash].[ext]' : 'assets/[name]-[hash].[ext]'
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  define: {
    // Only expose necessary environment variables
    __DEV__: mode !== 'production',
  },
}));
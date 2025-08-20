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
    // Minify for production but KEEP console logs for debugging camera issue
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: false, // TEMPORARILY KEEP console statements for debugging
        drop_debugger: true, // Remove debugger statements
        // Don't remove any console functions for now
        // pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      format: {
        comments: false // Remove comments
      }
    } : undefined,
    // Browser compatibility
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Increase chunk size limit to avoid over-splitting
    chunkSizeWarningLimit: 2000,
    // Disable module preload polyfill that might cause issues
    modulePreload: false,
    rollupOptions: {
      output: {
        // Keep TensorFlow in a separate chunk to ensure proper loading
        manualChunks: (id) => {
          if (id.includes('@tensorflow') || id.includes('face-landmarks-detection')) {
            return 'tensorflow';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Increase max parallel requests to reduce chunk splitting
        maxParallelFileOps: 10,
        // Use simpler naming
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge',
      // CRITICAL: Force TensorFlow to be pre-bundled
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow-models/face-landmarks-detection'
    ],
    exclude: [],
    // Force re-optimization on every build
    force: true
  },
  define: {
    // Only expose necessary environment variables
    __DEV__: mode !== 'production',
  },
}));
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'ES2020',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Changed from 3000 to 8000
        changeOrigin: true,
        secure: false,
      },
      '/pump': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/tokens': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'afdaea06ea75.ngrok-free.app',
    ],
  },
  define: {
    global: 'globalThis',
  },
})
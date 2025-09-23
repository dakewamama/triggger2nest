import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: { '@': '/src' },
  },
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      // All API calls proxied to backend on port 8000
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/pump': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/tokens': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/wallet': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/trading': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

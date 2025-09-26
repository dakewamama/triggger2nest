import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
      '/pump': 'http://localhost:8000',
      '/tokens': 'http://localhost:8000',
      '/wallet': 'http://localhost:8000',
      '/trading': 'http://localhost:8000',
    },
  },
  optimizeDeps: {
    exclude: ['@solana/web3.js'],
    include: ['buffer', 'process'],
  },
})

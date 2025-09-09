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
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '3e0b601a499d.ngrok-free.app'
    ]
  },
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
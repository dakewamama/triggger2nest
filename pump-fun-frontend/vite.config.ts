import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis', 
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: ['buffer'], 
  },
  server: {
    host: '0.0.0.0', 
    port: 5173,     
    allowedHosts: [
      '.ngrok-free.app'  
    ]
  }
})

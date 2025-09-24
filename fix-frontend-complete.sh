#!/bin/bash

echo "🧹 COMPLETE CLEANUP & FIX"
echo "========================="

# 1. Stop all running processes
echo "Stopping all processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 2. Clear backend cache
echo "Clearing backend cache..."
rm -rf dist/
rm -rf node_modules/.cache/
rm -rf .nest/
rm -rf tmp/

# 3. Clear frontend cache
echo "Clearing frontend cache..."
cd frontend
rm -rf node_modules/.cache/
rm -rf .vite/
rm -rf dist/
cd ..

# 4. Find out what port backend ACTUALLY uses
echo ""
echo "Checking backend port configuration..."
BACKEND_PORT=$(grep -oP 'port\s*=\s*\K\d+' src/main.ts 2>/dev/null || echo "3000")
echo "Backend is configured for port: $BACKEND_PORT"

# 5. Fix frontend to use the correct port
echo "Updating frontend to use port $BACKEND_PORT..."
cat > frontend/src/services/api.ts << EOF
import axios from 'axios'

const API_BASE_URL = 'http://localhost:$BACKEND_PORT'

console.log('🔗 API connecting to:', API_BASE_URL);

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  })

  constructor() {
    this.api.interceptors.request.use(
      (config) => {
        console.log(\`[API] \${config.method?.toUpperCase()} \${config.baseURL}\${config.url}\`)
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.message)
        if (error.code === 'ERR_NETWORK') {
          console.error(\`Cannot connect to backend on port $BACKEND_PORT. Is it running?\`)
        }
        return Promise.reject(error)
      }
    )
  }

  async healthCheck() {
    try {
      const { data } = await this.api.get('/health')
      return data
    } catch (error) {
      return { status: 'error', message: 'Backend offline' }
    }
  }

  async getTrendingTokens(limit = 50, offset = 0) {
    try {
      const { data } = await this.api.get('/tokens/trending', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  async getFeaturedTokens(limit = 20, offset = 0) {
    try {
      const { data } = await this.api.get('/tokens/featured', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  async getNewTokens(limit = 50, offset = 0) {
    try {
      const { data } = await this.api.get('/tokens/new', { 
        params: { limit, offset } 
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  async getMarketStats() {
    try {
      const { data } = await this.api.get('/tokens/stats/market')
      return data.data
    } catch (error) {
      return null
    }
  }

  async getLatestTrades(limit = 20) {
    try {
      const { data } = await this.api.get('/tokens/trades/latest', {
        params: { limit }
      })
      return data.data || []
    } catch (error) {
      return []
    }
  }

  // Add other methods as needed...
}

const apiService = new ApiService()
export { apiService, apiService as api }
export default apiService
EOF

# 6. Update vite config
cat > frontend/vite.config.ts << EOF
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
    'process.env': {},
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      '/health': 'http://localhost:$BACKEND_PORT',
      '/api': 'http://localhost:$BACKEND_PORT',
      '/pump': 'http://localhost:$BACKEND_PORT',
      '/tokens': 'http://localhost:$BACKEND_PORT',
      '/wallet': 'http://localhost:$BACKEND_PORT',
      '/trading': 'http://localhost:$BACKEND_PORT',
    },
  },
  clearScreen: false,
})
EOF

echo ""
echo "✅ Cache cleared and configuration updated!"
echo ""
echo "Now start both servers:"
echo ""
echo "Terminal 1 - Backend:"
echo "  npm run start:dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "Backend will run on: http://localhost:$BACKEND_PORT"
echo "Frontend will run on: http://localhost:5173"
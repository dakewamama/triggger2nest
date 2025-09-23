#!/bin/bash

# SIMPLE FRONTEND FIX - DON'T TOUCH BACKEND
# ========================================
# Just fix the frontend to work with existing backend

echo "🎯 SIMPLE FRONTEND FIX - BACKEND UNTOUCHED"
echo "=========================================="

# Step 1: Clean frontend only
echo "🧹 Cleaning ONLY frontend directory..."
rm -rf frontend/

# Step 2: Create clean frontend
echo "📁 Creating clean frontend structure..."
mkdir -p frontend/src/{components,pages,hooks,services,config,utils}

# Step 3: Package.json - Simple and clean
echo "📦 Creating package.json..."
cat > frontend/package.json << 'EOF'
{
  "name": "trigger-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@solana/web3.js": "^1.87.6",
    "axios": "^1.6.2",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vite-plugin-node-polyfills": "^0.17.0"
  }
}
EOF

# Step 4: Vite config - Simple
echo "⚡ Creating vite.config.js..."
cat > frontend/vite.config.js << 'EOF'
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
      '/api': 'http://localhost:3000',
      '/pump': 'http://localhost:3000',
      '/tokens': 'http://localhost:3000',
      '/wallet': 'http://localhost:3000',
      '/trading': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
    },
  },
})
EOF

# Step 5: TypeScript config - Simple
echo "🔧 Creating tsconfig.json..."
cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "types": ["vite/client"]
  },
  "include": ["src"]
}
EOF

# Step 6: Vite env types
echo "🌐 Creating vite-env.d.ts..."
cat > frontend/src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
EOF

# Step 7: Simple API service - connects to YOUR backend
echo "🔗 Creating API service..."
mkdir -p frontend/src/services
cat > frontend/src/services/api.ts << 'EOF'
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const apiService = {
  // Health check
  async healthCheck() {
    const response = await api.get('/health');
    return response.data;
  },

  // Your existing backend endpoints
  async createToken(data: any) {
    const response = await api.post('/pump/create-token', data);
    return response.data;
  },

  async buyToken(data: any) {
    const response = await api.post('/pump/buy-token', data);
    return response.data;
  },

  async sellToken(data: any) {
    const response = await api.post('/pump/sell-token', data);
    return response.data;
  },

  async getTokens() {
    const response = await api.get('/tokens');
    return response.data;
  },
};
EOF

# Step 8: Wallet hook - Simple
echo "💰 Creating wallet hook..."
cat > frontend/src/hooks/useWallet.ts << 'EOF'
import { useState, useCallback } from 'react';

export function useWallet() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (!window.solana) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    setConnecting(true);
    try {
      const response = await window.solana.connect();
      setConnected(true);
      setAddress(response.publicKey.toString());
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    if (window.solana) {
      window.solana.disconnect();
    }
  }, []);

  return {
    connected,
    connecting,
    address,
    connect,
    disconnect,
  };
}

declare global {
  interface Window {
    solana?: any;
  }
}
EOF

# Step 9: Simple App
echo "⚛️ Creating App.tsx..."
cat > frontend/src/App.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { apiService } from './services/api';
import { useWallet } from './hooks/useWallet';

function Header() {
  const { connected, connecting, address, connect, disconnect } = useWallet();
  
  return (
    <header className="bg-gray-900 border-b border-green-500">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-green-400">
          TRIGGER TERMINAL
        </Link>
        
        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-gray-300 hover:text-green-400">Home</Link>
          <Link to="/create" className="text-gray-300 hover:text-green-400">Create</Link>
          
          {connected ? (
            <div className="flex items-center space-x-4">
              <span className="text-green-400">{address?.slice(0, 8)}...</span>
              <button onClick={disconnect} className="bg-red-600 px-4 py-2 rounded">
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="bg-green-600 px-4 py-2 rounded"
            >
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-6xl font-bold mb-4">
        <span className="text-green-400">TRIGGER</span>{' '}
        <span className="text-cyan-400">TERMINAL</span>
      </h1>
      <p className="text-xl text-gray-300 mb-8">
        Solana memecoin trading terminal
      </p>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg border border-green-500">
          <h3 className="text-xl font-bold text-green-400 mb-4">🚀 Trade</h3>
          <p className="text-gray-300">Fast memecoin trading</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-cyan-500">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 Analyze</h3>
          <p className="text-gray-300">Market insights</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-purple-500">
          <h3 className="text-xl font-bold text-purple-400 mb-4">💎 Create</h3>
          <p className="text-gray-300">Launch tokens</p>
        </div>
      </div>
    </div>
  );
}

function CreateTokenPage() {
  const [formData, setFormData] = useState({ name: '', symbol: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.createToken(formData);
      alert('Token creation request sent!');
    } catch (error) {
      alert('Error creating token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        <span className="text-green-400">CREATE</span>{' '}
        <span className="text-purple-400">TOKEN</span>
      </h1>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Token Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Symbol</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white"
            rows={4}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded font-medium"
        >
          {loading ? 'Creating...' : 'Create Token'}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    apiService.healthCheck()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('error'));
  }, []);

  if (backendStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (backendStatus === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-red-400 mb-4">Backend Connection Failed</h2>
          <p className="text-gray-300">Make sure your backend is running on port 3000</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateTokenPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
EOF

# Step 10: Main entry
echo "🚀 Creating main.tsx..."
cat > frontend/src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Step 11: Simple CSS
echo "🎨 Creating index.css..."
cat > frontend/src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  background-color: #111827;
  color: white;
}
EOF

# Step 12: HTML
echo "📄 Creating index.html..."
cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TRIGGER Terminal</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

# Step 13: Tailwind config
echo "🎨 Creating tailwind.config.js..."
cat > frontend/tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Step 14: PostCSS config
cat > frontend/postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Step 15: Install and build
echo "📦 Installing dependencies..."
cd frontend
npm install

echo "🔧 Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Frontend is ready!"
    echo "=========================="
    echo ""
    echo "🚀 To start:"
    echo "cd frontend"
    echo "npm run dev"
    echo ""
    echo "Frontend will run on: http://localhost:5173"
    echo "Connects to your backend on: http://localhost:3000"
    echo ""
    echo "🎯 SIMPLE. CLEAN. WORKS WITH YOUR BACKEND!"
else
    echo "❌ Build failed - check errors above"
fi
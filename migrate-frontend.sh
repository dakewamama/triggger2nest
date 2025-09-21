#!/bin/bash

# Frontend Configuration Fix
echo "🔧 Fixing Frontend TypeScript Configuration..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to frontend directory
if [ ! -d "frontend" ]; then
    print_error "Frontend directory not found. Please run the migration script first."
    exit 1
fi

cd frontend

# Fix tsconfig.json
print_status "Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
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
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "types": ["vite/client", "node"]
  },
  "include": [
    "src/**/*",
    "src/**/*.ts", 
    "src/**/*.tsx"
  ],
  "exclude": ["node_modules", "dist"],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
EOF

# Create tsconfig.node.json
print_status "Creating tsconfig.node.json..."
cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node"]
  },
  "include": [
    "vite.config.ts",
    "vitest.config.ts",
    "postcss.config.js",
    "tailwind.config.js"
  ]
}
EOF

# Create postcss.config.js if missing
if [ ! -f "postcss.config.js" ]; then
    print_status "Creating postcss.config.js..."
    cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# Create index.html if missing
if [ ! -f "index.html" ]; then
    print_status "Creating index.html..."
    cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TRIGGER Terminal - Solana Memecoin Trading Platform</title>
    <meta name="description" content="The arcade-style trading terminal for Solana memecoins. Discover, trade, and create tokens with precision." />
    <meta name="author" content="Trigger Terminal" />
    <meta name="keywords" content="solana, memecoin, trading, defi, blockchain, crypto, terminal" />

    <meta property="og:title" content="TRIGGER Terminal - Solana Trading Platform" />
    <meta property="og:description" content="The arcade-style trading terminal for Solana memecoins. Discover, trade, and create tokens with precision." />
    <meta property="og:type" content="website" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@trigger_terminal" />
    
    <link rel="canonical" href="https://trigger-terminal.com/" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
fi

# Create basic index.css if missing
if [ ! -f "src/index.css" ]; then
    print_status "Creating src/index.css..."
    mkdir -p src
    cat > src/index.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Trigger: Arcade x Trading Terminal Design System */

@layer base {
  :root {
    /* Core Terminal Colors */
    --terminal-bg: 120 100% 4%;
    --terminal-surface: 120 50% 8%;
    --terminal-border: 120 30% 15%;
    
    /* Neon Accents */
    --neon-cyan: 180 100% 50%;
    --neon-magenta: 300 100% 60%;
    --neon-lime: 90 100% 50%;
    --neon-gold: 48 100% 50%;
    
    /* Trading Colors */
    --profit-green: 120 100% 40%;
    --loss-red: 0 100% 60%;
    --warning-amber: 35 100% 50%;
    
    /* Text Hierarchy */
    --text-primary: 0 0% 95%;
    --text-secondary: 0 0% 70%;
    --text-muted: 0 0% 50%;
    --text-inverse: 120 100% 4%;
    
    /* Component Colors */
    --background: var(--terminal-bg);
    --foreground: var(--text-primary);
    
    --card: var(--terminal-surface);
    --card-foreground: var(--text-primary);
    
    --popover: var(--terminal-surface);
    --popover-foreground: var(--text-primary);
    
    --primary: var(--neon-lime);
    --primary-foreground: var(--text-inverse);
    
    --secondary: var(--terminal-surface);
    --secondary-foreground: var(--text-primary);
    
    --muted: var(--terminal-border);
    --muted-foreground: var(--text-muted);
    
    --accent: var(--neon-cyan);
    --accent-foreground: var(--text-inverse);
    
    --destructive: var(--loss-red);
    --destructive-foreground: var(--text-primary);
    
    --border: var(--terminal-border);
    --input: var(--terminal-surface);
    --ring: var(--neon-lime);
    
    --radius: 0.375rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground font-mono;
    font-family: 'JetBrains Mono', monospace;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Orbitron', monospace;
    @apply font-bold tracking-wide;
  }
}

@layer components {
  /* Terminal Window Effects */
  .terminal-glow {
    box-shadow: 
      inset 0 0 0 1px hsl(var(--neon-lime) / 0.2),
      0 0 10px hsl(var(--neon-lime) / 0.3);
  }
  
  .neon-text {
    color: hsl(var(--neon-lime));
    text-shadow: 0 0 10px hsl(var(--neon-lime) / 0.5);
  }
  
  .cyber-grid {
    background-image: 
      linear-gradient(hsl(var(--terminal-border) / 0.3) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--terminal-border) / 0.3) 1px, transparent 1px);
    background-size: 20px 20px;
  }
}

@layer utilities {
  .text-neon-cyan { color: hsl(var(--neon-cyan)); }
  .text-neon-magenta { color: hsl(var(--neon-magenta)); }
  .text-neon-lime { color: hsl(var(--neon-lime)); }
  .text-neon-gold { color: hsl(var(--neon-gold)); }
  
  .bg-terminal { background-color: hsl(var(--terminal-bg)); }
  .bg-terminal-surface { background-color: hsl(var(--terminal-surface)); }
  
  .border-neon { border-color: hsl(var(--neon-lime)); }
  .border-terminal { border-color: hsl(var(--terminal-border)); }
}
EOF
fi

# Create basic App.tsx if missing
if [ ! -f "src/App.tsx" ]; then
    print_status "Creating src/App.tsx..."
    cat > src/App.tsx << 'EOF'
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { apiService } from "./services/api/apiService";
import { ENV } from "./config/env";

// Simple connection status component
function ConnectionStatus({ status, onRetry }: { 
  status: 'checking' | 'connected' | 'error', 
  onRetry: () => void 
}) {
  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-terminal flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-lime/20 border-t-neon-lime rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-bold text-neon-lime">TRIGGER TERMINAL</h2>
          <p className="text-gray-400">Connecting to backend...</p>
          <p className="text-sm text-gray-500">{ENV.API_URL}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-terminal flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md w-full text-center space-y-4">
          <h2 className="text-xl text-red-400">CONNECTION FAILED</h2>
          <p className="text-gray-300">Cannot connect to backend server</p>
          <div className="text-left bg-gray-900 rounded p-4 space-y-2">
            <p className="text-sm text-gray-400">Troubleshooting:</p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Ensure backend is running</li>
              <li>• Check port 3000 is available</li>
              <li>• Verify API URL: {ENV.API_URL}</li>
            </ul>
          </div>
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Main homepage component
function HomePage() {
  return (
    <div className="min-h-screen bg-terminal">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold">
            <span className="text-neon-lime">TRIGGER</span>
            <span className="text-neon-cyan ml-4">TERMINAL</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            The arcade-style trading terminal for Solana memecoins. 
            Discover trending tokens, trade with precision, and ride the waves.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-neon-cyan mb-4">🚀 Trade</h3>
              <p className="text-gray-400">
                Buy and sell tokens with lightning-fast execution
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-neon-lime mb-4">📊 Discover</h3>
              <p className="text-gray-400">
                Find trending tokens and hidden gems
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-neon-magenta mb-4">💎 Create</h3>
              <p className="text-gray-400">
                Launch your own tokens with ease
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      console.log('[App] Checking backend connection...');
      await apiService.healthCheck();
      console.log('[App] Backend connection successful');
      setBackendStatus('connected');
    } catch (error) {
      console.error('[App] Backend connection failed:', error);
      setBackendStatus('error');
    }
  };

  if (backendStatus !== 'connected') {
    return (
      <ConnectionStatus 
        status={backendStatus} 
        onRetry={checkBackendConnection}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-terminal text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
EOF
fi

# Create basic main.tsx if missing
if [ ! -f "src/main.tsx" ]; then
    print_status "Creating src/main.tsx..."
    cat > src/main.tsx << 'EOF'
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
fi

# Fix tailwind config
print_status "Updating tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        orbitron: ['Orbitron', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom terminal colors
        terminal: 'hsl(120 100% 4%)',
        'neon-cyan': 'hsl(180 100% 50%)',
        'neon-lime': 'hsl(90 100% 50%)',
        'neon-magenta': 'hsl(300 100% 60%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
EOF

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install --legacy-peer-deps
fi

print_success "TypeScript configuration fixed!"
print_success "Frontend should now compile without errors"

# Run type check
print_status "Running TypeScript check..."
if npx tsc --noEmit; then
    print_success "TypeScript compilation successful!"
else
    print_error "There may still be some TypeScript issues to resolve"
fi

echo ""
echo "✅ Frontend configuration fixed!"
echo "🚀 You can now run: npm run dev"
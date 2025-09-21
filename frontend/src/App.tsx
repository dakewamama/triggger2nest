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

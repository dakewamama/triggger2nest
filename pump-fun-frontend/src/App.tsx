import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/home/HomePage';
import CreateTokenPage from './pages/token/CreateTokenPage';
import TokenDetailPage from './pages/token/TokenDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import { pumpService } from './services/api/pumpService';
import SystemStatus from './components/common/SystemStatus';

function AppContent() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  useEffect(() => {
    checkBackendConnection();
  }, []);
  
  const checkBackendConnection = async () => {
    try {
      await pumpService.healthCheck();
      setBackendStatus('online');
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendStatus('offline');
    }
  };
  
  if (backendStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to backend...</p>
        </div>
      </div>
    );
  }
  
  if (backendStatus === 'offline') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-2">Backend Connection Failed</h2>
          <p className="text-gray-300 mb-4">
            Cannot connect to the backend server. Please ensure:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1 mb-4">
            <li>Backend is running on port 3000</li>
            <li>Run: <code className="bg-gray-800 px-2 py-1 rounded">npm run start:dev</code></li>
            <li>Check console for error details</li>
          </ul>
          <button
            onClick={checkBackendConnection}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateTokenPage />} />
          <Route path="/token/:mintAddress" element={<TokenDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
      <SystemStatus />
    </WalletProvider>
  );
}

export default App;

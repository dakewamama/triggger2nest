import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check for required environment variables
if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL is not set. Using default: http://localhost:8000');
}

// Log environment info
console.log('🚀 Pump.fun Frontend Starting...');
console.log('📍 Backend API:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
console.log('🌐 Solana Network:', import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta');
console.log('⚙️ Mode:', import.meta.env.MODE);


if (import.meta.env.PROD && !import.meta.env.VITE_PRIVY_APP_ID) {
  console.warn('⚠️ VITE_PRIVY_APP_ID is not set. Wallet connection may not work properly.');
  console.info('ℹ️ Get your Privy App ID from https://dashboard.privy.io');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
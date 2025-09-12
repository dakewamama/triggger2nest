import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check for required environment variables
if (!import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL is not set. Using default: http://localhost:3000');
}

if (!import.meta.env.VITE_PRIVY_APP_ID) {
  console.error(' VITE_PRIVY_APP_ID is not set. Wallet connection will not work properly.');
  console.info('Get your Privy App ID from https://dashboard.privy.io');
}

// Log environment info
console.log('trigger app Starting...');
console.log('📍 API URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000');
console.log('🌐 Network:', import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta');
console.log(' Mode:', import.meta.env.MODE);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
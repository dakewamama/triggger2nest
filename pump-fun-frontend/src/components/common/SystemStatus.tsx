import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { pumpService } from '../../services/api/pumpService'
import { pumpFunApi } from '../../services/pump-api/pump-fun.service';
import { useWallet } from '../../hooks/useWallet';
import { ENV } from '../../config/env';

interface StatusCheck {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
}

export default function SystemStatus() {
  const { isConnected, address, balance } = useWallet();
  const [checks, setChecks] = useState<StatusCheck[]>([
    { name: 'Backend API', status: 'checking', message: 'Checking...' },
    { name: 'Pump.fun API', status: 'checking', message: 'Checking...' },
    { name: 'Solana RPC', status: 'checking', message: 'Checking...' },
    { name: 'Wallet Connection', status: 'checking', message: 'Checking...' },
    { name: 'Environment', status: 'checking', message: 'Checking...' },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    runDiagnostics();
  }, [isConnected, address]);
  
  const runDiagnostics = async () => {
    const newChecks: StatusCheck[] = [];
    
    // Check Backend API
    try {
      const health = await pumpService.healthCheck();
      newChecks.push({
        name: 'Backend API',
        status: 'success',
        message: `Connected to ${ENV.API_URL}`,
      });
    } catch (error) {
      newChecks.push({
        name: 'Backend API',
        status: 'error',
        message: `Cannot connect to backend at ${ENV.API_URL}`,
      });
    }
    
    // Check Pump.fun API
    try {
      const tokens = await pumpFunApi.getTrendingTokens(1);
      newChecks.push({
        name: 'Pump.fun API',
        status: 'success',
        message: 'API is accessible',
      });
    } catch (error) {
      newChecks.push({
        name: 'Pump.fun API',
        status: 'warning',
        message: 'API might be rate-limited or down',
      });
    }
    
    // Check Solana RPC
    try {
      const response = await fetch(ENV.SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
      });
      const data = await response.json();
      newChecks.push({
        name: 'Solana RPC',
        status: 'success',
        message: `Connected to ${ENV.SOLANA_NETWORK}`,
      });
    } catch (error) {
      newChecks.push({
        name: 'Solana RPC',
        status: 'error',
        message: 'Cannot connect to Solana RPC',
      });
    }
    
    // Check Wallet
    if (isConnected && address) {
      newChecks.push({
        name: 'Wallet Connection',
        status: 'success',
        message: `Connected: ${address.slice(0, 4)}...${address.slice(-4)} (${balance.toFixed(4)} SOL)`,
      });
    } else {
      newChecks.push({
        name: 'Wallet Connection',
        status: 'warning',
        message: 'No wallet connected',
      });
    }
    
    // Check Environment
    const privyConfigured = ENV.PRIVY_APP_ID && ENV.PRIVY_APP_ID !== '';
    newChecks.push({
      name: 'Environment',
      status: privyConfigured ? 'success' : 'warning',
      message: privyConfigured 
        ? `${ENV.IS_DEV ? 'Development' : 'Production'} mode`
        : 'Privy App ID not configured',
    });
    
    setChecks(newChecks);
  };
  
  const getStatusIcon = (status: StatusCheck['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };
  
  const getOverallStatus = () => {
    const hasError = checks.some(c => c.status === 'error');
    const hasWarning = checks.some(c => c.status === 'warning');
    
    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    return 'success';
  };
  
  const overallStatus = getOverallStatus();
  
  return (
    <>
      {/* Floating Status Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 rounded-full shadow-lg transition-colors ${
            overallStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700'
              : overallStatus === 'warning'
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {overallStatus === 'error' ? (
            <XCircle className="w-6 h-6 text-white" />
          ) : overallStatus === 'warning' ? (
            <AlertCircle className="w-6 h-6 text-white" />
          ) : (
            <CheckCircle className="w-6 h-6 text-white" />
          )}
        </button>
      </div>
      
      {/* Status Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">System Status</h3>
              <button
                onClick={runDiagnostics}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{check.name}</p>
                  <p className="text-xs text-gray-400">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-700 bg-gray-800/50">
            <div className="text-xs text-gray-400 space-y-1">
              <p>API: {ENV.API_URL}</p>
              <p>Network: {ENV.SOLANA_NETWORK}</p>
              <p>Mode: {ENV.IS_DEV ? 'Development' : 'Production'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
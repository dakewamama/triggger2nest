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
    { name: 'Pump.fun Data', status: 'checking', message: 'Checking...' },
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
      console.log('[SystemStatus] Testing backend connection...');
      const health = await pumpService.healthCheck();
      newChecks.push({
        name: 'Backend API',
        status: 'success',
        message: `Connected to ${ENV.API_URL}`,
      });
      console.log('[SystemStatus] Backend connection: SUCCESS');
    } catch (error: any) {
      console.error('[SystemStatus] Backend connection failed:', error);
      newChecks.push({
        name: 'Backend API',
        status: 'error',
        message: `Cannot connect to backend at ${ENV.API_URL}`,
      });
    }
    
    // Check Pump.fun Data (through our backend)
    try {
      console.log('[SystemStatus] Testing pump.fun data...');
      const tokens = await pumpFunApi.getTrendingTokens(1);
      if (tokens && tokens.length > 0) {
        newChecks.push({
          name: 'Pump.fun Data',
          status: 'success',
          message: `Data available (${tokens.length} tokens)`,
        });
        console.log('[SystemStatus] Pump.fun data: SUCCESS');
      } else {
        newChecks.push({
          name: 'Pump.fun Data',
          status: 'warning',
          message: 'No token data available',
        });
        console.log('[SystemStatus] Pump.fun data: NO DATA');
      }
    } catch (error: any) {
      console.error('[SystemStatus] Pump.fun data failed:', error);
      newChecks.push({
        name: 'Pump.fun Data',
        status: 'warning',
        message: 'Token data unavailable',
      });
    }
    
    // Check Solana RPC
    try {
      console.log('[SystemStatus] Testing Solana RPC...');
      const response = await fetch(ENV.SOLANA_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (response.ok) {
        newChecks.push({
          name: 'Solana RPC',
          status: 'success',
          message: `Connected to ${ENV.SOLANA_NETWORK}`,
        });
        console.log('[SystemStatus] Solana RPC: SUCCESS');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      console.error('[SystemStatus] Solana RPC failed:', error);
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
    const envStatus = ENV.API_URL && ENV.SOLANA_NETWORK;
    newChecks.push({
      name: 'Environment',
      status: envStatus ? 'success' : 'warning',
      message: envStatus 
        ? `${ENV.IS_DEV ? 'Development' : 'Production'} mode (${ENV.SOLANA_NETWORK})`
        : 'Configuration incomplete',
    });
    
    console.log('[SystemStatus] Diagnostics completed:', newChecks);
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
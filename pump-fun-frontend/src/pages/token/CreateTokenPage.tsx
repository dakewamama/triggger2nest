import React from 'react';
import CreateTokenForm from '../components/forms/CreateTokenForm';
import { useWallet } from '../contexts/WalletContext';
import { Coins, AlertCircle } from 'lucide-react';

export default function CreateTokenPage() {
  const { isConnected } = useWallet();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-600/20 rounded-full">
              <Coins className="h-8 w-8 text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Create New Token</h1>
          <p className="text-gray-400">
            Launch your own token on Solana with Pump.fun
          </p>
        </div>
        
        {!isConnected ? (
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              <h3 className="font-semibold text-yellow-400">Wallet Connection Required</h3>
            </div>
            <p className="text-gray-300">
              Please connect your wallet to create a token. You'll need approximately 0.02 SOL for token creation fees.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6">
            <CreateTokenForm />
          </div>
        )}
      </div>
    </div>
  );
}
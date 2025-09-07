import { useWallet } from '../../hooks/useWallet';
import { User, Wallet, Coins, TrendingUp } from 'lucide-react';

export default function ProfilePage() {
  const { isConnected, address, balance } = useWallet();
  
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-gray-400">
            Please connect your wallet to view your profile and holdings.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Wallet Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">Wallet</h2>
          </div>
          <p className="font-mono text-sm text-gray-400 mb-2">{address}</p>
          <p className="text-2xl font-bold">{balance.toFixed(4)} SOL</p>
        </div>
        
        {/* Holdings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Holdings</h2>
          </div>
          <p className="text-gray-400">Token holdings will appear here</p>
        </div>
        
        {/* Performance */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Performance</h2>
          </div>
          <p className="text-gray-400">Trading performance metrics</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-center py-8">
            Your recent transactions will appear here
          </p>
        </div>
      </div>
    </div>
  );
}
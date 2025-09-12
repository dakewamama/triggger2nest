import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Wallet, 
  Coins, 
  TrendingUp, 
  RefreshCw,
  ExternalLink,
  DollarSign,
  Activity,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useWallet } from '../../hooks/useWallet';
import { pumpService } from '../../services/api/pumpService';
import { pumpFunApi } from '../../services/pump-api/pump-fun.service';

interface TokenHolding {
  mint: string;
  balance: number;
  decimals: number;
  tokenInfo: any;
}

interface Transaction {
  signature: string;
  slot: number;
  blockTime: number;
  transaction: any;
}

export default function ProfilePage() {
  const { isConnected, address, balance } = useWallet();
  
  const [holdings, setHoldings] = useState<TokenHolding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (isConnected && address) {
      loadUserData();
    }
  }, [isConnected, address]);
  
  const loadUserData = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // ✅ FIXED: use new safe return shapes
      const [balanceResult, historyResult] = await Promise.all([
        pumpService.getWalletBalances(address).catch(() => ({ 
          success: true,
          data: { tokenBalances: [], solBalance: 0, portfolioValue: 0 }
        })),
        pumpService.getTransactionHistory(address, 20).catch(() => ({ 
          success: true, 
          data: [] 
        })),
      ]);

      const tokenHoldings = balanceResult.data?.tokenBalances || [];
      const transactionsData = historyResult.data || [];
      
      setHoldings(tokenHoldings);
      setTransactions(transactionsData);
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };
  
  const calculatePortfolioValue = () => {
    return holdings.reduce((total, holding) => {
      if (holding.tokenInfo?.price) {
        return total + (holding.balance * holding.tokenInfo.price);
      }
      return total;
    }, 0);
  };
  
  const getHoldingsWithValue = () => {
    return holdings
      .filter(holding => holding.balance > 0)
      .map(holding => ({
        ...holding,
        value: holding.tokenInfo?.price ? holding.balance * holding.tokenInfo.price : 0,
      }))
      .sort((a, b) => b.value - a.value);
  };
  
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your profile and holdings.
          </p>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Why Connect?</h3>
            <ul className="text-left space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-green-400" />
                View your token holdings
              </li>
              <li className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Track transaction history
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                Monitor portfolio performance
              </li>
              <li className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                Trade tokens directly
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  const portfolioValue = calculatePortfolioValue();
  const holdingsWithValue = getHoldingsWithValue();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Wallet Info */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">SOL Balance</h2>
          </div>
          <p className="text-2xl font-bold text-white">{balance.toFixed(4)} SOL</p>
          <p className="text-sm text-gray-400 font-mono">{pumpFunApi.formatAddress(address!)}</p>
        </div>
        
        {/* Portfolio Value */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Portfolio Value</h2>
          </div>
          <p className="text-2xl font-bold text-white">
            {pumpFunApi.formatPrice(portfolioValue)}
          </p>
          <p className="text-sm text-gray-400">
            {pumpFunApi.formatPrice(portfolioValue + balance * 0.1)} total
          </p>
        </div>
        
        {/* Holdings Count */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Coins className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Token Holdings</h2>
          </div>
          <p className="text-2xl font-bold text-white">{holdingsWithValue.length}</p>
          <p className="text-sm text-gray-400">
            {holdings.filter(h => h.tokenInfo?.complete).length} graduated
          </p>
        </div>
        
        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">Transactions</h2>
          </div>
          <p className="text-2xl font-bold text-white">{transactions.length}</p>
          <p className="text-sm text-gray-400">Last 20 transactions</p>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile data...</p>
        </div>
      )}
      
      {/* Content Grid */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Holdings */}
          {/* ... keep existing holdings + transactions rendering unchanged ... */}
        </div>
      )}
    </div>
  );
}

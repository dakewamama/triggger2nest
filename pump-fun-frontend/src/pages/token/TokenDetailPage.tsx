import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, TrendingUp, Users, Activity, Loader2 } from 'lucide-react';
import { pumpFunApi, PumpToken, TokenTrade } from '../services/pump-api/pump-fun.service';
import { pumpService } from '../../services/api/pumpService';
import { useWallet } from '../contexts/WalletContext';

export default function TokenDetailPage() {
  const { mintAddress } = useParams<{ mintAddress: string }>();
  const { isConnected, address } = useWallet();
  const [token, setToken] = useState<PumpToken | null>(null);
  const [trades, setTrades] = useState<TokenTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  
  useEffect(() => {
    if (mintAddress) {
      fetchTokenDetails();
      fetchTrades();
    }
  }, [mintAddress]);
  
  const fetchTokenDetails = async () => {
    if (!mintAddress) return;
    
    try {
      const details = await pumpFunApi.getTokenDetails(mintAddress);
      setToken(details);
    } catch (error) {
      console.error('Failed to fetch token details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTrades = async () => {
    if (!mintAddress) return;
    
    try {
      const tradeList = await pumpFunApi.getTokenTrades(mintAddress, 50);
      setTrades(tradeList);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
    }
  };
  
  const handleBuy = async () => {
    if (!isConnected || !buyAmount || !mintAddress) return;
    
    setTxLoading(true);
    try {
      await pumpService.buyToken({
        mintAddress,
        amountSol: parseFloat(buyAmount),
      });
      setBuyAmount('');
      // Refresh data
      fetchTokenDetails();
      fetchTrades();
    } catch (error: any) {
      alert(`Buy failed: ${error.message}`);
    } finally {
      setTxLoading(false);
    }
  };
  
  const handleSell = async () => {
    if (!isConnected || !sellAmount || !mintAddress) return;
    
    setTxLoading(true);
    try {
      await pumpService.sellToken({
        mintAddress,
        amountTokens: parseFloat(sellAmount),
      });
      setSellAmount('');
      // Refresh data
      fetchTokenDetails();
      fetchTrades();
    } catch (error: any) {
      alert(`Sell failed: ${error.message}`);
    } finally {
      setTxLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
      </div>
    );
  }
  
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Token not found</h2>
          <Link to="/" className="text-green-400 hover:text-green-300">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  const price = pumpFunApi.calculatePrice(token);
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Tokens
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Token Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-6">
                {token.image_uri ? (
                  <img src={token.image_uri} alt={token.symbol} className="w-20 h-20 rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold">{token.symbol[0]}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{token.name}</h1>
                  <p className="text-xl text-gray-400 mb-4">{token.symbol}</p>
                  <p className="text-gray-300">{token.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Price</p>
                  <p className="text-lg font-mono">${price.toFixed(6)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Market Cap</p>
                  <p className="text-lg font-medium">${(token.usd_market_cap / 1e6).toFixed(2)}M</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Supply</p>
                  <p className="text-lg font-medium">{(token.total_supply / 1e9).toFixed(2)}B</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <p className="text-lg font-medium">
                    {token.complete ? '✅ Graduated' : '🚀 Bonding'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Recent Trades */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
              <div className="space-y-2">
                {trades.slice(0, 10).map((trade) => (
                  <div key={trade.signature} className="flex items-center justify-between py-2 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.is_buy ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}>
                        {trade.is_buy ? 'BUY' : 'SELL'}
                      </span>
                      <span className="text-sm text-gray-400">
                        {trade.token_amount.toFixed(2)} tokens
                      </span>
                    </div>
                    <span className="text-sm font-mono text-gray-300">
                      {trade.sol_amount.toFixed(4)} SOL
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Trading Panel */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Trade</h2>
              
              {!isConnected ? (
                <div className="text-center py-8 text-gray-400">
                  Connect wallet to trade
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Buy Section */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Buy Tokens</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="SOL amount"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        step="0.001"
                        min="0.001"
                      />
                      <button
                        onClick={handleBuy}
                        disabled={!buyAmount || txLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                  
                  {/* Sell Section */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Sell Tokens</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Token amount"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                        step="1"
                        min="1"
                      />
                      <button
                        onClick={handleSell}
                        disabled={!sellAmount || txLoading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Links */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3">Links</h3>
              <div className="space-y-2">
                <a
                  href={`https://pump.fun/${mintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Pump.fun
                </a>
                <a
                  href={`https://solscan.io/token/${mintAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Solscan
                </a>
                {token.twitter && (
                  <a
                    href={`https://twitter.com/${token.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Twitter
                  </a>
                )}
                {token.telegram && (
                  <a
                    href={token.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Telegram
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
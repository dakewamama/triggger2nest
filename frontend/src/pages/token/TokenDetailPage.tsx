import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, AlertTriangle, CheckCircle, TrendingUp, Users, Clock, Copy } from 'lucide-react';
import { pumpFunApi, type PumpToken, type TokenTrade } from '../../services/pump-api/pump-fun.service';
import { pumpService } from '../../services/api/pumpService';
import { useWallet } from '../../hooks/useWallet';
import { Connection, Transaction } from '@solana/web3.js';
import { ENV } from '../../config/env';

export default function TokenDetailPage() {
  const { mintAddress } = useParams<{ mintAddress: string }>();
  const { isConnected, address, sendTransaction } = useWallet();
  
  const [token, setToken] = useState<PumpToken | null>(null);
  const [trades, setTrades] = useState<TokenTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
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
  
  const clearMessages = () => {
    setTxError(null);
    setTxSuccess(null);
  };
  
  const copyAddress = async (addressToCopy: string) => {
    await navigator.clipboard.writeText(addressToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleBuy = async () => {
    if (!isConnected || !buyAmount || !mintAddress || !address) {
      setTxError('Please connect your wallet and enter an amount');
      return;
    }
    
    const solAmount = parseFloat(buyAmount);
    if (isNaN(solAmount) || solAmount <= 0) {
      setTxError('Please enter a valid SOL amount');
      return;
    }
    
    if (solAmount < 0.001) {
      setTxError('Minimum buy amount is 0.001 SOL');
      return;
    }
    
    setTxLoading(true);
    clearMessages();
    
    try {
      console.log('Creating buy transaction...');
      
      const response = await pumpService.createBuyTransaction({
        mint: mintAddress,
        publicKey: address,
        amount: 0,
        solAmount: solAmount,
        slippage: 1,
        priorityFee: 0.00001,
      });
      
      if (!response.success || !response.transaction) {
        throw new Error(response.error || 'Failed to create buy transaction');
      }
      
      console.log('Signing and sending buy transaction...');
      const connection = new Connection(ENV.SOLANA_RPC);
      const transaction = Transaction.from(Buffer.from(response.transaction, 'base64'));
      
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Buy transaction sent:', signature);
      setTxSuccess(`Buy successful! Transaction: ${signature.slice(0, 8)}...`);
      setBuyAmount('');
      
      setTimeout(() => {
        fetchTokenDetails();
        fetchTrades();
      }, 2000);
      
    } catch (error: any) {
      console.error('Buy failed:', error);
      
      let errorMessage = 'Buy transaction failed';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient SOL balance';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setTxError(errorMessage);
    } finally {
      setTxLoading(false);
    }
  };
  
  const handleSell = async () => {
    if (!isConnected || !sellAmount || !mintAddress || !address) {
      setTxError('Please connect your wallet and enter an amount');
      return;
    }
    
    const tokenAmount = parseFloat(sellAmount);
    if (isNaN(tokenAmount) || tokenAmount <= 0) {
      setTxError('Please enter a valid token amount');
      return;
    }
    
    setTxLoading(true);
    clearMessages();
    
    try {
      console.log('Creating sell transaction...');
      
      const response = await pumpService.createSellTransaction({
        mint: mintAddress,
        publicKey: address,
        amount: tokenAmount,
        slippage: 1,
        priorityFee: 0.00001,
      });
      
      if (!response.success || !response.transaction) {
        throw new Error(response.error || 'Failed to create sell transaction');
      }
      
      console.log('Signing and sending sell transaction...');
      const connection = new Connection(ENV.SOLANA_RPC);
      const transaction = Transaction.from(Buffer.from(response.transaction, 'base64'));
      
      const signature = await sendTransaction(transaction, connection);
      
      console.log('Sell transaction sent:', signature);
      setTxSuccess(`Sell successful! Transaction: ${signature.slice(0, 8)}...`);
      setSellAmount('');
      
      setTimeout(() => {
        fetchTokenDetails();
        fetchTrades();
      }, 2000);
      
    } catch (error: any) {
      console.error('Sell failed:', error);
      
      let errorMessage = 'Sell transaction failed';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient token balance';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setTxError(errorMessage);
    } finally {
      setTxLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-green-400/20 rounded-full animate-pulse mx-auto" />
          </div>
          <p className="text-gray-400 text-xl">Loading token details...</p>
        </div>
      </div>
    );
  }
  
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Token Not Found</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The token with address {mintAddress?.slice(0, 8)}... could not be found or loaded.
            </p>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const price = pumpFunApi.calculatePrice(token);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.05),transparent_50%)]" />
      
      <div className="relative container mx-auto px-6 py-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 group transition-colors duration-300"
        >
          <div className="p-2 rounded-xl bg-gray-800/60 group-hover:bg-gray-700/60 transition-colors duration-300">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to Tokens</span>
        </Link>
        
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Token Info - Left Column */}
          <div className="xl:col-span-8 space-y-8">
            {/* Main Token Card */}
            <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5" />
              
              <div className="relative">
                {/* Token Header */}
                <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
                  <div className="flex items-start gap-6">
                    {token.image_uri ? (
                      <div className="relative">
                        <img 
                          src={token.image_uri} 
                          alt={token.symbol} 
                          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-gray-600 shadow-lg" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://via.placeholder.com/96/6B7280/FFFFFF?text=${token.symbol[0]}`;
                          }}
                        />
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl opacity-20 blur-sm" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-600 rounded-3xl flex items-center justify-center ring-4 ring-gray-600 shadow-lg">
                        <span className="text-3xl font-bold text-white">{token.symbol[0]}</span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-4xl font-bold text-white">{token.name}</h1>
                        {token.complete ? (
                          <span className="px-4 py-2 bg-green-900/50 text-green-400 text-sm rounded-full border border-green-500/30 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                            Graduated
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-blue-900/50 text-blue-400 text-sm rounded-full border border-blue-500/30 flex items-center gap-2 animate-pulse">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                            Bonding
                          </span>
                        )}
                      </div>
                      <p className="text-2xl text-gray-400 font-mono mb-4">${token.symbol}</p>
                      <p className="text-gray-300 leading-relaxed text-lg">{token.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      label: 'Price',
                      value: pumpFunApi.formatPrice(price),
                      icon: TrendingUp,
                      color: 'from-green-500 to-emerald-500',
                    },
                    {
                      label: 'Market Cap',
                      value: pumpFunApi.formatMarketCap(token.usd_market_cap),
                      icon: Users,
                      color: 'from-blue-500 to-cyan-500',
                    },
                    {
                      label: 'Supply',
                      value: `${(token.total_supply / 1e9).toFixed(2)}B`,
                      icon: Users,
                      color: 'from-purple-500 to-violet-500',
                    },
                    {
                      label: 'Created',
                      value: pumpFunApi.formatTimeAgo(token.created_timestamp),
                      icon: Clock,
                      color: 'from-orange-500 to-red-500',
                    },
                  ].map((stat, index) => (
                    <div key={index} className="group">
                      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-4 transition-all duration-300 group-hover:transform group-hover:-translate-y-1 group-hover:shadow-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color}`}>
                            <stat.icon className="w-4 h-4 text-white" />
                          </div>
                          <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        </div>
                        <p className="text-xl font-bold text-white">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Creator Info */}
                <div className="mt-8 pt-6 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Created by</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-300">
                          {pumpFunApi.formatAddress(token.creator, 8)}
                        </span>
                        <button
                          onClick={() => copyAddress(token.creator)}
                          className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Contract Address</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-300 text-sm">
                          {pumpFunApi.formatAddress(mintAddress || '', 8)}
                        </span>
                        <button
                          onClick={() => copyAddress(mintAddress || '')}
                          className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
                        >
                          <Copy className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Trades */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Recent Trades
              </h2>
              {trades.length > 0 ? (
                <div className="space-y-3">
                  {trades.slice(0, 10).map((trade) => (
                    <div key={trade.signature} className="bg-gray-900/40 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 hover:bg-gray-900/60">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          trade.is_buy 
                            ? 'bg-green-900/50 text-green-400 border border-green-500/30' 
                            : 'bg-red-900/50 text-red-400 border border-red-500/30'
                        }`}>
                          {trade.is_buy ? 'BUY' : 'SELL'}
                        </span>
                        <div>
                          <p className="text-white font-medium">
                            {trade.token_amount.toLocaleString()} {token.symbol}
                          </p>
                          <p className="text-xs text-gray-400">
                            {pumpFunApi.formatTimeAgo(trade.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-mono font-medium">
                          {trade.sol_amount.toFixed(4)} SOL
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {pumpFunApi.formatAddress(trade.user, 4)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-lg">No trades yet</p>
                  <p className="text-gray-500 text-sm">Be the first to trade this token!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Trading Panel - Right Column */}
          <div className="xl:col-span-4 space-y-8">
            {/* Trading Card */}
            <div className="sticky top-8">
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">$</span>
                  </div>
                  Trade {token.symbol}
                </h2>
                
                {!isConnected ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-lg mb-2">Connect Wallet</p>
                    <p className="text-gray-500 text-sm">Connect your wallet to start trading</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Transaction Messages */}
                    {txError && (
                      <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <p className="text-red-400 text-sm">{txError}</p>
                        </div>
                      </div>
                    )}
                    
                    {txSuccess && (
                      <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <p className="text-green-400 text-sm">{txSuccess}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Buy Section */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-5">
                      <label className="block text-sm font-medium text-green-400 mb-3">
                        Buy {token.symbol}
                      </label>
                      <div className="space-y-4">
                        <div>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            step="0.001"
                            min="0.001"
                            disabled={txLoading}
                          />
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <span>Minimum: 0.001 SOL</span>
                          </p>
                        </div>
                        <button
                          onClick={handleBuy}
                          disabled={!buyAmount || txLoading}
                          className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                        >
                          {txLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Buy {token.symbol}
                        </button>
                      </div>
                    </div>
                    
                    {/* Sell Section */}
                    <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-5">
                      <label className="block text-sm font-medium text-red-400 mb-3">
                        Sell {token.symbol}
                      </label>
                      <div className="space-y-4">
                        <div>
                          <input
                            type="number"
                            placeholder="0"
                            value={sellAmount}
                            onChange={(e) => setSellAmount(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            step="1"
                            min="1"
                            disabled={txLoading}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Tokens in your wallet
                          </p>
                        </div>
                        <button
                          onClick={handleSell}
                          disabled={!sellAmount || txLoading}
                          className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                        >
                          {txLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Sell {token.symbol}
                        </button>
                      </div>
                    </div>
                    
                    {/* Trading Info */}
                    <div className="bg-gray-900/40 rounded-2xl p-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-3">Trading Settings</h4>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Slippage Tolerance</span>
                          <span className="text-gray-300">1.0%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Priority Fee</span>
                          <span className="text-gray-300">0.00001 SOL</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction Type</span>
                          <span className="text-gray-300">Wallet Signed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Links Card */}
              <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">External Links</h3>
                <div className="space-y-3">
                  {[
                    { 
                      label: 'Pump.fun', 
                      url: `https://pump.fun/${mintAddress}`,
                      icon: '🚀'
                    },
                    { 
                      label: 'Solscan', 
                      url: `https://solscan.io/token/${mintAddress}${ENV.SOLANA_NETWORK === 'devnet' ? '?cluster=devnet' : ''}`,
                      icon: '🔍'
                    },
                    ...(token.website ? [{ label: 'Website', url: token.website, icon: '🌐' }] : []),
                    ...(token.twitter ? [{ label: 'Twitter', url: `https://twitter.com/${token.twitter.replace('@', '')}`, icon: '🐦' }] : []),
                    ...(token.telegram ? [{ label: 'Telegram', url: token.telegram, icon: '📱' }] : []),
                  ].map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-900/40 hover:bg-gray-900/60 rounded-2xl transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{link.icon}</span>
                        <span className="text-gray-300 group-hover:text-white font-medium">{link.label}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
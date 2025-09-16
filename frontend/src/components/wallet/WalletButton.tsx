import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Wallet, LogOut, Copy, Check, ChevronDown, Zap, Star, Shield, Sparkles } from 'lucide-react';

export default function WalletButton() {
  const { address, isConnected, isConnecting, balance, connect, disconnect } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };
  
  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 hover:from-green-600 hover:via-emerald-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-full font-bold transition-all duration-500 transform hover:scale-110 shadow-xl shadow-green-500/40 disabled:shadow-none"
      >
        {/* Floating Wallet Icon */}
        <div className="relative">
          <Wallet className="w-5 h-5 transform group-hover:rotate-12 transition-transform duration-300" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" />
        </div>
        
        <span className="hidden sm:inline relative">
          {isConnecting ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Connecting...
            </span>
          ) : (
            'Connect Wallet'
          )}
        </span>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-500 animate-pulse" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 delay-100" />
        
        {/* Sparkle Effects */}
        <div className="absolute top-1 left-4 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-200" />
        <div className="absolute bottom-2 right-6 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-300" />
      </button>
    );
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="group relative flex items-center gap-4 px-6 py-4 bg-gray-800/80 backdrop-blur-xl hover:bg-gray-700/80 border border-gray-600/50 hover:border-green-500/60 rounded-full transition-all duration-500 transform hover:scale-105 shadow-xl hover:shadow-green-500/20"
      >
        {/* Connection Status - Floating Indicator */}
        <div className="relative">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
          <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full blur animate-pulse opacity-70" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce opacity-80" />
        </div>
        
        {/* Address & Balance Container */}
        <div className="flex items-center gap-3">
          {/* Address Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/60 rounded-full border border-gray-700/50">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <Wallet className="w-3 h-3 text-white" />
            </div>
            <span className="font-mono text-sm text-white font-bold">
              {truncateAddress(address!)}
            </span>
          </div>
          
          {/* Balance Badge - Desktop Only */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full border border-blue-500/30 transform group-hover:scale-110 transition-transform duration-300">
            <div className="relative">
              <Zap className="w-4 h-4 text-blue-400" />
              <div className="absolute inset-0 w-4 h-4 text-blue-300 animate-ping opacity-30">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <span className="text-sm text-blue-300 font-bold">
              {balance.toFixed(2)} SOL
            </span>
          </div>
        </div>
        
        {/* Dropdown Arrow */}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-all duration-300 ${showDropdown ? 'rotate-180 text-green-400' : 'group-hover:text-white'}`} />
        
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>
      
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown - Floating Card */}
          <div className="absolute right-0 mt-4 w-96 bg-gray-900/95 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl z-50 overflow-hidden transform scale-95 animate-in slide-in-from-top-2 duration-300">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl" />
            
            {/* Header Section */}
            <div className="relative p-8 border-b border-gray-700/30">
              {/* Floating Status Badge */}
              <div className="absolute -top-3 left-8 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg transform rotate-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs font-bold uppercase tracking-wider">Connected</span>
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div className="pt-4">
                <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">
                  Wallet Dashboard
                </div>
                
                {/* Main Wallet Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {/* Wallet Avatar */}
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-2xl flex items-center justify-center transform rotate-3 shadow-xl">
                        <Wallet className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                      <div className="absolute inset-0 w-14 h-14 bg-gradient-to-br from-green-500 to-purple-500 rounded-2xl blur opacity-30 animate-pulse" />
                    </div>
                    
                    <div>
                      <div className="font-mono text-lg text-white font-bold mb-1">
                        {truncateAddress(address!)}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-400">Phantom Wallet</div>
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                          <span className="text-white text-xs">👻</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={copyAddress}
                    className="group relative p-3 hover:bg-gray-800/80 rounded-2xl transition-all duration-300 transform hover:scale-110"
                  >
                    {copied ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 text-xs font-bold">Copied!</span>
                      </div>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Balance Card - Staggered Design */}
                <div className="relative transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-500/30 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">SOL Balance</div>
                        <div className="text-3xl font-black text-white mb-1">
                          {balance.toFixed(4)}
                        </div>
                        <div className="text-sm text-blue-300 font-semibold">
                          ~${(balance * 100).toFixed(2)} USD
                        </div>
                      </div>
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center transform rotate-12 shadow-xl">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-3xl blur-xl opacity-50" />
                </div>
              </div>
            </div>
            
            {/* Actions Section */}
            <div className="relative p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Tokens', value: '12', icon: '🪙' },
                  { label: 'Trades', value: '34', icon: '📈' },
                  { label: 'Profit', value: '+5.2%', icon: '💎' },
                ].map((stat, index) => (
                  <div key={index} className={`text-center p-3 bg-gray-800/60 rounded-2xl border border-gray-700/30 transform ${index % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 transition-transform duration-300`}>
                    <div className="text-lg mb-1">{stat.icon}</div>
                    <div className="text-white font-bold text-sm">{stat.value}</div>
                    <div className="text-gray-400 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
              
              {/* Disconnect Button */}
              <button
                onClick={() => {
                  disconnect();
                  setShowDropdown(false);
                }}
                className="group relative w-full flex items-center gap-4 px-6 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all duration-300 transform hover:scale-105 border border-red-500/20 hover:border-red-500/40"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors duration-300 transform group-hover:rotate-12">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-ping" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold text-lg">Disconnect Wallet</div>
                  <div className="text-xs text-gray-500">Sign out safely</div>
                </div>
                <div className="text-2xl transform group-hover:scale-125 transition-transform duration-300">
                  👋
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
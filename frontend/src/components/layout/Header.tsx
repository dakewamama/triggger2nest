import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coins, Plus, User, Home, Sparkles, Zap, Star } from 'lucide-react';
import WalletButton from '../wallet/WalletButton';

export default function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home', emoji: '🏠' },
    { path: '/create', icon: Plus, label: 'Create', emoji: '🚀' },
    { path: '/profile', icon: User, label: 'Profile', emoji: '👤' },
  ];
  
  return (
    <header className="relative bg-gray-900/90 backdrop-blur-2xl border-b border-gray-700/30 sticky top-0 z-50 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/8 via-blue-500/5 to-purple-500/8" />
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-0 right-1/3 w-24 h-24 bg-gradient-to-r from-purple-400/8 to-pink-400/8 rounded-full blur-2xl animate-pulse delay-1000" />
      
      {/* Floating Particles */}
      <div className="absolute top-4 left-10 w-1 h-1 bg-green-400/40 rounded-full animate-bounce" />
      <div className="absolute top-6 right-20 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-bounce delay-500" />
      <div className="absolute bottom-3 left-1/2 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce delay-1000" />
      
      <div className="relative container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section - Creative Positioning */}
          <Link to="/" className="group relative flex items-center space-x-4">
            {/* Main Logo */}
            <div className="relative transform group-hover:scale-110 transition-all duration-500">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 via-emerald-500 to-blue-500 rounded-3xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12 shadow-xl shadow-green-500/30">
                <Coins className="h-8 w-8 text-white transform group-hover:rotate-12 transition-transform duration-500" />
              </div>
              
              {/* Floating Elements Around Logo */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 delay-100">
                <Star className="w-3 h-3 text-white p-0.5" />
              </div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300 delay-200" />
              
              {/* Glow Effect */}
              <div className="absolute inset-0 w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            </div>
            
            {/* Logo Text */}
            <div className="hidden sm:block transform group-hover:translate-x-2 transition-transform duration-300">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                  Pump.Fun
                </span>
                <div className="transform group-hover:rotate-12 transition-transform duration-300">
                  <Sparkles className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse" />
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Controller</span>
                <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Desktop Navigation - Floating Pills */}
            <div className="hidden md:flex items-center">
              <div className="relative bg-gray-800/70 backdrop-blur-xl rounded-full p-2 border border-gray-700/40 shadow-2xl">
                <div className="flex items-center gap-2">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative flex items-center space-x-3 px-5 py-3 rounded-full font-bold transition-all duration-500 transform ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-110'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/60 hover:scale-105'
                      }`}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        transform: isActive(item.path) ? 'rotate(2deg) scale(1.1)' : ''
                      }}
                    >
                      {/* Emoji Badge */}
                      <span className="text-lg transform hover:scale-125 transition-transform duration-300">
                        {item.emoji}
                      </span>
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm font-bold">{item.label}</span>
                      
                      {/* Active Indicator */}
                      {isActive(item.path) && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-30 blur animate-pulse" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce">
                            <div className="w-full h-full bg-yellow-300 rounded-full animate-ping" />
                          </div>
                        </>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile Navigation - Floating Buttons */}
            <div className="flex md:hidden items-center space-x-2">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative p-4 rounded-2xl transition-all duration-500 transform ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-110 rotate-12'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/80 hover:scale-105'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <item.icon className="h-5 w-5" />
                  
                  {/* Mobile Active Indicator */}
                  {isActive(item.path) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
            
            {/* Wallet Button */}
            <div className="ml-6 transform hover:scale-105 transition-transform duration-300">
              <WalletButton />
            </div>
          </nav>
        </div>
      </div>
      
      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
    </header>
  );
}
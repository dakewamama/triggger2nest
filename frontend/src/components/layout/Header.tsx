import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coins, Plus, User, Home } from 'lucide-react';
import WalletButton from '../wallet/WalletButton';

export default function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-green-400'
      : 'text-gray-300 hover:text-white';
  };
  
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Coins className="h-8 w-8 text-green-400" />
            <span className="text-xl font-bold text-white">Pump.Fun</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 transition-colors ${isActive('/')}`}
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            
            <Link
              to="/create"
              className={`flex items-center space-x-2 transition-colors ${isActive('/create')}`}
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Create</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-2 transition-colors ${isActive('/profile')}`}
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            
            <WalletButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
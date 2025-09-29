import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '../providers/WalletProvider';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-terminal-bg text-white">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-terminal-bg/80 backdrop-blur-lg border-b border-terminal-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Simple Text Links */}
            <div className="flex items-center gap-6">
              <Link 
                to="/" 
                className={`font-bold transition-colors ${
                  location.pathname === '/' ? 'text-neon-lime' : 'text-gray-400 hover:text-white'
                }`}
              >
                Tokens
              </Link>
              <Link 
                to="/create" 
                className={`font-bold transition-colors ${
                  location.pathname === '/create' ? 'text-neon-lime' : 'text-gray-400 hover:text-white'
                }`}
              >
                Create
              </Link>
              <Link 
                to="/trade" 
                className={`font-bold transition-colors ${
                  location.pathname === '/trade' ? 'text-neon-lime' : 'text-gray-400 hover:text-white'
                }`}
              >
                Trade
              </Link>
            </div>
            
            {/* Wallet Button */}
            <WalletMultiButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
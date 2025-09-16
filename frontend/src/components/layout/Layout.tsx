import React from 'react';
import Header from './Header';
import { Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(34,197,94,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.02),transparent_50%)]" />
        
        {/* Animated dots */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-green-400/20 rounded-full animate-pulse" />
        <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-purple-400/20 rounded-full animate-pulse delay-2000" />
      </div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="relative mt-auto">
        {/* Gradient line */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        
        <div className="bg-gray-900/60 backdrop-blur-sm border-t border-gray-800/50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Left side - Branding */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-300 font-medium">Pump.Fun Controller</span>
                </div>
              </div>
              
              {/* Center - Copyright */}
              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  © 2025{' '}
                  <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent font-medium">
                    trigger
                  </span>
                  {' '}• Solana meme coin controller and dashboard
                </p>
              </div>
              
              {/* Right side - Links */}
              <div className="flex items-center gap-6">
                <a
                  href="https://pump.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 text-sm font-medium transition-colors duration-300 flex items-center gap-1"
                >
                  <span>pump.fun</span>
                  <div className="w-1 h-1 bg-green-400/60 rounded-full animate-pulse" />
                </a>
                <a
                  href="https://solana.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 text-sm font-medium transition-colors duration-300 flex items-center gap-1"
                >
                  <span>solana</span>
                  <div className="w-1 h-1 bg-blue-400/60 rounded-full animate-pulse" />
                </a>
              </div>
            </div>
            
            {/* Bottom disclaimer */}
            <div className="mt-6 pt-6 border-t border-gray-800/50">
              <p className="text-center text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
                This is an unofficial interface for interacting with pump.fun smart contracts. 
                Always verify transactions before signing. Trading meme coins involves significant risk.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
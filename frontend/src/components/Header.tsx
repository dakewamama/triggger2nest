import { Link } from 'react-router-dom'
import { WalletMultiButton } from '../providers/WalletProvider'
import { Search, TrendingUp, Plus } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-terminal-border bg-terminal-bg/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-neon-lime rounded animate-pulse" />
            <span className="font-display text-xl font-bold text-neon-lime">
              TRIGGER
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-gray-300 hover:text-neon-lime transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Trending</span>
            </Link>
            <Link 
              to="/create" 
              className="flex items-center space-x-2 text-gray-300 hover:text-neon-cyan transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </Link>
            <Link 
              to="/search" 
              className="flex items-center space-x-2 text-gray-300 hover:text-neon-magenta transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>
          </nav>

          {/* Wallet Connection - REAL PHANTOM WALLET */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  )
}

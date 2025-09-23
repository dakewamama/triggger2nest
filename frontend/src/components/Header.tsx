// frontend/src/components/Header.tsx
import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton } from '@/providers/WalletProvider'
import { Search, TrendingUp, Plus, Home, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/trade', label: 'Trade', icon: TrendingUp },
    { path: '/create', label: 'Create', icon: Plus },
    { path: '/search', label: 'Search', icon: Search },
  ]

  return (
    <header className="bg-terminal-surface/80 backdrop-blur-lg border-b border-terminal-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-neon-lime to-neon-cyan rounded-lg flex items-center justify-center"
            >
              <Zap className="w-6 h-6 text-black" />
            </motion.div>
            <span className="font-display text-xl font-bold">
              <span className="text-neon-lime">TRIGGER</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  location.pathname === path
                    ? 'bg-neon-lime/20 text-neon-lime'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:block">{label}</span>
              </Link>
            ))}
          </nav>

          {/* Wallet Button */}
          <WalletMultiButton />
        </div>
      </div>
    </header>
  )
}
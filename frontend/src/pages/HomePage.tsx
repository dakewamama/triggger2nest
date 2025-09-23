import { useEffect, useState } from 'react'
import { api } from '../services/api'
import TokenCard from '../components/TokenCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, Clock } from 'lucide-react'

export default function HomePage() {
  const [featuredTokens, setFeaturedTokens] = useState([])
  const [trendingTokens, setTrendingTokens] = useState([])
  const [newTokens, setNewTokens] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getFeaturedTokens(),
      api.getTrendingTokens(),
      api.getNewTokens()
    ]).then(([featured, trending, newest]) => {
      setFeaturedTokens(featured)
      setTrendingTokens(trending)
      setNewTokens(newest)
      setLoading(false)
    }).catch(console.error)
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 relative"
      >
        <div className="absolute inset-0 cyber-grid opacity-20" />
        <h1 className="text-5xl font-display font-black mb-4">
          <span className="shimmer">PUMP.FUN TERMINAL</span>
        </h1>
        <p className="text-gray-400 text-lg">Trade Solana memecoins on devnet</p>
      </motion.div>

      {/* Token Tabs */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="bg-terminal-surface border border-terminal-border">
          <TabsTrigger value="featured" className="data-[state=active]:bg-neon-gold/20 data-[state=active]:text-neon-gold">
            <Sparkles size={16} className="mr-2" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-neon-lime/20 data-[state=active]:text-neon-lime">
            <TrendingUp size={16} className="mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="new" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
            <Clock size={16} className="mr-2" />
            New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="terminal-card animate-pulse">
                  <div className="h-40 bg-terminal-border rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredTokens.map((token: any) => (
                <TokenCard key={token.mint} {...token} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {trendingTokens.map((token: any) => (
              <TokenCard key={token.mint} {...token} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {newTokens.map((token: any) => (
              <TokenCard key={token.mint} {...token} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
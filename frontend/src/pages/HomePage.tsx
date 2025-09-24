import { useState, useEffect } from 'react'
import { api } from '../services/api'
import TokenCard from '../components/TokenCard'
import RecentTrades from '../components/RecentTrades'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { TrendingUp, Sparkles, Clock } from 'lucide-react'

export default function HomePage() {
  const [featuredTokens, setFeaturedTokens] = useState<any[]>([])
  const [trendingTokens, setTrendingTokens] = useState<any[]>([])
  const [newTokens, setNewTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trending')

  useEffect(() => {
    loadTokens()
    const interval = setInterval(loadTokens, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadTokens = async () => {
    try {
      setLoading(true)
      console.log('Loading tokens from backend...')
      
      const [featured, trending, newTokens] = await Promise.all([
        api.getFeaturedTokens(10, 0),
        api.getTrendingTokens(50, 0),
        api.getNewTokens(50, 0)
      ])

      console.log('Loaded tokens:', { featured, trending, newTokens })
      
      setFeaturedTokens(featured || [])
      setTrendingTokens(trending || [])
      setNewTokens(newTokens || [])
    } catch (error) {
      console.error('Failed to load tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-green-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Featured Tokens */}
      {featuredTokens.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-2xl font-bold text-neon-lime mb-4 flex items-center">
            <Sparkles className="w-6 h-6 mr-2" />
            Featured Tokens
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTokens.slice(0, 6).map((token) => (
              <TokenCard key={token.mint} token={token} />
            ))}
          </div>
        </section>
      )}

      {/* Token Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="trending">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="new">
                <Clock className="w-4 h-4 mr-2" />
                New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending">
              {trendingTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No trending tokens found. Backend might be down or rate limited.
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingTokens.map((token) => (
                    <TokenCard key={token.mint} token={token} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="new">
              {newTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No new tokens found. Backend might be down or rate limited.
                </div>
              ) : (
                <div className="space-y-4">
                  {newTokens.map((token) => (
                    <TokenCard key={token.mint} token={token} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Trades */}
        <div>
          <RecentTrades />
        </div>
      </div>
    </div>
  )
}

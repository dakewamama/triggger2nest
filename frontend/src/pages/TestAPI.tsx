import { useState, useEffect } from 'react'
import apiService from '../services/api'

export default function TestAPI() {
  const [status, setStatus] = useState<any>({})
  const [trending, setTrending] = useState<any[]>([])
  const [newTokens, setNewTokens] = useState<any[]>([])
  const [marketStats, setMarketStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<any[]>([])

  useEffect(() => {
    testAllEndpoints()
  }, [])

  const testAllEndpoints = async () => {
    setLoading(true)
    const newErrors: any[] = []

    // Test health
    try {
      const health = await apiService.healthCheck()
      setStatus(health)
      console.log('✅ Health check passed:', health)
    } catch (error: any) {
      newErrors.push({ endpoint: 'health', error: error.message })
      console.error('❌ Health check failed:', error)
    }

    // Test trending tokens
    try {
      const tokens = await apiService.getTrendingTokens(5, 0)
      setTrending(tokens)
      console.log('✅ Trending tokens:', tokens)
    } catch (error: any) {
      newErrors.push({ endpoint: 'trending', error: error.message })
      console.error('❌ Trending tokens failed:', error)
    }

    // Test new tokens
    try {
      const tokens = await apiService.getNewTokens(5, 0)
      setNewTokens(tokens)
      console.log('✅ New tokens:', tokens)
    } catch (error: any) {
      newErrors.push({ endpoint: 'new', error: error.message })
      console.error('❌ New tokens failed:', error)
    }

    // Test market stats
    try {
      const stats = await apiService.getMarketStats()
      setMarketStats(stats)
      console.log('✅ Market stats:', stats)
    } catch (error: any) {
      newErrors.push({ endpoint: 'marketStats', error: error.message })
      console.error('❌ Market stats failed:', error)
    }

    setErrors(newErrors)
    setLoading(false)
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      <div className="space-y-6">
        {/* Backend Status */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Backend Status</h2>
          {loading ? (
            <div className="animate-pulse">Testing connection...</div>
          ) : (
            <div>
              {status.status === 'ok' ? (
                <div className="text-green-400">
                  ✅ Backend Connected
                  <pre className="mt-2 text-xs">{JSON.stringify(status, null, 2)}</pre>
                </div>
              ) : (
                <div className="text-red-400">❌ Backend Offline</div>
              )}
            </div>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-900/50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-red-400">Errors</h2>
            {errors.map((err, i) => (
              <div key={i} className="mb-2">
                <span className="font-mono">{err.endpoint}:</span> {err.error}
              </div>
            ))}
          </div>
        )}

        {/* Market Stats */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Market Stats</h2>
          {marketStats ? (
            <pre className="text-xs overflow-auto">
              {JSON.stringify(marketStats, null, 2)}
            </pre>
          ) : (
            <div className="text-gray-500">No data</div>
          )}
        </div>

        {/* Trending Tokens */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Trending Tokens ({trending.length})
          </h2>
          {trending.length > 0 ? (
            <div className="space-y-2">
              {trending.map((token, i) => (
                <div key={i} className="bg-gray-700 p-3 rounded">
                  <div className="font-bold">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                  <div className="text-xs">MC: ${token.market_cap?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No tokens found</div>
          )}
        </div>

        {/* New Tokens */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            New Tokens ({newTokens.length})
          </h2>
          {newTokens.length > 0 ? (
            <div className="space-y-2">
              {newTokens.map((token, i) => (
                <div key={i} className="bg-gray-700 p-3 rounded">
                  <div className="font-bold">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No tokens found</div>
          )}
        </div>

        <button
          onClick={testAllEndpoints}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
        >
          Retest All Endpoints
        </button>
      </div>
    </div>
  )
}

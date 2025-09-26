import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import TokenCard from '../components/TokenCard'
import { Search, Filter, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import debounce from 'lodash.debounce'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [relatedTokens, setRelatedTokens] = useState<any>([])
  const [searchType, setSearchType] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await api.searchTokens(searchQuery)
        setResults(response.data || [])
        setSuggestions(response.suggestions || [])
        setRelatedTokens(response.relatedTokens || [])
        setSearchType(response.searchType || '')
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setLoading(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    performSearch(query)
  }, [query])

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="terminal-card">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, symbol, or contract address..."
              className="w-full bg-terminal-bg border border-terminal-border rounded-lg pl-10 pr-4 py-3 focus:border-neon-lime outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-all ${
              showFilters ? 'bg-neon-lime text-black border-neon-lime' : 'border-terminal-border'
            }`}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Search Type Indicator */}
        {searchType && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-gray-400 text-sm">Search type:</span>
            <span className="px-2 py-1 bg-neon-lime/20 text-neon-lime rounded text-sm font-mono">
              {searchType}
            </span>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-gray-400 text-sm mb-2">Did you mean:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(suggestion)}
                  className="px-3 py-1 bg-terminal-border rounded hover:bg-neon-lime hover:text-black transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="terminal-card overflow-hidden"
          >
            <h3 className="font-display font-bold mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400">Min Market Cap</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full mt-1 bg-terminal-bg border border-terminal-border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Max Market Cap</label>
                <input
                  type="number"
                  placeholder="1000000"
                  className="w-full mt-1 bg-terminal-bg border border-terminal-border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Min Volume 24h</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full mt-1 bg-terminal-bg border border-terminal-border rounded px-3 py-2"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="terminal-card animate-pulse">
              <div className="h-40 bg-terminal-border rounded" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-bold">
              {results.length} Results
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((token: any) => (
              <TokenCard key={token.mint} {...token} />
            ))}
          </div>
        </>
      ) : query && !loading ? (
        <div className="text-center py-12">
          <Sparkles className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-display mb-2">No tokens found</h3>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      ) : null}

      {/* Related Tokens */}
      {relatedTokens.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-display font-bold">Related Tokens</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {relatedTokens.map((token: any) => (
              <TokenCard key={token.mint} {...token} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState } from 'react';
import { Bug, Search, Database, Activity, X, RefreshCw, Code, Server, Trash2 } from 'lucide-react';
import { pumpFunApi } from '../../services/pump-api/pump-fun.service';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [debugResults, setDebugResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'tokens' | 'api'>('search');
  const [loading, setLoading] = useState(false);
  
  const runSearchTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/tokens/debug/search-test?q=${encodeURIComponent(testQuery || 'test')}`);
      const data = await response.json();
      setDebugResults(data);
    } catch (error: any) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const listAllTokens = async (limit = 50) => {
    setLoading(true);
    try {
      const response = await fetch(`/tokens/debug/list-all?limit=${limit}`);
      const data = await response.json();
      setDebugResults(data);
    } catch (error: any) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const testAdvancedSearch = async () => {
    setLoading(true);
    try {
      const result = await pumpFunApi.searchTokensAdvanced(testQuery);
      setDebugResults({
        query: testQuery,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const testDashboard = async () => {
    setLoading(true);
    try {
      const data = await pumpFunApi.getDashboardData();
      setDebugResults({
        dashboard: data,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const testMarketStats = async () => {
    setLoading(true);
    try {
      const stats = await pumpFunApi.getMarketStats();
      setDebugResults({
        marketStats: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const clearResults = () => {
    setDebugResults(null);
    setTestQuery('');
  };
  
  const healthCheck = async () => {
    setLoading(true);
    try {
      const responses = await Promise.allSettled([
        fetch('/tokens/health'),
        fetch('/pump/health'),
        fetch('/health')
      ]);
      
      const results = await Promise.all(
        responses.map(async (r, i) => {
          const endpoints = ['/tokens/health', '/pump/health', '/health'];
          if (r.status === 'fulfilled') {
            try {
              const data = await r.value.json();
              return { endpoint: endpoints[i], ...data };
            } catch {
              return { endpoint: endpoints[i], status: 'error', error: 'Invalid JSON' };
            }
          }
          return { endpoint: endpoints[i], status: 'error', error: r.reason };
        })
      );
      
      setDebugResults({ healthChecks: results, timestamp: new Date().toISOString() });
    } catch (error: any) {
      setDebugResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg z-50 group"
      >
        <Bug className="w-6 h-6 text-white group-hover:animate-pulse" />
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      </button>
      
      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 w-[500px] max-h-[700px] bg-gray-900 border border-purple-500 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-purple-400">Debug Panel</h3>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                  {process.env.NODE_ENV}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-700 bg-gray-800/30">
            {[
              { key: 'search', icon: Search, label: 'Search' },
              { key: 'tokens', icon: Database, label: 'Tokens' },
              { key: 'api', icon: Server, label: 'API' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                  activeTab === tab.key
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4 overflow-y-auto max-h-[500px]">
            {activeTab === 'search' && (
              <>
                {/* Search Test */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Test Search Query</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      placeholder="Enter search query (name, symbol, or CA)"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && testAdvancedSearch()}
                    />
                    <button
                      onClick={testAdvancedSearch}
                      disabled={loading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded text-white text-sm"
                    >
                      Test
                    </button>
                  </div>
                </div>
                
                {/* Search Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={runSearchTest}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded text-sm text-gray-300 flex items-center justify-center gap-2"
                  >
                    <Search className="w-3 h-3" />
                    Search Diagnostic
                  </button>
                  <button
                    onClick={testAdvancedSearch}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded text-sm text-gray-300 flex items-center justify-center gap-2"
                  >
                    <Code className="w-3 h-3" />
                    Advanced Search
                  </button>
                </div>
                
                {/* Example Queries */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Example queries:</p>
                  <div className="flex flex-wrap gap-1">
                    {['PEPE', 'dog', 'HeLLon', 'moon coin', 'test'].map(q => (
                      <button
                        key={q}
                        onClick={() => setTestQuery(q)}
                        className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {activeTab === 'tokens' && (
              <>
                {/* Token Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => listAllTokens(20)}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded text-sm text-gray-300"
                  >
                    List 20 Tokens
                  </button>
                  <button
                    onClick={() => listAllTokens(50)}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded text-sm text-gray-300"
                  >
                    List 50 Tokens
                  </button>
                  <button
                    onClick={testDashboard}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded text-sm text-gray-300"
                  >
                    Dashboard Data
                  </button>
                  <button
                    onClick={testMarketStats}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded text-sm text-gray-300"
                  >
                    Market Stats
                  </button>
                </div>
              </>
            )}
            
            {activeTab === 'api' && (
              <>
                {/* API Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={healthCheck}
                    disabled={loading}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 rounded text-sm text-gray-300 flex items-center justify-center gap-2"
                  >
                    <Activity className="w-3 h-3" />
                    Health Check
                  </button>
                  <button
                    onClick={() => window.location.href = '/tokens/health'}
                    className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300"
                  >
                    Service Status
                  </button>
                </div>
                
                {/* Endpoints */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">API Endpoints:</p>
                  <div className="space-y-1 text-xs">
                    <div className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                      GET /tokens/featured
                    </div>
                    <div className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                      GET /tokens/trending
                    </div>
                    <div className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                      GET /tokens/search/advanced?q=
                    </div>
                    <div className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                      GET /tokens/stats/market
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Results Display */}
            {debugResults && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">Debug Results:</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(debugResults, null, 2))}
                      className="p-1 hover:bg-gray-800 rounded"
                      title="Copy to clipboard"
                    >
                      <Code className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      onClick={clearResults}
                      className="p-1 hover:bg-gray-800 rounded"
                      title="Clear results"
                    >
                      <Trash2 className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-gray-800 rounded max-h-[300px] overflow-y-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                    {JSON.stringify(debugResults, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="ml-2 text-sm text-gray-400">Loading...</span>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-700 bg-gray-800/30">
            <div className="text-xs text-gray-500 space-y-1">
              <p>Backend: {process.env.REACT_APP_API_URL || 'http://localhost:8000'}</p>
              <p>Network: {process.env.REACT_APP_SOLANA_NETWORK || 'mainnet-beta'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
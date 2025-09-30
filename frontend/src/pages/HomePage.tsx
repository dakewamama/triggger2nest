import { useState } from 'react';
import EnhancedSearch from '../components/EnhancedSearch';
import TokenGrid from '../components/TokenGrid';
import { TrendingUp, Clock } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'featured'>('trending');

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <EnhancedSearch />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded font-medium transition-all flex items-center gap-2 ${
            activeTab === 'trending'
              ? 'bg-neon-lime text-black'
              : 'bg-terminal-border text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trending
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`px-4 py-2 rounded font-medium transition-all flex items-center gap-2 ${
            activeTab === 'new'
              ? 'bg-neon-lime text-black'
              : 'bg-terminal-border text-gray-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          New
        </button>
      </div>

      {/* Token Grid - PASS THE CATEGORY PROP! */}
      <TokenGrid category={activeTab} />
    </div>
  );
}
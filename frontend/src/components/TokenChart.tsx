import { useEffect, useState } from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface TokenChartProps {
  mint: string
}

export default function TokenChart({ mint }: TokenChartProps) {
  const [timeframe, setTimeframe] = useState('24h')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Generate mock data - replace with real API call
    const data = Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      price: Math.random() * 0.001 + 0.0001,
      volume: Math.random() * 100000
    }))
    setChartData(data)
  }, [mint, timeframe])

  return (
    <div className="terminal-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold">Price Chart</h3>
        <div className="flex gap-2">
          {['1h', '24h', '7d', '30d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded text-sm font-mono transition-all ${
                timeframe === tf
                  ? 'bg-neon-lime text-black'
                  : 'bg-terminal-border text-gray-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff00" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00ff00" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#666"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#666"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value.toFixed(5)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#141a14',
              border: '1px solid #263326',
              borderRadius: '8px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#00ff00" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Volume Chart */}
      <div className="mt-6">
        <h4 className="font-display text-sm text-gray-400 mb-2">Volume</h4>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={chartData}>
            <Area 
              type="monotone" 
              dataKey="volume" 
              stroke="#00ffff" 
              fill="#00ffff"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
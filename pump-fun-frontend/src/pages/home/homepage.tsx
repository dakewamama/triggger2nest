export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Pump.Fun</h1>
      <p className="text-gray-300 mb-8">
        Create and trade tokens on Solana
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Create Token</h3>
          <p className="text-gray-400">Launch your own token in minutes</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Trade Tokens</h3>
          <p className="text-gray-400">Buy and sell community tokens</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Your Portfolio</h3>
          <p className="text-gray-400">Track your token holdings</p>
        </div>
      </div>
    </div>
  )
}
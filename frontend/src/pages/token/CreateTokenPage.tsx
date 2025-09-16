import CreateTokenForm from '../../components/forms/CreateTokenForm';
import { useWallet } from '../../hooks/useWallet';
import { Coins, AlertCircle, Sparkles, Zap, Shield, Rocket, Star, Crown, Flame } from 'lucide-react';

export default function CreateTokenPage() {
  const { isConnected } = useWallet();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-1/3 w-28 h-28 bg-gradient-to-r from-yellow-500/12 to-orange-500/12 rounded-full blur-2xl animate-pulse delay-2000" />
        
        {/* Floating Particles */}
        <div className="absolute top-32 left-1/4 w-2 h-2 bg-green-400/30 rounded-full animate-bounce" />
        <div className="absolute top-80 right-1/3 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-bounce delay-500" />
        <div className="absolute bottom-60 left-2/3 w-1 h-1 bg-purple-400/50 rounded-full animate-bounce delay-1000" />
      </div>
      
      <div className="relative container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header Section - Staggered Layout */}
          <div className="text-center mb-20 relative">
            {/* Floating Decorations */}
            <div className="absolute -top-8 left-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl rotate-45 opacity-20 animate-pulse" />
            <div className="absolute -top-12 right-1/3 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full rotate-12 opacity-30 animate-bounce" />
            <div className="absolute top-16 -right-8 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-25 animate-pulse delay-1000" />
            
            {/* Main Logo - Creative Positioning */}
            <div className="flex justify-center mb-8 relative">
              <div className="relative transform rotate-3 hover:rotate-0 transition-all duration-500">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 via-emerald-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30">
                  <Coins className="h-12 w-12 text-white transform rotate-12" />
                </div>
                
                {/* Floating Elements Around Logo */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center transform rotate-45 shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <div className="absolute top-2 -left-4 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full animate-ping opacity-60" />
                
                {/* Glow Effect */}
                <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
              </div>
            </div>
            
            {/* Title with Creative Typography */}
            <h1 className="text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
              Create{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Your
                </span>
                <div className="absolute -top-6 -right-6 transform rotate-12 animate-bounce">
                  <Crown className="w-8 h-8 text-yellow-400 opacity-70" />
                </div>
              </span>
              <br />
              <span className="relative">
                Meme{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  Token
                </span>
                <div className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-40 blur-sm" />
              </span>
            </h1>
            
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Launch your own meme coin on Solana with{' '}
              <span className="text-green-400 font-bold">pump.fun's</span> bonding curve mechanism
            </p>
          </div>
          
          {/* Features Cards - Staggered Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Zap,
                title: 'Instant Launch',
                description: 'Deploy your token in seconds with no upfront liquidity required',
                color: 'from-yellow-500 to-orange-500',
                rotation: 'rotate-2',
                delay: '0ms',
                emoji: '⚡',
              },
              {
                icon: Shield,
                title: 'Fair Launch',
                description: 'Bonding curve ensures fair price discovery for all participants',
                color: 'from-blue-500 to-cyan-500',
                rotation: '-rotate-1',
                delay: '200ms',
                emoji: '🛡️',
              },
              {
                icon: Rocket,
                title: 'Community Driven',
                description: 'Let the market decide your token\'s value through organic trading',
                color: 'from-purple-500 to-pink-500',
                rotation: 'rotate-1',
                delay: '400ms',
                emoji: '🚀',
              },
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`group transform ${feature.rotation} hover:rotate-0 transition-all duration-500`}
                style={{ animationDelay: feature.delay }}
              >
                <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 transition-all duration-500 hover:transform hover:-translate-y-6 hover:shadow-2xl hover:shadow-green-500/20 overflow-hidden">
                  
                  {/* Floating Emoji Badge */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center border-4 border-gray-800 transform rotate-12 group-hover:rotate-0 transition-transform duration-300 shadow-xl">
                    <span className="text-2xl">{feature.emoji}</span>
                  </div>
                  
                  <div className="text-center relative z-10">
                    <div className={`inline-flex p-6 rounded-3xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-125 transition-transform duration-500 shadow-xl`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                      {feature.description}
                    </p>
                  </div>
                  
                  {/* Animated Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
                  <div className="absolute top-4 left-4 w-2 h-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500" />
                  <div className="absolute bottom-6 right-6 w-1.5 h-1.5 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 animate-ping delay-200 transition-opacity duration-500" />
                </div>
              </div>
            ))}
          </div>
          
          {/* Main Form Container - Creative Positioning */}
          <div className="relative">
            {/* Connection Warning - Floating Alert */}
            {!isConnected && (
              <div className="mb-12 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="relative bg-gradient-to-r from-yellow-900/40 via-orange-900/40 to-red-900/40 border border-yellow-500/30 rounded-3xl p-8 backdrop-blur-sm overflow-hidden">
                  {/* Floating Warning Icon */}
                  <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl transform rotate-12">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-3xl" />
                  <div className="relative flex items-start gap-6 pt-4">
                    <div className="p-3 bg-yellow-500/20 rounded-2xl">
                      <span className="text-3xl">⚠️</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-400 mb-3 text-2xl">
                        Wallet Connection Required
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Connect your Phantom wallet to create tokens. You'll need approximately{' '}
                        <span className="font-bold text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-lg">0.02 SOL</span> for creation fees
                        plus transaction costs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Card - Staggered Design */}
            <div className="relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="relative bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl overflow-hidden shadow-2xl">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-purple-500/5" />
                
                {/* Floating Decorations */}
                <div className="absolute top-8 right-8 w-16 h-16 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-lg animate-pulse delay-1000" />
                
                {/* Form Content */}
                <div className="relative p-10 md:p-12">
                  <CreateTokenForm />
                </div>
              </div>
            </div>
            
            {/* Additional Info Cards - Offset Layout */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Token Economics - Tilted Card */}
              <div className="transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-8 relative overflow-hidden">
                  {/* Floating Icon */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center transform rotate-45 shadow-xl">
                    <span className="text-white text-xl transform -rotate-45">💰</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm">$</span>
                    </div>
                    Token Economics
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Total Supply', value: '1,000,000,000', icon: '🪙' },
                      { label: 'Initial Price', value: 'Market Determined', icon: '📊' },
                      { label: 'Bonding Curve', value: 'Automatic', icon: '📈', highlight: true },
                      { label: 'Graduation', value: '$69K Market Cap', icon: '🎓', highlight: true },
                    ].map((item, index) => (
                      <div key={index} className={`flex justify-between items-center p-3 rounded-2xl transition-colors duration-300 ${item.highlight ? 'bg-green-500/10 border border-green-500/20' : 'hover:bg-gray-700/30'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-gray-400">{item.label}</span>
                        </div>
                        <span className={`font-bold ${item.highlight ? 'text-green-400' : 'text-white'}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Security Features - Tilted Opposite */}
              <div className="transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-8 relative overflow-hidden">
                  {/* Floating Icon */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center transform -rotate-45 shadow-xl">
                    <Shield className="w-6 h-6 text-white transform rotate-45" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    Security Features
                  </h3>
                  <div className="space-y-3">
                    {[
                      'Rug-pull protection via bonding curve',
                      'No hidden mint authority',
                      'Immutable smart contract',
                      'Transparent on-chain metadata'
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-700/20 rounded-2xl transition-colors duration-300">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
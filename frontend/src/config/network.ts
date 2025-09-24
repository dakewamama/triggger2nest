export const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta'
export const RPC_URL = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'

export const IS_DEVNET = NETWORK === 'devnet'
export const IS_MAINNET = NETWORK === 'mainnet-beta'

// Pump.fun works on mainnet only
export const PUMP_FUN_AVAILABLE = IS_MAINNET

console.log(`🌐 Connected to: ${NETWORK}`)
console.log(`📡 RPC URL: ${RPC_URL}`)

if (IS_DEVNET) {
  console.log('💧 Get free SOL at: https://faucet.solana.com')
  console.log('⚠️  Note: Pump.fun tokens only work on mainnet!')
}

#!/bin/bash

echo "🔄 NETWORK CONFIGURATION FOR FRONTEND"
echo "======================================"

cd frontend

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Current Configuration:${NC}"
echo "The frontend is currently configured for: MAINNET-BETA"
echo ""

echo "Choose network:"
echo "1) Devnet (for testing - free SOL)"
echo "2) Mainnet-beta (real tokens, real money)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
  1)
    NETWORK="devnet"
    RPC_URL="https://api.devnet.solana.com"
    echo -e "${YELLOW}Switching to DEVNET...${NC}"
    ;;
  2)
    NETWORK="mainnet-beta"
    RPC_URL="https://api.mainnet-beta.solana.com"
    echo -e "${YELLOW}Switching to MAINNET-BETA...${NC}"
    ;;
  *)
    echo "Invalid choice. Keeping current configuration."
    exit 1
    ;;
esac

# Update WalletProvider.tsx
echo "Updating WalletProvider..."
sed -i "s|https://api.mainnet-beta.solana.com|$RPC_URL|g" src/providers/WalletProvider.tsx
sed -i "s|'mainnet-beta'|'$NETWORK'|g" src/providers/WalletProvider.tsx

# Create/Update .env file
echo "Creating .env file..."
cat > .env << EOF
# Network Configuration
VITE_SOLANA_NETWORK=$NETWORK
VITE_SOLANA_RPC_URL=$RPC_URL

# Backend API (your NestJS backend)
VITE_API_URL=http://localhost:8000

# Optional: Helius RPC (faster, get free key at helius.dev)
# VITE_HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
EOF

# Update a config file for easy reference
echo "Creating network config file..."
cat > src/config/network.ts << 'EOF'
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
EOF

echo ""
echo -e "${GREEN}✅ Network switched to: $NETWORK${NC}"
echo ""

if [ "$NETWORK" == "devnet" ]; then
  echo -e "${YELLOW}DEVNET Configuration:${NC}"
  echo "- Network: Devnet (testing network)"
  echo "- Get free SOL at: https://faucet.solana.com"
  echo "- RPC: $RPC_URL"
  echo ""
  echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
  echo "Pump.fun tokens ONLY exist on mainnet!"
  echo "On devnet you can:"
  echo "  - Test wallet connections"
  echo "  - Test transaction signing"
  echo "  - Create test tokens"
  echo "But you WON'T see real pump.fun tokens"
else
  echo -e "${GREEN}MAINNET Configuration:${NC}"
  echo "- Network: Mainnet-beta (real network)"
  echo "- Uses real SOL and real tokens"
  echo "- Pump.fun tokens will work"
  echo "- RPC: $RPC_URL"
  echo ""
  echo -e "${YELLOW}⚠️  WARNING:${NC}"
  echo "This uses REAL SOL and REAL MONEY!"
fi

echo ""
echo "Restart your frontend for changes to take effect:"
echo "  npm run dev"
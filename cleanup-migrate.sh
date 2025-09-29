#!/bin/bash

# Debug Account Issues
# ====================

TOKEN="AZ7NMD25xTMzrRNes8vtE1J9w8uRJwP7j4qMuP3xpump"
WALLET="6dbtajkWMrN9zQ42mJ5otaSbuSYodERf6o2ru2PqDoki"

echo "================================================"
echo "🔍 DEBUGGING PUMP.FUN ACCOUNT ISSUE"
echo "================================================"
echo ""
echo "Token: $TOKEN"
echo "Wallet: $WALLET"
echo ""

# Step 1: Check token status (we know this works)
echo "[1] Checking token status..."
curl -s http://localhost:8000/pump/token-status/$TOKEN | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"Status: {data.get('status')}`)
print(f\"Message: {data.get('message')}`)
if 'bondingCurve' in data:
    print(f\"Bonding Curve: {data['bondingCurve']}\")
"

echo ""
echo "[2] Debugging all accounts involved..."
curl -s -X POST http://localhost:8000/pump/debug-accounts \
  -H "Content-Type: application/json" \
  -d "{
    \"mint\": \"$TOKEN\",
    \"buyer\": \"$WALLET\"
  }" | python3 -m json.tool

echo ""
echo "================================================"
echo "WHAT TO CHECK:"
echo "================================================"
echo ""
echo "1. bondingCurveTokenAccount.exists = false?"
echo "   → The bonding curve's token account doesn't exist"
echo "   → This is the likely issue"
echo ""
echo "2. All accounts exist?"
echo "   → Issue might be with instruction data"
echo "   → Or the program state"
echo ""

# Alternative: Try with a different well-known active token
echo "================================================"
echo "[3] Testing with a different token..."
echo "================================================"

# Try MOTHER token (usually active)
MOTHER="3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN"
echo "Testing MOTHER token: $MOTHER"

curl -s -X POST http://localhost:8000/pump/buy-token \
  -H "Content-Type: application/json" \
  -d "{
    \"mint\": \"$MOTHER\",
    \"publicKey\": \"$WALLET\",
    \"amount\": 0.01,
    \"solAmount\": 0.01,
    \"simulate\": false
  }" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success'):
    print('✅ Transaction built successfully for MOTHER token')
else:
    print(f\"❌ Failed: {data.get('error')}\")
"
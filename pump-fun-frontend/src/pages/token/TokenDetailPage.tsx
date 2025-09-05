import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { pumpService } from '../../services/pumpService'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function TokenDetailPage() {
  const { mintAddress } = useParams<{ mintAddress: string }>()
  const [buyAmount, setBuyAmount] = useState('')
  const [sellAmount, setSellAmount] = useState('')
  const [loading, setLoading] = useState('')

  const handleBuy = async () => {
    if (!mintAddress || !buyAmount) return
    setLoading('buy')
    try {
      await pumpService.buyToken(mintAddress, parseFloat(buyAmount))
      setBuyAmount('')
    } catch (error) {
      console.error('Buy failed:', error)
    }
    setLoading('')
  }

  const handleSell = async () => {
    if (!mintAddress || !sellAmount) return
    setLoading('sell')
    try {
      await pumpService.sellToken(mintAddress, parseFloat(sellAmount))
      setSellAmount('')
    } catch (error) {
      console.error('Sell failed:', error)
    }
    setLoading('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Token Trading</h1>
          <p className="text-gray-400 mb-4">Mint: {mintAddress}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-400">Buy Tokens</h3>
              <Input
                label="SOL Amount"
                type="number"
                step="0.001"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                placeholder="0.001"
              />
              <Button
                onClick={handleBuy}
                loading={loading === 'buy'}
                disabled={!buyAmount || loading !== ''}
                className="w-full"
              >
                Buy Tokens
              </Button>
            </div>

            {/* Sell Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-red-400">Sell Tokens</h3>
              <Input
                label="Token Amount"
                type="number"
                step="0.001"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                placeholder="100"
              />
              <Button
                onClick={handleSell}
                loading={loading === 'sell'}
                disabled={!sellAmount || loading !== ''}
                variant="destructive"
                className="w-full"
              >
                Sell Tokens
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
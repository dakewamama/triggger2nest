// frontend/src/pages/CreateTokenPage.tsx
import { useState } from 'react'
import { useWallet } from '@/providers/WalletProvider' // Changed import
import { api } from '@/services/api'
import { toast } from 'sonner'
import { Upload, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CreateTokenPage() {
  const navigate = useNavigate()
  const { publicKey } = useWallet() // Using our mock wallet
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!publicKey) {
      toast.error('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value)
      })
      data.append('publicKey', publicKey)
      if (imageFile) data.append('image', imageFile)

      const result = await api.createToken(data)
      
      if (result.success) {
        toast.success('Token creation initiated!')
        navigate('/')
      } else {
        toast.error(result.error || 'Token creation failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Token creation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-display font-bold mb-8 text-center">
        Create Your Token
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="terminal-card">
          <label className="block text-sm text-gray-400 mb-2">Token Image</label>
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-terminal-border flex items-center justify-center">
                <Upload className="text-gray-500" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="flex-1"
            />
          </div>
        </div>

        {/* Token Details */}
        <div className="terminal-card space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Token Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Awesome Token"
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 focus:border-neon-lime outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Symbol *</label>
            <input
              type="text"
              required
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="AWESOME"
              maxLength={10}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 focus:border-neon-lime outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your token..."
              rows={4}
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 focus:border-neon-lime outline-none resize-none"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="terminal-card space-y-4">
          <h3 className="font-display font-bold">Social Links (Optional)</h3>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 focus:border-neon-lime outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Twitter</label>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="@username"
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 focus:border-neon-lime outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Telegram</label>
            <input
              type="text"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              placeholder="@groupname"
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 focus:border-neon-lime outline-none"
            />
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-900/20 border border-red-500/50 rounded p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" />
          <div className="text-sm">
            <p className="text-red-400 font-bold mb-1">Important</p>
            <p className="text-gray-400">
              Token creation requires wallet integration. This is on devnet for testing purposes.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !publicKey}
          className="w-full py-3 bg-gradient-to-r from-neon-lime to-neon-cyan text-black font-bold rounded transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Token...' : 'Create Token (0.1 SOL)'}
        </button>

        {!publicKey && (
          <p className="text-center text-gray-400 text-sm">
            Connect wallet to create token
          </p>
        )}
      </form>
    </div>
  )
}
import { useState } from 'react'
import { useWallet } from '../providers/WalletProvider'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { Upload } from 'lucide-react'

export default function CreateTokenPage() {
  const { publicKey, connected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    website: '',
    twitter: '',
    telegram: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet')
      return
    }

    setLoading(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('symbol', formData.symbol)
      data.append('description', formData.description)
      data.append('website', formData.website || '')
      data.append('twitter', formData.twitter || '')
      data.append('telegram', formData.telegram || '')
      data.append('publicKey', publicKey.toString()) // Convert to string
      
      if (imageFile) {
        data.append('image', imageFile)
      }

      const result = await api.createToken(data)
      
      if (result.success) {
        toast.success('Token creation initiated!')
        // Reset form
        setFormData({
          name: '',
          symbol: '',
          description: '',
          website: '',
          twitter: '',
          telegram: '',
        })
        setImageFile(null)
      } else {
        toast.error(result.error || 'Token creation failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-8">
        <span className="text-neon-lime">Create</span> Your Token
      </h1>

      {!connected ? (
        <div className="terminal-card text-center py-8">
          <p className="text-gray-400">Please connect your wallet to create a token</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="terminal-card space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-bold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Token Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
                  placeholder="e.g., Doge Killer"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Symbol *</label>
                <input
                  type="text"
                  required
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
                  placeholder="e.g., DOGEK"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
                  placeholder="Describe your token..."
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Token Image</label>
            <div className="border-2 border-dashed border-terminal-border rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer text-neon-lime hover:text-neon-cyan"
              >
                {imageFile ? imageFile.name : 'Click to upload image'}
              </label>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h2 className="text-lg font-bold mb-4">Social Links (Optional)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
                  placeholder="https://yourtoken.com"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Twitter</label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
                  placeholder="@yourtoken"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Telegram</label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded p-3 text-white focus:border-neon-lime focus:outline-none"
                  placeholder="t.me/yourtoken"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded font-bold bg-gradient-to-r from-neon-lime to-neon-cyan text-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Token'}
          </button>
        </form>
      )}
    </div>
  )
}

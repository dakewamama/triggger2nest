import { useState } from 'react'
import { useTokenCreation } from '../../hooks/useTokenCreation'
import type { CreateTokenDto } from '../../types'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import ImageUpload from '../ui/ImageUpload'
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

export default function CreateTokenForm() {
  const { createToken, isLoading, error, success, reset } = useTokenCreation()
  
  const [formData, setFormData] = useState<CreateTokenDto>({
    name: '',
    symbol: '',
    description: '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<Partial<CreateTokenDto>>({})

  const handleInputChange = (field: keyof CreateTokenDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImageChange = (file: File | null) => {
    setImageFile(file)
  }

  const validateForm = (): boolean => {
    const errors: Partial<CreateTokenDto> = {}

    if (!formData.name.trim()) {
      errors.name = 'Token name is required'
    } else if (formData.name.length > 50) {
      errors.name = 'Token name must be 50 characters or less'
    }

    if (!formData.symbol.trim()) {
      errors.symbol = 'Token symbol is required'
    } else if (formData.symbol.length > 10) {
      errors.symbol = 'Token symbol must be 10 characters or less'
    } else if (!/^[A-Z0-9]+$/.test(formData.symbol.toUpperCase())) {
      errors.symbol = 'Token symbol can only contain letters and numbers'
    }

    if (!formData.description.trim()) {
      errors.description = 'Token description is required'
    } else if (formData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Convert symbol to uppercase
    const tokenData: CreateTokenDto = {
      ...formData,
      symbol: formData.symbol.toUpperCase(),
    }

    await createToken(tokenData, imageFile || undefined)
  }

  const handleReset = () => {
    setFormData({ name: '', symbol: '', description: '' })
    setImageFile(null)
    setFormErrors({})
    reset()
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Token Name"
          placeholder="e.g., My Awesome Token"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={formErrors.name}
          disabled={isLoading}
        />

        <Input
          label="Token Symbol"
          placeholder="e.g., MAT"
          value={formData.symbol}
          onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
          error={formErrors.symbol}
          disabled={isLoading}
          maxLength={10}
        />

        <Textarea
          label="Description"
          placeholder="Describe your token and its purpose..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={formErrors.description}
          disabled={isLoading}
          rows={4}
          maxLength={500}
        />

        <ImageUpload
          onImageChange={handleImageChange}
          disabled={isLoading}
        />

        <div className="text-sm text-gray-400">
          <p>• Creating a token costs ~0.001 SOL</p>
          <p>• Make sure your wallet has sufficient balance</p>
          <p>• Image upload is optional but recommended</p>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="flex-1"
          >
            Create Token
          </Button>
          
          {(success || error) && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          )}
        </div>
      </form>

      {/* Success Message */}
      {success && (
        <div className="mt-6 p-4 bg-green-900/50 border border-green-500 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-400 mb-2">Token Created Successfully!</h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-400">Transaction:</span>{' '}
                  <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                    {success.transactionId}
                  </code>
                </p>
                {success.mintAddress && (
                  <p>
                    <span className="text-gray-400">Mint Address:</span>{' '}
                    <code className="bg-gray-800 px-2 py-1 rounded text-xs">
                      {success.mintAddress}
                    </code>
                  </p>
                )}
                {success.pumpUrl && (
                  <a
                    href={success.pumpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 mt-2"
                  >
                    View on Pump.fun <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Creation Failed</h3>
              <p className="text-sm text-gray-300">{error.message}</p>
              {error.status && (
                <p className="text-xs text-gray-400 mt-1">Error Code: {error.status}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import Button from './Button'

interface ImageUploadProps {
  onImageChange: (file: File | null) => void
  error?: string
  disabled?: boolean
}

export default function ImageUpload({ onImageChange, error, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return

    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)
    setFileName(file.name)
    onImageChange(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setFileName(null)
    onImageChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Token Image (Optional)</label>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-gray-600 hover:border-gray-500 ${error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-300"><span className="font-medium">Click to upload</span></p>
          <p className="text-gray-500 text-xs mt-1">PNG, JPG, GIF up to 5MB</p>
        </div>
      ) : (
        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
          <div className="flex items-center gap-3">
            <img src={preview} alt="Preview" className="w-16 h-16 rounded object-cover" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-300">{fileName}</p>
              <p className="text-xs text-gray-500">Image uploaded</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={removeImage} disabled={disabled}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
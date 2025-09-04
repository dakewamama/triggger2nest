import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles)
    const file = acceptedFiles[0]
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)
      setFileName(file.name)
      onImageChange(file)
    }
  }, [onImageChange])

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    setFileName(null)
    onImageChange(null)
  }

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/*': [] // updated syntax
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: disabled || false,
    onDragEnter: undefined,
    onDragOver: undefined,
    onDragLeave: undefined
  })

  const hasRejectedFiles = fileRejections.length > 0
  const rejectionError = hasRejectedFiles ? fileRejections[0].errors[0].message : null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">
        Token Image (Optional)
      </label>
      
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-green-400 bg-green-400/10' : 'border-gray-600 hover:border-gray-500'}
            ${error || rejectionError ? 'border-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...(getInputProps() as React.InputHTMLAttributes<HTMLInputElement>)} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-sm">
              {isDragActive ? (
                <p className="text-green-400">Drop the image here...</p>
              ) : (
                <div>
                  <p className="text-gray-300">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                <img
                  src={preview}
                  alt="Token preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-300 truncate">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500">Image uploaded</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeImage}
                disabled={disabled}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {(error || rejectionError) && (
        <p className="text-sm text-red-400">
          {error || rejectionError}
        </p>
      )}
      
      <p className="text-xs text-gray-500">
        A good token image helps with discoverability and trust
      </p>
    </div>
  )
}
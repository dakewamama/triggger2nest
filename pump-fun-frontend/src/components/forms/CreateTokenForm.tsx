import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { pumpService } from '../../services/api/pumpService';
import { Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  symbol: string;
  description: string;
}

interface FormErrors {
  name?: string;
  symbol?: string;
  description?: string;
  general?: string;
}

export default function CreateTokenForm() {
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    symbol: '',
    description: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'symbol' ? value.toUpperCase() : value,
    }));
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, general: 'Image must be less than 5MB' }));
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };
  
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (formData.symbol.length > 10) {
      newErrors.symbol = 'Symbol must be 10 characters or less';
    } else if (!/^[A-Z0-9]+$/.test(formData.symbol)) {
      newErrors.symbol = 'Symbol can only contain letters and numbers';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      setErrors({ general: 'Please connect your wallet first' });
      return;
    }
    
    if (!validate()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    setSuccess(null);
    
    try {
      const response = await pumpService.createToken(formData, imageFile || undefined);
      
      setSuccess(response);
      
      // Redirect to token page after 3 seconds
      setTimeout(() => {
        if (response.mintAddress) {
          navigate(`/token/${response.mintAddress}`);
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('Token creation failed:', error);
      setErrors({
        general: error.message || 'Failed to create token. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const reset = () => {
    setFormData({ name: '', symbol: '', description: '' });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
    setSuccess(null);
  };
  
  if (success) {
    return (
      <div className="bg-green-900/20 border border-green-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              Token Created Successfully!
            </h3>
            <div className="space-y-2 text-sm">
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
              <p className="text-gray-300 mt-3">
                Redirecting to your token page...
              </p>
            </div>
            <button
              onClick={reset}
              className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Create Another Token
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Token Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Awesome Token"
          disabled={loading}
          className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 ${
            errors.name ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
      </div>
      
      {/* Token Symbol */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token Symbol *
        </label>
        <input
          type="text"
          name="symbol"
          value={formData.symbol}
          onChange={handleInputChange}
          placeholder="e.g., AWE"
          disabled={loading}
          maxLength={10}
          className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 font-mono uppercase ${
            errors.symbol ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        {errors.symbol && (
          <p className="mt-1 text-sm text-red-400">{errors.symbol}</p>
        )}
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your token and its purpose..."
          disabled={loading}
          rows={4}
          maxLength={500}
          className={`w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 resize-none ${
            errors.description ? 'border-red-500' : 'border-gray-700'
          }`}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.description && (
              <p className="text-sm text-red-400">{errors.description}</p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formData.description.length}/500
          </p>
        </div>
      </div>
      
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Token Image (Optional)
        </label>
        
        {!imagePreview ? (
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-400">Click to upload image</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </label>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <img
              src={imagePreview}
              alt="Token preview"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-300">{imageFile?.name}</p>
              <p className="text-xs text-gray-500">
                {imageFile && (imageFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={removeImage}
              disabled={loading}
              className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      
      {/* Fee Information */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-gray-300 mb-2">Creation Fees</h3>
        <ul className="space-y-1 text-sm text-gray-400">
          <li>• Token creation: ~0.02 SOL</li>
          <li>• Initial buy: 0.001 SOL (minimum)</li>
          <li>• Total needed: ~0.021 SOL + transaction fees</li>
        </ul>
      </div>
      
      {/* Error Message */}
      {errors.general && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{errors.general}</p>
          </div>
        </div>
      )}
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !isConnected}
        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating Token...
          </>
        ) : (
          'Create Token'
        )}
      </button>
    </form>
  );
}
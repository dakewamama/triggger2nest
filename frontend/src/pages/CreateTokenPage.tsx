// frontend/src/pages/CreateTokenPage.tsx - FIXED VERSION
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

export default function CreateTokenPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.symbol) {
      toast.error('Name and Symbol are required');
      return;
    }

    if (!imageFile) {
      toast.error('Token image is required');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('symbol', formData.symbol.toUpperCase());
      data.append('description', formData.description || '');
      data.append('twitter', formData.twitter || '');
      data.append('telegram', formData.telegram || '');
      data.append('website', formData.website || '');
      data.append('image', imageFile);

      console.log('Creating token with data:', {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        hasImage: !!imageFile
      });

      const result = await api.createToken(data);

      if (result.success) {
        toast.success('Token created successfully!');
        if (result.data?.mint) {
          navigate(`/token/${result.data.mint}`);
        } else {
          navigate('/');
        }
      } else {
        toast.error(result.error || 'Failed to create token');
      }
    } catch (error: any) {
      console.error('Create token error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to create token';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-400 font-display">
        Create New Token
      </h1>

      <div className="bg-gray-800 rounded-lg p-6 mb-4 border border-yellow-600">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-yellow-500 mb-1">Token Creation Currently Disabled</p>
            <p>Token creation requires pump.fun API access which is currently unavailable.</p>
            <p className="mt-2">To create tokens:</p>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Use pump.fun website directly</li>
              <li>Or wait for API access to be restored</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Token Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
              placeholder="My Awesome Token"
              required
              maxLength={32}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Symbol <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
              placeholder="TOKEN"
              required
              maxLength={10}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400 h-32"
            placeholder="Describe your token..."
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Token Image <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            {imagePreview ? (
              <div className="space-y-4">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 mx-auto rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-400 mb-2">Click to upload image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/png,image/jpeg,image/gif"
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Twitter</label>
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
              placeholder="https://x.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telegram</label>
            <input
              type="url"
              value={formData.telegram}
              onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
              placeholder="https://t.me/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
              placeholder="https://..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !formData.name || !formData.symbol || !imageFile}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Token...' : 'Create Token'}
        </button>
      </form>
    </div>
  );
}
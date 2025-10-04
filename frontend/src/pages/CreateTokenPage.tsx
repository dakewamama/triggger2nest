import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useWallet } from '../providers/WalletProvider';
import { Connection, Transaction } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import { pumpService } from '../services';

// Initialize Solana connection (use your RPC endpoint)
const connection = new Connection(
  import.meta.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com',
  'confirmed'
);

export default function CreateTokenPage() {
  const navigate = useNavigate();
  const { publicKey, signTransaction, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'building' | 'signing' | 'sending' | 'confirming'>('idle');
  
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
      if (file.size > 5 * 1024 * 1024) {
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

    if (!connected || !publicKey || !signTransaction) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.symbol) {
      toast.error('Name and symbol are required');
      return;
    }

    try {
      setLoading(true);
      setTransactionStatus('building');

      // Just use placeholder URIs or base64 encoded data
      
      // Create metadata object
      const metadata = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description || `${formData.name} - A pump.fun token`,
        image: imagePreview || 'https://via.placeholder.com/256', // Placeholder for local dev
        attributes: [],
        properties: {
          files: imagePreview ? [{
            uri: imagePreview, // Can use base64 for local testing
            type: 'image/png'
          }] : [],
          category: 'image',
        },
        extensions: {
          twitter: formData.twitter,
          telegram: formData.telegram,
          website: formData.website,
        }
      };

      // For local testing, convert metadata to base64 data URI
      const metadataJson = JSON.stringify(metadata);
      const metadataUri = `data:application/json;base64,${btoa(metadataJson)}`;

      // Build the transaction
      const tokenData = {
        name: formData.name,
        symbol: formData.symbol,
        uri: metadataUri, // Using local data URI or placeholder
        creator: publicKey.toString(),
      };

      toast.loading('Building transaction...');
      const result = await pumpService.createToken(tokenData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create token transaction');
      }

      setTransactionStatus('signing');
      toast.loading('Please sign the transaction in your wallet...');

      // Deserialize and sign the transaction
      const transaction = Transaction.from(Buffer.from(result.data.transaction, 'base64'));
      
      // Sign with wallet
      const signedTransaction = await signTransaction(transaction);

      setTransactionStatus('sending');
      toast.loading('Sending transaction to network...');

      // Send the signed transaction
      const sendResult = await pumpService.sendSignedTransaction({
        transaction: Buffer.from(signedTransaction.serialize()).toString('base64'),
      });

      if (sendResult.success && sendResult.data?.signature) {
        setTransactionStatus('confirming');
        toast.loading('Confirming transaction...');

        // Wait for confirmation
        await pumpService.waitForConfirmation(sendResult.data.signature, connection);

        toast.success(
          <div>
            <p className="font-medium">Token created successfully!</p>
            <p className="text-sm mt-1">Mint: {result.data.mint}</p>
            <p className="text-xs mt-1 opacity-80">View on Solscan</p>
          </div>,
          { duration: 10000 }
        );

        // Navigate to token page
        navigate(`/token/${result.data.mint}`);
      } else {
        throw new Error(sendResult.error || 'Failed to send transaction');
      }
    } catch (error: any) {
      console.error('Create token error:', error);
      
      let errorMessage = 'Failed to create token';
      
      if (error.message?.includes('insufficient') || error.message?.includes('Insufficient')) {
        errorMessage = 'Insufficient SOL balance. You need at least 0.02 SOL plus gas fees.';
      } else if (error.message?.includes('User rejected') || error.message?.includes('cancelled')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setTransactionStatus('idle');
    }
  };

  const getStatusMessage = () => {
    switch (transactionStatus) {
      case 'building':
        return 'Building transaction...';
      case 'signing':
        return 'Waiting for wallet signature...';
      case 'sending':
        return 'Sending to blockchain...';
      case 'confirming':
        return 'Confirming transaction...';
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-400 font-display">
        Create New Token
      </h1>

      {/* Info Box */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-green-600/30">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-green-400 mb-1">Create Your Token with Bonding Curve</p>
            <p>Your token will launch with automatic liquidity via pump.fun's bonding curve.</p>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
              <li>Total Supply: 1 billion tokens</li>
              <li>Creation Fee: 0.02 SOL + gas</li>
              <li>Automatic liquidity and price discovery</li>
              <li>Fair launch - no presale or team allocation</li>
            </ul>
            <p className="mt-2 text-yellow-400">
              For local testing, metadata is stored as data URI (no IPFS needed)
            </p>
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
              disabled={loading}
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
              placeholder="PUMP"
              required
              maxLength={10}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400 min-h-[100px]"
            placeholder="Describe your token..."
            maxLength={500}
            disabled={loading}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Token Image (Optional for testing)
          </label>
          <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Token preview"
                  className="w-32 h-32 mx-auto rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="text-sm text-red-400 hover:text-red-300"
                  disabled={loading}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-400">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB
                </p>
                <p className="text-xs text-yellow-400 mt-2">
                  For local testing, image will be embedded as base64
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Social Links (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-green-400"
                placeholder="https://twitter.com/..."
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Status Message */}
        {getStatusMessage() && (
          <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <p className="text-sm text-blue-400">{getStatusMessage()}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !connected}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Token...
            </>
          ) : !connected ? (
            'Connect Wallet to Continue'
          ) : (
            <>
              Create Token (0.02 SOL)
            </>
          )}
        </button>

        {/* Fee Notice */}
        <div className="text-xs text-gray-400 text-center">
          <p>Creation fee: 0.02 SOL + network gas fees (~0.001 SOL)</p>
          <p>Your token will launch with automatic liquidity on pump.fun</p>
          <p className="text-yellow-400 mt-1">
            Metadata stored as data URI (no IPFS required)
          </p>
        </div>
      </form>
    </div>
  );
}
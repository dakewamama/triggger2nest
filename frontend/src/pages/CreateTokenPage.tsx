// frontend/src/pages/CreateTokenPage.tsx - With experimental creation & simulation
import { useState } from 'react';
import { ExternalLink, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';
import { useWallet } from '../providers/WalletProvider';

export default function CreateTokenPage() {
  const { publicKey, signTransaction, connected } = useWallet();
  const [activeTab, setActiveTab] = useState<'pump' | 'experimental'>('pump');
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    uri: '',
  });

  const handleExperimentalCreate = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.name || !formData.symbol) {
      toast.error('Name and Symbol are required');
      return;
    }

    setLoading(true);
    try {
      // Call experimental create endpoint
      const result = await api.post('/pump/create-experimental', {
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        uri: formData.uri || 'https://arweave.net/default-pump-metadata',
        creator: publicKey.toString(),
      });

      if (result.data.success && result.data.data?.transaction) {
        // Simulate first
        const simResult = await api.post('/pump/simulate', {
          transaction: result.data.data.transaction,
        });

        setSimulationResult(simResult.data);

        if (simResult.data.willSucceed) {
          toast.success('Simulation passed! Transaction will succeed.');
          
          // Ask to proceed
          if (window.confirm('Simulation passed. Do you want to sign and send the transaction?')) {
            // Sign and send
            const tx = Transaction.from(Buffer.from(result.data.data.transaction, 'base64'));
            const signed = await signTransaction(tx);
            const signature = await connection.sendRawTransaction(signed.serialize());
            
            toast.success(`Token created! Mint: ${result.data.data.mint}`);
            toast.success(`Transaction: ${signature}`);
          }
        } else {
          toast.error(simResult.data.message || 'Simulation failed. Transaction would not succeed.');
        }
      } else {
        toast.error(result.data.error || 'Failed to create token');
      }
    } catch (error: any) {
      console.error('Create error:', error);
      toast.error(error.message || 'Failed to create token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-neon-lime font-display">
        Create Token
      </h1>

      {/* Tab Selection */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pump')}
          className={`px-4 py-2 rounded font-medium transition-all ${
            activeTab === 'pump'
              ? 'bg-neon-lime text-black'
              : 'bg-terminal-border text-gray-400'
          }`}
        >
          Official Method
        </button>
        <button
          onClick={() => setActiveTab('experimental')}
          className={`px-4 py-2 rounded font-medium transition-all ${
            activeTab === 'experimental'
              ? 'bg-neon-cyan text-black'
              : 'bg-terminal-border text-gray-400'
          }`}
        >
          Experimental (IDL)
        </button>
      </div>

      {activeTab === 'pump' ? (
        <div className="space-y-6">
          <div className="terminal-card border-neon-lime">
            <h3 className="font-bold mb-4">Recommended: Use Pump.fun Website</h3>
            <p className="text-gray-300 mb-4">
              The official way to create tokens on pump.fun is through their website.
            </p>
            <a 
              href="https://pump.fun" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neon-lime text-black rounded font-bold hover:bg-neon-lime/90"
            >
              Go to Pump.fun <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Warning */}
          <div className="terminal-card border-yellow-600">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-500 mb-2">
                  Experimental Feature
                </h3>
                <p className="text-sm text-gray-300">
                  This uses reverse-engineered instructions and may not work.
                  Token creation might fail even if simulation passes.
                  Use pump.fun website for guaranteed results.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="terminal-card">
            <h3 className="font-bold mb-4">Experimental Token Creation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Token Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-4 py-2 focus:outline-none focus:border-neon-lime"
                  placeholder="My Token"
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
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-4 py-2 focus:outline-none focus:border-neon-lime"
                  placeholder="TOKEN"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Metadata URI (Optional)
                </label>
                <input
                  type="text"
                  value={formData.uri}
                  onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
                  className="w-full bg-terminal-bg border border-terminal-border rounded px-4 py-2 focus:outline-none focus:border-neon-lime"
                  placeholder="https://arweave.net/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for default metadata
                </p>
              </div>

              <button
                onClick={handleExperimentalCreate}
                disabled={loading || !connected || !formData.name || !formData.symbol}
                className="w-full py-3 bg-neon-cyan text-black rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Token (Experimental)'}
              </button>

              {!connected && (
                <p className="text-center text-yellow-500 text-sm">
                  Connect your wallet to create tokens
                </p>
              )}
            </div>
          </div>

          {/* Simulation Result */}
          {simulationResult && (
            <div className={`terminal-card border ${
              simulationResult.willSucceed ? 'border-green-600' : 'border-red-600'
            }`}>
              <div className="flex items-start gap-3">
                {simulationResult.willSucceed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold mb-2">
                    Simulation {simulationResult.willSucceed ? 'Passed' : 'Failed'}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {simulationResult.message}
                  </p>
                  {simulationResult.logs && simulationResult.logs.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-gray-500">
                        View logs
                      </summary>
                      <pre className="mt-2 p-2 bg-black/50 rounded text-xs overflow-x-auto">
                        {simulationResult.logs.slice(0, 10).join('\n')}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react'
import apiService from '@/services/api'

export default function TestConnection() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [backendInfo, setBackendInfo] = useState<any>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      setStatus('checking')
      const health = await apiService.healthCheck()
      setBackendInfo(health)
      setStatus('connected')
    } catch (err: any) {
      setStatus('error')
      setError(err.message || 'Connection failed')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Backend Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 rounded border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Backend URL:</p>
          <p className="font-mono text-green-400">http://localhost:8000</p>
        </div>

        <div className="p-4 rounded border border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Status:</p>
          {status === 'checking' && (
            <p className="text-yellow-400">Checking connection...</p>
          )}
          {status === 'connected' && (
            <div>
              <p className="text-green-400 mb-2">✅ Connected!</p>
              <pre className="text-xs bg-gray-800 p-2 rounded">
                {JSON.stringify(backendInfo, null, 2)}
              </pre>
            </div>
          )}
          {status === 'error' && (
            <div>
              <p className="text-red-400 mb-2">❌ Connection Failed</p>
              <p className="text-sm text-gray-400">{error}</p>
              <p className="text-sm text-yellow-400 mt-2">
                Make sure backend is running on port 8000
              </p>
            </div>
          )}
        </div>

        <button
          onClick={checkConnection}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
        >
          Retry Connection
        </button>
      </div>
    </div>
  )
}

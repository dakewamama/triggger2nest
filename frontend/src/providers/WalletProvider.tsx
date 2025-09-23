import { FC, ReactNode, createContext, useContext, useState } from 'react'

interface WalletContextType {
  isConnected: boolean
  publicKey: string | null
  connect: () => void
  disconnect: () => void
  signTransaction: (tx: any) => Promise<any>
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  publicKey: null,
  connect: () => {},
  disconnect: () => {},
  signTransaction: async () => null,
})

export const useWallet = () => useContext(WalletContext)

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)

  const connect = () => {
    // Mock wallet connection
    setIsConnected(true)
    setPublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
    console.log('Mock wallet connected')
  }

  const disconnect = () => {
    setIsConnected(false)
    setPublicKey(null)
    console.log('Mock wallet disconnected')
  }

  const signTransaction = async (tx: any) => {
    console.log('Mock signing transaction:', tx)
    return tx
  }

  return (
    <WalletContext.Provider value={{ 
      isConnected, 
      publicKey, 
      connect, 
      disconnect,
      signTransaction 
    }}>
      {children}
    </WalletContext.Provider>
  )
}

// Mock WalletMultiButton component
export const WalletMultiButton = () => {
  const { isConnected, publicKey, connect, disconnect } = useWallet()
  
  return (
    <button
      onClick={isConnected ? disconnect : connect}
      className="px-4 py-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black font-bold rounded transition-all hover:opacity-90"
    >
      {isConnected ? 
        `${publicKey?.slice(0, 4)}...${publicKey?.slice(-4)}` : 
        'Connect Wallet'
      }
    </button>
  )
}
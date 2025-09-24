import { FC, ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react'
import { PublicKey, Transaction, Connection } from '@solana/web3.js'

// Phantom wallet interface
interface PhantomWallet {
  publicKey: PublicKey
  isPhantom: boolean  // Added this property
  isConnected: boolean
  signTransaction: (transaction: Transaction) => Promise<Transaction>
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  signAndSendTransaction: (transaction: Transaction) => Promise<{ signature: string }>
  connect: (opts?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>
  disconnect: () => Promise<void>
  on: (event: string, handler: (args: any) => void) => void
  removeListener: (event: string, handler: (args: any) => void) => void
}

interface WalletContextType {
  publicKey: PublicKey | null
  connected: boolean
  connecting: boolean
  disconnect: () => Promise<void>
  connect: () => Promise<void>
  signTransaction: ((transaction: any) => Promise<any>) | undefined
}

interface ConnectionContextType {
  connection: Connection
}

const WalletContext = createContext<WalletContextType>({
  publicKey: null,
  connected: false,
  connecting: false,
  disconnect: async () => {},
  connect: async () => {},
  signTransaction: undefined,
})

const ConnectionContext = createContext<ConnectionContextType>({
  connection: new Connection('https://api.devnet.solana.com'),
})

interface Props {
  children: ReactNode
}

// Get Phantom wallet from window
const getPhantomWallet = (): PhantomWallet | undefined => {
  if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
    return window.solana as PhantomWallet
  }
  return undefined
}

export const WalletProvider: FC<Props> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed')

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const phantom = getPhantomWallet()
      if (phantom?.isConnected) {
        setPublicKey(phantom.publicKey)
        setConnected(true)
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }, [])

  useEffect(() => {
    checkIfWalletIsConnected()
    
    const phantom = getPhantomWallet()
    if (phantom) {
      phantom.on('connect', (publicKey: PublicKey) => {
        setPublicKey(publicKey)
        setConnected(true)
      })
      
      phantom.on('disconnect', () => {
        setPublicKey(null)
        setConnected(false)
      })
    }
  }, [checkIfWalletIsConnected])

  const connect = useCallback(async () => {
    const phantom = getPhantomWallet()
    
    if (!phantom) {
      window.open('https://phantom.app/', '_blank')
      return
    }

    try {
      setConnecting(true)
      const response = await phantom.connect()
      setPublicKey(response.publicKey)
      setConnected(true)
    } catch (error) {
      console.error('Error connecting wallet:', error)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    const phantom = getPhantomWallet()
    if (phantom) {
      try {
        await phantom.disconnect()
        setPublicKey(null)
        setConnected(false)
      } catch (error) {
        console.error('Error disconnecting wallet:', error)
      }
    }
  }, [])

  const signTransaction = useCallback(async (transaction: any) => {
    const phantom = getPhantomWallet()
    if (!phantom) throw new Error('Wallet not connected')
    return await phantom.signTransaction(transaction)
  }, [])

  return (
    <ConnectionContext.Provider value={{ connection }}>
      <WalletContext.Provider value={{
        publicKey,
        connected,
        connecting,
        disconnect,
        connect,
        signTransaction: connected ? signTransaction : undefined,
      }}>
        {children}
      </WalletContext.Provider>
    </ConnectionContext.Provider>
  )
}

// Custom hooks
export const useWallet = () => useContext(WalletContext)
export const useConnection = () => useContext(ConnectionContext)

// Custom Wallet Button Component
export const WalletMultiButton: FC = () => {
  const { publicKey, connected, connecting, connect, disconnect } = useWallet()

  const handleClick = () => {
    if (connected) {
      disconnect()
    } else {
      connect()
    }
  }

  const buttonText = () => {
    if (connecting) return 'Connecting...'
    if (connected && publicKey) {
      const address = publicKey.toString()
      return `${address.slice(0, 4)}...${address.slice(-4)}`
    }
    return 'Connect Wallet'
  }

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="px-4 py-2 bg-gradient-to-r from-neon-lime to-neon-cyan text-black font-bold rounded transition-all hover:opacity-90 disabled:opacity-50"
    >
      {buttonText()}
    </button>
  )
}

export const WalletDisconnectButton: FC = () => {
  const { disconnect } = useWallet()
  
  return (
    <button
      onClick={disconnect}
      className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700"
    >
      Disconnect
    </button>
  )
}

// Add window type
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean
      publicKey?: PublicKey
      isConnected?: boolean
      signTransaction?: (transaction: Transaction) => Promise<Transaction>
      signAllTransactions?: (transactions: Transaction[]) => Promise<Transaction[]>
      signAndSendTransaction?: (transaction: Transaction) => Promise<{ signature: string }>
      connect?: (opts?: { onlyIfTrusted: boolean }) => Promise<{ publicKey: PublicKey }>
      disconnect?: () => Promise<void>
      on?: (event: string, handler: (args: any) => void) => void
      removeListener?: (event: string, handler: (args: any) => void) => void
    }
  }
}

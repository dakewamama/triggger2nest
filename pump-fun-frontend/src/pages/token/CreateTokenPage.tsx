import CreateTokenForm from '../../components/forms/CreateTokenForm'
import { Coins } from 'lucide-react'

export default function CreateTokenPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-600/20 rounded-full">
            <Coins className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2">Create New Token</h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Launch your own token on Solana with trigger. Fill out the form below to get started.
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <CreateTokenForm />
      </div>
    </div>
  )
}
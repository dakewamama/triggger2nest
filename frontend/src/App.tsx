import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { WalletProvider } from './providers/WalletProvider'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TokenDetailsPage from './pages/TokenDetailsPage'
import CreateTokenPage from './pages/CreateTokenPage'
import TradingPage from './pages/TradingPage'
import SearchPage from './pages/SearchPage'
import TestAPI from './pages/TestAPI'

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Layout>
          <nav className="bg-gray-800 p-4 mb-4">
            <div className="flex gap-4">
              <Link to="/" className="text-white hover:text-green-400">Home</Link>
              <Link to="/test-api" className="text-white hover:text-green-400">Test API</Link>
              <Link to="/create" className="text-white hover:text-green-400">Create Token</Link>
              <Link to="/trade" className="text-white hover:text-green-400">Trade</Link>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test-api" element={<TestAPI />} />
            <Route path="/token/:mint" element={<TokenDetailsPage />} />
            <Route path="/create" element={<CreateTokenPage />} />
            <Route path="/trade" element={<TradingPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </Layout>
        <Toaster position="bottom-right" theme="dark" />
      </BrowserRouter>
    </WalletProvider>
  )
}

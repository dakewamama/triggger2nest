import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WalletProvider } from './providers/WalletProvider'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import TokenDetailsPage from './pages/TokenDetailsPage'
import CreateTokenPage from './pages/CreateTokenPage'
import TradingPage from './pages/TradingPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
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
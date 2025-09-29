import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import WalletProvider from './providers/WalletProvider';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TokenDetailsPage from './pages/TokenDetailsPage';
import CreateTokenPage from './pages/CreateTokenPage';
import TradePage from './pages/TradingPage';

export default function App() {
  return (
    <Router>
      <WalletProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/token/:mint" element={<TokenDetailsPage />} />
            <Route path="/create" element={<CreateTokenPage />} />
            <Route path="/trade" element={<TradePage />} />
          </Routes>
        </Layout>
        <Toaster position="bottom-right" theme="dark" />
      </WalletProvider>
    </Router>
  );
}
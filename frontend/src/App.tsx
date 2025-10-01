import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './providers/WalletProvider';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TokenDetailsPage from './pages/TokenDetailsPage';
import CreateTokenPage from './pages/CreateTokenPage';
import TradingPage from './pages/TradingPage';
import PortfolioPage from './pages/PortfolioPage';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/token/:mint" element={<TokenDetailsPage />} />
            <Route path="/create" element={<CreateTokenPage />} />
            <Route path="/trade" element={<TradingPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster 
        position="bottom-right"
        theme="dark"
        richColors
      />
    </WalletProvider>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import HomePage from '../home/HomePage'
import CreateTokenPage from '../token/CreateTokenPage'
import TokenDetailPage from '../token/TokenDetailPage'
import ProfilePage from '../profile/ProfilePage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateTokenPage />} />
          <Route path="/token/:mintAddress" element={<TokenDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
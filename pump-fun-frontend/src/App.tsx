import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/home/homepage'
import CreateTokenPage from './pages/token/CreateTokenPage'
import ProfilePage from './pages/profile/ProfilePage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Temporary navigation - we'll make this prettier later */}
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex gap-4">
            <a href="/" className="text-white hover:text-gray-300">Home</a>
            <a href="/create" className="text-white hover:text-gray-300">Create Token</a>
            <a href="/profile" className="text-white hover:text-gray-300">Profile</a>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateTokenPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
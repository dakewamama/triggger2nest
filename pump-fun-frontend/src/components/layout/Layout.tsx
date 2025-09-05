import type { ReactNode } from 'react'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-800 border-t border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Pump.Fun Frontend - Built with React & TypeScript</p>
        </div>
      </footer>
    </div>
  )
}
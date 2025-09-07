import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-gray-800 border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 trigger - pump.fun controller exposure</p>
        </div>
      </footer>
    </div>
  );
}
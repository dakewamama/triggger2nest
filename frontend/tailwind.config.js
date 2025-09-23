/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0f0a',
          surface: '#141a14',
          border: '#263326',
        },
        neon: {
          lime: '#00ff00',
          cyan: '#00ffff',
          magenta: '#ff00ff',
          gold: '#ffd700',
        },
        profit: '#00cc00',
        loss: '#ff3333',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
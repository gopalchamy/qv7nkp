/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#070b14',
          card: '#0e1626',
          cardHover: '#131e33',
          border: 'rgba(255, 255, 255, 0.08)',
          borderGlow: 'rgba(6, 182, 212, 0.35)',
        },
        forecast: {
          light: '#fde68a',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        actual: {
          light: '#a5f3fc',
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.3)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}

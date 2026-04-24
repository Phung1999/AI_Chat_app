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
        primary: '#6C63FF',
        'primary-dark': '#5A52E0',
        'primary-light': '#8B84FF',
        secondary: '#4ECDC4',
        accent: '#FF6B6B',
        'accent-green': '#51CF66',
        bubble: {
          sent: '#6C63FF',
          received: '#FFFFFF',
        },
        surface: '#FFFFFF',
        'surface-hover': '#F0F2FF',
        border: '#E8EAF6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #6C63FF 0%, #4ECDC4 100%)',
        'sidebar-gradient': 'linear-gradient(180deg, #6C63FF 0%, #5A52E0 100%)',
        'auth-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #6C63FF 70%, #4ECDC4 100%)',
      },
      boxShadow: {
        'primary-sm': '0 2px 8px rgba(108,99,255,0.2)',
        'primary-md': '0 4px 16px rgba(108,99,255,0.25)',
        'primary-lg': '0 8px 32px rgba(108,99,255,0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold:    { DEFAULT: '#C9A96E', light: '#E8D5B7', dark: '#A07840' },
        charcoal:{ DEFAULT: '#1A1A1A', light: '#2A2A2A', dark: '#0A0A0A' },
        cream:   { DEFAULT: '#F7F4F0', dark: '#EDE9E4' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up':   'fadeUp 0.6s ease forwards',
        'fade-in':   'fadeIn 0.5s ease forwards',
        'slide-in':  'slideIn 0.5s ease forwards',
        'pulse-gold':'pulseGold 2s ease infinite',
        'shimmer':   'shimmer 1.8s linear infinite',
        'float':     'float 3s ease-in-out infinite',
        'spin-slow':  'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp:     { '0%':{ opacity:'0', transform:'translateY(24px)' }, '100%':{ opacity:'1', transform:'translateY(0)' } },
        fadeIn:     { '0%':{ opacity:'0' }, '100%':{ opacity:'1' } },
        slideIn:    { '0%':{ opacity:'0', transform:'translateX(-24px)' }, '100%':{ opacity:'1', transform:'translateX(0)' } },
        pulseGold:  { '0%,100%':{ boxShadow:'0 0 0 0 rgba(201,169,110,0.4)' }, '50%':{ boxShadow:'0 0 0 12px rgba(201,169,110,0)' } },
        shimmer:    { '0%':{ backgroundPosition:'-200% 0' }, '100%':{ backgroundPosition:'200% 0' } },
        float:      { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'card':  '0 4px 24px rgba(0,0,0,0.08)',
        'hover': '0 16px 48px rgba(0,0,0,0.16)',
        'gold':  '0 4px 20px rgba(201,169,110,0.4)',
      },
    },
  },
  plugins: [],
}

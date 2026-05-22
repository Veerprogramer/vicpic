/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        neon: {
          blue: '#00d4ff',
          purple: '#bf00ff',
          cyan: '#00ffff',
          pink: '#ff00aa',
          green: '#00ff88',
        },
        dark: {
          900: '#020408',
          800: '#060d16',
          700: '#0a1628',
          600: '#0f2040',
          500: '#152a55',
          400: '#1e3a6e',
        },
        glass: {
          100: 'rgba(255,255,255,0.03)',
          200: 'rgba(255,255,255,0.06)',
          300: 'rgba(255,255,255,0.10)',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'monospace'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
        `,
        'neon-glow': 'linear-gradient(135deg, #00d4ff22, #bf00ff22)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      backgroundSize: {
        'grid': '24px 24px',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.1)',
        'neon-purple': '0 0 20px rgba(191,0,255,0.4), 0 0 40px rgba(191,0,255,0.1)',
        'neon-sm': '0 0 10px rgba(0,212,255,0.3)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.5)',
      },
      keyframes: {
        'neon-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(0,212,255,0.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 40px rgba(0,212,255,0.8)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200vh)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'scan-line': 'scan-line 4s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-up': 'fade-up 0.4s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};

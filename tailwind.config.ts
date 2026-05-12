import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep':    '#040d09',
        'bg-base':    '#0d1f1a',
        'bg-raised':  '#122b23',
        'emerald-primary': '#00c870',
        'emerald-dim':     '#1a5c3a',
        'metal-light':     '#64a082',
      },
      fontFamily: {
        display: ['Rajdhani', 'Share Tech Mono', 'monospace'],
        mono:    ['"Share Tech Mono"', 'monospace'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(0,200,112,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0,200,112,0.6), 0 0 40px rgba(0,200,112,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
}

export default config

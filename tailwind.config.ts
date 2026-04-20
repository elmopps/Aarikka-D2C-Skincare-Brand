import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-green':   '#1B3A2D',
        'brand-gold':    '#C5973A',
        'brand-cream':   '#FAF6EF',
        'brand-charcoal':'#1C1C1C',
        'brand-sage':    '#7D9B7E',
        'brand-white':   '#FFFFFF',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '1280px',
      },
      borderRadius: {
        card: '8px',
        btn:  '4px',
      },
    },
  },
  plugins: [],
}

export default config

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f2f8f4',
          100: '#e0f0e6',
          200: '#bde0cc',
          300: '#8ec9a9',
          400: '#5aad82',
          500: '#358f63',
          600: '#23724d',
          700: '#1a5a3d',
          800: '#154830',
          900: '#0f3522',
          950: '#071f14',
        },
        blush: {
          50:  '#fdf4f4',
          100: '#fce8e8',
          200: '#fad5d5',
          300: '#f5b3b3',
          400: '#ed8585',
          500: '#e05c5c',
          600: '#cb3f3f',
          700: '#aa3030',
          800: '#8c2d2d',
          900: '#752b2b',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#faf7ef',
          200: '#f4eddb',
          300: '#ebdfc0',
          400: '#dfcc9d',
          500: '#d0b87a',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'hero-pattern': "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(53,143,99,0.15), transparent)",
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 53, 34, 0.08), 0 1px 2px -1px rgba(15, 53, 34, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(15, 53, 34, 0.12), 0 4px 10px -6px rgba(15, 53, 34, 0.1)',
        'glow': '0 0 40px rgba(53, 143, 99, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config

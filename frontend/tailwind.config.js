/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        stone: {
          50: '#FAFAF8',
          100: '#F5F4F0',
          150: '#EFEDE7',
          200: '#E8E6DE',
          300: '#D4D0C4',
          400: '#B8B3A3',
          500: '#9C9582',
          600: '#7A7366',
          700: '#5C564D',
          800: '#3D3935',
          900: '#1F1D1B',
          950: '#0F0E0D',
        },
        accent: {
          gold: '#C9A96E',
          'gold-light': '#D4BC8E',
          'gold-dark': '#A8874F',
          warm: '#B8956A',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'text-reveal': 'textReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'stagger-in': 'staggerIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'parallax-fade': 'parallaxFade 1s ease-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'zoom-subtle': 'zoomSubtle 20s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        textReveal: {
          '0%': { opacity: '0', transform: 'translateY(40px) skewY(2deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) skewY(0)' },
        },
        staggerIn: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        parallaxFade: {
          '0%': { opacity: '0', transform: 'translateY(60px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        zoomSubtle: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.08)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

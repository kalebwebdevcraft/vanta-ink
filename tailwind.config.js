/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Anton"', 'Impact', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070606',
          900: '#0c0b0b',
          800: '#141212',
          700: '#1e1b1b',
          600: '#2b2727',
        },
        bone: {
          DEFAULT: '#ece6da',
          dim: '#a39d92',
          mute: '#6b665e',
        },
        blood: {
          DEFAULT: '#e11d2e',
          light: '#ff4a58',
          dark: '#8f0f1a',
        },
      },
    },
  },
  plugins: [],
};
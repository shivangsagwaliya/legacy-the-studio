/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        studio: {
          950: '#07080a',
          900: '#0e1015',
          850: '#13161d',
          800: '#1a1e27',
          700: '#262b36',
          600: '#383f4e',
          500: '#525b6e',
          400: '#7e889b',
          300: '#a6b0c2',
          200: '#d0d7e2',
          100: '#eef2f7',
        },
        apple: {
          blue: '#0A84FF',
          indigo: '#5E5CE6',
          purple: '#BF5AF2',
          pink: '#FF375F',
          red: '#FF453A',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
          green: '#30D158',
          teal: '#64D2FF',
          cyan: '#70D7FF',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'Consolas', '"Courier New"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        xl: '20px',
        '2xl': '40px',
      },
    },
  },
  plugins: [],
};

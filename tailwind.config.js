/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#059825',
          dark: '#123223',
          mint: '#eef8f1',
          amber: '#f59e0b',
          red: '#dc2626'
        }
      },
      boxShadow: {
        bar: '0 -10px 30px rgba(0, 0, 0, 0.12)',
        soft: '0 10px 30px rgba(18, 50, 35, 0.08)'
      }
    }
  },
  plugins: []
};

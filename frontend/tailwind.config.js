/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
        },
        tallento: {
          pink: '#0284c7',   // Primary Vibrant Sky Blue
          orange: '#38bdf8', // Soft Light Blue
          purple: '#2563eb', // Royal Blue Accent
          dark: '#0369a1',
          card: '#ffffff',
          border: '#e0f2fe',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        navy: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        accent: {
          purple: '#2563eb',
          amber: '#f59e0b',
          rose: '#0284c7',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-50': '#EFF6FF',
        'primary-100': '#DBEAFE',
        'primary-200': '#BFDBFE',
        'primary-300': '#93C5FD',
        'primary-400': '#60A5FA',
        'primary-500': '#3B82F6',
        'primary-600': '#2563EB',
        'primary-700': '#1D4ED8',
        'primary-800': '#1E40AF',
        'primary-900': '#1E3A8A',
      },
      backgroundColor: {
        'light': '#FFFFFF',
        'dark': '#1F2937',
      },
      textColor: {
        'light': '#1F2937',
        'dark': '#F9FAFB',
      },
    },
  },
  plugins: [],
}
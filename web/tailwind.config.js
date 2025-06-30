/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stories-pink': '#e91e63',
        'stories-purple': '#9c27b0',
      }
    },
  },
  plugins: [],
}

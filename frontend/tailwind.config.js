/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a', // Navy blue
          light: '#3b82f6', // Light blue
          dark: '#1e40af',
        },
        vatsim: {
          navy: '#1e3a8a',
          blue: '#3b82f6',
          gray: '#f3f4f6',
          'dark-gray': '#1f2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

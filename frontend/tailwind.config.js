/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0B0E14',
          light: '#111827',
          lighter: '#1E293B',
        },
        primary: {
          DEFAULT: '#D84315',
          light: '#FF6E40',
          dark: '#BF360C',
        },
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
const colors=require('tailwindcss/colors')

module.exports = {
  mode:'jit',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#202225',
        secondary: '#5865f2',
        grey: colors.neutral,
      }
    },
  },
  plugins: [],
}
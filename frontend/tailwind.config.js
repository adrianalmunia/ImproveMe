/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'Gris-Bonito': '#3C3C3C',
        'Azul-Principal': '#4F99CC',
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#005EB8',
        secondary: '#E60012',
        accent: '#FF7A00',
      },
    },
  },
  plugins: [],
};

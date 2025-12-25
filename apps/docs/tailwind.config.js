/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,md,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './src/**/*.{js,ts,jsx,tsx,md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#398CCB',
        subtext: '#8BA1B2',
        gray: '#D9D9D9',
        'background-black': '#070707',
        'border-gray': '#788188',
        'border-primary': '#75ABD4',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};

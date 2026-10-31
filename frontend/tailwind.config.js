/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#09090b',
          900: '#18181b',
          850: '#202024',
          800: '#27272a',
          700: '#3f3f46',
        },
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace', 'Consolas'],
      },
    },
  },
  plugins: [],
};


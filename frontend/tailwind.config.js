/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cores da identidade CPFL Funil
        brand: {
          50:  '#eef3fb',
          100: '#d5e2f5',
          200: '#abc5eb',
          300: '#7aa4de',
          400: '#4f86c6',  // azul médio do logo
          500: '#3a6eaa',
          600: '#2d5a8e',
          700: '#1e3d6b',  // azul escuro do logo
          800: '#152d50',
          900: '#0d1e38',
        },
        cpfl: {
          navy:   '#1D3461',  // azul escuro CPFL
          blue:   '#4F86C6',  // azul claro CPFL
          yellow: '#F5C32C',  // amarelo CPFL
          dark:   '#111827',
        },
      },
    },
  },
  plugins: [],
};

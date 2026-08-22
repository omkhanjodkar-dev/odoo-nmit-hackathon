/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#714b67', // Odoo purple tone
          600: '#5a3b52',
          700: '#432c3d',
        },
        odoo: {
          purple: '#714B67',
          teal: '#008784',
          dark: '#212529',
          light: '#F8F9FA',
          gray: '#E9ECEF',
          border: '#DEE2E6',
        }
      }
    },
  },
  plugins: [],
}

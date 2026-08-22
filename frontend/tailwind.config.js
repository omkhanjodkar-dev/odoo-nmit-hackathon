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
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Primary Electric Indigo
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        navy: {
          800: '#1E293B',
          900: '#0F172A', // Deep Midnight Slate for Topbar
          950: '#0B0F19',
        },
        status: {
          present: '#10B981',
          'present-bg': '#ECFDF5',
          'present-text': '#065F46',
          leave: '#0284C7',
          'leave-bg': '#F0F9FF',
          'leave-text': '#0369A1',
          absent: '#F59E0B',
          'absent-bg': '#FFFBEB',
          'absent-text': '#92400E',
          danger: '#EF4444',
          'danger-bg': '#FEF2F2',
          'danger-text': '#991B1B',
          pending: '#8B5CF6',
          'pending-bg': '#FAF5FF',
          'pending-text': '#6B21A8',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'elevated': '0 10px 30px -4px rgba(15, 23, 42, 0.08)',
        'glow-indigo': '0 0 20px rgba(99, 102, 241, 0.3)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideDown': 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}

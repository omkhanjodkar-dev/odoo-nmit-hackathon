/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        odoo: {
          purple: '#714B67',
          'purple-dark': '#5a3b52',
          'purple-light': '#f7f2f6',
          'purple-muted': '#ede5eb',
          teal: '#008784',
          'teal-dark': '#006e6b',
          'teal-light': '#e6f4f4',
          dark: '#1e293b',
          light: '#F8FAFC',
          gray: '#E2E8F0',
          border: '#E2E8F0',
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
        'glow-purple': '0 0 15px rgba(113, 75, 103, 0.25)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'slideDown': 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulseSlow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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

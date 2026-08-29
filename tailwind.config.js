/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-subtle': '#EFF6FF',
          navy: '#0C1322',
          'navy-border': '#1A2337',
          'navy-hover': '#1E293B',
          canvas: '#F8FAFC',
          surface: '#FFFFFF',
          border: '#E2E8F0',
          heading: '#0F172A',
          body: '#475569',
          muted: '#94A3B8',
          success: '#16A34A',
          'success-subtle': '#F0FDF4',
          warning: '#EA580C',
          'warning-subtle': '#FFF7ED',
          danger: '#DC2626',
          'danger-subtle': '#FEF2F2',
          info: '#2563EB',
          'info-subtle': '#F0F7FF',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        'card': '12px',
        'sheet': '16px',
      }
    },
  },
  plugins: [],
}

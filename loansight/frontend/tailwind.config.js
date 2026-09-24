/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAFAF7',
          subtle: '#F4F4EE',
          card: '#FFFFFF',
          border: 'rgba(15, 23, 42, 0.08)'
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          light: '#64748B'
        },
        tealAccent: {
          DEFAULT: '#0F9D8A',
          hover: '#0D8A79',
          light: '#E6F6F4',
          subtle: 'rgba(15, 157, 138, 0.1)'
        },
        risk: {
          low: '#10B981',
          lowBg: '#ECFDF5',
          medium: '#D97706',
          mediumBg: '#FFFBEB',
          high: '#E11D48',
          highBg: '#FFF1F2'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.06)',
        'card-hover': '0 12px 28px -4px rgba(15, 23, 42, 0.09), 0 4px 12px -2px rgba(15, 23, 42, 0.04)'
      }
    },
  },
  plugins: [],
}

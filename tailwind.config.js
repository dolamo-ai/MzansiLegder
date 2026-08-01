/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand palette
        bg: '#09090B',
        'bg-2': '#111827',
        sidebar: '#0F172A',
        card: '#18181B',
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
        },
        accent: '#06B6D4',
        purple: '#7C3AED',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        border: 'rgba(255,255,255,0.08)',
        'text-1': '#FFFFFF',
        'text-2': '#A1A1AA',
        muted: '#71717A',
      },
      borderRadius: {
        btn: '16px',
        card: '22px',
        input: '16px',
        table: '18px',
        modal: '24px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25)',
        glow: '0 0 0 1px rgba(37,99,235,0.35), 0 8px 30px rgba(37,99,235,0.25)',
        'glow-accent': '0 0 0 1px rgba(6,182,212,0.35), 0 8px 30px rgba(6,182,212,0.22)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

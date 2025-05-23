/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Synmax brand colors
        primary: {
          50: '#e6f4f7',
          100: '#cce9ef',
          200: '#99d3df',
          300: '#66bdcf',
          400: '#33a7bf',
          500: '#00a4bd', // Synmax calypso blue
          600: '#008397',
          700: '#006271',
          800: '#00414b',
          900: '#002025',
          950: '#001013',
        },
        secondary: {
          50: '#e6ffec',
          100: '#ccffda',
          200: '#99ffb5',
          300: '#66ff90',
          400: '#33ff6b',
          500: '#00e96c', // Synmax bright green
          600: '#00ba56',
          700: '#008c41',
          800: '#005d2b',
          900: '#002f16',
          950: '#00170b',
        },
        accent: {
          50: '#f0ffe6',
          100: '#e1ffcc',
          200: '#c3ff99',
          300: '#a5ff66',
          400: '#8bff5b', // Synmax lime green gradient end
          500: '#6fe633',
          600: '#59b829',
          700: '#438a1f',
          800: '#2d5c14',
          900: '#172e0a',
          950: '#0b1705',
        },
        dark: {
          50: '#e7e8ea',
          100: '#cfd1d5',
          200: '#9fa3ab',
          300: '#6f7581',
          400: '#3f4757',
          500: '#131c2a', // Synmax dark blue/navy
          600: '#0f1622',
          700: '#0b1119',
          800: '#070b11',
          900: '#040608',
          950: '#020304',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Functional colors
        success: '#00e96c',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#00a4bd',
      },
      fontFamily: {
        sans: ['Graphie', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'sans-light': ['Graphie Light', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'sans-bold': ['Graphie Bold', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00e96c 0%, #8bff5b 100%)',
        'gradient-dark': 'linear-gradient(180deg, #131c2a 0%, #0f1622 100%)',
      },
      backgroundColor: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
      },
      textColor: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores del sistema GUSTO adaptados a UNITEPC
        dark: {
          900: '#0a0a0b',
          800: '#111113',
          700: '#18181b',
          600: '#1f1f23',
          500: '#27272a',
          400: '#3f3f46',
        },
        primary: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        secondary: {
          DEFAULT: '#14B8A6',
          light: '#2DD4BF',
          dark: '#0D9488',
        },
        accent: {
          orange: '#F97316',
          blue: '#3B82F6',
          green: '#22C55E',
          red: '#EF4444',
          yellow: '#EAB308',
          pink: '#EC4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.3)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.3)',
      }
    },
  },
  plugins: [],
  // Importante: no usar Tailwind para clases base que interfieran con Quasar
  corePlugins: {
    preflight: false,
  }
}

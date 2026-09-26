/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#16311F',
          800: '#1e432a',
          700: '#285C38',
          600: '#327244',
          500: '#3E7C4A',
          400: '#52965f',
          100: '#d5e6d8',
          50: '#f0f5f1',
        },
        sage: {
          100: '#E7EEE1',
          200: '#d7e2ce',
          50: '#f3f6f0',
        },
        cream: {
          50: '#F6F3EA',
          100: '#ece7d8',
        },
        lime: {
          400: '#D4E85A',
          300: '#deee7b',
          200: '#eaf4aa',
          100: '#F2F7D6',
          50: '#fafceb',
        },
        soil: {
          600: '#8B5E34',
          500: '#a37142',
          100: '#f4ede6',
        },
        amber: {
          500: '#E8A93B',
          400: '#f0b852',
          100: '#fdf5e7',
        },
        terracotta: {
          500: '#C6503E',
          600: '#b04231',
          100: '#fae9e6',
        },
        steel: {
          500: '#3E7CA8',
          600: '#32678c',
          100: '#e5eff6',
        },
        ink: {
          900: '#1E241C',
          700: '#343d31',
          500: '#5B6459',
          400: '#838e80',
          300: '#afb8ac',
        },
        line: {
          200: '#DCE3D6',
          100: '#eaf0e6',
        },
        surface: {
          0: '#FFFFFF',
        }
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 8px 24px rgba(22, 49, 31, 0.08)',
        'ambient-lg': '0 16px 36px rgba(22, 49, 31, 0.12)',
        'ambient-xl': '0 24px 48px rgba(22, 49, 31, 0.16)',
      },
      borderRadius: {
        'hero': '20px',
        'card': '12px',
        'pill': '999px',
      }
    },
  },
  plugins: [],
}

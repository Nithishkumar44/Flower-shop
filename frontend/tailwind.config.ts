import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF4',
          100: '#FAF4DF',
          200: '#F3E4B5',
          300: '#ECD285',
          400: '#E2BC55',
          500: '#D4AF37', // primary gold accent
          600: '#B89327',
          700: '#92711D',
          800: '#6D5114',
          900: '#4D370A',
        },
        rose: {
          50: '#FFF5F6',
          100: '#FFE6E9',
          200: '#FFD3D8',
          300: '#FFAFBA',
          400: '#FF7D91',
          500: '#F43F5E',
          650: '#D04E64', // premium dust rose
        },
        forest: {
          50: '#F3F7F5',
          100: '#E4EDE9',
          200: '#CBE0D6',
          300: '#A4C6B7',
          400: '#75A490',
          550: '#2A5C47', // botanical green
          800: '#14382A',
          900: '#0F2E23', // deep dark green background
          950: '#061711',
        },
        cream: {
          50: '#FCFAF7',
          100: '#FAF6EF',
          200: '#F2ECE0',
          300: '#E5DCB9',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

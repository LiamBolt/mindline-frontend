/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '375px',
      },
      colors: {
        teal: {
          50:  '#F3F6FF',
          100: '#E4EAF8',
          200: '#C5D0EA',
          300: '#8FA0C4',
          400: '#5B6FA0',
          500: '#3A4D80',
          600: '#243564',
          700: '#18264A',
          800: '#0F1C3A',
          900: '#0A192F',
        },
        mint: {
          50:  '#E6FAFF',
          100: '#CFF4FF',
          200: '#A6EBFF',
          300: '#6DDDFF',
          400: '#2ECFFF',
          500: '#00B8E8',
          600: '#0099D1',
          700: '#0078B8',
          800: '#0A5F96',
          900: '#0B4570',
        },
        ice: {
          50:  '#F5F8FF',
          100: '#E8EEFF',
          200: '#D4DFFF',
        },
        help: {
          50:  '#FBF1E7',
          500: '#C97B3D',
          600: '#B5652A',
        },
        /* Semantic Colors */
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
        },
        fg: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          heading: 'var(--text-heading)',
          onAccent: 'var(--text-on-accent)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          focus: 'var(--border-focus)',
        },
        accent: {
          base: 'var(--accent-base)',
          hover: 'var(--accent-hover)',
          subtle: 'var(--accent-subtle)',
        }
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      transitionTimingFunction: {
        'calm': 'var(--ease-calm)',
      },
      transitionDuration: {
        'fast': 'var(--duration-fast)',
        'base': 'var(--duration-base)',
        'modal': 'var(--duration-modal)',
      }
    },
  },
  plugins: [],
}

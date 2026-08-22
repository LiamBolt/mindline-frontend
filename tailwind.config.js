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
          50:  '#F2F5F5',
          100: '#E0E8E8',
          200: '#C0D2D1',
          300: '#9CB8B6',
          400: '#6A9592',
          500: '#407673',
          600: '#1E5E5A',
          700: '#1A4E4A',
          800: '#163F3C',
          900: '#12302E',
        },
        mint: {
          50:  '#F4FAF9',
          100: '#E6F4F2',
          200: '#CEE9E5',
          300: '#B2DCD6',
          400: '#8BCAC2',
          500: '#69BBB0',
          600: '#4FAFA2',
          700: '#408D83',
          800: '#326E66',
          900: '#244F49',
        },
        ice: {
          50:  '#EFF9F7',
          100: '#D6EFEB',
          200: '#B5D5D1',
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
        sans: ['Inter', 'Manrope', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
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

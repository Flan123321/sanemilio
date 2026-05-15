/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.{html,js}"
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          900: '#0B1A2E',
          800: '#152844',
          700: '#1F3654',
          600: '#2C4A6E',
        },
        'orange': {
          primary: '#FF6B35',
          light: '#FF8A5C',
          dark: '#E65528',
        },
        'cream': {
          DEFAULT: '#F8F5F0',
          light: '#FFFBF5',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in-up 0.8s ease-out forwards',
      }
    }
  },
  plugins: [],
}

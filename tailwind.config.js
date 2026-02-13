/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        letter: ['"Dancing Script"', 'cursive'],
      },
      colors: {
        'sdv-brown': '#8B6914',
        'sdv-dark': '#5C3A1E',
        'sdv-cream': '#F5E6C8',
        'sdv-gold': '#FFD700',
        'sdv-red': '#C0392B',
        'sdv-green': '#27AE60',
        'sdv-blue': '#2980B9',
      },
      animation: {
        'letter-unfold': 'letterUnfold 0.8s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
      },
      keyframes: {
        letterUnfold: {
          '0%': { transform: 'scaleY(0) rotateX(90deg)', opacity: '0' },
          '50%': { transform: 'scaleY(0.5) rotateX(45deg)', opacity: '0.5' },
          '100%': { transform: 'scaleY(1) rotateX(0deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};

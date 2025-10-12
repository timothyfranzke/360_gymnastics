/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: {
            DEFAULT: '#fc7900',
            hover: '#e66a00',
          },
          blue: {
            DEFAULT: '#0226ff',
            hover: '#0119b3',
            light: '#3b82f6',
            'light-hover': '#2563eb',
          },
          cyan: {
            DEFAULT: '#06b6d4',
            hover: '#0891b2',
          },
          white: '#ffffff',
          gray: {
            DEFAULT: '#6b7280',
            hover: '#4b5563',
          },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      },
      zIndex: {
        '-10': '-10',
      },
    },
  },
  plugins: [],
}

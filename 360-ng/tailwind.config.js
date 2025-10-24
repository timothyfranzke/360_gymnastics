/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./src/**/*.component.html",
    "./src/**/*.component.ts"
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand colors that align with the button system
        'brand-orange': '#fc7900',
        'brand-orange-hover': '#e66a00',
        'brand-blue': '#0226ff',
        'brand-blue-hover': '#0119b3',
        'brand-blue-light': '#3b82f6',
        'brand-blue-light-hover': '#2563eb',
        'brand-cyan': '#06b6d4',
        'brand-cyan-hover': '#0891b2',
        'brand-white': '#ffffff',
        'brand-gray': '#6b7280',
        'brand-gray-hover': '#4b5563'
      },
      fontFamily: {
        // Since no Google Fonts are detected, using system fonts for optimal performance
        'sans': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      }
    }
  },
  plugins: [],
  // Safelist common utility classes to avoid purging issues
  safelist: [
    'bg-white',
    'px-4',
    'py-2',
    'text-white',
    'text-gray-800',
    'text-gray-600',
    'bg-gray-100',
    'bg-gray-200',
    'border',
    'border-gray-300',
    'rounded',
    'shadow',
    'flex',
    'items-center',
    'justify-center',
    'space-x-2',
    'space-y-2',
    'w-full',
    'h-full',
    'max-w-md',
    'max-w-lg',
    'max-w-xl',
    'max-w-2xl',
    'container',
    'mx-auto',
    'p-4',
    'p-6',
    'p-8',
    'm-4',
    'm-6',
    'm-8',
    'mt-4',
    'mb-4',
    'ml-4',
    'mr-4',
    'text-sm',
    'text-base',
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'font-medium',
    'font-semibold',
    'font-bold',
    'hover:bg-gray-50',
    'hover:text-indigo-600',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-indigo-500',
    'transition',
    'duration-200',
    'ease-in-out'
  ]
};
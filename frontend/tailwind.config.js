/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: '#0B0B0C',
        'noir-2': '#100F0D',
        'noir-3': '#171511',
        'noir-4': '#1F1B14',
        'gold-l': '#F8EAB8',
        gold: '#D9B85C',
        'gold-2': '#C49B3F',
        'gold-d': '#9A7026',
        'gold-deep': '#7A5818',
        cream: '#ECE4D2',
        'cream-soft': '#A79E8A',
        'cream-dim': '#7C7461',
        line: 'rgba(217, 184, 92, 0.16)',
        'line-2': 'rgba(217, 184, 92, 0.30)',
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Jost', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

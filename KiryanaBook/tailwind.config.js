/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        card: 'hsl(var(--card))',
        'card-secondary': 'hsl(var(--card-secondary))',
        primary: 'hsl(var(--primary))',
        success: 'hsl(var(--success))',
        danger: 'hsl(var(--danger))',
        warning: 'hsl(var(--warning))',
        'text-primary': 'hsl(var(--text-primary))',
        'text-muted': 'hsl(var(--text-muted))',
        border: 'hsl(var(--border))'
      },
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}

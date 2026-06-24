/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#111118',
          700: '#1a1a24',
          600: '#22222f',
          500: '#2d2d3d',
        },
        accent: {
          primary: '#6c63ff',
          secondary: '#a78bfa',
          glow: '#818cf8',
        },
        text: {
          primary: '#e2e8f0',
          muted: '#94a3b8',
          subtle: '#64748b',
        }
      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mc: {
          dark: '#121417',
          surface: '#1b1f24',
          card: '#22272e',
          border: '#373e47',
          accent: '#10b981',       // emerald
          accentHover: '#059669',
          diamond: '#38bdf8',      // diamond blue
          gold: '#fbbf24',         // gold ingot
          redstone: '#f43f5e',     // redstone red
          amethyst: '#c084fc',     // amethyst purple
          text: '#f1f5f9',
          muted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace']
      },
      boxShadow: {
        'mc-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'mc-glow': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'mc-blue-glow': '0 0 20px -3px rgba(56, 189, 248, 0.4)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Workshop instrument: warm graphite ground, steel panels, brass as the
        // only accent. Numeric brass shades exist so opacity modifiers still work.
        ground: '#14120F',
        panel: '#1B1815',
        raised: '#221E1A',
        rule: '#2E2A24',
        brass: {
          DEFAULT: '#C89A4E',
          300: '#E4C48A',
          400: '#D6AD64',
          500: '#C89A4E',
          600: '#A87C36',
          700: '#7E5B26',
          800: '#5C431C',
          900: '#3D2D14',
          950: '#241A0C',
        },
        paper: '#EFE9DF',
        muted: '#9C9286',
        ok: '#6E9E6A',
        warn: '#D08A3E',
        bad: '#C4624F',
        // Loader cue: a 6px swatch, never a border or a wash.
        loader: {
          universal: '#A8A29A',
          fabric: '#C8A97E',
          quilt: '#A98BB8',
          forge: '#C08155',
          neoforge: '#7C9FAE',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0, 0, 0, 0.4), 0 16px 40px -20px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
}

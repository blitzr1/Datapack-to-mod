/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cool graphite ground with one blue accent for actions and focus.
        ground: '#0B0D10',
        panel: '#12151A',
        raised: '#171C23',
        rule: '#232A33',
        signal: {
          DEFAULT: '#3B82F6',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          950: '#172554',
        },
        paper: '#E6EDF5',
        soft: '#B9C3D0',
        muted: '#8B95A5',
        faint: '#6E7787',
        ok: '#4FA97A',
        warn: '#D9A03C',
        bad: '#E05C5C',
        // Loader cue: a 6px swatch, never a border or a wash.
        loader: {
          universal: '#9AA3AF',
          fabric: '#D4B08C',
          quilt: '#B18BD0',
          forge: '#D9824F',
          neoforge: '#6FA8C9',
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

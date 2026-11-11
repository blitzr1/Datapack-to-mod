import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: './', // Ensures relative assets so it works on GitHub Pages, Vercel, Netlify, or subfolders
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/jszip')) {
            return 'jszip';
          }
          if (id.includes('node_modules/lenis') || id.includes('node_modules/canvas-confetti')) {
            return 'ui-utils';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import path from 'node:path';

// `base` controls how the built HTML resolves asset URLs.
// Default `/` works for nginx at a domain root and for `pnpm run preview`.
// GitHub Pages serves the project at `https://<user>.github.io/inkmo/`, so the
// deploy workflow sets `PUBLIC_BASE=/inkmo/` to prefix every asset URL.
const base = process.env.PUBLIC_BASE || '/';

export default defineConfig({
  base,
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vditor: ['vditor'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  preview: {
    port: 4173,
  },
});

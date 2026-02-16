import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bagis-rpg/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
  server: {
    port: 3001,
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  define: {
    // Intentionally empty or strictly specific defines. 
    // Do NOT overwrite process.env with empty object.
  },
  build: {
    // Downgrade target for older iOS compatibility
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: true,
  }
});
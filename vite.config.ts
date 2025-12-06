import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', 
  define: {
    // This is CRITICAL for preventing crashes in libraries that check process.env
    'process.env': {}
  },
  build: {
    // Downgrade target for older iOS compatibility
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure CSS is extracted properly
    cssCodeSplit: true,
  }
});
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    base: './', 
    define: {
      // Inject the API key safely. 
      // If env.API_KEY is undefined, it injects "undefined" (string) or undefined value, 
      // which is handled by the service layer fallback.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      // Compatibility for older mobile browsers
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
    }
  };
});
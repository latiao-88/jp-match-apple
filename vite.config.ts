import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    base: './', 
    define: {
      // CRITICAL: Inject the API key directly into the build so the code can access process.env.API_KEY
      // The JSON.stringify is needed because define does a literal replacement.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    build: {
      // Downgrade target for older iOS compatibility (iPhone 7/8/X era)
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      cssCodeSplit: true,
    }
  };
});
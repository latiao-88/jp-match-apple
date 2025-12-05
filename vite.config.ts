import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 关键：确保资源使用相对路径，解决 GitHub Pages 白屏问题
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
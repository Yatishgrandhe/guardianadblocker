import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'components': resolve(__dirname, 'components'),
      'lib': resolve(__dirname, 'lib'),
    },
  },
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/index.tsx'),
      },
      output: {
        entryFileNames: 'popup.js',
        assetFileNames: '[name][extname]',
        chunkFileNames: '[name].js',
      },
    },
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
}); 
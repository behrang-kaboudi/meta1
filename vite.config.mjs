import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: 'react', // یعنی dev server ریشه‌اش پوشه‌ی react است
  publicDir: false,
  plugins: [react()],
  cacheDir: 'vite-cache', // اختیاری: کش را از node_modules بیرون می‌برد
  build: {
    outDir: 'dist', // نسبت به root → خروجی می‌شود: react/dist
    emptyOutDir: true,
    rollupOptions: {
      // مسیر مطلق تا خیال‌مان راحت باشد
      input: path.resolve(__dirname, 'react/src/loader.jsx'),
      output: {
        entryFileNames: 'loader.js', // ثابت برای EJS
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});

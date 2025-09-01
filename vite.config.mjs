import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
const r = (...segs) => path.resolve(__dirname, ...segs);
export default defineConfig({
  root: 'react', // یعنی dev server ریشه‌اش پوشه‌ی react است
  base: '/assets/',
  publicDir: false,
  plugins: [react()],
  cacheDir: 'vite-cache', // اختیاری: کش را از node_modules بیرون می‌برد
  resolve: {
    alias: {
      '@shared': r('shared'), // ← shared/
      // پیشنهاد اختیاری:
      '@': r('react/src'), // ← استفاده راحت از سورس فرانت
    },
  },
  server: {
    fs: { allow: [r('shared'), r('react')] }, // ← به dev server اجازه بده
  },
  build: {
    outDir: 'dist', // نسبت به root → خروجی می‌شود: react/dist
    emptyOutDir: true,
    rollupOptions: {
      // مسیر مطلق تا خیال‌مان راحت باشد
      // input: path.resolve(__dirname, 'react/src/loader.jsx'),
      input: r('react/src/loader.jsx'), // ← مسیر مطلق
      output: {
        entryFileNames: 'loader.js', // ثابت برای EJS
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});

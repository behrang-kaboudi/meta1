// vite.config.js  (در ریشه‌ی پروژه - ESM-safe)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const r = (...segs) => path.resolve(__dirname, ...segs);

export default defineConfig({
  root: 'react',
  base: '/assets/',
  publicDir: false,
  plugins: [react()],
  cacheDir: 'vite-cache',
  resolve: {
    alias: {
      '@shared': r('shared'),
      '@': r('react/src'),
    },
  },
  server: {
    fs: { allow: [r('shared'), r('react')] },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: r('react/src/loader.jsx'),
      output: {
        entryFileNames: 'loader.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'node:path';
// const r = (...segs) => path.resolve(__dirname, ...segs);
// export default defineConfig({
//   root: 'react', // یعنی dev server ریشه‌اش پوشه‌ی react است
//   base: '/assets/',
//   publicDir: false,
//   plugins: [react()],
//   cacheDir: 'vite-cache', // اختیاری: کش را از node_modules بیرون می‌برد
//   resolve: {
//     alias: {
//       '@shared': r('shared'), // ← shared/
//       // پیشنهاد اختیاری:
//       '@': r('react/src'), // ← استفاده راحت از سورس فرانت
//     },
//   },
//   server: {
//     fs: { allow: [r('shared'), r('react')] }, // ← به dev server اجازه بده
//   },
//   build: {
//     outDir: 'dist', // نسبت به root → خروجی می‌شود: react/dist
//     emptyOutDir: true,
//     rollupOptions: {
//       // مسیر مطلق تا خیال‌مان راحت باشد
//       // input: path.resolve(__dirname, 'react/src/loader.jsx'),
//       input: r('react/src/loader.jsx'), // ← مسیر مطلق
//       output: {
//         entryFileNames: 'loader.js', // ثابت برای EJS
//         chunkFileNames: 'chunks/[name]-[hash].js',
//         assetFileNames: 'assets/[name]-[hash][extname]',
//       },
//     },
//   },
// });

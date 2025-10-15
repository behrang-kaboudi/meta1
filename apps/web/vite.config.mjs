import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const r = (...segs) => path.resolve(__dirname, ...segs);

export default defineConfig({
  root: "./react/",
  base: "/assets/",
  publicDir: false,
  plugins: [react()],
  cacheDir: "vite-cache",
  resolve: {
    alias: {
      "@shared": r("shared"),
      "@": r("react/src"),
    },
  },
  server: {
    fs: { allow: [r("shared"), r("react")] },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: r("react/src/loader.jsx"),
      output: {
        entryFileNames: "loader.js",
        chunkFileNames: "chunks/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});

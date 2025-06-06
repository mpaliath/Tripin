import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: { outDir: "dist/client" },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),   //  <-- important line
    },
  },
});

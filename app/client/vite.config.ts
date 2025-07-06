import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This alias is used by shadcn/ui and should match your tsconfig.json
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API requests to the backend Express server during development
      '/auth': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
    }
  }
})
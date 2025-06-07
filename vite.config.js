// vite.config.js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist'
  },
  test: {
    environment: 'jsdom'
  }
})

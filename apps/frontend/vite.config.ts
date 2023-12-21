import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: './dist/',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 8080,
  },
  css: {
    devSourcemap: true,
  },
  base: './',
})

console.log('http://localhost:8080/components_dev/')

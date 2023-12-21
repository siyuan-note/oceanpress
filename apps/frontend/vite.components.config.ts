import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
  },
  plugins: [vue()],
  publicDir: './src/components/web-custom/public',
  build: {
    outDir: './dist/components/',
    emptyOutDir: true,
    lib: {
      entry: './src/components/web-custom/flow.ts',
      name: 'web-custom',
      fileName: 'oceanpress',
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})

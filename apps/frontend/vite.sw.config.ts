import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJSX()],
  publicDir: './src/components/web-custom/public',
  build: {
    outDir: './dist/',
    emptyOutDir: false,
    lib: {
      entry: ['./sw.ts'],
      name: 'sw',
      fileName: 'sw',
      formats: ['iife'],
    },
  },
  resolve: {
    alias: {
      '~': '/src',
    },
  },
  base: './',
  define: {
    'process.env': {},
  },
})

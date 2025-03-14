import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
import devtools from 'vite-plugin-vue-devtools'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [devtools(), vue(), vueJSX()],
  build: {
    outDir: './dist/',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '~': '/src',
    },
  },
  server: {
    port: 8080,
  },
  base: './',
})

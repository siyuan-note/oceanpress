import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
import Solid from 'vite-plugin-solid'
export default defineConfig({
  plugins: [Solid(),vue(), vueJSX()],
  build: {
    outDir: './dist/',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '~': './src',
    },
  },
  server: {
    port: 8080,
  },
  base: './',
})

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
import devtools from 'vite-plugin-vue-devtools'
const env = loadEnv('development', './')
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [devtools(), vue(), vueJSX()],
  build: {
    outDir: env.VITE_PLUGIN_DIR ?? './dist-plugin/',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '~': '/src',
    },
  },
  publicDir: './plugin_static/',
  server: {
    port: 8080,
  },
  base: './',
})

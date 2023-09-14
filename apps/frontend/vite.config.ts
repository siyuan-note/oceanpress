import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJSX()],
  build: {
    outDir: "./dist/",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    port: 8080,
  },
});

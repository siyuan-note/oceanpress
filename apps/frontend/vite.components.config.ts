import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJSX from "@vitejs/plugin-vue-jsx";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJSX()],
  publicDir: "./src/components/web-custom/public",
  build: {
    outDir: "./dist/components/",
    emptyOutDir: true,
    lib: {
      entry: "./src/components/web-custom/flow.ts",
      name: "web-custom",
      fileName:"oceanpress"
    },
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

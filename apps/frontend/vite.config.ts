import { defineConfig, type BuildEnvironmentOptions } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
import devtools from 'vite-plugin-vue-devtools'
import { resolve } from 'path/posix'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isLibraryMode = mode === 'library'
  console.log('[isLibraryMode]', isLibraryMode)
  const buildConfig = (
    isLibraryMode
      ? {
          lib: {
            entry: {
              app: resolve(__dirname, 'src/pages/App.tsx'),
            },
            fileName: (format, entryName) => `${entryName}.${format}.js`, // 根据入口名称生成文件名
            name: 'OceanPressApp', // 库的全局变量名
          },
          rollupOptions: {
            external: ['vue', 'fs/promises', 'node:path', 'node:fs'],
            output: {
              globals: {
                vue: 'Vue',
              },
            },
          },
          outDir: './dist-app/',
          emptyOutDir: true,
        }
      : {
          outDir: './dist/',
          emptyOutDir: true,
        }
  ) satisfies BuildEnvironmentOptions
  return {
    plugins: [devtools(), vue(), vueJSX()],
    build: buildConfig,
    resolve: {
      alias: {
        '~': '/src',
      },
    },
    server: {
      port: 8080,
    },
    base: './',
  }
})

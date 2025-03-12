import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // 入口文件
  format: 'esm', // 输出格式：CommonJS 和 ES Module
  dts: true, // 生成类型声明文件
  clean: true, // 每次构建前清理输出目录
  sourcemap: true, // 生成 sourcemap
  minify: false, // 是否压缩代码
  outDir: 'dist', // 输出目录
  bundle: true, // 是否打包依赖
  noExternal: ['oceanpress-rpc'], // 不要将这些模块视为外部模块
});

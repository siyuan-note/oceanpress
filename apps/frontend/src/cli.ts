import { currentConfig, loadConfigFile } from "./config";
import { build } from "./fs/build";
import { writeFile, mkdir, readFile } from "fs/promises";
import { Command } from "commander";
import { join,  } from "path/posix";
import {  resolve } from "path";
import "@/util/store.node.dep";
const program = new Command();
console.log(process.argv);

program.name("OceanPress").description("这是一款从思源笔记本生成一个静态站点的工具");

program
  .command("build")
  .description("输出静态站点源码")
  .option("-c, --config <string>", "指定配置文件的位置")
  .option("-o, --output <string>", "指定输出目录位置")
  .action(async (opt: { config: string; output: string }) => {
    if (!opt.config || !opt.output) {
      console.log(`请设置配置文件位置和输出目录位置`);
    }
    const config = await readFile(opt.config, "utf-8");
    loadConfigFile(JSON.parse(config));
    const filePath = resolve(opt.output);
    const res = build(currentConfig.value, {
      onFileTree: async (tree) => {
        for (const [path, data] of Object.entries(tree)) {
          const fullPath = join(filePath, "./", path);
          const pathArray = fullPath.split("/").slice(0, -1);
          const dirPath = pathArray.join("/");
          mkdir(dirPath, { recursive: true });
          try {
            if (typeof data === "string") {
              await writeFile(fullPath, data, "utf-8");
            } else {
              await writeFile(fullPath, new DataView(data));
            }
          } catch (error) {
            console.log(`${fullPath} 无法写入`);
          }
        }
      },
    });
    const obj = (await res.next()).value;
    if (typeof obj === "object" && !(obj instanceof Error)) {
      obj.log = (...arg) => {
        console.log(...arg);
      };
    }
    for await (const iterator of res) {
      if (typeof iterator === "string") {
        if (iterator.startsWith("渲染：")) {
          process.stdout.write(`\r\x1b[K${iterator}`);
        } else {
          process.stdout.write(`\n${iterator}`);
        }
      } else {
        console.log(iterator + "\n");
      }
    }
  });

program.parse(process.argv);

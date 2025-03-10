import { readFile } from 'fs/promises'
import { program } from './common.ts'
import { currentConfig, loadConfigFile } from '~/core/config.ts';
import { OceanPress } from '~/core/ocean_press.ts';
import { genZIP } from '~/core/genZip.ts';
program
  .command('deploy')
  .description('部署站点')
  .option('-c, --config <string>', '指定配置文件的位置')
  .option('-h, --apiBase <string>', 'OceanPress server 地址')
  .option('-k, --apiKey <string>', 'OceanPress server Api 密钥')
  .action(async (opt: { config: string; apiBase: string; apiKey: string }) => {
    if (!opt.apiBase || !opt.apiKey) {
      return console.error(`请配置 apiBase 和 apiKey`)
    }
    const config = await readFile(opt.config, 'utf-8')
    loadConfigFile(JSON.parse(config))

    const ocean_press = new OceanPress(currentConfig.value)

    ocean_press.pluginCenter.registerPlugin({
      async build_onFileTree([tree], next) {
        const zip = await genZIP(tree, { withoutZip: true })
        const sizeInMB = zip.size / (1024 * 1024)
        console.log('[zip.size in MB]', sizeInMB.toFixed(2))
        // todo： 这里需要实现 调用 OceanPress server 接口将 zip 包上传部署。
        // await writeFile('dist.zip', new Uint8Array(await zip.arrayBuffer()));
      },
    })

    const res = await ocean_press.build()

    const obj = (await res.next()).value
    if (typeof obj === 'object' && !(obj instanceof Error)) {
      obj.log = (...arg) => {
        console.log(...arg)
      }
    }
    for await (const iterator of res) {
      if (typeof iterator === 'string') {
        if (iterator.startsWith('渲染：')) {
          process.stdout.write(`\r\x1b[K${iterator}`)
        } else {
          process.stdout.write(`\n${iterator}`)
        }
      } else {
        console.log(iterator + '\n')
      }
    }
  })

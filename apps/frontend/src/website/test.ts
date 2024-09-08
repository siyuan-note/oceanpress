import { readFile } from 'fs/promises'

async function main() {
  const r = await readFile(
    'C:/Users/llej/Documents/SiYuan2/SiYuan/repo/objects/df/77a8e7ef5f7cc03f2624b00a65ea46a55ac446',
  )
  console.log('[r]', r)
}
main()
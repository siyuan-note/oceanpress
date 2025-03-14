import { NMessageProvider } from 'naive-ui'
import { FunctionalComponent } from 'vue'
import { isSiyuanPlugin } from './config.ts'
const app: FunctionalComponent = () => {
  return (
    <>
      <NMessageProvider>
        <router-view></router-view>
      </NMessageProvider>
      <div>
        可关注
        <a href="https://ld246.com/article/1693989505448">
          OceanPress_js 版的开发记录
        </a>
        获取最新进展
      </div>
      {isSiyuanPlugin ? null : (
        <div>
          查看OceanPress生成的效果：
          <a href="/notebook/请从这里开始.html#20210428212840-859h45j">
            《思源笔记用户指南》： 请从这里开始.html
          </a>
          <br />
          <a href="/notebook/请从这里开始/编辑器/排版元素.html">
            《思源笔记用户指南》： 排版元素.html
          </a>
        </div>
      )}
      <hr />
      <div>
        <div>
          由
          <a href="https://shenzilong.cn">
            崮生（子虚
          </a>
          开发
        </div>
        <div>
          <a href="https://oceanpress-js.heartstack.space">项目地址</a>
        </div>
        <div>
          <a href="https://github.com/siyuan-note/oceanpress">开源代码仓库</a>
        </div>
      </div>
    </>
  )
}
export default app
